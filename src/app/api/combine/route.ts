// 조합 API 엔드포인트
// POST /api/combine
// Supabase 연동 + OpenAI 조합
import { NextRequest, NextResponse } from 'next/server';
import { createClient, Element } from '@/utils/supabase/server';
import { generateCombination } from '@/lib/openai';

// 로컬 메모리 캐시 (L1)
const memoryCache = new Map<string, Element>();

// 캐시 키 생성
function getCacheKey(a: number, b: number): string {
    return a < b ? `${a}_${b}` : `${b}_${a}`;
}

// 로컬 원소 저장소 (Supabase 실패 시 폴백)
const localElements = new Map<number, { id: number; name: string; emoji: string; isBaseElement: boolean }>([
    [1, { id: 1, name: '물', emoji: '💧', isBaseElement: true }],
    [2, { id: 2, name: '불', emoji: '🔥', isBaseElement: true }],
    [3, { id: 3, name: '흙', emoji: '🌍', isBaseElement: true }],
    [4, { id: 4, name: '공기', emoji: '💨', isBaseElement: true }],
]);
const localRecipes = new Map<string, number>();
let nextLocalId = 5;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { elementAId, elementBId } = body;

        if (!elementAId || !elementBId) {
            return NextResponse.json(
                { success: false, error: '두 원소의 ID가 필요합니다.' },
                { status: 400 }
            );
        }

        const cacheKey = getCacheKey(Number(elementAId), Number(elementBId));
        const [smaller, larger] = elementAId < elementBId
            ? [Number(elementAId), Number(elementBId)]
            : [Number(elementBId), Number(elementAId)];

        // L1: 메모리 캐시 확인
        if (memoryCache.has(cacheKey)) {
            const cached = memoryCache.get(cacheKey)!;
            return NextResponse.json({
                success: true,
                result: {
                    id: cached.id,
                    name: cached.name,
                    emoji: cached.emoji,
                    isBaseElement: cached.is_base_element,
                },
                isNew: false,
                isFirstDiscovery: false,
                source: 'cache',
            });
        }

        let supabase;
        let useSupabase = true;

        try {
            supabase = await createClient();
        } catch {
            console.log('Supabase 연결 실패, 로컬 모드 사용');
            useSupabase = false;
        }

        // Supabase 모드
        if (useSupabase && supabase) {
            // 원소 정보 조회
            const [elementAResult, elementBResult] = await Promise.all([
                supabase.from('elements').select('*').eq('id', elementAId).single(),
                supabase.from('elements').select('*').eq('id', elementBId).single(),
            ]);

            const elementA = elementAResult.data as Element;
            const elementB = elementBResult.data as Element;

            if (!elementA || !elementB) {
                return NextResponse.json(
                    { success: false, error: '원소를 찾을 수 없습니다.' },
                    { status: 400 }
                );
            }

            // L2: DB에서 레시피 조회
            const { data: recipe } = await supabase
                .from('recipes')
                .select('result')
                .eq('input_a', smaller)
                .eq('input_b', larger)
                .single();

            if (recipe) {
                const { data: resultElement } = await supabase
                    .from('elements')
                    .select('*')
                    .eq('id', recipe.result)
                    .single();

                if (resultElement) {
                    memoryCache.set(cacheKey, resultElement as Element);
                    return NextResponse.json({
                        success: true,
                        result: {
                            id: resultElement.id,
                            name: resultElement.name,
                            emoji: resultElement.emoji,
                            isBaseElement: resultElement.is_base_element,
                        },
                        isNew: false,
                        isFirstDiscovery: false,
                        source: 'supabase',
                    });
                }
            }

            // L3: OpenAI로 새 조합 생성
            const aiResult = await generateCombination(elementA.name, elementB.name);

            // 이미 존재하는 원소인지 확인
            const { data: existingElement } = await supabase
                .from('elements')
                .select('*')
                .eq('name', aiResult.result)
                .single();

            let resultElement: Element;
            let isFirstDiscovery = false;

            if (existingElement) {
                resultElement = existingElement as Element;
            } else {
                // 새 원소 생성
                const { data: newElement, error } = await supabase
                    .from('elements')
                    .insert({
                        name: aiResult.result,
                        emoji: aiResult.emoji,
                        is_base_element: false,
                    })
                    .select()
                    .single();

                if (error || !newElement) {
                    throw new Error('원소 생성 실패');
                }
                resultElement = newElement as Element;
                isFirstDiscovery = true;
            }

            // 레시피 저장 (중복 무시)
            try {
                await supabase.from('recipes').insert({
                    input_a: smaller,
                    input_b: larger,
                    result: resultElement.id,
                });
            } catch {
                // 중복 레시피 무시
            }

            memoryCache.set(cacheKey, resultElement);

            return NextResponse.json({
                success: true,
                result: {
                    id: resultElement.id,
                    name: resultElement.name,
                    emoji: resultElement.emoji,
                    isBaseElement: resultElement.is_base_element,
                },
                isNew: true,
                isFirstDiscovery,
                source: 'supabase',
            });
        }

        // 로컬 폴백 모드
        if (localRecipes.has(cacheKey)) {
            const resultId = localRecipes.get(cacheKey)!;
            const result = localElements.get(resultId);
            if (result) {
                return NextResponse.json({
                    success: true,
                    result,
                    isNew: false,
                    isFirstDiscovery: false,
                    source: 'local',
                });
            }
        }

        const elementA = localElements.get(Number(elementAId));
        const elementB = localElements.get(Number(elementBId));

        if (!elementA || !elementB) {
            return NextResponse.json(
                { success: false, error: '원소를 찾을 수 없습니다.' },
                { status: 400 }
            );
        }

        const aiResult = await generateCombination(elementA.name, elementB.name);

        let existingElement: { id: number; name: string; emoji: string; isBaseElement: boolean } | undefined;
        for (const element of localElements.values()) {
            if (element.name === aiResult.result) {
                existingElement = element;
                break;
            }
        }

        let resultElement: { id: number; name: string; emoji: string; isBaseElement: boolean };
        let isFirstDiscovery = false;

        if (existingElement) {
            resultElement = existingElement;
        } else {
            resultElement = {
                id: nextLocalId++,
                name: aiResult.result,
                emoji: aiResult.emoji,
                isBaseElement: false,
            };
            localElements.set(resultElement.id, resultElement);
            isFirstDiscovery = true;
        }

        localRecipes.set(cacheKey, resultElement.id);

        return NextResponse.json({
            success: true,
            result: resultElement,
            isNew: true,
            isFirstDiscovery,
            source: 'local',
        });
    } catch (error) {
        console.error('조합 API 오류:', error);
        return NextResponse.json(
            { success: false, error: '조합 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}

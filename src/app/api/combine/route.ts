// 조합 API 엔드포인트
// POST /api/combine
// Supabase 없이 로컬 모드 + OpenAI로 동작
import { NextRequest, NextResponse } from 'next/server';
import { generateCombination } from '@/lib/openai';

// 로컬 저장소 (메모리)
const localElements = new Map<number, { id: number; name: string; emoji: string; isBaseElement: boolean }>([
    [1, { id: 1, name: '물', emoji: '💧', isBaseElement: true }],
    [2, { id: 2, name: '불', emoji: '🔥', isBaseElement: true }],
    [3, { id: 3, name: '흙', emoji: '🌍', isBaseElement: true }],
    [4, { id: 4, name: '공기', emoji: '💨', isBaseElement: true }],
]);

// 레시피 저장소
const localRecipes = new Map<string, number>();

// 다음 ID
let nextElementId = 5;

// 캐시 키 생성
function getCacheKey(a: number, b: number): string {
    return a < b ? `${a}_${b}` : `${b}_${a}`;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { elementAId, elementBId } = body;

        // 입력 검증
        if (!elementAId || !elementBId) {
            return NextResponse.json(
                { success: false, error: '두 원소의 ID가 필요합니다.' },
                { status: 400 }
            );
        }

        const cacheKey = getCacheKey(Number(elementAId), Number(elementBId));

        // 이미 조합된 레시피 확인
        if (localRecipes.has(cacheKey)) {
            const resultId = localRecipes.get(cacheKey)!;
            const result = localElements.get(resultId);
            if (result) {
                return NextResponse.json({
                    success: true,
                    result,
                    isNew: false,
                    isFirstDiscovery: false,
                });
            }
        }

        // 원소 정보 조회
        const elementA = localElements.get(Number(elementAId));
        const elementB = localElements.get(Number(elementBId));

        if (!elementA || !elementB) {
            return NextResponse.json(
                { success: false, error: '원소를 찾을 수 없습니다.' },
                { status: 400 }
            );
        }

        // OpenAI로 새 조합 생성
        const aiResult = await generateCombination(elementA.name, elementB.name);

        // 이미 존재하는 원소인지 확인
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
            // 새로운 원소 생성
            resultElement = {
                id: nextElementId++,
                name: aiResult.result,
                emoji: aiResult.emoji,
                isBaseElement: false,
            };
            localElements.set(resultElement.id, resultElement);
            isFirstDiscovery = true;
        }

        // 레시피 저장
        localRecipes.set(cacheKey, resultElement.id);

        return NextResponse.json({
            success: true,
            result: resultElement,
            isNew: true,
            isFirstDiscovery,
        });
    } catch (error) {
        console.error('조합 API 오류:', error);
        return NextResponse.json(
            { success: false, error: '조합 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}

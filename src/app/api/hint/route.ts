// 힌트 API 엔드포인트
// POST /api/hint - 목표 원소까지의 다음 힌트 제공
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// 간단한 힌트 로직
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { targetElementId, discoveredElementIds } = body;

        if (!targetElementId) {
            return NextResponse.json(
                { success: false, error: '목표 원소 ID가 필요합니다.' },
                { status: 400 }
            );
        }

        let supabase;
        try {
            supabase = await createClient();
        } catch {
            // Supabase 연결 실패 시 기본 힌트 반환
            return NextResponse.json({
                success: true,
                hint: {
                    message: '기본 원소들을 조합해보세요!',
                    suggestion: {
                        elementA: { id: 1, name: '물', emoji: '💧' },
                        elementB: { id: 2, name: '불', emoji: '🔥' },
                    },
                },
                source: 'fallback',
            });
        }

        // 목표 원소를 만드는 레시피 조회
        const { data: recipes } = await supabase
            .from('recipes')
            .select('input_a, input_b, result')
            .eq('result', targetElementId);

        if (!recipes || recipes.length === 0) {
            return NextResponse.json({
                success: true,
                hint: {
                    message: '이 원소를 만드는 방법은 아직 발견되지 않았습니다.',
                    suggestion: null,
                },
            });
        }

        // 사용자가 가진 원소로 만들 수 있는 레시피 찾기
        const discoveredSet = new Set(discoveredElementIds || []);
        const availableRecipe = recipes.find(
            (r) => discoveredSet.has(r.input_a) && discoveredSet.has(r.input_b)
        );

        if (availableRecipe) {
            // 두 원소 정보 조회
            const [elementAResult, elementBResult] = await Promise.all([
                supabase.from('elements').select('id, name, emoji').eq('id', availableRecipe.input_a).single(),
                supabase.from('elements').select('id, name, emoji').eq('id', availableRecipe.input_b).single(),
            ]);

            if (elementAResult.data && elementBResult.data) {
                return NextResponse.json({
                    success: true,
                    hint: {
                        message: '이 두 원소를 조합해보세요!',
                        suggestion: {
                            elementA: elementAResult.data,
                            elementB: elementBResult.data,
                        },
                        direct: true,
                    },
                });
            }
        }

        // 만들 수 없는 경우 - 중간 재료 힌트
        const firstRecipe = recipes[0];
        const missingA = !discoveredSet.has(firstRecipe.input_a);
        const missingB = !discoveredSet.has(firstRecipe.input_b);

        const [elementAResult, elementBResult] = await Promise.all([
            supabase.from('elements').select('id, name, emoji').eq('id', firstRecipe.input_a).single(),
            supabase.from('elements').select('id, name, emoji').eq('id', firstRecipe.input_b).single(),
        ]);

        const elementA = elementAResult.data;
        const elementB = elementBResult.data;

        if (!elementA || !elementB) {
            return NextResponse.json({
                success: true,
                hint: {
                    message: '힌트를 찾을 수 없습니다.',
                    suggestion: null,
                },
            });
        }

        if (missingA && missingB) {
            return NextResponse.json({
                success: true,
                hint: {
                    message: `먼저 "${elementA.name}"과 "${elementB.name}"을 발견해야 합니다.`,
                    missingElements: [elementA, elementB],
                },
            });
        } else if (missingA) {
            return NextResponse.json({
                success: true,
                hint: {
                    message: `먼저 "${elementA.name}"을 발견해야 합니다.`,
                    missingElements: [elementA],
                },
            });
        } else {
            return NextResponse.json({
                success: true,
                hint: {
                    message: `먼저 "${elementB.name}"을 발견해야 합니다.`,
                    missingElements: [elementB],
                },
            });
        }
    } catch (error) {
        console.error('힌트 API 오류:', error);
        return NextResponse.json(
            { success: false, error: '힌트 조회 실패' },
            { status: 500 }
        );
    }
}

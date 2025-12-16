// 일일 챌린지 API 엔드포인트
// GET /api/challenge - 오늘의 챌린지 정보 조회
// POST /api/challenge - 챌린지 진행 상황 업데이트
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// 오늘 날짜 (KST 기준)
function getTodayKST(): string {
    const now = new Date();
    const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    return kst.toISOString().split('T')[0];
}

// 시드 기반 난수 생성 (날짜별 동일한 결과)
function seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

// 미리 정의된 챌린지 목표 원소 목록 (난이도 10~15 단계)
const CHALLENGE_TARGETS = [
    { name: '증기', emoji: '💨', depth: 2 },
    { name: '진흙', emoji: '🟤', depth: 2 },
    { name: '에너지', emoji: '⚡', depth: 3 },
    { name: '용암', emoji: '🌋', depth: 2 },
    { name: '구름', emoji: '☁️', depth: 3 },
    { name: '비', emoji: '🌧️', depth: 4 },
    { name: '식물', emoji: '🌱', depth: 4 },
    { name: '나무', emoji: '🌳', depth: 5 },
    { name: '숲', emoji: '🌲', depth: 6 },
    { name: '동물', emoji: '🐾', depth: 6 },
    { name: '인간', emoji: '👤', depth: 8 },
    { name: '도시', emoji: '🏙️', depth: 10 },
    { name: '문명', emoji: '🏛️', depth: 12 },
    { name: '기술', emoji: '💻', depth: 13 },
    { name: '우주', emoji: '🌌', depth: 15 },
];

// GET: 오늘의 챌린지 정보 조회
export async function GET() {
    try {
        const today = getTodayKST();

        // 오늘 날짜 기반으로 목표 원소 선택 (시드 사용)
        const dateSeed = parseInt(today.replace(/-/g, ''), 10);
        const targetIndex = Math.floor(seededRandom(dateSeed) * CHALLENGE_TARGETS.length);
        const todayTarget = CHALLENGE_TARGETS[targetIndex];

        // Supabase 연결 시도
        let supabaseChallenge = null;
        try {
            const supabase = await createClient();

            // DB에서 오늘의 챌린지 조회
            const { data: challenge } = await supabase
                .from('daily_challenges')
                .select('*, target_element:elements(*)')
                .eq('date', today)
                .single();

            if (challenge) {
                supabaseChallenge = challenge;
            }
        } catch {
            // Supabase 연결 실패 시 로컬 데이터 사용
        }

        return NextResponse.json({
            success: true,
            challenge: supabaseChallenge || {
                date: today,
                target: todayTarget,
            },
            source: supabaseChallenge ? 'supabase' : 'local',
        });
    } catch (error) {
        console.error('챌린지 조회 오류:', error);
        return NextResponse.json(
            { success: false, error: '챌린지 조회 실패' },
            { status: 500 }
        );
    }
}

// POST: 챌린지 완료 기록
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, moveCount, foundElements } = body;

        const today = getTodayKST();

        try {
            const supabase = await createClient();

            // 일일 진행 상황 업데이트 또는 생성
            const { data, error } = await supabase
                .from('daily_progress')
                .upsert({
                    user_id: userId,
                    date: today,
                    move_count: moveCount,
                    found_elements: foundElements,
                    is_completed: true,
                    completed_at: new Date().toISOString(),
                })
                .select()
                .single();

            if (error) {
                throw error;
            }

            return NextResponse.json({
                success: true,
                progress: data,
            });
        } catch {
            // Supabase 실패 시 성공 응답만 반환
            return NextResponse.json({
                success: true,
                message: '로컬 모드에서 완료 처리됨',
            });
        }
    } catch (error) {
        console.error('챌린지 진행 저장 오류:', error);
        return NextResponse.json(
            { success: false, error: '진행 상황 저장 실패' },
            { status: 500 }
        );
    }
}

// 원소 목록 API 엔드포인트
// GET /api/elements
// Supabase 없이 로컬 모드로 동작
import { NextResponse } from 'next/server';

// 로컬 저장소 (메모리)
const localElements = new Map<number, { id: number; name: string; emoji: string; isBaseElement: boolean }>([
    [1, { id: 1, name: '물', emoji: '💧', isBaseElement: true }],
    [2, { id: 2, name: '불', emoji: '🔥', isBaseElement: true }],
    [3, { id: 3, name: '흙', emoji: '🌍', isBaseElement: true }],
    [4, { id: 4, name: '공기', emoji: '💨', isBaseElement: true }],
]);

export async function GET() {
    try {
        const elements = Array.from(localElements.values());

        return NextResponse.json({
            success: true,
            elements,
        });
    } catch (error) {
        console.error('원소 조회 오류:', error);
        return NextResponse.json({
            success: true,
            elements: [
                { id: 1, name: '물', emoji: '💧', isBaseElement: true },
                { id: 2, name: '불', emoji: '🔥', isBaseElement: true },
                { id: 3, name: '흙', emoji: '🌍', isBaseElement: true },
                { id: 4, name: '공기', emoji: '💨', isBaseElement: true },
            ],
        });
    }
}

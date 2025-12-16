// 원소 목록 API 엔드포인트
// GET /api/elements
// Supabase 연동 (실패 시 기본 원소 반환)
import { NextResponse } from 'next/server';
import { createClient, Element } from '@/utils/supabase/server';

// 기본 원소 (폴백용)
const DEFAULT_ELEMENTS = [
    { id: 1, name: '물', emoji: '💧', isBaseElement: true },
    { id: 2, name: '불', emoji: '🔥', isBaseElement: true },
    { id: 3, name: '흙', emoji: '🌍', isBaseElement: true },
    { id: 4, name: '공기', emoji: '💨', isBaseElement: true },
];

export async function GET() {
    try {
        const supabase = await createClient();

        // 모든 원소 가져오기
        const { data: elements, error } = await supabase
            .from('elements')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) {
            console.error('원소 조회 오류:', error);
            return NextResponse.json({
                success: true,
                elements: DEFAULT_ELEMENTS,
                source: 'fallback',
            });
        }

        // 원소가 없으면 기본 원소 반환
        if (!elements || elements.length === 0) {
            return NextResponse.json({
                success: true,
                elements: DEFAULT_ELEMENTS,
                source: 'fallback',
            });
        }

        return NextResponse.json({
            success: true,
            elements: elements.map((e: Element) => ({
                id: e.id,
                name: e.name,
                emoji: e.emoji,
                isBaseElement: e.is_base_element,
            })),
            source: 'supabase',
        });
    } catch (error) {
        console.error('원소 조회 오류:', error);
        return NextResponse.json({
            success: true,
            elements: DEFAULT_ELEMENTS,
            source: 'fallback',
        });
    }
}

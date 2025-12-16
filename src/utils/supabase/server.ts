// Next.js 16 Server Component용 Supabase 클라이언트
// @supabase/ssr을 사용하여 쿠키 핸들링
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// 서버 컴포넌트 및 Server Action에서 사용할 Supabase 클라이언트 생성
export async function createClient() {
    const cookieStore = await cookies(); // Next.js 16에서는 await 필수

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // Server Component에서 쿠키를 쓰려고 할 때 무시
                    }
                },
            },
        }
    );
}

// 타입 정의
export interface Element {
    id: number;
    name: string;
    emoji: string;
    is_base_element: boolean;
    discovered_by: string | null;
    created_at: string;
}

export interface Recipe {
    input_a: number;
    input_b: number;
    result: number;
}

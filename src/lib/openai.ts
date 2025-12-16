// OpenAI 클라이언트 설정
// 빌드 시점이 아닌 런타임에만 초기화되도록 지연 로딩 적용
import OpenAI from 'openai';

// OpenAI 클라이언트 싱글톤 (런타임에만 초기화)
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
    if (!openaiClient) {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error('OPENAI_API_KEY 환경 변수가 설정되지 않았습니다.');
        }
        openaiClient = new OpenAI({ apiKey });
    }
    return openaiClient;
}

// 조합 결과 생성 함수
export async function generateCombination(
    elementA: string,
    elementB: string
): Promise<{ result: string; emoji: string; is_new: boolean }> {
    try {
        const openai = getOpenAIClient();

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `당신은 창의적인 연금술사입니다. 두 요소를 조합하여 새로운 요소를 만듭니다.
규칙:
1. 결과는 반드시 명사여야 합니다.
2. 추상적 개념도 허용됩니다.
3. 이모지 1개를 반드시 포함해야 합니다.
4. 두 요소의 조합으로 논리적으로 만들어질 수 있는 것이어야 합니다.
5. JSON 형식으로만 응답하세요.`,
                },
                {
                    role: 'user',
                    content: `"${elementA}"와 "${elementB}"를 조합하면 무엇이 될까요?
JSON 형식으로 응답하세요: { "result": "결과물 이름", "emoji": "이모지", "is_new": true }`,
                },
            ],
            temperature: 0.7,
            max_tokens: 100,
        });

        const content = response.choices[0]?.message?.content || '';

        // JSON 파싱 시도
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
    } catch (error) {
        console.error('OpenAI 조합 오류:', error);
    }

    // 기본값 반환
    return {
        result: '미지의 물질',
        emoji: '❓',
        is_new: true,
    };
}

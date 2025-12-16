// 힌트 알고리즘 - BFS 기반 최단 경로 탐색
// 목표 원소까지의 최단 조합 경로를 찾습니다

interface Element {
    id: number;
    name: string;
    emoji: string;
}

interface Recipe {
    inputA: number;
    inputB: number;
    result: number;
}

interface HintStep {
    step: number;
    elementA: Element;
    elementB: Element;
    result: Element;
}

// BFS로 목표 원소까지의 최단 경로 찾기
export function findShortestPath(
    targetElementId: number,
    discoveredElements: Element[],
    recipes: Recipe[],
    baseElementIds: number[] = [1, 2, 3, 4] // 물, 불, 흙, 공기
): HintStep[] | null {
    // 이미 발견한 원소인지 확인
    const discoveredIds = new Set(discoveredElements.map((e) => e.id));

    if (discoveredIds.has(targetElementId)) {
        return []; // 이미 발견함
    }

    // 원소 ID → 원소 정보 맵
    const elementMap = new Map<number, Element>();
    discoveredElements.forEach((e) => elementMap.set(e.id, e));

    // 레시피를 결과 기준으로 그룹화
    const recipeByResult = new Map<number, Recipe[]>();
    recipes.forEach((r) => {
        const existing = recipeByResult.get(r.result) || [];
        existing.push(r);
        recipeByResult.set(r.result, existing);
    });

    // BFS 탐색
    // 각 노드: { elementId, path: HintStep[] }
    interface BfsNode {
        elementId: number;
        path: HintStep[];
        createdElements: Set<number>;
    }

    const queue: BfsNode[] = [];
    const visited = new Set<number>();

    // 기본 원소로 시작
    baseElementIds.forEach((id) => {
        queue.push({
            elementId: id,
            path: [],
            createdElements: new Set(baseElementIds),
        });
        visited.add(id);
    });

    // 만들 수 있는 모든 조합 탐색
    while (queue.length > 0) {
        const current = queue.shift()!;

        // 현재 만들 수 있는 모든 조합 시도
        const availableElements = Array.from(current.createdElements);

        for (let i = 0; i < availableElements.length; i++) {
            for (let j = i; j < availableElements.length; j++) {
                const a = availableElements[i];
                const b = availableElements[j];

                // 이 조합으로 만들 수 있는 결과 찾기
                const key = a < b ? `${a}_${b}` : `${b}_${a}`;
                const matchingRecipes = recipes.filter(
                    (r) =>
                        (r.inputA === a && r.inputB === b) ||
                        (r.inputA === b && r.inputB === a)
                );

                for (const recipe of matchingRecipes) {
                    if (visited.has(recipe.result)) continue;

                    visited.add(recipe.result);

                    const elementA = elementMap.get(a);
                    const elementB = elementMap.get(b);
                    const resultElement = elementMap.get(recipe.result);

                    if (!elementA || !elementB || !resultElement) continue;

                    const newStep: HintStep = {
                        step: current.path.length + 1,
                        elementA,
                        elementB,
                        result: resultElement,
                    };

                    const newPath = [...current.path, newStep];
                    const newCreated = new Set(current.createdElements);
                    newCreated.add(recipe.result);

                    // 목표 발견!
                    if (recipe.result === targetElementId) {
                        return newPath;
                    }

                    queue.push({
                        elementId: recipe.result,
                        path: newPath,
                        createdElements: newCreated,
                    });
                }
            }
        }
    }

    // 경로를 찾지 못함
    return null;
}

// 다음 힌트 단계만 반환 (스포일러 최소화)
export function getNextHint(
    targetElementId: number,
    discoveredElements: Element[],
    recipes: Recipe[]
): HintStep | null {
    const path = findShortestPath(targetElementId, discoveredElements, recipes);

    if (!path || path.length === 0) {
        return null;
    }

    return path[0];
}

// Zustand 게임 상태 관리
import { create } from 'zustand';

// 캔버스에 배치된 원소 타입
export interface CanvasElement {
    id: string; // 고유 인스턴스 ID
    elementId: number; // DB 원소 ID
    name: string;
    emoji: string;
    x: number;
    y: number;
}

// 게임 상태 인터페이스
interface GameState {
    // 인벤토리에 있는 발견된 원소들 (DB ID 기준)
    discoveredElements: Array<{
        id: number;
        name: string;
        emoji: string;
        isBaseElement: boolean;
    }>;

    // 캔버스에 배치된 원소들
    canvasElements: CanvasElement[];

    // 최근 사용한 원소 ID 목록 (최대 10개)
    recentElementIds: number[];

    // 로딩 상태
    isLoading: boolean;
    isCombining: boolean;

    // 액션들
    setDiscoveredElements: (
        elements: Array<{
            id: number;
            name: string;
            emoji: string;
            isBaseElement: boolean;
        }>
    ) => void;
    addDiscoveredElement: (element: {
        id: number;
        name: string;
        emoji: string;
        isBaseElement: boolean;
    }) => void;
    addToCanvas: (element: CanvasElement) => void;
    removeFromCanvas: (instanceId: string) => void;
    updateCanvasElementPosition: (instanceId: string, x: number, y: number) => void;
    clearCanvas: () => void;
    addToRecent: (elementId: number) => void;
    setLoading: (loading: boolean) => void;
    setCombining: (combining: boolean) => void;
}

// Zustand 스토어 생성
export const useGameStore = create<GameState>((set) => ({
    discoveredElements: [],
    canvasElements: [],
    recentElementIds: [],
    isLoading: true,
    isCombining: false,

    // 발견된 원소 목록 설정
    setDiscoveredElements: (elements) => set({ discoveredElements: elements }),

    // 새로운 원소 추가
    addDiscoveredElement: (element) =>
        set((state) => {
            // 이미 존재하는지 확인
            if (state.discoveredElements.some((e) => e.id === element.id)) {
                return state;
            }
            return {
                discoveredElements: [...state.discoveredElements, element],
            };
        }),

    // 캔버스에 원소 추가
    addToCanvas: (element) =>
        set((state) => ({
            canvasElements: [...state.canvasElements, element],
        })),

    // 캔버스에서 원소 제거
    removeFromCanvas: (instanceId) =>
        set((state) => ({
            canvasElements: state.canvasElements.filter((e) => e.id !== instanceId),
        })),

    // 캔버스 원소 위치 업데이트
    updateCanvasElementPosition: (instanceId, x, y) =>
        set((state) => ({
            canvasElements: state.canvasElements.map((e) =>
                e.id === instanceId ? { ...e, x, y } : e
            ),
        })),

    // 캔버스 비우기
    clearCanvas: () => set({ canvasElements: [] }),

    // 최근 사용 원소에 추가
    addToRecent: (elementId) =>
        set((state) => {
            const filtered = state.recentElementIds.filter((id) => id !== elementId);
            return {
                recentElementIds: [elementId, ...filtered].slice(0, 10),
            };
        }),

    // 로딩 상태 설정
    setLoading: (loading) => set({ isLoading: loading }),

    // 조합 중 상태 설정
    setCombining: (combining) => set({ isCombining: combining }),
}));

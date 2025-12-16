// 메인 캔버스 컴포넌트
'use client';

import { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ElementItem from './Element';
import CombineEffect from './CombineEffect';
import { useGameStore, CanvasElement } from '@/store/gameStore';

// 조합 거리 임계값 (px)
const COMBINE_THRESHOLD = 80;

interface CanvasProps {
    onCombine: (
        elementA: CanvasElement,
        elementB: CanvasElement
    ) => Promise<void>;
}

export default function Canvas({ onCombine }: CanvasProps) {
    const canvasRef = useRef<HTMLDivElement>(null);
    const {
        canvasElements,
        updateCanvasElementPosition,
        removeFromCanvas,
        isCombining,
    } = useGameStore();

    // 조합 효과 상태
    const [combineEffect, setCombineEffect] = useState<{
        show: boolean;
        success: boolean;
        resultEmoji?: string;
        resultName?: string;
        isFirstDiscovery?: boolean;
        position: { x: number; y: number };
    }>({
        show: false,
        success: false,
        position: { x: 0, y: 0 },
    });

    // 들어올리기 중인 원소 ID
    const [nearbyPair, setNearbyPair] = useState<{
        a: string;
        b: string;
    } | null>(null);

    // 두 원소 사이의 거리 계산
    const getDistance = (a: CanvasElement, b: CanvasElement) => {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    };

    // 가장 가까운 원소 찾기
    const findNearestElement = useCallback(
        (
            draggedId: string,
            x: number,
            y: number
        ): CanvasElement | null => {
            const dragged = canvasElements.find((e) => e.id === draggedId);
            if (!dragged) return null;

            const tempElement = { ...dragged, x, y };
            let nearest: CanvasElement | null = null;
            let minDistance = COMBINE_THRESHOLD;

            for (const element of canvasElements) {
                if (element.id === draggedId) continue;
                const distance = getDistance(tempElement, element);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearest = element;
                }
            }

            return nearest;
        },
        [canvasElements]
    );

    // 드래그 종료 처리
    const handleDragEnd = useCallback(
        async (id: string, x: number, y: number) => {
            // 위치 업데이트
            updateCanvasElementPosition(id, x, y);

            // 가까운 원소 찾기
            const nearest = findNearestElement(id, x, y);

            if (nearest && !isCombining) {
                const dragged = canvasElements.find((e) => e.id === id);
                if (dragged) {
                    // 조합 시도
                    await onCombine(dragged, nearest);
                }
            }

            setNearbyPair(null);
        },
        [
            updateCanvasElementPosition,
            findNearestElement,
            canvasElements,
            isCombining,
            onCombine,
        ]
    );

    // 원소 제거
    const handleRemove = useCallback(
        (id: string) => {
            removeFromCanvas(id);
        },
        [removeFromCanvas]
    );

    // 캔버스 정리하기
    const handleArrange = () => {
        const padding = 20;
        const itemSize = 100;
        const cols = Math.floor(
            ((canvasRef.current?.clientWidth || 800) - 300) / (itemSize + padding)
        );

        canvasElements.forEach((element, index) => {
            const row = Math.floor(index / cols);
            const col = index % cols;
            const x = 300 + padding + col * (itemSize + padding);
            const y = padding + row * (itemSize + padding);
            updateCanvasElementPosition(element.id, x, y);
        });
    };

    // 전체 비우기
    const handleClear = () => {
        const { clearCanvas } = useGameStore.getState();
        clearCanvas();
    };

    return (
        <div
            ref={canvasRef}
            className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
            style={{
                backgroundImage: `
          radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.05) 0%, transparent 50%),
          url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23334155' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
        `,
            }}
        >
            {/* 헤더 */}
            <header className="fixed top-0 left-72 right-0 h-16 z-20 px-6 flex items-center justify-between bg-slate-900/50 backdrop-blur-sm border-b border-slate-700/30">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">⚗️</span>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        일일공방
                    </h1>
                    <span className="text-sm text-slate-500">Daily Workshop</span>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleArrange}
                        className="px-4 py-2 text-sm bg-slate-800/80 hover:bg-slate-700/80
                     text-slate-300 rounded-lg border border-slate-600/50
                     transition-colors flex items-center gap-2"
                    >
                        🗂️ 정리하기
                    </button>
                    <button
                        onClick={handleClear}
                        className="px-4 py-2 text-sm bg-slate-800/80 hover:bg-red-900/50
                     text-slate-300 hover:text-red-300 rounded-lg border border-slate-600/50
                     transition-colors flex items-center gap-2"
                    >
                        🗑️ 비우기
                    </button>
                </div>
            </header>

            {/* 캔버스 영역 */}
            <div className="absolute inset-0 pt-16 pl-72">
                <AnimatePresence>
                    {canvasElements.map((element) => (
                        <ElementItem
                            key={element.id}
                            id={element.id}
                            name={element.name}
                            emoji={element.emoji}
                            x={element.x}
                            y={element.y}
                            onDragEnd={handleDragEnd}
                            onRemove={handleRemove}
                        />
                    ))}
                </AnimatePresence>

                {/* 빈 캔버스 안내 */}
                {canvasElements.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        <div className="text-center text-slate-500">
                            <span className="text-6xl block mb-4">🧪</span>
                            <p className="text-lg">인벤토리에서 원소를 선택하세요</p>
                            <p className="text-sm mt-2">
                                두 원소를 가까이 드래그하면 조합됩니다
                            </p>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* 조합 효과 */}
            <CombineEffect
                show={combineEffect.show}
                success={combineEffect.success}
                resultEmoji={combineEffect.resultEmoji}
                resultName={combineEffect.resultName}
                isFirstDiscovery={combineEffect.isFirstDiscovery}
                position={combineEffect.position}
                onComplete={() => setCombineEffect((prev) => ({ ...prev, show: false }))}
            />

            {/* 조합 중 오버레이 */}
            <AnimatePresence>
                {isCombining && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/30 flex items-center justify-center z-40"
                    >
                        <div className="text-4xl animate-pulse">⚗️</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// 인벤토리 사이드바 컴포넌트
'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';

interface InventoryProps {
    onElementClick: (element: {
        id: number;
        name: string;
        emoji: string;
    }) => void;
}

export default function Inventory({ onElementClick }: InventoryProps) {
    const { discoveredElements, recentElementIds, isLoading } = useGameStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [isCollapsed, setIsCollapsed] = useState(false);

    // 검색 필터링 (초성 검색 지원)
    const filteredElements = useMemo(() => {
        if (!searchQuery.trim()) return discoveredElements;

        const query = searchQuery.toLowerCase();
        return discoveredElements.filter((element) =>
            element.name.toLowerCase().includes(query)
        );
    }, [discoveredElements, searchQuery]);

    // 최근 사용 원소와 나머지 분리
    const { recentElements, otherElements } = useMemo(() => {
        const recent = filteredElements.filter((e) =>
            recentElementIds.includes(e.id)
        );
        const others = filteredElements.filter(
            (e) => !recentElementIds.includes(e.id)
        );
        return { recentElements: recent, otherElements: others };
    }, [filteredElements, recentElementIds]);

    if (isCollapsed) {
        return (
            <button
                onClick={() => setIsCollapsed(false)}
                className="fixed left-0 top-1/2 -translate-y-1/2 z-30
                   bg-slate-800/90 backdrop-blur-sm border border-slate-700/50
                   rounded-r-xl px-2 py-4 hover:bg-slate-700/90 transition-colors"
            >
                <span className="text-lg">📦</span>
                <span className="block text-xs text-slate-400 mt-1">
                    {discoveredElements.length}
                </span>
            </button>
        );
    }

    return (
        <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            className="fixed left-0 top-0 h-full w-72 z-30
                 bg-gradient-to-b from-slate-900/95 to-slate-800/95
                 backdrop-blur-md border-r border-slate-700/50
                 flex flex-col shadow-2xl"
        >
            {/* 헤더 */}
            <div className="p-4 border-b border-slate-700/50">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        📦 인벤토리
                        <span className="text-sm font-normal text-slate-400">
                            ({discoveredElements.length})
                        </span>
                    </h2>
                    <button
                        onClick={() => setIsCollapsed(true)}
                        className="p-1 hover:bg-slate-700/50 rounded-lg transition-colors"
                    >
                        <span className="text-slate-400">◀</span>
                    </button>
                </div>

                {/* 검색창 */}
                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="검색..."
                        className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600/50
                     rounded-xl text-sm text-white placeholder-slate-500
                     focus:outline-none focus:border-purple-500/50 transition-colors"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                        🔍
                    </span>
                </div>
            </div>

            {/* 원소 목록 */}
            <div className="flex-1 overflow-y-auto p-3">
                {isLoading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin text-2xl">⚗️</div>
                    </div>
                ) : (
                    <>
                        {/* 최근 사용 */}
                        {recentElements.length > 0 && (
                            <div className="mb-4">
                                <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2 px-1">
                                    최근 사용
                                </h3>
                                <div className="grid grid-cols-3 gap-2">
                                    <AnimatePresence>
                                        {recentElements.map((element) => (
                                            <ElementButton
                                                key={element.id}
                                                element={element}
                                                onClick={onElementClick}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                        )}

                        {/* 전체 목록 */}
                        <div>
                            <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2 px-1">
                                {searchQuery ? '검색 결과' : '모든 원소'}
                            </h3>
                            <div className="grid grid-cols-3 gap-2">
                                <AnimatePresence>
                                    {otherElements.map((element) => (
                                        <ElementButton
                                            key={element.id}
                                            element={element}
                                            onClick={onElementClick}
                                            isBaseElement={element.isBaseElement}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>

                        {filteredElements.length === 0 && (
                            <div className="text-center text-slate-500 py-8">
                                검색 결과가 없습니다
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* 하단 정보 */}
            <div className="p-3 border-t border-slate-700/50">
                <p className="text-xs text-slate-500 text-center">
                    원소를 클릭하여 캔버스에 추가하세요
                </p>
            </div>
        </motion.aside>
    );
}

// 개별 원소 버튼 컴포넌트
function ElementButton({
    element,
    onClick,
    isBaseElement = false,
}: {
    element: { id: number; name: string; emoji: string };
    onClick: (element: { id: number; name: string; emoji: string }) => void;
    isBaseElement?: boolean;
}) {
    return (
        <motion.button
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onClick(element)}
            className={`flex flex-col items-center justify-center p-2 rounded-xl
                  border transition-all duration-200
                  ${isBaseElement
                    ? 'bg-gradient-to-br from-amber-900/30 to-orange-900/30 border-amber-600/30 hover:border-amber-500/50'
                    : 'bg-slate-800/50 border-slate-600/30 hover:border-purple-500/50 hover:bg-slate-700/50'
                }`}
        >
            <span className="text-2xl">{element.emoji}</span>
            <span className="text-[10px] text-slate-400 mt-1 truncate w-full text-center">
                {element.name}
            </span>
        </motion.button>
    );
}

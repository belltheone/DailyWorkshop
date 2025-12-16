// 원소 컴포넌트 (클릭 전용, 드래그 없음)
'use client';

import { motion } from 'framer-motion';
import React from 'react';

interface ElementItemProps {
    id: string;
    name: string;
    emoji: string;
    index: number;
    isSelected?: boolean;
    onClick?: (id: string) => void;
    onRemove?: (id: string) => void;
}

export default function ElementItem({
    id,
    name,
    emoji,
    index,
    isSelected = false,
    onClick,
    onRemove,
}: ElementItemProps) {
    // 그리드 위치 계산
    const cols = 6;
    const itemSize = 100;
    const padding = 15;
    const row = Math.floor(index / cols);
    const col = index % cols;
    const x = 320 + padding + col * (itemSize + padding);
    const y = 100 + padding + row * (itemSize + padding);

    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{
                x,
                y,
                scale: 1,
                opacity: 1,
            }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => {
                e.stopPropagation();
                onClick?.(id);
            }}
            onDoubleClick={(e) => {
                e.stopPropagation();
                onRemove?.(id);
            }}
            className="absolute cursor-pointer select-none"
        >
            <div
                className={`flex flex-col items-center justify-center px-4 py-3 
                    bg-gradient-to-br from-slate-800/90 to-slate-900/90
                    border rounded-2xl shadow-lg
                    backdrop-blur-sm hover:shadow-xl
                    transition-all duration-200 min-w-[80px]
                    ${isSelected
                        ? 'border-purple-500 ring-2 ring-purple-500/50 shadow-purple-500/30 bg-purple-900/30'
                        : 'border-slate-600/50 hover:border-purple-500/50'
                    }`}
            >
                {/* 선택 표시 */}
                {isSelected && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs text-white shadow-lg"
                    >
                        ✓
                    </motion.div>
                )}
                {/* 이모지 */}
                <span className="text-3xl mb-1">{emoji}</span>
                {/* 이름 */}
                <span className="text-xs text-slate-300 font-medium text-center whitespace-nowrap">
                    {name}
                </span>
            </div>
        </motion.div>
    );
}

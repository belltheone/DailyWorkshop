// 드래그 가능한 원소 컴포넌트
'use client';

import { motion } from 'framer-motion';
import React from 'react';

interface ElementItemProps {
    id: string;
    name: string;
    emoji: string;
    x: number;
    y: number;
    onDragEnd: (id: string, x: number, y: number) => void;
    onRemove?: (id: string) => void;
    isDraggable?: boolean;
}

export default function ElementItem({
    id,
    name,
    emoji,
    x,
    y,
    onDragEnd,
    onRemove,
    isDraggable = true,
}: ElementItemProps) {
    return (
        <motion.div
            drag={isDraggable}
            dragMomentum={false}
            initial={{ x, y, scale: 0 }}
            animate={{ x, y, scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileDrag={{ scale: 1.15, zIndex: 100 }}
            onDragEnd={(_, info) => {
                // 현재 위치에서 드래그 이동량을 더함
                const newX = x + info.offset.x;
                const newY = y + info.offset.y;
                onDragEnd(id, newX, newY);
            }}
            onDoubleClick={() => onRemove?.(id)}
            className="absolute cursor-grab active:cursor-grabbing select-none"
            style={{ touchAction: 'none' }}
        >
            <div
                className="flex flex-col items-center justify-center px-4 py-3 
                      bg-gradient-to-br from-slate-800/90 to-slate-900/90
                      border border-slate-600/50 rounded-2xl shadow-lg
                      backdrop-blur-sm hover:shadow-xl hover:border-purple-500/50
                      transition-all duration-200 min-w-[80px]"
            >
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

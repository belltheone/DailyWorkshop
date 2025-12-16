// 드래그 가능한 원소 컴포넌트
'use client';

import { motion } from 'framer-motion';
import React, { useRef } from 'react';

interface ElementItemProps {
    id: string;
    name: string;
    emoji: string;
    x: number;
    y: number;
    isSelected?: boolean;
    onDragEnd: (id: string, x: number, y: number) => void;
    onClick?: (id: string) => void;
    onRemove?: (id: string) => void;
    isDraggable?: boolean;
}

export default function ElementItem({
    id,
    name,
    emoji,
    x,
    y,
    isSelected = false,
    onDragEnd,
    onClick,
    onRemove,
    isDraggable = true,
}: ElementItemProps) {
    const elementRef = useRef<HTMLDivElement>(null);

    return (
        <motion.div
            ref={elementRef}
            drag={isDraggable}
            dragMomentum={false}
            dragElastic={0}
            initial={{ x, y, scale: 0, opacity: 0 }}
            animate={{ x, y, scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileDrag={{ scale: 1.15, zIndex: 100 }}
            onDragEnd={(event, info) => {
                // 현재 위치에서 드래그 이동량을 더함
                const newX = x + info.offset.x;
                const newY = y + info.offset.y;
                console.log(`드래그 종료: ${name}`, { oldX: x, oldY: y, newX, newY });
                onDragEnd(id, newX, newY);
            }}
            onClick={(e) => {
                e.stopPropagation();
                onClick?.(id);
            }}
            onDoubleClick={(e) => {
                e.stopPropagation();
                onRemove?.(id);
            }}
            className="absolute cursor-grab active:cursor-grabbing select-none"
            style={{ touchAction: 'none' }}
        >
            <div
                className={`flex flex-col items-center justify-center px-4 py-3 
                    bg-gradient-to-br from-slate-800/90 to-slate-900/90
                    border rounded-2xl shadow-lg
                    backdrop-blur-sm hover:shadow-xl
                    transition-all duration-200 min-w-[80px]
                    ${isSelected
                        ? 'border-purple-500 ring-2 ring-purple-500/50 shadow-purple-500/30'
                        : 'border-slate-600/50 hover:border-purple-500/50'
                    }`}
            >
                {/* 선택 표시 */}
                {isSelected && (
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-xs text-white">
                        ✓
                    </div>
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

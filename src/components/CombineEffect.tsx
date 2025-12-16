// 조합 성공/실패 애니메이션 효과
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface CombineEffectProps {
    show: boolean;
    success: boolean;
    resultEmoji?: string;
    resultName?: string;
    isFirstDiscovery?: boolean;
    position: { x: number; y: number };
    onComplete: () => void;
}

export default function CombineEffect({
    show,
    success,
    resultEmoji,
    resultName,
    isFirstDiscovery,
    position,
    onComplete,
}: CombineEffectProps) {
    const [particles, setParticles] = useState<
        Array<{ id: number; angle: number; distance: number }>
    >([]);

    useEffect(() => {
        if (show && success) {
            // 파티클 생성
            const newParticles = Array.from({ length: 12 }, (_, i) => ({
                id: i,
                angle: (i / 12) * 360,
                distance: 60 + Math.random() * 40,
            }));
            setParticles(newParticles);
        }
    }, [show, success]);

    return (
        <AnimatePresence>
            {show && (
                <>
                    {/* 성공 효과 */}
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            className="fixed pointer-events-none z-50"
                            style={{ left: position.x, top: position.y, transform: 'translate(-50%, -50%)' }}
                        >
                            {/* 결과 원소 표시 */}
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                className="flex flex-col items-center"
                            >
                                <span className="text-6xl">{resultEmoji}</span>
                                <motion.span
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-lg font-bold text-white mt-2"
                                >
                                    {resultName}
                                </motion.span>
                                {isFirstDiscovery && (
                                    <motion.span
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.4 }}
                                        className="text-sm text-yellow-400 font-semibold mt-1"
                                    >
                                        ✨ 최초 발견! ✨
                                    </motion.span>
                                )}
                            </motion.div>

                            {/* 파티클 효과 */}
                            {particles.map((particle) => (
                                <motion.div
                                    key={particle.id}
                                    initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                                    animate={{
                                        opacity: 0,
                                        x: Math.cos((particle.angle * Math.PI) / 180) * particle.distance,
                                        y: Math.sin((particle.angle * Math.PI) / 180) * particle.distance,
                                        scale: 0,
                                    }}
                                    transition={{ duration: 0.6 }}
                                    className="absolute w-3 h-3 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full"
                                    style={{ left: '50%', top: '50%' }}
                                />
                            ))}

                            {/* 링 효과 */}
                            <motion.div
                                initial={{ scale: 0, opacity: 1 }}
                                animate={{ scale: 3, opacity: 0 }}
                                transition={{ duration: 0.8 }}
                                onAnimationComplete={onComplete}
                                className="absolute w-20 h-20 border-4 border-purple-500/50 rounded-full"
                                style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                            />
                        </motion.div>
                    )}

                    {/* 실패 효과 */}
                    {!success && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed pointer-events-none z-50"
                            style={{ left: position.x, top: position.y, transform: 'translate(-50%, -50%)' }}
                        >
                            <motion.div
                                initial={{ scale: 1 }}
                                animate={{ x: [0, -10, 10, -10, 10, 0], scale: [1, 1.1, 1] }}
                                transition={{ duration: 0.4 }}
                                onAnimationComplete={onComplete}
                                className="text-4xl"
                            >
                                ❌
                            </motion.div>
                        </motion.div>
                    )}
                </>
            )}
        </AnimatePresence>
    );
}

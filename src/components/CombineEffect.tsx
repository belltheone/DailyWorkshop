// 조합 성공/실패 애니메이션 효과 (개선된 버전)
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';

interface CombineEffectProps {
    show: boolean;
    success: boolean;
    resultEmoji?: string;
    resultName?: string;
    isFirstDiscovery?: boolean;
    position: { x: number; y: number };
    onComplete: () => void;
}

// 파티클 타입 정의
interface Particle {
    id: number;
    angle: number;
    distance: number;
    size: number;
    color: string;
    delay: number;
}

// 스파크 타입 정의
interface Spark {
    id: number;
    x: number;
    y: number;
    rotation: number;
}

// 랜덤 색상 팔레트
const colors = [
    'from-purple-400 to-pink-500',
    'from-blue-400 to-cyan-500',
    'from-green-400 to-emerald-500',
    'from-yellow-400 to-orange-500',
    'from-pink-400 to-rose-500',
];

export default function CombineEffect({
    show,
    success,
    resultEmoji,
    resultName,
    isFirstDiscovery,
    position,
    onComplete,
}: CombineEffectProps) {
    const [particles, setParticles] = useState<Particle[]>([]);
    const [sparks, setSparks] = useState<Spark[]>([]);

    // 파티클 생성
    useEffect(() => {
        if (show && success) {
            // 메인 파티클 (24개)
            const newParticles: Particle[] = Array.from({ length: 24 }, (_, i) => ({
                id: i,
                angle: (i / 24) * 360 + Math.random() * 15,
                distance: 80 + Math.random() * 60,
                size: 4 + Math.random() * 8,
                color: colors[Math.floor(Math.random() * colors.length)],
                delay: Math.random() * 0.2,
            }));
            setParticles(newParticles);

            // 스파크 효과 (8개)
            const newSparks: Spark[] = Array.from({ length: 8 }, (_, i) => ({
                id: i,
                x: (Math.random() - 0.5) * 120,
                y: (Math.random() - 0.5) * 120,
                rotation: Math.random() * 360,
            }));
            setSparks(newSparks);

            // 사운드 효과 (Web Audio API)
            playSuccessSound();
        }
    }, [show, success]);

    // 성공 사운드 재생
    const playSuccessSound = useCallback(() => {
        try {
            const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

            // 멜로디 노트 재생
            const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
            notes.forEach((freq, i) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.type = 'sine';
                oscillator.frequency.value = freq;

                gainNode.gain.setValueAtTime(0.15, audioContext.currentTime + i * 0.1);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.1 + 0.3);

                oscillator.start(audioContext.currentTime + i * 0.1);
                oscillator.stop(audioContext.currentTime + i * 0.1 + 0.3);
            });
        } catch {
            // 오디오 재생 실패 무시
        }
    }, []);

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
                            {/* 글로우 배경 */}
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 2, opacity: [0, 0.6, 0] }}
                                transition={{ duration: 1 }}
                                className="absolute w-32 h-32 rounded-full bg-gradient-to-r from-purple-500/30 to-pink-500/30 blur-xl"
                                style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                            />

                            {/* 결과 원소 표시 */}
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                className="relative flex flex-col items-center"
                            >
                                {/* 이모지 + 광채 효과 */}
                                <motion.span
                                    animate={{
                                        textShadow: [
                                            '0 0 20px rgba(168, 85, 247, 0.8)',
                                            '0 0 40px rgba(168, 85, 247, 1)',
                                            '0 0 20px rgba(168, 85, 247, 0.8)',
                                        ],
                                    }}
                                    transition={{ duration: 0.8, repeat: 2 }}
                                    className="text-6xl drop-shadow-lg"
                                >
                                    {resultEmoji}
                                </motion.span>

                                <motion.span
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-lg font-bold text-white mt-2 drop-shadow-lg"
                                >
                                    {resultName}
                                </motion.span>

                                {isFirstDiscovery && (
                                    <motion.span
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: [0, 1.2, 1] }}
                                        transition={{ delay: 0.4, type: 'spring' }}
                                        className="text-sm text-yellow-400 font-semibold mt-1 flex items-center gap-1"
                                    >
                                        <span>👑</span>
                                        <span>최초 발견!</span>
                                        <span>👑</span>
                                    </motion.span>
                                )}
                            </motion.div>

                            {/* 메인 파티클 효과 */}
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
                                    transition={{ duration: 0.8, delay: particle.delay }}
                                    className={`absolute rounded-full bg-gradient-to-br ${particle.color}`}
                                    style={{
                                        width: particle.size,
                                        height: particle.size,
                                        left: '50%',
                                        top: '50%',
                                    }}
                                />
                            ))}

                            {/* 별 스파크 효과 */}
                            {sparks.map((spark) => (
                                <motion.div
                                    key={`spark-${spark.id}`}
                                    initial={{ opacity: 1, x: 0, y: 0, scale: 0, rotate: 0 }}
                                    animate={{
                                        opacity: [1, 1, 0],
                                        x: spark.x,
                                        y: spark.y,
                                        scale: [0, 1.5, 0],
                                        rotate: spark.rotation,
                                    }}
                                    transition={{ duration: 0.6, delay: 0.1 * spark.id }}
                                    className="absolute text-yellow-300 text-xl"
                                    style={{ left: '50%', top: '50%' }}
                                >
                                    ✦
                                </motion.div>
                            ))}

                            {/* 확장 링 효과 (여러 개) */}
                            {[0, 0.1, 0.2].map((delay, i) => (
                                <motion.div
                                    key={`ring-${i}`}
                                    initial={{ scale: 0, opacity: 0.8 }}
                                    animate={{ scale: 4, opacity: 0 }}
                                    transition={{ duration: 1, delay }}
                                    onAnimationComplete={i === 2 ? onComplete : undefined}
                                    className="absolute w-16 h-16 border-2 border-purple-400/50 rounded-full"
                                    style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                                />
                            ))}
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
                                animate={{
                                    x: [0, -10, 10, -10, 10, 0],
                                    scale: [1, 1.1, 1],
                                    rotate: [0, -5, 5, -5, 5, 0],
                                }}
                                transition={{ duration: 0.4 }}
                                onAnimationComplete={onComplete}
                                className="text-4xl"
                            >
                                💨
                            </motion.div>
                            <motion.span
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="block text-center text-slate-400 text-sm mt-2"
                            >
                                조합 불가
                            </motion.span>
                        </motion.div>
                    )}
                </>
            )}
        </AnimatePresence>
    );
}

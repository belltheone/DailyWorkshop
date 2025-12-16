// 일일 챌린지 UI 컴포넌트
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChallengeTarget {
    name: string;
    emoji: string;
    depth?: number;
}

interface ChallengeProps {
    discoveredElements: Array<{ id: number; name: string; emoji: string }>;
    moveCount: number;
    onComplete?: () => void;
}

export default function DailyChallenge({
    discoveredElements,
    moveCount,
    onComplete,
}: ChallengeProps) {
    const [challenge, setChallenge] = useState<{
        date: string;
        target: ChallengeTarget;
    } | null>(null);
    const [isCompleted, setIsCompleted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showSuccess, setShowSuccess] = useState(false);
    const [startTime] = useState(Date.now());

    // 챌린지 정보 로드
    useEffect(() => {
        const fetchChallenge = async () => {
            try {
                const response = await fetch('/api/challenge');
                const data = await response.json();

                if (data.success) {
                    setChallenge(data.challenge);
                }
            } catch (error) {
                console.error('챌린지 로드 실패:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchChallenge();
    }, []);

    // 목표 달성 확인
    useEffect(() => {
        if (!challenge || isCompleted) return;

        const targetName = challenge.target?.name;
        if (!targetName) return;

        const found = discoveredElements.some(
            (el) => el.name === targetName
        );

        if (found) {
            setIsCompleted(true);
            setShowSuccess(true);
            onComplete?.();

            // 3초 후 성공 모달 숨기기
            setTimeout(() => {
                setShowSuccess(false);
            }, 3000);
        }
    }, [discoveredElements, challenge, isCompleted, onComplete]);

    // 경과 시간 계산
    const getElapsedTime = () => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    if (isLoading) {
        return (
            <div className="fixed top-20 right-4 z-20 bg-slate-800/90 backdrop-blur-sm
                      border border-slate-700/50 rounded-xl p-4 min-w-[200px]">
                <div className="animate-pulse flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-700 rounded-full" />
                    <div className="h-4 bg-slate-700 rounded w-24" />
                </div>
            </div>
        );
    }

    if (!challenge) {
        return null;
    }

    return (
        <>
            {/* 챌린지 카드 */}
            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="fixed top-20 right-4 z-20"
            >
                <div
                    className={`bg-gradient-to-br backdrop-blur-sm border rounded-xl p-4 min-w-[220px]
                      shadow-lg transition-all duration-300 ${isCompleted
                            ? 'from-green-900/90 to-emerald-900/90 border-green-500/50'
                            : 'from-slate-800/90 to-slate-900/90 border-slate-700/50 hover:border-purple-500/50'
                        }`}
                >
                    {/* 헤더 */}
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-slate-400 uppercase tracking-wide">
                            오늘의 목표
                        </span>
                        <span className="text-xs text-slate-500">
                            {challenge.date || new Date().toISOString().split('T')[0]}
                        </span>
                    </div>

                    {/* 목표 원소 */}
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-4xl">{challenge.target?.emoji || '❓'}</span>
                        <div>
                            <p className="text-lg font-bold text-white">
                                {challenge.target?.name || '???'}
                            </p>
                            {challenge.target?.depth && (
                                <p className="text-xs text-slate-400">
                                    난이도 Lv.{challenge.target.depth}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* 진행 상황 */}
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-slate-400">
                            <span>🎯 시도:</span>
                            <span className="text-white font-medium">{moveCount}회</span>
                        </div>
                        {isCompleted ? (
                            <span className="text-green-400 font-semibold flex items-center gap-1">
                                ✅ 완료!
                            </span>
                        ) : (
                            <span className="text-yellow-400 text-xs">진행 중...</span>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* 성공 모달 */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            className="bg-gradient-to-br from-green-900 to-emerald-900 
                         border border-green-500/50 rounded-2xl p-8 text-center
                         shadow-2xl max-w-sm mx-4"
                        >
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: [0, 1.2, 1] }}
                                transition={{ delay: 0.2 }}
                                className="text-6xl block mb-4"
                            >
                                🎉
                            </motion.span>
                            <h2 className="text-2xl font-bold text-white mb-2">
                                챌린지 완료!
                            </h2>
                            <p className="text-green-300 mb-4">
                                "{challenge.target?.name}"을(를) 발견했습니다!
                            </p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="bg-green-800/50 rounded-lg p-3">
                                    <p className="text-green-300">시도 횟수</p>
                                    <p className="text-2xl font-bold text-white">{moveCount}</p>
                                </div>
                                <div className="bg-green-800/50 rounded-lg p-3">
                                    <p className="text-green-300">소요 시간</p>
                                    <p className="text-2xl font-bold text-white">{getElapsedTime()}</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

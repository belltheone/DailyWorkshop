// 최초 발견 축하 모달 컴포넌트
'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface FirstDiscoveryModalProps {
    isOpen: boolean;
    onClose: () => void;
    element: {
        name: string;
        emoji: string;
    };
}

export default function FirstDiscoveryModal({
    isOpen,
    onClose,
    element,
}: FirstDiscoveryModalProps) {
    // 3초 후 자동 닫기
    if (isOpen) {
        setTimeout(() => {
            onClose();
        }, 4000);
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
                    onClick={onClose}
                >
                    {/* 파티클 효과 */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {[...Array(20)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{
                                    x: '50%',
                                    y: '50%',
                                    scale: 0,
                                }}
                                animate={{
                                    x: `${Math.random() * 100}%`,
                                    y: `${Math.random() * 100}%`,
                                    scale: [0, 1, 0],
                                }}
                                transition={{
                                    duration: 2,
                                    delay: Math.random() * 0.5,
                                    ease: 'easeOut',
                                }}
                                className="absolute w-3 h-3 rounded-full"
                                style={{
                                    background: `hsl(${Math.random() * 60 + 30}, 100%, 60%)`,
                                }}
                            />
                        ))}
                    </div>

                    {/* 모달 카드 */}
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.5, opacity: 0, y: 50 }}
                        transition={{ type: 'spring', damping: 15 }}
                        className="relative bg-gradient-to-br from-yellow-600 via-orange-600 to-red-600 
                       rounded-3xl p-1 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[22px] p-8 text-center">
                            {/* 왕관 아이콘 */}
                            <motion.div
                                initial={{ rotate: -30, scale: 0 }}
                                animate={{ rotate: 0, scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring' }}
                                className="text-6xl mb-4"
                            >
                                👑
                            </motion.div>

                            {/* 제목 */}
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-2xl font-bold text-transparent bg-clip-text 
                           bg-gradient-to-r from-yellow-400 to-orange-500 mb-2"
                            >
                                최초 발견!
                            </motion.h2>

                            {/* 설명 */}
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-slate-400 text-sm mb-6"
                            >
                                세계 최초로 이 원소를 발견했습니다!
                            </motion.p>

                            {/* 원소 정보 */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.5, type: 'spring' }}
                                className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 
                           border border-yellow-500/30 rounded-2xl p-6 mb-6"
                            >
                                <span className="text-6xl block mb-3">{element.emoji}</span>
                                <span className="text-2xl font-bold text-white">{element.name}</span>
                            </motion.div>

                            {/* 뱃지 */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="inline-flex items-center gap-2 px-4 py-2 
                           bg-gradient-to-r from-yellow-500/20 to-orange-500/20
                           border border-yellow-500/30 rounded-full"
                            >
                                <span className="text-lg">🏆</span>
                                <span className="text-yellow-400 font-medium text-sm">
                                    First Discoverer
                                </span>
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

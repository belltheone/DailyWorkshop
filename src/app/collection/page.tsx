// 도감 페이지 - 발견한 모든 원소 컬렉션
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Element {
    id: number;
    name: string;
    emoji: string;
    isBaseElement: boolean;
    discoveredBy?: string;
    createdAt?: string;
}

export default function CollectionPage() {
    const [elements, setElements] = useState<Element[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'date' | 'id'>('id');
    const [filterBase, setFilterBase] = useState<'all' | 'base' | 'discovered'>('all');

    // 원소 로드
    useEffect(() => {
        const loadElements = async () => {
            try {
                const response = await fetch('/api/elements');
                const data = await response.json();

                if (data.success && data.elements) {
                    setElements(data.elements);
                }
            } catch (error) {
                console.error('원소 로드 실패:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadElements();
    }, []);

    // 필터링 및 정렬
    const filteredElements = elements
        .filter((el) => {
            // 검색 필터
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                if (!el.name.toLowerCase().includes(query) && !el.emoji.includes(query)) {
                    return false;
                }
            }

            // 기본/발견 필터
            if (filterBase === 'base' && !el.isBaseElement) return false;
            if (filterBase === 'discovered' && el.isBaseElement) return false;

            return true;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'date':
                    return (b.id || 0) - (a.id || 0); // 최신순
                default:
                    return (a.id || 0) - (b.id || 0); // ID순
            }
        });

    const baseElements = elements.filter((el) => el.isBaseElement);
    const discoveredElements = elements.filter((el) => !el.isBaseElement);

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* 헤더 */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <span className="text-2xl">🛠️</span>
                        <h1 className="text-xl font-bold text-white">일일공방</h1>
                    </Link>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-400">
                            발견한 원소: <span className="text-white font-bold">{elements.length}</span>개
                        </span>
                        <Link
                            href="/"
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm
                         transition-colors"
                        >
                            게임으로 돌아가기
                        </Link>
                    </div>
                </div>
            </header>

            {/* 메인 컨텐츠 */}
            <div className="container mx-auto px-4 pt-24 pb-8">
                {/* 통계 카드 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6"
                    >
                        <p className="text-slate-400 text-sm">총 원소</p>
                        <p className="text-3xl font-bold text-white">{elements.length}</p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6"
                    >
                        <p className="text-slate-400 text-sm">기본 원소</p>
                        <p className="text-3xl font-bold text-blue-400">{baseElements.length}</p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6"
                    >
                        <p className="text-slate-400 text-sm">발견한 원소</p>
                        <p className="text-3xl font-bold text-green-400">{discoveredElements.length}</p>
                    </motion.div>
                </div>

                {/* 필터 및 검색 */}
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 mb-6">
                    <div className="flex flex-wrap items-center gap-4">
                        {/* 검색 */}
                        <div className="flex-1 min-w-[200px]">
                            <input
                                type="text"
                                placeholder="원소 검색..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600/50 rounded-lg
                           text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                            />
                        </div>

                        {/* 필터 */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setFilterBase('all')}
                                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${filterBase === 'all'
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-slate-700/50 text-slate-400 hover:text-white'
                                    }`}
                            >
                                전체
                            </button>
                            <button
                                onClick={() => setFilterBase('base')}
                                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${filterBase === 'base'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-700/50 text-slate-400 hover:text-white'
                                    }`}
                            >
                                기본
                            </button>
                            <button
                                onClick={() => setFilterBase('discovered')}
                                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${filterBase === 'discovered'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-slate-700/50 text-slate-400 hover:text-white'
                                    }`}
                            >
                                발견
                            </button>
                        </div>

                        {/* 정렬 */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'id')}
                            className="px-3 py-2 bg-slate-900/50 border border-slate-600/50 rounded-lg
                         text-white focus:outline-none focus:border-purple-500"
                        >
                            <option value="id">ID순</option>
                            <option value="name">이름순</option>
                            <option value="date">최신순</option>
                        </select>
                    </div>
                </div>

                {/* 원소 그리드 */}
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent" />
                    </div>
                ) : filteredElements.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-slate-400 text-lg">원소를 찾을 수 없습니다</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {filteredElements.map((element, index) => (
                            <motion.div
                                key={element.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.02 }}
                                className={`group relative bg-slate-800/50 backdrop-blur-sm border rounded-xl p-4
                           hover:border-purple-500/50 hover:bg-slate-700/50 transition-all cursor-pointer
                           ${element.isBaseElement ? 'border-blue-500/30' : 'border-slate-700/50'}`}
                            >
                                {/* 이모지 */}
                                <div className="text-4xl text-center mb-2">{element.emoji}</div>

                                {/* 이름 */}
                                <p className="text-center text-white font-medium truncate">{element.name}</p>

                                {/* ID 배지 */}
                                <span className="absolute top-2 left-2 text-xs text-slate-500">#{element.id}</span>

                                {/* 기본 원소 배지 */}
                                {element.isBaseElement && (
                                    <span className="absolute top-2 right-2 text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">
                                        기본
                                    </span>
                                )}

                                {/* 호버 효과 */}
                                <div className="absolute inset-0 bg-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

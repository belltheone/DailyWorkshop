// Google AdSense 배너 광고 컴포넌트
'use client';

import { useEffect, useRef } from 'react';

interface AdBannerProps {
    slot: string;
    format?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
    style?: React.CSSProperties;
    className?: string;
}

// Google AdSense Client ID
const ADSENSE_CLIENT = 'ca-pub-5965391983551048';

export default function AdBanner({
    slot,
    format = 'auto',
    style,
    className = '',
}: AdBannerProps) {
    const adRef = useRef<HTMLModElement>(null);
    const isLoaded = useRef(false);

    useEffect(() => {
        // 중복 로드 방지
        if (isLoaded.current) return;
        isLoaded.current = true;

        try {
            // AdSense 스크립트 로드
            if (typeof window !== 'undefined') {
                const adsbygoogle = (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle || [];
                adsbygoogle.push({});
            }
        } catch (error) {
            console.error('AdSense 로드 오류:', error);
        }
    }, []);

    return (
        <ins
            ref={adRef}
            className={`adsbygoogle ${className}`}
            style={{
                display: 'block',
                ...style,
            }}
            data-ad-client={ADSENSE_CLIENT}
            data-ad-slot={slot}
            data-ad-format={format}
            data-full-width-responsive="true"
        />
    );
}

// 좌측 사이드바 광고
export function LeftSidebarAd() {
    return (
        <div className="fixed left-0 top-1/2 -translate-y-1/2 z-10 hidden xl:block">
            <div className="w-[160px] bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-r-lg p-2">
                <div className="w-[140px] h-[400px] bg-slate-700/30 rounded flex items-center justify-center">
                    <AdBanner
                        slot="1234567890"
                        format="vertical"
                        style={{ width: '140px', height: '400px' }}
                    />
                </div>
                <p className="text-center text-xs text-slate-500 mt-1">광고</p>
            </div>
        </div>
    );
}

// 우측 사이드바 광고
export function RightSidebarAd() {
    return (
        <div className="fixed right-0 top-1/2 -translate-y-1/2 z-10 hidden xl:block">
            <div className="w-[160px] bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-l-lg p-2">
                <div className="w-[140px] h-[400px] bg-slate-700/30 rounded flex items-center justify-center">
                    <AdBanner
                        slot="0987654321"
                        format="vertical"
                        style={{ width: '140px', height: '400px' }}
                    />
                </div>
                <p className="text-center text-xs text-slate-500 mt-1">광고</p>
            </div>
        </div>
    );
}

// 하단 배너 광고
export function BottomBannerAd() {
    return (
        <div className="fixed bottom-0 left-0 right-0 z-10 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700/50">
            <div className="max-w-3xl mx-auto py-2 px-4">
                <div className="w-full h-[70px] bg-slate-700/30 rounded flex items-center justify-center">
                    <AdBanner
                        slot="1122334455"
                        format="horizontal"
                        style={{ width: '100%', height: '70px' }}
                    />
                </div>
            </div>
        </div>
    );
}

// 보상형 광고 (힌트 시청 시)
export function RewardedAd({ onReward }: { onReward: () => void }) {
    const handleWatchAd = () => {
        // 실제 보상형 광고 SDK 연동 필요
        // 여기서는 시뮬레이션
        alert('광고 시청 시뮬레이션 (3초 후 보상 지급)');
        setTimeout(() => {
            onReward();
        }, 3000);
    };

    return (
        <button
            onClick={handleWatchAd}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500
                 hover:from-yellow-600 hover:to-orange-600 text-white font-medium rounded-lg
                 transition-all hover:scale-105"
        >
            <span>🎬</span>
            <span>광고 보고 힌트 받기</span>
        </button>
    );
}

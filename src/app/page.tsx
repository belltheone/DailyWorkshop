// 일일공방 (Daily Workshop) 메인 페이지
'use client';

import { useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Canvas from '@/components/Canvas';
import Inventory from '@/components/Inventory';
import { useGameStore, CanvasElement } from '@/store/gameStore';

export default function Home() {
  const {
    setDiscoveredElements,
    addDiscoveredElement,
    addToCanvas,
    removeFromCanvas,
    addToRecent,
    setLoading,
    setCombining,
    canvasElements,
  } = useGameStore();

  // 초기 원소 로드
  useEffect(() => {
    const loadElements = async () => {
      try {
        const response = await fetch('/api/elements');
        const data = await response.json();

        if (data.success && data.elements) {
          setDiscoveredElements(data.elements);
        }
      } catch (error) {
        console.error('원소 로드 실패:', error);
        // 기본 원소 설정 (API 실패 시)
        setDiscoveredElements([
          { id: 1, name: '물', emoji: '💧', isBaseElement: true },
          { id: 2, name: '불', emoji: '🔥', isBaseElement: true },
          { id: 3, name: '흙', emoji: '🌍', isBaseElement: true },
          { id: 4, name: '공기', emoji: '💨', isBaseElement: true },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadElements();
  }, [setDiscoveredElements, setLoading]);

  // 인벤토리에서 원소 클릭 시 캔버스에 추가
  const handleElementClick = useCallback(
    (element: { id: number; name: string; emoji: string }) => {
      // 랜덤 위치에 원소 추가
      const x = 350 + Math.random() * 400;
      const y = 100 + Math.random() * 300;

      const canvasElement: CanvasElement = {
        id: uuidv4(),
        elementId: element.id,
        name: element.name,
        emoji: element.emoji,
        x,
        y,
      };

      addToCanvas(canvasElement);
      addToRecent(element.id);
    },
    [addToCanvas, addToRecent]
  );

  // 두 원소 조합
  const handleCombine = useCallback(
    async (elementA: CanvasElement, elementB: CanvasElement) => {
      setCombining(true);

      try {
        const response = await fetch('/api/combine', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            elementAId: elementA.elementId,
            elementBId: elementB.elementId,
          }),
        });

        const data = await response.json();

        if (data.success) {
          // 조합된 원소들 제거
          removeFromCanvas(elementA.id);
          removeFromCanvas(elementB.id);

          // 결과 원소를 캔버스에 추가
          const midX = (elementA.x + elementB.x) / 2;
          const midY = (elementA.y + elementB.y) / 2;

          const newCanvasElement: CanvasElement = {
            id: uuidv4(),
            elementId: data.result.id,
            name: data.result.name,
            emoji: data.result.emoji,
            x: midX,
            y: midY,
          };

          addToCanvas(newCanvasElement);

          // 새로운 원소를 인벤토리에 추가
          addDiscoveredElement({
            id: data.result.id,
            name: data.result.name,
            emoji: data.result.emoji,
            isBaseElement: data.result.isBaseElement,
          });

          addToRecent(data.result.id);
        }
      } catch (error) {
        console.error('조합 실패:', error);
      } finally {
        setCombining(false);
      }
    },
    [removeFromCanvas, addToCanvas, addDiscoveredElement, addToRecent, setCombining]
  );

  return (
    <main className="relative w-screen h-screen overflow-hidden">
      {/* 인벤토리 사이드바 */}
      <Inventory onElementClick={handleElementClick} />

      {/* 메인 캔버스 */}
      <Canvas onCombine={handleCombine} />
    </main>
  );
}

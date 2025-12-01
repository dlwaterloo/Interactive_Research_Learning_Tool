import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const SwipeableCard = ({ 
  children, 
  onSwipeLeft, 
  onSwipeRight, 
  onSwipeUp,
  index = 0,
  total = 1,
  title = "",
  style = {}
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isLeaving, setIsLeaving] = useState(false);
  const cardRef = useRef(null);

  const handleTouchStart = (e) => {
    setIsDragging(true);
    const touch = e.touches[0];
    setStartX(touch.clientX);
    setStartY(touch.clientY);
    setCurrentX(0);
    setCurrentY(0);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;
    setCurrentX(deltaX);
    setCurrentY(deltaY);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 100;
    const absX = Math.abs(currentX);
    const absY = Math.abs(currentY);

    if (absX > threshold && absX > absY) {
      // Horizontal swipe
      setIsLeaving(true);
      if (currentX > 0 && onSwipeRight) {
        // Swipe right (go back)
        setTimeout(() => {
          onSwipeRight();
          setIsLeaving(false);
          setCurrentX(0);
          setCurrentY(0);
        }, 300);
      } else if (currentX < 0 && onSwipeLeft) {
        // Swipe left (go forward)
        setTimeout(() => {
          onSwipeLeft();
          setIsLeaving(false);
          setCurrentX(0);
          setCurrentY(0);
        }, 300);
      } else {
        setIsLeaving(false);
        setCurrentX(0);
        setCurrentY(0);
      }
    } else if (absY > threshold && absY > absX && currentY < 0 && onSwipeUp) {
      // Swipe up
      setIsLeaving(true);
      setTimeout(() => {
        onSwipeUp();
        setIsLeaving(false);
        setCurrentY(0);
        setCurrentX(0);
      }, 300);
    } else {
      // Snap back
      setCurrentX(0);
      setCurrentY(0);
    }
  };

  // Mouse events for desktop
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setStartY(e.clientY);
    setCurrentX(0);
    setCurrentY(0);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    setCurrentX(deltaX);
    setCurrentY(deltaY);
  };

  const handleMouseUp = () => {
    handleTouchEnd();
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, startX, startY, currentX, currentY]);

  const rotation = currentX * 0.1;
  const baseOpacity = 1 - Math.abs(currentX) / 300;
  const baseScale = isLeaving ? 0.8 : 1 - Math.abs(currentX) / 1000;
  
  // Get base transform from style prop (for stacking)
  const baseTransform = style.transform || '';
  const baseOpacityStyle = style.opacity || 1;
  
  // Combine base transform with drag transform
  const dragTransform = `translateX(${currentX}px) translateY(${currentY}px) rotate(${rotation}deg) scale(${baseScale})`;
  const finalTransform = baseTransform ? `${baseTransform} ${dragTransform}` : dragTransform;

  return (
    <div
      ref={cardRef}
      className="absolute inset-0 w-full h-full"
      style={{
        ...style,
        transform: finalTransform,
        opacity: Math.max(0.3, baseOpacity) * baseOpacityStyle,
        transition: isLeaving ? 'all 0.3s ease-out' : (style.transition || 'none'),
        zIndex: style.zIndex || (total - index),
        cursor: isDragging ? 'grabbing' : 'grab',
        display: style.display || 'block',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
    >
      <div className="w-full h-full bg-white/40 backdrop-blur-xl border border-white/60 shadow-2xl rounded-3xl overflow-hidden flex flex-col">
        {/* Card Header */}
        {title && (
          <div className="px-6 py-4 border-b border-white/20 bg-white/20">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#1A1A2E]">{title}</h2>
              <div className="text-xs text-[#1A1A2E]/60 font-medium">
                {index + 1} / {total}
              </div>
            </div>
          </div>
        )}
        
        {/* Card Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {children}
        </div>

        {/* Swipe Hints */}
        <div className="px-6 py-4 border-t border-white/20 bg-white/10 flex items-center justify-between text-xs text-[#1A1A2E]/50">
          <div className="flex items-center gap-2">
            <ArrowLeft size={16} />
            <span>Previous</span>
          </div>
          <span>Swipe to navigate</span>
          <div className="flex items-center gap-2">
            <span>Next</span>
            <ArrowRight size={16} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwipeableCard;


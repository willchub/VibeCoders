import { useRef } from 'react';

const MAX_TILT = 12; // max tilt degrees

export default function TiltCard({ children, className = '' }) {
  const cardRef = useRef(null);

  const handleMove = (e) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);

    card.style.transform =
      `rotateY(${x * MAX_TILT}deg) ` +
      `rotateX(${-y * MAX_TILT}deg) ` +
      `scale(1.04)`;
  };

  const handleLeave = () => {
    const card = cardRef.current;
    if (card) card.style.transform = '';
  };

  return (
    <div className={className} style={{ perspective: '800px' }}>
      <div
        ref={cardRef}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{
          transition: 'transform 0.15s ease',
          transformStyle: 'preserve-3d',
        }}
      >
        {children}
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback, ReactNode } from "react";
import { Sparkles, Star, Heart, Zap, Music, Palette, BookOpen, Gamepad2 } from "lucide-react";

interface FloatingElement {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  size: number;
  delay: number;
  icon: ReactNode;
  color: string;
  rotation: number;
}

interface InteractiveFloatingElementsProps {
  themeName: string;
}

const getThemeElements = (themeName: string): { icons: ReactNode[]; colors: string[] } => {
  switch (themeName) {
    case "princess":
      return {
        icons: [
          <Heart key="h" className="w-full h-full" />,
          <Star key="s" className="w-full h-full" />,
          <Sparkles key="sp" className="w-full h-full" />,
          <span key="e1">👑</span>,
          <span key="e2">💎</span>,
          <span key="e3">🦄</span>,
        ],
        colors: ["text-rose-300", "text-pink-300", "text-purple-300", "text-fuchsia-300"],
      };
    case "ocean":
      return {
        icons: [
          <span key="e1">🐠</span>,
          <span key="e2">🐚</span>,
          <span key="e3">🌊</span>,
          <span key="e4">🐙</span>,
          <span key="e5">🦀</span>,
          <span key="e6">⭐</span>,
        ],
        colors: ["text-cyan-300", "text-blue-300", "text-teal-300", "text-sky-300"],
      };
    case "space":
      return {
        icons: [
          <Star key="s" className="w-full h-full" />,
          <span key="e1">🚀</span>,
          <span key="e2">🌙</span>,
          <span key="e3">⭐</span>,
          <span key="e4">🛸</span>,
          <span key="e5">🪐</span>,
        ],
        colors: ["text-indigo-300", "text-purple-300", "text-violet-300", "text-blue-300"],
      };
    case "jungle":
      return {
        icons: [
          <span key="e1">🌿</span>,
          <span key="e2">🦋</span>,
          <span key="e3">🌴</span>,
          <span key="e4">🦜</span>,
          <span key="e5">🌺</span>,
          <span key="e6">🐒</span>,
        ],
        colors: ["text-green-300", "text-emerald-300", "text-lime-300", "text-teal-300"],
      };
    case "candy":
      return {
        icons: [
          <span key="e1">🍭</span>,
          <span key="e2">🍬</span>,
          <span key="e3">🧁</span>,
          <span key="e4">🍩</span>,
          <span key="e5">🍪</span>,
          <span key="e6">🎀</span>,
        ],
        colors: ["text-pink-300", "text-purple-300", "text-yellow-300", "text-orange-300"],
      };
    case "superhero":
      return {
        icons: [
          <Zap key="z" className="w-full h-full" />,
          <Star key="s" className="w-full h-full" />,
          <span key="e1">💥</span>,
          <span key="e2">⚡</span>,
          <span key="e3">🦸</span>,
          <span key="e4">🔥</span>,
        ],
        colors: ["text-yellow-400", "text-red-400", "text-blue-400", "text-orange-400"],
      };
    case "dinosaur":
      return {
        icons: [
          <span key="e1">🦖</span>,
          <span key="e2">🦕</span>,
          <span key="e3">🌋</span>,
          <span key="e4">🥚</span>,
          <span key="e5">🌿</span>,
          <span key="e6">🦴</span>,
        ],
        colors: ["text-green-400", "text-orange-400", "text-amber-400", "text-lime-400"],
      };
    case "unicorn":
      return {
        icons: [
          <span key="e1">🦄</span>,
          <span key="e2">🌈</span>,
          <span key="e3">✨</span>,
          <span key="e4">💖</span>,
          <span key="e5">🌟</span>,
          <span key="e6">☁️</span>,
        ],
        colors: ["text-pink-300", "text-purple-300", "text-blue-300", "text-violet-300"],
      };
    case "pirate":
      return {
        icons: [
          <span key="e1">🏴‍☠️</span>,
          <span key="e2">⚓</span>,
          <span key="e3">🦜</span>,
          <span key="e4">💰</span>,
          <span key="e5">🗺️</span>,
          <span key="e6">⚔️</span>,
        ],
        colors: ["text-amber-400", "text-yellow-400", "text-stone-400", "text-orange-400"],
      };
    case "fairy":
      return {
        icons: [
          <span key="e1">🧚</span>,
          <span key="e2">🌸</span>,
          <span key="e3">✨</span>,
          <span key="e4">🦋</span>,
          <span key="e5">🍄</span>,
          <span key="e6">🌺</span>,
        ],
        colors: ["text-fuchsia-300", "text-pink-300", "text-purple-300", "text-violet-300"],
      };
    case "robot":
      return {
        icons: [
          <span key="e1">🤖</span>,
          <span key="e2">⚙️</span>,
          <span key="e3">🔧</span>,
          <span key="e4">💡</span>,
          <span key="e5">🔋</span>,
          <span key="e6">📡</span>,
        ],
        colors: ["text-sky-400", "text-cyan-400", "text-slate-400", "text-blue-400"],
      };
    default: // rainbow
      return {
        icons: [
          <Sparkles key="sp" className="w-full h-full" />,
          <Star key="s" className="w-full h-full" />,
          <Heart key="h" className="w-full h-full" />,
          <Music key="m" className="w-full h-full" />,
          <Palette key="p" className="w-full h-full" />,
          <span key="e1">🎨</span>,
        ],
        colors: ["text-pink-300", "text-yellow-300", "text-purple-300", "text-cyan-300"],
      };
  }
};

const InteractiveFloatingElements = ({ themeName }: InteractiveFloatingElementsProps) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [elements, setElements] = useState<FloatingElement[]>([]);
  const [isTouch, setIsTouch] = useState(false);

  const { icons, colors } = getThemeElements(themeName);

  // Initialize floating elements
  useEffect(() => {
    const newElements: FloatingElement[] = [];
    const numElements = 12;

    for (let i = 0; i < numElements; i++) {
      const randomIcon = icons[Math.floor(Math.random() * icons.length)];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      newElements.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        targetX: Math.random() * 100,
        targetY: Math.random() * 100,
        size: 16 + Math.random() * 24,
        delay: Math.random() * 2,
        icon: randomIcon,
        color: randomColor,
        rotation: Math.random() * 360,
      });
    }

    setElements(newElements);
  }, [themeName]);

  // Handle mouse movement
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isTouch) {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    }
  }, [isTouch]);

  // Handle touch movement
  const handleTouchMove = useCallback((e: TouchEvent) => {
    setIsTouch(true);
    const touch = e.touches[0];
    if (touch) {
      setMousePosition({
        x: (touch.clientX / window.innerWidth) * 100,
        y: (touch.clientY / window.innerHeight) * 100,
      });
    }
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [handleMouseMove, handleTouchMove]);

  // Calculate element position based on mouse with parallax effect
  const getParallaxPosition = (element: FloatingElement) => {
    const parallaxStrength = 0.15;
    const baseX = element.x;
    const baseY = element.y;
    
    const deltaX = (mousePosition.x - 50) * parallaxStrength * (element.size / 30);
    const deltaY = (mousePosition.y - 50) * parallaxStrength * (element.size / 30);

    return {
      x: baseX + deltaX,
      y: baseY + deltaY,
    };
  };

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {elements.map((element) => {
        const { x, y } = getParallaxPosition(element);
        
        return (
          <div
            key={element.id}
            className={`absolute transition-all duration-700 ease-out ${element.color}`}
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: element.size,
              height: element.size,
              transform: `rotate(${element.rotation}deg)`,
              opacity: 0.6,
              animation: `float ${3 + element.delay}s ease-in-out infinite`,
              animationDelay: `${element.delay}s`,
            }}
          >
            {element.icon}
          </div>
        );
      })}
      
      {/* Mouse/Touch follower trail */}
      <div
        className="absolute w-8 h-8 transition-all duration-300 ease-out opacity-40"
        style={{
          left: `${mousePosition.x}%`,
          top: `${mousePosition.y}%`,
          transform: "translate(-50%, -50%)",
        }}
      >
        <div className={`w-full h-full ${colors[0]} animate-ping`}>
          <Sparkles className="w-full h-full" />
        </div>
      </div>
      
      {/* Secondary trail elements */}
      {[...Array(3)].map((_, i) => (
        <div
          key={`trail-${i}`}
          className={`absolute w-4 h-4 transition-all ease-out opacity-30 ${colors[i % colors.length]}`}
          style={{
            left: `${mousePosition.x}%`,
            top: `${mousePosition.y}%`,
            transform: "translate(-50%, -50%)",
            transitionDuration: `${400 + i * 150}ms`,
          }}
        >
          <Star className="w-full h-full" />
        </div>
      ))}
    </div>
  );
};

export default InteractiveFloatingElements;

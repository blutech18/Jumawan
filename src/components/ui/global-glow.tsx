import { useEffect, useState } from "react";
import { useScroll } from "framer-motion";

export const GlobalGlow = () => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const { scrollY } = useScroll();
    const [opacity, setOpacity] = useState(0);
    const [y, setY] = useState(100);

    useEffect(() => {
        return scrollY.onChange((latest) => {
            const vh = window.innerHeight;
            // Start fading in after 50% of the viewport height (mid-Hero)
            // Fully visible by 100% of viewport (start of About)
            const start = vh * 0.5;
            const end = vh * 1.2;

            if (latest < start) {
                setOpacity(0);
                setY(100);
            } else if (latest > end) {
                setOpacity(1);
                setY(0);
            } else {
                const progress = (latest - start) / (end - start);
                setOpacity(progress);
                setY(100 - (progress * 100));
            }
        });
    }, [scrollY]);

    if (!mounted) return null;

    return (
        <div
            className="fixed inset-x-0 bottom-0 z-50 pointer-events-none h-[160px] md:h-[240px] w-full transition-all duration-700 ease-out"
            style={{
                opacity,
                transform: `translateY(${y}px)`,
                maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
                WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)'
            }}
        >
            <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-cyan-700/30 via-cyan-800/20 to-transparent blur-3xl opacity-70 animate-pulse"
                style={{
                    animationDuration: '4s'
                }}
            />
            <div
                className="absolute bottom-[-100px] left-1/2 -translate-x-1/2 w-[120%] h-[240px] bg-blue-700/25 blur-[100px] rounded-[100%] animate-pulse"
                style={{
                    animationDuration: '6s'
                }}
            />
        </div>
    );
};

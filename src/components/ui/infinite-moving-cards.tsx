import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";

export const InfiniteMovingCards = ({
    items,
    direction = "left",
    speed = "fast",
    pauseOnHover = true,
    className,
}: {
    items: {
        name: string;
        image: string;
    }[];
    direction?: "left" | "right";
    speed?: "fast" | "normal" | "slow";
    pauseOnHover?: boolean;
    className?: string;
}) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const scrollerRef = React.useRef<HTMLUListElement>(null);

    useEffect(() => {
        addAnimation();
    }, []);
    const [start, setStart] = useState(false);
    function addAnimation() {
        if (containerRef.current && scrollerRef.current) {
            const scrollerContent = Array.from(scrollerRef.current.children);

            scrollerContent.forEach((item) => {
                const duplicatedItem = item.cloneNode(true);
                if (scrollerRef.current) {
                    scrollerRef.current.appendChild(duplicatedItem);
                }
            });

            getDirection();
            getSpeed();
            setStart(true);
        }
    }
    const getDirection = () => {
        if (containerRef.current) {
            if (direction === "left") {
                containerRef.current.style.setProperty(
                    "--animation-direction",
                    "forwards"
                );
            } else {
                containerRef.current.style.setProperty(
                    "--animation-direction",
                    "reverse"
                );
            }
        }
    };
    const getSpeed = () => {
        if (containerRef.current) {
            if (speed === "fast") {
                containerRef.current.style.setProperty("--animation-duration", "20s");
            } else if (speed === "normal") {
                containerRef.current.style.setProperty("--animation-duration", "40s");
            } else {
                containerRef.current.style.setProperty("--animation-duration", "80s");
            }
        }
    };
    return (
        <div
            ref={containerRef}
            className={cn(
                "scroller relative z-20 max-w-[100vw] overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]",
                className
            )}
        >
            <ul
                ref={scrollerRef}
                className={cn(
                    "flex min-w-full shrink-0 gap-4 sm:gap-6 py-4 w-max flex-nowrap",
                    start && "animate-scroll",
                    pauseOnHover && "hover:[animation-play-state:paused]"
                )}
            >
                {items.map((item, idx) => (
                    <li
                        className="w-[180px] sm:w-[240px] h-[70px] sm:h-[80px] max-w-full relative rounded-2xl border border-white/[0.08] flex-shrink-0 bg-white/[0.02] backdrop-blur-md px-4 sm:px-5 py-3 sm:py-4 hover:bg-white/[0.06] hover:border-primary/40 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all duration-300 group flex items-center justify-start gap-3 sm:gap-4 overflow-hidden"
                        key={item.name + idx}
                    >
                        {/* Glossy gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.01] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                        <div className="relative z-20 w-8 h-8 sm:w-10 sm:h-10 shrink-0 filter drop-shadow-md group-hover:scale-110 transition-transform duration-300 flex items-center justify-center bg-white/[0.02] rounded-lg p-1.5 border border-white/[0.05]">
                            <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain" />
                        </div>
                        <span className="relative z-20 text-[13px] sm:text-[15px] font-medium text-foreground/90 group-hover:text-white transition-colors truncate flex-1">
                            {item.name}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

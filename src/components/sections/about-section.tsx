"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";





export function AboutSection() {
    const { ref, inView } = useInView({
        threshold: 0.1,
        triggerOnce: true,
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring" as const, stiffness: 100, damping: 15 },
        },
    };

    return (
        <section id="about" className="py-24 relative overflow-hidden">


            <div className="container px-4 md:px-6 relative z-10">
                <motion.div
                    ref={ref}
                    initial="hidden"
                    animate={inView ? "visible" : "hidden"}
                    variants={containerVariants}
                    className="max-w-6xl mx-auto"
                >
                    {/* Header - Minimalist */}
                    <motion.div variants={itemVariants} className="flex flex-col items-center mb-16 mx-auto w-fit"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-center">
                            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                About Me
                            </span>
                        </h2>
                        <div className="flex items-center justify-center gap-3 w-full">
                            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/70" />
                            <div className="w-1.5 h-1.5 rounded-full bg-white/80" />
                            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/70" />
                        </div>              </motion.div>

                    <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">

                        {/* Left Column - Image/Carousel (Simpler) */}
                        <motion.div variants={itemVariants} className="lg:col-span-5 relative group">
                            <div className="relative rounded-2xl overflow-hidden aspect-[4/5] shadow-2xl shadow-primary/5">
                                <Carousel className="w-full h-full">
                                    <CarouselContent className="-ml-0 h-full">
                                        {[
                                            { src: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80", label: "Development" },
                                            { src: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&q=80", label: "Design" },
                                            { src: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80", label: "Innovation" }
                                        ].map((item, i) => (
                                            <CarouselItem key={i} className="pl-0 h-full">
                                                <div className="relative w-full h-full">
                                                    <img
                                                        src={item.src}
                                                        alt={item.label}
                                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                                                    <div className="absolute bottom-6 left-6">
                                                        <span className="text-white/90 font-medium text-sm tracking-wider uppercase border-l-2 border-primary pl-3">
                                                            {item.label}
                                                        </span>
                                                    </div>
                                                </div>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <CarouselPrevious className="static translate-y-0 h-8 w-8 bg-black/20 hover:bg-black/40 border-none text-white" />
                                        <CarouselNext className="static translate-y-0 h-8 w-8 bg-black/20 hover:bg-black/40 border-none text-white" />
                                    </div>
                                </Carousel>
                            </div>

                            {/* Decorative element behind image */}
                            <div className="absolute -z-10 top-12 -right-12 w-full h-full border border-primary/10 rounded-2xl hidden lg:block" />
                        </motion.div>

                        {/* Right Column - Text & Content */}
                        <motion.div variants={itemVariants} className="lg:col-span-7 flex flex-col justify-center">
                            <div className="prose prose-invert max-w-none text-base md:text-lg leading-relaxed text-muted-foreground/90 space-y-8">
                                <div>
                                    <p>
                                        I'm a <span className="text-foreground font-semibold">Full Stack Developer</span> and <span className="text-foreground font-semibold">BSIT Graduate</span> from Liceo de Cagayan University. I bridge the gap between user needs and technical implementation by building accessible, pixel-perfect user interfaces that blend art with code, rooted in clean architecture and performance optimization.
                                    </p>
                                </div>

                                <div>
                                    <div className="grid grid-cols-[70%_30%] gap-4 sm:gap-6 items-center">
                                        <div>
                                            <h3 className="text-foreground font-bold text-xl mb-3">Blutech</h3>
                                            <p>
                                                Operating under <strong>Blutech</strong>, I accept commissions and freelance projects, expanding my expertise beyond personal work to deliver tailored freelance solutions for clients.
                                            </p>
                                        </div>
                                        <div className="flex justify-end lg:justify-center">
                                            <img src="/blutech2.png" alt="Blutech Logo" className="w-full max-w-[120px] h-auto object-contain" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-foreground font-bold text-xl mb-3">Beyond Coding</h3>
                                    <p>
                                        When I'm not at my computer, I'm usually exploring the latest tech trends, experimenting with new frameworks, or gaming. I believe that staying curious and maintaining a healthy work-life balance is key to sustained creativity and productivity.
                                    </p>
                                </div>
                            </div>




                        </motion.div>

                    </div>
                </motion.div>
            </div>
        </section>
    );
}
import { useState, useRef, type MouseEvent } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

export function ImageGallery({ images, alt, viewTransitionName }: { images: string[]; alt: string; viewTransitionName?: string }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const cardRef = useRef<HTMLDivElement>(null);

    // Tilt on hover effect
    const mouseX = useMotionValue(0); // Not re-trigger a re-render
    const mouseY = useMotionValue(0);
    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 20 }); // Smoth the movement with spring effect
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 20 });

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        
        // Get element's position and dimensions
        const rect = cardRef.current?.getBoundingClientRect();
        if (!rect) return;

        // Convert mouse position in the browswer to -0.5 +0.5 relative to the card 
        mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
        mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    };

    const resetTilt = () => { mouseX.set(0); mouseY.set(0); };

    return (
        <div>
            <div style={{ perspective: 1000 }}>
                <motion.div
                    ref={cardRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={resetTilt}
                    style={{ rotateX, rotateY }}
                    className="aspect-square overflow-hidden rounded-2xl bg-surface-2"
                >
                    <img 
                        src={images[activeIndex]} alt={alt} className="h-full w-full object-cover rounded-2xl" 
                        style={{ viewTransitionName }}
                    />
                </motion.div>
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
                <div className="mt-4 flex gap-2">
                    {images.map((img, i) => (
                        <button 
                            key={img}
                            onClick={() => setActiveIndex(i)}
                            className={`h-16 w-16 overflow-hidden rounded-lg border-2
                                transition-colors ${i === activeIndex ? 'border-accent' : 'border-transparent'}`}
                        >
                            <img src={img} alt={`${alt} ${i + 1}`} loading="lazy"
                            className="h-full w-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
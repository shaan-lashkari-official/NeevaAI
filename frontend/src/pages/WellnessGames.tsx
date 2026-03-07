import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, ArrowLeft, Wind, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const FocusFlow = () => {
    const [isActive, setIsActive] = useState(false);
    const [phase, setPhase] = useState('Inhale');
    const [, setCount] = useState(0);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isActive) {
            interval = setInterval(() => {
                setCount((c) => {
                    const newCount = (c + 1) % 16;
                    if (newCount >= 0 && newCount < 4) setPhase('Inhale');
                    else if (newCount >= 4 && newCount < 8) setPhase('Hold');
                    else if (newCount >= 8 && newCount < 12) setPhase('Exhale');
                    else setPhase('Hold');
                    return newCount;
                });
            }, 1000);
        }
        return () => clearInterval(interval!);
    }, [isActive]);

    return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="relative flex items-center justify-center w-64 h-64">
                <motion.div
                    animate={{
                        scale: phase === 'Inhale' ? 1.5 : phase === 'Exhale' ? 1 : 1.5,
                        opacity: phase === 'Hold' ? 0.8 : 1,
                    }}
                    transition={{ duration: 4, ease: "easeInOut" }}
                    className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: phase === 'Inhale' ? 1.2 : phase === 'Exhale' ? 0.8 : 1.2,
                    }}
                    transition={{ duration: 4, ease: "easeInOut" }}
                    className="w-48 h-48 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center shadow-2xl"
                >
                    <span className="text-2xl font-bold text-gray-800 dark:text-gray-200">{phase}</span>
                </motion.div>
            </div>
            <button
                onClick={() => setIsActive(!isActive)}
                className="mt-8 px-8 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2"
            >
                {isActive ? <Pause size={20} /> : <Play size={20} />}
                {isActive ? 'Pause' : 'Start Focus'}
            </button>
        </div>
    );
};

const SensoryCalm = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: -1000, y: -1000, isDown: false, trail: [] as { x: number; y: number; age: number }[] });
    const particlesRef = useRef<any[]>([]);
    const burstCooldownRef = useRef(0);

    const initCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            canvas.width = canvas.offsetWidth * window.devicePixelRatio;
            canvas.height = canvas.offsetHeight * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        };
        window.addEventListener('resize', resize);
        resize();

        const W = () => canvas.offsetWidth;
        const H = () => canvas.offsetHeight;

        class Particle {
            x: number;
            y: number;
            baseSize: number;
            size: number;
            vx: number;
            vy: number;
            hue: number;
            saturation: number;
            lightness: number;
            alpha: number;
            life: number;
            maxLife: number;
            wobbleOffset: number;
            wobbleSpeed: number;
            glowing: number;

            constructor(x?: number, y?: number, opts?: any) {
                this.x = x ?? Math.random() * W();
                this.y = y ?? Math.random() * H();
                this.baseSize = opts?.size ?? (Math.random() * 4 + 1.5);
                this.size = this.baseSize;
                this.vx = opts?.vx ?? (Math.random() - 0.5) * 0.8;
                this.vy = opts?.vy ?? (Math.random() - 0.5) * 0.8;
                this.hue = opts?.hue ?? (Math.random() * 80 + 220); // blues-purples
                this.saturation = 70 + Math.random() * 20;
                this.lightness = 55 + Math.random() * 20;
                this.alpha = opts?.alpha ?? (0.3 + Math.random() * 0.4);
                this.life = 0;
                this.maxLife = opts?.maxLife ?? (400 + Math.random() * 600);
                this.wobbleOffset = Math.random() * Math.PI * 2;
                this.wobbleSpeed = 0.01 + Math.random() * 0.02;
                this.glowing = 0;
            }

            update(time: number) {
                const mouse = mouseRef.current;
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const influenceRadius = mouse.isDown ? 200 : 140;

                if (dist < influenceRadius && mouse.x > 0) {
                    const force = (1 - dist / influenceRadius);
                    const forceStrength = mouse.isDown ? 2.5 : 0.8;

                    if (mouse.isDown) {
                        // Click: particles rush toward cursor — satisfying vortex pull
                        this.vx += (dx / dist) * force * forceStrength * 0.3;
                        this.vy += (dy / dist) * force * forceStrength * 0.3;
                        this.hue += force * 2; // color shift on pull
                    } else {
                        // Hover: gentle orbit — particles swirl around cursor
                        const angle = Math.atan2(dy, dx);
                        const tangentX = -Math.sin(angle);
                        const tangentY = Math.cos(angle);
                        // Slight pull inward + strong tangential swirl
                        this.vx += (dx / dist) * force * 0.15 + tangentX * force * forceStrength;
                        this.vy += (dy / dist) * force * 0.15 + tangentY * force * forceStrength;
                    }

                    this.glowing = Math.min(1, this.glowing + 0.1);
                    this.size = this.baseSize * (1 + force * 0.8);
                } else {
                    this.glowing *= 0.95;
                    this.size += (this.baseSize - this.size) * 0.05;
                }

                // Gentle wobble for ambient motion
                this.vx += Math.sin(time * this.wobbleSpeed + this.wobbleOffset) * 0.02;
                this.vy += Math.cos(time * this.wobbleSpeed * 0.7 + this.wobbleOffset) * 0.02;

                // Friction
                this.vx *= 0.985;
                this.vy *= 0.985;

                // Soft speed limit
                const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                if (speed > 4) {
                    this.vx *= 4 / speed;
                    this.vy *= 4 / speed;
                }

                this.x += this.vx;
                this.y += this.vy;

                // Soft boundary wrapping
                const margin = 20;
                if (this.x < -margin) this.x = W() + margin;
                if (this.x > W() + margin) this.x = -margin;
                if (this.y < -margin) this.y = H() + margin;
                if (this.y > H() + margin) this.y = -margin;

                this.life++;
                // Fade in and out
                const lifeRatio = this.life / this.maxLife;
                if (lifeRatio < 0.05) {
                    this.alpha = Math.min(this.alpha, lifeRatio / 0.05 * 0.6);
                } else if (lifeRatio > 0.85) {
                    this.alpha *= 0.98;
                }
            }

            draw(ctx: CanvasRenderingContext2D) {
                // Glow layer
                if (this.glowing > 0.05) {
                    const glowSize = this.size * (2 + this.glowing * 2);
                    const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glowSize);
                    grad.addColorStop(0, `hsla(${this.hue}, ${this.saturation}%, ${this.lightness + 15}%, ${this.alpha * this.glowing * 0.4})`);
                    grad.addColorStop(1, `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, 0)`);
                    ctx.fillStyle = grad;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, glowSize, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Core particle
                ctx.fillStyle = `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, ${this.alpha})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }

            isDead() {
                return this.life > this.maxLife;
            }
        }

        // Init particles
        const particles = particlesRef.current;
        if (particles.length === 0) {
            for (let i = 0; i < 120; i++) {
                particles.push(new Particle());
            }
        }

        let animationFrameId: number;
        let time = 0;

        const drawConnections = (ctx: CanvasRenderingContext2D) => {
            const connectionDist = 80;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < connectionDist) {
                        const alpha = (1 - dist / connectionDist) * 0.12 * Math.min(particles[i].alpha, particles[j].alpha);
                        const hue = (particles[i].hue + particles[j].hue) / 2;
                        ctx.strokeStyle = `hsla(${hue}, 60%, 60%, ${alpha})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[j].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        };

        const drawMouseTrail = (ctx: CanvasRenderingContext2D) => {
            const trail = mouseRef.current.trail;
            if (trail.length < 2) return;

            for (let i = 1; i < trail.length; i++) {
                const t = i / trail.length;
                const alpha = t * 0.3 * (1 - trail[i].age / 30);
                if (alpha <= 0) continue;
                const size = t * 3;
                ctx.fillStyle = `hsla(260, 70%, 70%, ${alpha})`;
                ctx.beginPath();
                ctx.arc(trail[i].x, trail[i].y, size, 0, Math.PI * 2);
                ctx.fill();
            }
        };

        const animate = () => {
            time++;
            ctx.save();
            ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);

            // Fade trail effect — creates beautiful motion blur
            ctx.fillStyle = document.documentElement.classList.contains('dark')
                ? 'rgba(15, 15, 25, 0.15)'
                : 'rgba(250, 250, 250, 0.15)';
            ctx.fillRect(0, 0, W(), H());

            // Update mouse trail
            const trail = mouseRef.current.trail;
            trail.forEach(t => t.age++);
            while (trail.length > 0 && trail[0].age > 30) trail.shift();

            drawMouseTrail(ctx);
            drawConnections(ctx);

            // Update and draw particles
            for (let i = particles.length - 1; i >= 0; i--) {
                particles[i].update(time);
                particles[i].draw(ctx);
                if (particles[i].isDead()) {
                    particles.splice(i, 1);
                }
            }

            // Maintain particle count
            const targetCount = 120;
            while (particles.length < targetCount) {
                particles.push(new Particle());
            }

            // Burst particles on click
            if (mouseRef.current.isDown && burstCooldownRef.current <= 0) {
                const mx = mouseRef.current.x;
                const my = mouseRef.current.y;
                for (let i = 0; i < 5; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = 1 + Math.random() * 2;
                    particles.push(new Particle(mx, my, {
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        size: 2 + Math.random() * 3,
                        hue: 260 + Math.random() * 60,
                        alpha: 0.6 + Math.random() * 0.3,
                        maxLife: 100 + Math.random() * 150,
                    }));
                }
                burstCooldownRef.current = 4;
            }
            burstCooldownRef.current = Math.max(0, burstCooldownRef.current - 1);

            ctx.restore();
            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        // Mouse event handlers
        const getPos = (e: MouseEvent | TouchEvent) => {
            const rect = canvas.getBoundingClientRect();
            const clientX = 'touches' in e ? e.touches[0]?.clientX ?? 0 : e.clientX;
            const clientY = 'touches' in e ? e.touches[0]?.clientY ?? 0 : e.clientY;
            return { x: clientX - rect.left, y: clientY - rect.top };
        };

        const onMove = (e: MouseEvent | TouchEvent) => {
            const pos = getPos(e);
            mouseRef.current.x = pos.x;
            mouseRef.current.y = pos.y;
            mouseRef.current.trail.push({ x: pos.x, y: pos.y, age: 0 });
            if (mouseRef.current.trail.length > 40) mouseRef.current.trail.shift();
        };
        const onDown = (e: MouseEvent | TouchEvent) => {
            const pos = getPos(e);
            mouseRef.current.x = pos.x;
            mouseRef.current.y = pos.y;
            mouseRef.current.isDown = true;
        };
        const onUp = () => { mouseRef.current.isDown = false; };
        const onLeave = () => {
            mouseRef.current.x = -1000;
            mouseRef.current.y = -1000;
            mouseRef.current.isDown = false;
        };

        canvas.addEventListener('mousemove', onMove);
        canvas.addEventListener('mousedown', onDown);
        canvas.addEventListener('mouseup', onUp);
        canvas.addEventListener('mouseleave', onLeave);
        canvas.addEventListener('touchmove', onMove, { passive: true });
        canvas.addEventListener('touchstart', onDown, { passive: true });
        canvas.addEventListener('touchend', onUp);

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
            canvas.removeEventListener('mousemove', onMove);
            canvas.removeEventListener('mousedown', onDown);
            canvas.removeEventListener('mouseup', onUp);
            canvas.removeEventListener('mouseleave', onLeave);
            canvas.removeEventListener('touchmove', onMove);
            canvas.removeEventListener('touchstart', onDown);
            canvas.removeEventListener('touchend', onUp);
        };
    }, []);

    useEffect(() => {
        const cleanup = initCanvas();
        return cleanup;
    }, [initCanvas]);

    return (
        <div className="w-full h-[60vh] bg-[#fafafa] dark:bg-[#0f0f19] rounded-3xl overflow-hidden relative cursor-none select-none">
            <canvas ref={canvasRef} className="w-full h-full" />
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none">
                <p className="text-gray-400 dark:text-gray-500 text-sm bg-white/60 dark:bg-white/5 backdrop-blur px-4 py-2 rounded-full">
                    Move &amp; click to interact with particles
                </p>
            </div>
        </div>
    );
};

const WellnessGames = () => {
    const [activeTab, setActiveTab] = useState<'focus' | 'sensory'>('focus');

    return (
        <div className="min-h-screen bg-[#FAFAFA] dark:bg-transparent pb-20">
            <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-8">
                {/* Header */}
                <div className="animate-in flex items-center gap-4">
                    <Link to="/wellness" className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-gray-600 dark:text-gray-400" />
                    </Link>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-2">Wellness Games</h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400">Interactive experiences for focus and calm</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-8 animate-in">
                    <button
                        onClick={() => setActiveTab('focus')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${activeTab === 'focus'
                                ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg shadow-purple-500/30'
                                : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10'
                            }`}
                    >
                        <Wind size={20} />
                        Focus Flow
                    </button>
                    <button
                        onClick={() => setActiveTab('sensory')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${activeTab === 'sensory'
                                ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg shadow-purple-500/30'
                                : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10'
                            }`}
                    >
                        <Sparkles size={20} />
                        Sensory Calm
                    </button>
                </div>

                {/* Game Area */}
                <div className="bg-white dark:bg-white/5 rounded-[2.5rem] p-8 border border-gray-100 dark:border-white/10 shadow-xl shadow-purple-500/5 animate-in">
                    <AnimatePresence mode="wait">
                        {activeTab === 'focus' ? (
                            <motion.div
                                key="focus"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <div className="mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Box Breathing</h2>
                                    <p className="text-gray-600 dark:text-gray-400">Follow the visual guide to regulate your breathing and improve focus.</p>
                                </div>
                                <FocusFlow />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="sensory"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <div className="mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Particle Flow</h2>
                                    <p className="text-gray-600 dark:text-gray-400">Move your cursor to swirl particles. Click to pull them in and create bursts.</p>
                                </div>
                                <SensoryCalm />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default WellnessGames;

import { motion } from 'framer-motion';

interface CircularTextProps {
    text: string;
    radius?: number;
    className?: string;
    duration?: number;
}

const CircularText = ({ text, radius = 100, className = "", duration = 20 }: CircularTextProps) => {
    const characters = text.split("");
    const angleStep = 360 / characters.length;

    return (
        <motion.div
            className={`relative flex items-center justify-center ${className}`}
            animate={{ rotate: 360 }}
            transition={{ duration: duration, repeat: Infinity, ease: "linear" }}
            style={{ width: radius * 2, height: radius * 2 }}
        >
            {characters.map((char, i) => (
                <span
                    key={i}
                    className="absolute text-sm font-medium uppercase tracking-widest text-gray-500 dark:text-gray-400"
                    style={{
                        transform: `rotate(${i * angleStep}deg) translateY(-${radius}px)`,
                        transformOrigin: "center center",
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        marginTop: "-0.5em", // Center vertically
                        marginLeft: "-0.5em", // Center horizontally roughly
                    }}
                >
                    {char}
                </span>
            ))}
        </motion.div>
    );
};

export default CircularText;

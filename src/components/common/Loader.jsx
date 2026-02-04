import { motion } from 'framer-motion';

const Loader = () => {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="relative">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 360],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <div className="w-4 h-4 bg-accent rounded-full" />
                </motion.div>
            </div>
        </div>
    );
};

export default Loader;

import { motion } from 'framer-motion';

const PageTemplate = ({ title, description }) => {
    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-secondary">{title}</h1>
                <p className="text-secondary/60 mt-1">{description}</p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-3xl border border-primary/5 min-h-[500px]"
            >
                <div className="flex flex-col items-center justify-center h-full text-secondary/30 space-y-4">
                    <div className="w-20 h-20 rounded-full border-4 border-dashed border-primary/20 flex items-center justify-center">
                        <span className="text-2xl font-bold">i</span>
                    </div>
                    <div className="text-center">
                        <p className="text-xl font-medium">Coming Soon</p>
                        <p className="text-sm">We are working hard to bring {title} to life.</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default PageTemplate;

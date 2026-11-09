import { motion } from 'framer-motion';

const CheckoutProgress = ({ progress, className = '' }) => {
  const complete = progress === 100;
  return (
    <div
      role="progressbar"
      aria-label="Form completion"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
      className={className}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-body text-[10px] font-bold text-outline uppercase tracking-widest">Form Completion</span>
        <span className={`font-body text-xs font-bold transition-colors duration-500 ${complete ? 'text-emerald-600' : 'text-primary'}`}>{progress}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-surface-dim overflow-hidden">
        <motion.div
          className={`h-full rounded-full transition-colors duration-500 ${complete ? 'bg-emerald-500' : 'bg-primary'}`}
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 24 }}
        />
      </div>
    </div>
  );
};

export default CheckoutProgress;

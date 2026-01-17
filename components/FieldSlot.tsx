import { motion } from 'framer-motion';

interface FieldSlotProps {
  onClick?: () => void;
  isActive?: boolean; // If it's a valid target/placement spot
}

export function FieldSlot({ onClick, isActive }: FieldSlotProps) {
  return (
    <motion.div
      onClick={onClick}
      className={`relative w-40 h-60 rounded-lg flex items-center justify-center cursor-pointer transition-colors duration-300
        ${isActive 
          ? 'bg-blue-500/20 border-2 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
          : 'bg-gray-800/30 border border-gray-700/50 hover:bg-gray-700/40 hover:border-gray-500'}
      `}
      whileHover={{ scale: 1.02 }}
    >
      {/* Zone Markings */}
      <div className="absolute inset-2 border border-dashed border-gray-600/50 rounded pointer-events-none" />
      <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
        <div className="w-20 h-20 rounded-full border border-gray-500" />
      </div>
      
      {/* Crosshairs corners */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-gray-500/50 rounded-tl" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-gray-500/50 rounded-tr" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-gray-500/50 rounded-bl" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-gray-500/50 rounded-br" />

      <span className="text-gray-500/50 text-xs font-mono tracking-widest uppercase">Monster Zone</span>
    </motion.div>
  );
}
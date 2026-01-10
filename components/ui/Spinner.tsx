"use client";

import { AnimatePresence, motion } from "framer-motion";

interface LoadingTransitionProps {
  isLoading?: boolean;
}

const cardImagePath = "/assets/card.png";

export const Spinner = () => {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <motion.div
        style={{
          width: 60,
          height: 60,
          borderRadius: "50%",
          border: "4px solid rgba(255, 255, 255, 0.2)",
          borderTopColor: "#ffffff",
        }}
        animate={{ rotate: 360 }}
        transition={{
          loop: Infinity,
          ease: "linear",
          duration: 1,
        }}
      />
    </div>
  );
};

export const CardSpinner = () => {
  // Configuration variables for easy tweaking
  const numCards = 8; // How many cards make up the circle
  const radius = 60;   // The distance from the center to the cards (in pixels)
  const duration = 1.5; // Seconds for a full rotation (slower is usually better for detailed assets)

  // Generate an array to map over based on numCards
  const cardsArray = Array.from({ length: numCards });

  return (
    // Outer container (fixed overlay)
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">

      {/* The spinning container holding all the cards */}
      <motion.div
        className="relative flex items-center justify-center"
        style={{
          width: radius * 2 + 40, // Ensure container is big enough
          height: radius * 2 + 40,
        }}
        animate={{ rotate: 360 }}
        transition={{
          loop: Infinity,
          ease: "linear",
          duration: duration,
        }}
      >
        {cardsArray.map((_, index) => {
          // Calculate the angle for each specific card
          const angle = (index / numCards) * 360;

          return (
            <div
              key={index}
              className="absolute top-1/2 left-1/2 shadow-lg"
              style={{
                // Tailwind w-8 is 2rem (32px). Adjust if needed.
                width: "32px",
                // The magic CSS sequence to arrange items in a circle:
                // 1. Center anchor point (-50%, -50%)
                // 2. Rotate to face direction
                // 3. Move outwards by radius (negative Y moves "up" relative to the card's rotation)
                transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${radius}px)`,
              }}
            >
              {/* The Card Image */}
              <img
                src={cardImagePath || "https://via.placeholder.com/32x48?text=Card"} // Fallback if image isn't loaded
                alt="loading card"
                className="w-full h-auto rounded-sm" // Added rounded corners for polish
                style={{
                   // Optional: slight glow to make them pop against black
                   filter: 'drop-shadow(0 0 2px rgba(255,215,0, 0.5))'
                }}
              />
            </div>
          );
        })}
      </motion.div>
      
      {/* Optional Loading Text underneath */}
      <p className="absolute mt-32 text-white text-sm font-semibold tracking-wider animate-pulse">
        LOADING DUEL...
      </p>
    </div>
  );
};

export const LoadingTransition = ({ isLoading = true }: LoadingTransitionProps) => {
  const numCards = 8;
  const radius = 60;
  const spinnerCardWidth = 32; // In pixels

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden">
      <AnimatePresence mode="wait">
        {isLoading ? (
          /* --- PHASE 1: THE DOTTED CARD SPINNER --- */
          <motion.div
            key="spinner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative flex items-center justify-center"
          >
            <motion.div
              style={{ width: radius * 2, height: radius * 2 }}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, ease: "linear", duration: 4 }}
            >
              {[...Array(numCards)].map((_, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2"
                  style={{
                    width: `${spinnerCardWidth}px`,
                    // Rotate each card around the center and push it out to the radius
                    transform: `translate(-50%, -50%) rotate(${i * (360 / numCards)}deg) translateY(-${radius}px)`,
                  }}
                >
                  <img
                    src={cardImagePath}
                    alt="spinner card"
                    className="w-full h-auto rounded-sm opacity-80"
                  />
                </div>
              ))}
            </motion.div>
            <p className="absolute mt-40 text-white text-xs font-bold tracking-[0.2em] animate-pulse">
              INITIALIZING...
            </p>
          </motion.div>
        ) : (
          /* --- PHASE 2: THE SCREEN-CONSUMING ZOOM --- */
          <motion.div
            key="reveal"
            className="absolute inset-0 flex items-center justify-center bg-black"
          >
            <motion.img
              src={cardImagePath}
              alt="Final Reveal"
              className="z-[101] rounded-md shadow-[0_0_100px_rgba(255,255,255,0.3)]"
              initial={{ 
                width: `${spinnerCardWidth}px`, // Matches the size of the spinner cards for continuity
                opacity: 1 
              }}
              animate={{ 
                width: "150vw", // Grows significantly larger than screen to ensure full coverage
                opacity: [1, 1, 0], // Stays visible during expansion, then vanishes at the very end
              }}
              transition={{ 
                width: { duration: 1, ease: [0.7, 0, 0.84, 0] }, // Accelerating "In" easing
                opacity: { duration: 0.2, delay: 0.8 } 
              }}
            />
            
            {/* White flash for high-impact transition effect */}
            <motion.div 
              className="absolute inset-0 bg-white z-[102]"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ delay: 0.8, duration: 0.2 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

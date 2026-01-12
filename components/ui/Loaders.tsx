"use client";

import { AnimatePresence, motion } from "framer-motion";

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
          repeat: Infinity, // Changed from loop to repeat
          repeatType: "loop", // Optional: explicitly set the behavior
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
          repeat: Infinity, // Changed from loop to repeat
          repeatType: "loop", // Optional: explicitly set the behavior
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
        LOADING...
      </p>
    </div>
  );
};

import React from "react";

export const UnderConstruction: React.FC = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Diagonal stripe pattern background */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            #6b7280,
            #6b7280 20px,
            #9ca3af 20px,
            #9ca3af 40px
          )`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center p-8">
        <p className="text-gray-500 text-sm font-medium">Under Construction</p>
      </div>
    </div>
  );
};

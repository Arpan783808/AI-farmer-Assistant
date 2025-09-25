import React from 'react';

const Loading: React.FC = () => {
  return (
    <div className="relative flex flex-col items-center justify-center h-full w-full bg-gray-100 bg-opacity-75 z-10 rounded-2xl">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-t-4 border-transparent border-t-gradient-to-r border-t-from-blue-500 border-t-to-purple-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-16 h-16 border-4 border-b-4 border-transparent border-b-gradient-to-r border-b-from-purple-500 border-b-to-pink-500 rounded-full animate-spin-slow"></div>
        <div className="absolute inset-0 w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 animate-pulse"></div>
      </div>
      <p className="mt-4 text-xl font-semibold text-gray-800 tracking-wide animate-bounce">
        Loading
        <span className="inline-block animate-pulse">...</span>
      </p>
    </div>
  );
};

export default Loading;
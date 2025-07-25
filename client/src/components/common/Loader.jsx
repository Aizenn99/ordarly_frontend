import React from 'react';

const Loader = () => {
  return (
    <div className="fixed inset-0 bg-cream-50 flex items-center justify-center">
      <div className="w-48 h-48 grid grid-cols-2 gap-2 relative">
        {/* Top Left - Four Dots */}
        <div className="bg-forest-green/20 rounded-lg p-4 flex items-center justify-center">
          <div className="grid grid-cols-2 gap-2">
            <div className="w-3 h-3 bg-forest-green rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-forest-green rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-forest-green rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
            <div className="w-3 h-3 bg-forest-green rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>

        {/* Top Right - Crossed Fork and Spoon */}
        <div className="bg-forest-green/20 rounded-lg p-4 flex items-center justify-center">
          <div className="relative w-12 h-12">
            {/* Fork */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform -rotate-45 animate-pulse">
              <div className="w-1.5 h-10 bg-forest-green rounded"></div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 flex space-x-0.5">
                <div className="w-0.5 h-4 bg-forest-green rounded"></div>
                <div className="w-0.5 h-4 bg-forest-green rounded"></div>
                <div className="w-0.5 h-4 bg-forest-green rounded"></div>
              </div>
            </div>
            {/* Spoon */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform rotate-45 animate-pulse" style={{ animationDelay: '0.2s' }}>
              <div className="w-1.5 h-10 bg-forest-green rounded"></div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2">
                <div className="w-3 h-4 bg-forest-green rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Left - Steam Bowl */}
        <div className="bg-forest-green/20 rounded-lg p-4 flex items-center justify-center">
          <div className="relative">
            <div className="w-8 h-4 bg-forest-green rounded-b-full"></div>
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="flex space-x-1">
                <div className="w-1 h-3 bg-forest-green rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                <div className="w-1 h-3 bg-forest-green rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1 h-3 bg-forest-green rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Right - Leaves */}
        <div className="bg-forest-green/20 rounded-lg p-4 flex items-center justify-center">
          <div className="relative h-12">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-forest-green"></div>
            {/* Left side leaves */}
            <div className="absolute left-1/2 top-0 transform -translate-x-full">
              <div className="w-3 h-2 bg-forest-green rounded-full -rotate-45 animate-pulse"></div>
            </div>
            <div className="absolute left-1/2 top-1/3 transform -translate-x-full">
              <div className="w-3 h-2 bg-forest-green rounded-full -rotate-45 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <div className="absolute left-1/2 top-2/3 transform -translate-x-full">
              <div className="w-3 h-2 bg-forest-green rounded-full -rotate-45 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            {/* Right side leaves */}
            <div className="absolute left-1/2 top-1/6 transform">
              <div className="w-3 h-2 bg-forest-green rounded-full rotate-45 animate-pulse" style={{ animationDelay: '0.1s' }}></div>
            </div>
            <div className="absolute left-1/2 top-1/2 transform">
              <div className="w-3 h-2 bg-forest-green rounded-full rotate-45 animate-pulse" style={{ animationDelay: '0.3s' }}></div>
            </div>
            <div className="absolute left-1/2 top-5/6 transform">
              <div className="w-3 h-2 bg-forest-green rounded-full rotate-45 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="absolute mt-5 w-full -bottom-8 left-1/2 transform -translate-x-1/2 text-forest-green font-medium">
          Future of Dine In...
        </div>
      </div>
    </div>
  );
};

export default Loader;
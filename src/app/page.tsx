"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Hero Section */}
      <div className="relative flex flex-col items-center justify-center min-h-screen px-4">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 text-center max-w-6xl mx-auto">
          {/* Logo Section */}
          <div className="mb-16">
            <div className="inline-flex items-center justify-center w-48 h-48 bg-white rounded-full mb-12 shadow-2xl">
              <Image
                src="/world-compass.png"
                alt="World Compass Logo"
                width={120}
                height={120}
                className="h-28 w-28 object-contain"
              />
            </div>
          </div>

          <h1 className="text-7xl md:text-8xl font-bold text-white mb-8 leading-tight">
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300 bg-clip-text text-transparent">
              World Compass
            </span>
          </h1>

          <p className="text-3xl md:text-4xl text-blue-100 mb-12 max-w-4xl mx-auto leading-relaxed font-medium">
            Tu compañero definitivo de navegación para explorar el mundo
          </p>

          {/* CTA Button */}
          <div className="flex justify-center">
            <button
              onClick={() => router.push("/discover")}
              className="px-12 py-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-2xl rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
            >
              Empezar a Explorar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

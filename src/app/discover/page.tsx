"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Discover() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || input.length < 3) return;

    setIsLoading(true);

    // Redirect to plan page with location
    setTimeout(() => {
      setIsLoading(false);
      router.push(`/plan?location=${encodeURIComponent(input)}`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <Image
              src="/world-compass.png"
              alt="World Compass Logo"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            World Compass
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-4">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300 bg-clip-text text-transparent">
              La brujula te guiará
            </span>
          </h2>

          <p className="text-2xl md:text-3xl text-blue-100 mb-12">
            Escribe en dónde te encuentras y te guiaremos a una nueva
            aventura...
          </p>

          {/* Magic Input */}
          <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tu ubicación..."
                className="w-full px-6 py-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-xl"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim() || input.length < 3}
                className="absolute right-2 top-2 bottom-2 px-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Guíame"
                )}
              </button>
            </div>
          </form>

          {/* Example prompts */}
          <div className="mt-8 text-center">
            <p className="text-blue-200 mb-4 text-lg">Prueba preguntando:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                "Madrid",
                "Lima",
                "Santiago de Chile",
                "Buenos Aires",
                "Rio de Janeiro",
                "Sao Paulo",
                "Bogota",
                "Medellin",
                "Caracas",
              ].map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setInput(prompt)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/20 rounded-full text-blue-200 text-base transition-all duration-300"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

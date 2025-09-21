"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";

interface Plan {
  title: string;
  description: string;
  category: "solo" | "friends" | "couple";
  duration: string;
  cost: string;
  location: string;
}

export default function Plan() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState("");
  const [rateLimitError, setRateLimitError] = useState<{
    message: string;
    resetTime?: number;
  } | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const locationParam = searchParams.get("location");
    if (locationParam) {
      setLocation(locationParam);
      generatePlans(locationParam);
    }
  }, [searchParams]);

  const generatePlans = async (userLocation: string) => {
    setIsLoading(true);
    setRateLimitError(null);

    try {
      const response = await fetch("/api/generate-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ location: userLocation }),
      });

      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans);
      } else if (response.status === 429) {
        const errorData = await response.json();
        setRateLimitError({
          message: errorData.message,
          resetTime: errorData.resetTime,
        });
      }
    } catch (error) {
      console.error("Error generating plans:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case "solo":
        return "🧘";
      case "friends":
        return "👥";
      case "couple":
        return "💕";
      default:
        return "🎯";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "solo":
        return "from-green-500 to-emerald-500";
      case "friends":
        return "from-blue-500 to-cyan-500";
      case "couple":
        return "from-pink-500 to-rose-500";
      default:
        return "from-blue-500 to-cyan-500";
    }
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
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
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
          <button
            onClick={() => router.push("/")}
            className="text-blue-200 hover:text-white transition-colors text-lg"
          >
            ← Inicio
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-6 pb-20">
        {/* Location Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300 bg-clip-text text-transparent">
              Planes en {location}
            </span>
          </h2>
          <p className="text-xl text-blue-100">
            Descubre los lugares secretos que solo los locales conocen
          </p>
        </div>

        {/* Rate Limit Error */}
        {rateLimitError && (
          <div className="text-center py-12">
            <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-md rounded-2xl p-8 border border-amber-400/30 max-w-lg mx-auto">
              <div className="text-6xl mb-4">⏰</div>
              <h3 className="text-2xl font-bold text-amber-200 mb-4">
                ¡Tranquilo, aventurero!
              </h3>
              <p className="text-amber-100 mb-4 text-lg">
                {rateLimitError.message}
              </p>
              {rateLimitError.resetTime && (
                <p className="text-amber-200 text-sm">
                  Inténtalo de nuevo en {rateLimitError.resetTime} segundos
                </p>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center space-x-3 text-blue-200">
              <div className="w-8 h-8 border-2 border-blue-200 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xl">Generando planes únicos...</span>
            </div>
          </div>
        )}

        {/* Plans Sections */}
        {!isLoading && plans.length > 0 && (
          <div className="space-y-8">
            {["solo", "friends", "couple"].map((category) => {
              const plan = plans.find((p) => p.category === category);
              if (!plan) return null;

              return (
                <div
                  key={category}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <span className="text-4xl">
                        {getCategoryEmoji(plan.category)}
                      </span>
                      <div>
                        <h3 className="text-2xl font-bold text-white capitalize">
                          {plan.category === "solo" && "Para ti solo"}
                          {plan.category === "friends" && "Con amigos"}
                          {plan.category === "couple" && "En pareja"}
                        </h3>
                        <p className="text-blue-200 text-sm">
                          {plan.duration} • {plan.location}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r ${getCategoryColor(
                        plan.category
                      )} text-white`}
                    >
                      {plan.cost}
                    </div>
                  </div>

                  <h4 className="text-3xl font-bold text-white mb-4">
                    {plan.title}
                  </h4>

                  <p className="text-xl text-blue-100 leading-relaxed">
                    {plan.description}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* No Plans State */}
        {!isLoading && plans.length === 0 && location && !rateLimitError && (
          <div className="text-center py-12">
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-2xl p-8 border border-purple-400/30 max-w-lg mx-auto">
              <div className="text-6xl mb-4">🤔</div>
              <h3 className="text-2xl font-bold text-purple-200 mb-4">
                No tenemos información específica sobre {location}
              </h3>
              <p className="text-purple-100 mb-4">
                Nuestros exploradores aún no han descubierto los secretos de
                esta ciudad. ¡Prueba con otra ubicación!
              </p>
              <button
                onClick={() => router.push("/discover")}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                Probar otra ciudad
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

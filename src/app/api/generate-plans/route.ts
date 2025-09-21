import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Rate limiting storage (in production, use Redis or database)
interface RateLimitData {
  attempts: number;
  lastAttempt: number;
  blockedUntil?: number;
}

const rateLimitMap = new Map<string, RateLimitData>();

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : request.ip || "unknown";
  return ip;
}

function checkRateLimit(request: NextRequest): {
  allowed: boolean;
  resetTime?: number;
  attemptsLeft?: number;
} {
  const key = getRateLimitKey(request);
  const now = Date.now();
  const data = rateLimitMap.get(key);

  // If no data, first request
  if (!data) {
    rateLimitMap.set(key, { attempts: 1, lastAttempt: now });
    return { allowed: true, attemptsLeft: 2 };
  }

  // Check if user is blocked
  if (data.blockedUntil && now < data.blockedUntil) {
    const resetTime = Math.ceil((data.blockedUntil - now) / 1000);
    return { allowed: false, resetTime };
  }

  // If user was blocked but time has passed, reset
  if (data.blockedUntil && now >= data.blockedUntil) {
    rateLimitMap.set(key, { attempts: 1, lastAttempt: now });
    return { allowed: true, attemptsLeft: 2 };
  }

  // Check attempts
  if (data.attempts >= 3) {
    // Block for 1 minute
    const blockedUntil = now + 60 * 1000; // 1 minute
    rateLimitMap.set(key, { ...data, blockedUntil });
    return { allowed: false, resetTime: 60 };
  }

  // Increment attempts
  const newAttempts = data.attempts + 1;
  rateLimitMap.set(key, { attempts: newAttempts, lastAttempt: now });

  return {
    allowed: true,
    attemptsLeft: 3 - newAttempts,
  };
}

interface Plan {
  title: string;
  description: string;
  category: "solo" | "friends" | "couple";
  duration: string;
  cost: string;
  location: string;
}

export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const rateLimit = checkRateLimit(request);
    if (!rateLimit.allowed) {
      console.log("🚫 Rate limit exceeded for IP:", getRateLimitKey(request));
      return NextResponse.json(
        {
          error: "rate_limit_exceeded",
          message:
            "Has hecho demasiadas solicitudes. Espera 1 minuto y vuelve a intentarlo.",
          resetTime: rateLimit.resetTime,
        },
        { status: 429 }
      );
    }

    console.log(
      "✅ Rate limit check passed. Attempts left:",
      rateLimit.attemptsLeft
    );

    const { location } = await request.json();

    console.log("🚀 Starting plan generation for location:", location);
    console.log("🔑 API Key exists:", !!process.env.OPENAI_API_KEY);
    console.log("🔑 API Key length:", process.env.OPENAI_API_KEY?.length);
    console.log(
      "🔑 API Key starts with:",
      process.env.OPENAI_API_KEY?.substring(0, 10)
    );

    if (!location) {
      console.log("❌ No location provided");
      return NextResponse.json(
        { error: "Location is required" },
        { status: 400 }
      );
    }

    const prompt = `Genera 3 planes ESPECÍFICOS y REALES para alguien en ${location}. 

    CRÍTICO: Solo sugiere lugares que SABES que existen realmente. Si no estás seguro de un lugar, di "Lugar no confirmado" en location.

    Requisitos ESTRICTOS:
    - 1 plan para viajeros solos (category: "solo")
    - 1 plan para grupos de amigos (category: "friends") 
    - 1 plan para parejas (category: "couple")
    - NOMBRES EXACTOS de lugares: restaurantes, bares, museos, parques, calles específicas
    - ACTIVIDADES CONCRETAS: qué hacer paso a paso, horarios reales
    - PRESUPUESTOS REALISTAS: costos reales en la MONEDA LOCAL del país/ciudad
    - UBICACIONES EXACTAS: barrio, calle, o zona específica verificable
    - DURACIONES REALES: cuánto tiempo realmente toma
    - Solo lugares que la mayoría de turistas NO conocen pero que existen
    - Si no conoces lugares reales en ${location}, di "No tengo información específica sobre ${location}"
    - RESPONDE TODO EN ESPAÑOL
    
    IMPORTANTE: Usa la moneda local correcta:
    - España: € (euros)
    - México: $ (pesos mexicanos)
    - Argentina: $ (pesos argentinos) 
    - Chile: $ (pesos chilenos)
    - Colombia: $ (pesos colombianos)
    - Perú: S/ (soles peruanos)
    - Brasil: R$ (reales brasileños)
    - Estados Unidos: $ (dólares)
    - Reino Unido: £ (libras esterlinas)
    - Japón: ¥ (yenes)
    - etc.
    
    Ejemplo de lo que busco:
    "Ir al Mercado de San Miguel a las 10am, probar jamón ibérico en el puesto de Joselito (€8), luego caminar por la Plaza Mayor hasta el Café Gijón para tomar un cortado (€2.50)"
    
    Devuelve SOLO un array JSON válido:
    [
      {
        "title": "Nombre específico del plan",
        "description": "Descripción paso a paso de qué hacer exactamente, dónde ir, qué comer/beber, horarios",
        "category": "solo|friends|couple",
        "duration": "Tiempo real (ej: 3 horas)",
        "cost": "Presupuesto real en moneda local (ej: $15-25, €20-30, ¥2000-3000)",
        "location": "Lugar exacto verificable o 'Lugar no confirmado'"
      }
    ]`;

    console.log("📝 Sending request to OpenAI...");
    console.log("🤖 Model:", "gpt-3.5-turbo");

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "Eres un experto local que conoce lugares REALES y específicos. Solo sugiere lugares que sabes que existen. Si no estás seguro, di 'Lugar no confirmado'. Da instrucciones paso a paso específicas, horarios reales, costos reales, y nombres exactos de lugares. Responde SOLO en español con JSON válido.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_completion_tokens: 2000,
    });

    console.log("✅ OpenAI response received");

    const response = completion.choices[0]?.message?.content;
    console.log("📄 OpenAI response length:", response?.length);
    console.log("📄 First 200 chars of response:", response?.substring(0, 200));

    if (!response) {
      console.log("❌ No response from OpenAI");
      throw new Error("No response from OpenAI");
    }

    // Parse the JSON response
    console.log("🔍 Parsing JSON response...");
    const plans: Plan[] = JSON.parse(response);
    console.log("✅ Parsed plans:", plans.length);

    // Check if AI says it doesn't have specific information
    if (
      plans.some(
        (plan) =>
          plan.description
            .toLowerCase()
            .includes("no tengo información específica") ||
          plan.location.toLowerCase().includes("lugar no confirmado")
      )
    ) {
      console.log(
        "⚠️ AI says no specific information available, returning empty"
      );
      return NextResponse.json({ plans: [] });
    }

    // Validate the response structure
    if (!Array.isArray(plans) || plans.length === 0) {
      console.log("❌ Invalid response format");
      throw new Error("Invalid response format");
    }

    console.log("🎉 Successfully generated plans:", plans.length);
    return NextResponse.json({ plans });
  } catch (error) {
    console.error("❌ Error generating plans:", error);

    // Fallback plans if OpenAI fails - Generic but realistic
    const fallbackPlans: Plan[] = [
      {
        title: "Caminata por el Centro Histórico",
        description:
          "Comienza a las 10am en la plaza principal. Camina por las calles peatonales del casco histórico, visita la iglesia principal (gratis), y termina en un café local para tomar algo. Perfecto para conocer la ciudad a tu ritmo.",
        category: "solo",
        duration: "2-3 horas",
        cost: "$8-15",
        location: "Centro histórico - Plaza principal",
      },
      {
        title: "Ruta de Tapas y Bares",
        description:
          "Reúnete con amigos a las 8pm en el primer bar. Haz una ruta caminando por 3-4 bares locales, pidiendo una tapa y una bebida en cada uno. Termina en un bar con música en vivo o terraza.",
        category: "friends",
        duration: "4-5 horas",
        cost: "$25-35 por persona",
        location: "Zona de bares - Centro",
      },
      {
        title: "Paseo Romántico al Atardecer",
        description:
          "Sal a las 7pm hacia el parque o paseo marítimo. Camina tomados de la mano, encuentra un banco con vista bonita para sentarse, y termina cenando en un restaurante con terraza o vista panorámica.",
        category: "couple",
        duration: "3-4 horas",
        cost: "$30-50 por pareja",
        location: "Parque principal o paseo marítimo",
      },
    ];

    return NextResponse.json({ plans: fallbackPlans });
  }
}

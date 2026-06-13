"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  Lock,
  Compass,
  Award,
  Users,
  Target,
  ShieldAlert,
  ArrowUpRight,
  MessageSquare,
  Cpu,
  GraduationCap,
  Layers,
  ChevronRight,
  Send,
  RefreshCw,
  Eye,
} from "lucide-react"

// Types for Feynman simulator
type FeynmanStep = "prompt" | "evaluating" | "socratic_response" | "evaluating2" | "success"

// Hexagonal Route Node component replicating the custom Duolingo layout
function HexNode({
  status,
  title,
  isNow = false,
  onClick,
  active,
}: {
  status: "completed" | "active" | "locked"
  title: string
  isNow?: boolean
  onClick: () => void
  active: boolean
}) {
  return (
    <div 
      onClick={onClick}
      className="flex items-center gap-4 cursor-pointer group select-none transition-all duration-300"
    >
      {/* Hexagon icon container */}
      <div className="relative flex items-center justify-center size-[76px] shrink-0">
        {status === "active" && (
          <>
            {/* Outer translucent green hexagon border */}
            <div className="absolute inset-0 flex items-center justify-center animate-pulse">
              <svg width="76" height="88" viewBox="0 0 76 88" fill="none">
                <path
                  d="M 38 3 L 73 23.5 L 73 64.5 L 38 85 L 3 64.5 L 3 23.5 Z"
                  stroke="#10b981"
                  strokeWidth="3.5"
                  strokeOpacity="0.4"
                  fill="#10b981"
                  fillOpacity="0.08"
                />
              </svg>
            </div>
            {/* Inner solid green hexagon */}
            <div className="relative z-10 scale-[0.78]">
              <svg width="76" height="88" viewBox="0 0 76 88" fill="none">
                <path
                  d="M 38 2 L 74 23 L 74 65 L 38 86 L 2 65 L 2 23 Z"
                  fill="#10b981"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-black">
                <svg className="size-6 fill-current text-[#09090b]" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              </div>
            </div>
          </>
        )}

        {status === "completed" && (
          <div className="relative transition-transform duration-300 group-hover:scale-105">
            <svg width="60" height="70" viewBox="0 0 60 70" fill="none">
              <path
                d="M 30 0 L 60 17.5 L 60 52.5 L 30 70 L 0 52.5 L 0 17.5 Z"
                fill="#10b981"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[#09090b]">
              <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        )}

        {status === "locked" && (
          <div className="relative opacity-60 group-hover:opacity-85 transition-opacity duration-300">
            <svg width="60" height="70" viewBox="0 0 60 70" fill="none">
              <path
                d="M 30 2 L 58 18.5 L 58 51.5 L 30 68 L 2 51.5 L 2 18.5 Z"
                fill="#1c1c1e"
                stroke="rgba(255, 255, 255, 0.12)"
                strokeWidth="2.5"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-zinc-500">
              <Lock className="size-4 shrink-0" />
            </div>
          </div>
        )}
      </div>

      {/* Node label */}
      <div className="flex items-center gap-2">
        <span 
          className={`font-bold text-sm tracking-wide transition-colors ${
            status === "locked" 
              ? "text-zinc-600 group-hover:text-zinc-400" 
              : active 
                ? "text-emerald-400" 
                : "text-white group-hover:text-emerald-300"
          }`}
        >
          {title}
        </span>
        {isNow && (
          <span className="px-2.5 py-0.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-[9px] font-bold text-emerald-400 tracking-wider uppercase">
            AHORA
          </span>
        )}
      </div>
    </div>
  )
}

export default function LandingPage() {
  // Interactive Feynman Simulator States
  const [simStep, setSimStep] = useState<FeynmanStep>("prompt")
  const [userExplanation, setUserExplanation] = useState("")
  const [responseFeedback, setResponseFeedback] = useState("")
  
  // Interactive Route States
  const [activeNode, setActiveNode] = useState<"aritmetica" | "fracciones" | "algebra" | "geometria" | "trigonometria" | "estadistica">("algebra")

  // Handle Feynman simulation submission
  const handleSimSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userExplanation.trim()) return

    if (simStep === "prompt") {
      setSimStep("evaluating")
      setTimeout(() => {
        setSimStep("socratic_response")
        setResponseFeedback(
          "¡Interesante respuesta! Dices que 'pasas el 5 al otro lado restando'. Si fueras un estudiante que está viendo esto por primera vez, ¿qué significa realmente 'pasar al otro lado'? ¿Qué operación matemática básica se está haciendo en ambos lados de la igualdad para mantener la ecuación en equilibrio?"
        )
        setUserExplanation("")
      }, 1800)
    } else if (simStep === "socratic_response") {
      setSimStep("evaluating2")
      setTimeout(() => {
        setSimStep("success")
      }, 1800)
    }
  }

  const resetSimulator = () => {
    setSimStep("prompt")
    setUserExplanation("")
    setResponseFeedback("")
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-foreground selection:bg-primary selection:text-primary-foreground overflow-x-hidden">
      {/* Background Glowing Gradients */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[1000px] right-1/4 translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[800px] left-1/3 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-[#09090b]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Sparkles className="size-5 text-[#09090b]" />
            </div>
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Estud<span className="text-emerald-400">IA</span>migo
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
            <a href="#problema" className="hover:text-emerald-400 transition-colors">El Problema</a>
            <a href="#caracteristicas" className="hover:text-emerald-400 transition-colors">Características</a>
            <a href="#simulador" className="hover:text-emerald-400 transition-colors">Simulador Activo</a>
            <a href="#ruta" className="hover:text-emerald-400 transition-colors">Ruta Duolingo</a>
            <a href="#equipo" className="hover:text-emerald-400 transition-colors">Equipo</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link 
              href="/chat"
              className="inline-flex h-9 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 px-4 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all"
            >
              Iniciar Sesión
            </Link>
            <Link 
              href="/chat"
              className="inline-flex h-9 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 text-xs font-semibold text-black hover:opacity-95 shadow-md shadow-emerald-500/10 transition-all hover:scale-[1.02]"
            >
              Probar Tutor AI
              <ArrowRight className="size-3.5 ml-1.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-32 md:pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Banner Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/5 text-emerald-400 text-xs font-semibold mb-6 animate-pulse">
          <Award className="size-3.5" />
          <span>Proyecto de Yorhacks - Innovathon 2026</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.1] mb-6">
          Aprende de verdad. <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
            No memorices temporalmente.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-zinc-400 max-w-3xl mx-auto mb-10 font-normal leading-relaxed">
          EstudIAmigo es la plataforma de aprendizaje activo impulsada por Inteligencia Artificial diseñada para la preparación de exámenes de admisión. Simula a un tutor particular con retroalimentación socrática y el reto Feynman.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link 
            href="/chat"
            className="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-8 text-sm font-bold text-black hover:opacity-95 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.03]"
          >
            Comenzar con EstudIAmigo
            <ArrowRight className="size-4 ml-2" />
          </Link>
          <a 
            href="#simulador"
            className="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 px-8 text-sm font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all"
          >
            Probar Demo Interactiva
          </a>
        </div>

        {/* Visual Mockup - Dashboard Preview */}
        <div className="relative rounded-2xl border border-zinc-800/80 bg-zinc-950/40 p-2 md:p-4 max-w-5xl mx-auto shadow-2xl backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent pointer-events-none z-10" />
          <div className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950">
            {/* Window controls */}
            <div className="h-10 bg-zinc-900/60 border-b border-zinc-800/60 px-4 flex items-center justify-between">
              <div className="flex gap-1.5">
                <span className="size-3 rounded-full bg-red-500/40" />
                <span className="size-3 rounded-full bg-yellow-500/40" />
                <span className="size-3 rounded-full bg-green-500/40" />
              </div>
              <div className="text-xs text-zinc-500 font-mono">estudiamigo.ai/tutor</div>
              <div className="w-12" />
            </div>

            {/* Simulated UI layout */}
            <div className="flex h-[400px] text-left">
              {/* Sidebar */}
              <div className="w-1/4 border-r border-zinc-900 bg-zinc-950/80 p-4 hidden sm:block">
                <div className="flex items-center gap-2 mb-6">
                  <div className="size-6 rounded bg-emerald-500 flex items-center justify-center text-xs text-black font-bold">E</div>
                  <span className="text-xs font-bold text-zinc-300">EstudIAmigo</span>
                </div>
                <div className="space-y-2">
                  <div className="h-7 rounded bg-zinc-900/80 px-2 flex items-center text-[10px] text-emerald-400 font-medium border border-emerald-500/10">
                    <Compass className="size-3 mr-2" /> Ruta de Admisión
                  </div>
                  <div className="h-7 rounded px-2 flex items-center text-[10px] text-zinc-500">
                    <Lock className="size-3 mr-2" /> Simulador de Examen
                  </div>
                  <div className="h-7 rounded px-2 flex items-center text-[10px] text-zinc-500">
                    <Users className="size-3 mr-2" /> Foro Socrático
                  </div>
                </div>
              </div>

              {/* Chat Simulation Area */}
              <div className="flex-1 bg-[#09090b]/80 p-6 flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Message 1 */}
                  <div className="flex gap-3">
                    <div className="size-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                      <Cpu className="size-3.5" />
                    </div>
                    <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl rounded-tl-none p-3 max-w-[80%]">
                      <p className="text-xs font-semibold text-emerald-400 mb-1">Tutor Socrático</p>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        ¡Bienvenido! Estás en la lección de <strong className="text-white">Leyes de los Exponentes</strong>. Para avanzar, debes superar el Reto Feynman. Explícame: ¿por qué cualquier número elevado a la potencia cero es igual a 1?
                      </p>
                    </div>
                  </div>

                  {/* Message 2 */}
                  <div className="flex gap-3 justify-end">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl rounded-tr-none p-3 max-w-[80%] text-right">
                      <p className="text-xs font-semibold text-emerald-400 mb-1">Estudiante (Tú)</p>
                      <p className="text-xs text-zinc-200">
                        Porque es una regla matemática que así se inventó para que todo funcione.
                      </p>
                    </div>
                  </div>

                  {/* Message 3 */}
                  <div className="flex gap-3">
                    <div className="size-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                      <Cpu className="size-3.5" />
                    </div>
                    <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl rounded-tl-none p-3 max-w-[80%]">
                      <p className="text-xs font-semibold text-emerald-400 mb-1">Tutor Socrático</p>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        Entiendo. Parece una regla arbitraria, pero en realidad tiene una lógica sólida. Pensemos: si <code className="text-emerald-400">2³ = 8</code> y <code className="text-emerald-400">2² = 4</code> (dividimos entre 2), y <code className="text-emerald-400">2¹ = 2</code> (dividimos entre 2 otra vez), ¿qué pasa si dividimos una vez más para llegar a <code className="text-emerald-400">2⁰</code>? ¿Cuál es el resultado lógico de esa secuencia?
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 border border-zinc-800 bg-zinc-900/30 rounded-xl p-2">
                  <div className="flex-1 text-xs text-zinc-500 px-2">Escribe tu razonamiento aquí...</div>
                  <div className="size-7 rounded-lg bg-emerald-500 text-black flex items-center justify-center">
                    <Send className="size-3.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem & Solution Section */}
      <section id="problema" className="py-20 border-y border-zinc-900 bg-zinc-950/20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
              ¿Por qué las plataformas actuales fallan?
            </h2>
            <p className="text-zinc-400">
              La mayoría de los estudiantes sufren de lo que los psicólogos cognitivos llaman la &quot;ilusión de competencia&quot;.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            {/* The Old Way */}
            <div className="rounded-2xl border border-red-500/10 bg-red-500/2.5 p-8 flex flex-col justify-between transition-all hover:border-red-500/20">
              <div>
                <div className="size-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 mb-6 border border-red-500/20">
                  <ShieldAlert className="size-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">El Problema: Ilusión de Competencia</h3>
                <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                  Lees resúmenes prefabricados y respondes cuestionarios de opción múltiple repetitivos. Al adivinar correctamente o memorizar el patrón de la pregunta, crees que dominas el tema. Sin embargo, en el examen de admisión real, al enfrentarte a un problema planteado de forma diferente, te bloqueas porque no asimilaste el concepto subyacente.
                </p>
              </div>
              <ul className="space-y-2 border-t border-zinc-900 pt-6 text-sm text-zinc-500">
                <li className="flex items-center gap-2">❌ Memorización pasiva a corto plazo</li>
                <li className="flex items-center gap-2">❌ Cuestionarios que permiten adivinar</li>
                <li className="flex items-center gap-2">❌ Cero capacidad de argumentar el porqué</li>
              </ul>
            </div>

            {/* The EstudIAmigo Way */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/2.5 p-8 flex flex-col justify-between transition-all hover:border-emerald-500/30">
              <div>
                <div className="size-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 border border-emerald-500/20">
                  <Sparkles className="size-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">La Solución: EstudIAmigo</h3>
                <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                  Te obligamos a estructurar y explicar los temas con tus propias palabras mediante el <strong className="text-white">Reto Feynman</strong>. Nuestra IA no se limita a poner una calificación de aprobado o reprobado; utiliza el <strong className="text-white">método socrático</strong>, haciéndote contra-preguntas que te guían a corregir tus propios errores y consolidar la memoria a largo plazo.
                </p>
              </div>
              <ul className="space-y-2 border-t border-zinc-900 pt-6 text-sm text-zinc-400">
                <li className="flex items-center gap-2 text-emerald-400"><CheckCircle2 className="size-4 text-emerald-400 shrink-0" /> Comprensión profunda garantizada</li>
                <li className="flex items-center gap-2 text-emerald-400"><CheckCircle2 className="size-4 text-emerald-400 shrink-0" /> Retroalimentación socrática personalizada</li>
                <li className="flex items-center gap-2 text-emerald-400"><CheckCircle2 className="size-4 text-emerald-400 shrink-0" /> Retención a largo plazo para el examen real</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Feynman Simulator Section */}
      <section id="simulador" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 text-xs text-zinc-400">
              <Cpu className="size-3.5 text-emerald-400" />
              <span>Experiencia Interactiva</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
              Prueba el <span className="text-emerald-400">Reto Feynman</span> y el Tutor Socrático
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              El Reto Feynman consiste en explicar un tema complejo de manera tan sencilla que incluso un niño lo entienda. Nuestra IA evalúa tu lógica y te guía con preguntas en lugar de darte la respuesta directa.
            </p>
            
            <div className="space-y-4 pt-4">
              <div className="flex gap-3">
                <div className="size-8 rounded bg-zinc-900 flex items-center justify-center text-zinc-400 text-xs font-bold shrink-0 border border-zinc-800">1</div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-200">Escribe tu explicación</h4>
                  <p className="text-xs text-zinc-500">Trata de explicar el problema matemático planteado.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="size-8 rounded bg-zinc-900 flex items-center justify-center text-zinc-400 text-xs font-bold shrink-0 border border-zinc-800">2</div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-200">Recibe retroalimentación socrática</h4>
                  <p className="text-xs text-zinc-500">La IA analiza tu lógica y te cuestiona sobre los vacíos.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="size-8 rounded bg-zinc-900 flex items-center justify-center text-zinc-400 text-xs font-bold shrink-0 border border-zinc-800">3</div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-200">Desbloquea el tema</h4>
                  <p className="text-xs text-zinc-500">Una vez que tu lógica es 100% correcta, avanzas en tu ruta.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Simulator Widget */}
          <div className="lg:col-span-7 bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden min-h-[420px] flex flex-col justify-between">
            {/* Ambient light inside simulator */}
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none" />
            
            <div>
              {/* Header Widget */}
              <div className="flex items-center justify-between pb-4 border-b border-zinc-900 mb-6">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Tutor Socrático Activo</span>
                </div>
                <button 
                  onClick={resetSimulator}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-all text-xs flex items-center gap-1.5"
                  title="Reiniciar Demo"
                >
                  <RefreshCw className="size-3" /> Reiniciar
                </button>
              </div>

              {/* State Machine Renderer */}
              {simStep === "prompt" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="rounded-xl bg-zinc-900/50 border border-zinc-800/80 p-4 space-y-2">
                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-wide">Pregunta del Tutor:</p>
                    <p className="text-sm text-zinc-200 font-medium">
                      &quot;Explica cómo se resuelve una ecuación de primer grado como <code className="text-emerald-400 bg-zinc-900 px-1 py-0.5 rounded">x + 5 = 12</code> a una persona que nunca ha visto álgebra.&quot;
                    </p>
                  </div>

                  <form onSubmit={handleSimSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-2">Tu Explicación (Reto Feynman):</label>
                      <textarea
                        value={userExplanation}
                        onChange={(e) => setUserExplanation(e.target.value)}
                        placeholder="Ejemplo: 'Pasas el número 5 al otro lado con el signo opuesto para que la x quede solita...'"
                        rows={4}
                        className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-all resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!userExplanation.trim()}
                      className="w-full inline-flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-xs font-bold text-black hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Enviar Explicación al Tutor
                      <Send className="size-3.5 ml-2" />
                    </button>
                  </form>
                </div>
              )}

              {simStep === "evaluating" && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-in fade-in duration-300">
                  <div className="relative">
                    <div className="size-12 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
                    <Sparkles className="size-5 text-emerald-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-xs text-zinc-400 font-mono animate-pulse">
                    La Inteligencia Artificial está evaluando tu explicación mediante Guardrails y Lógica Socrática...
                  </p>
                </div>
              )}

              {simStep === "socratic_response" && (
                <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                  <div className="rounded-xl bg-zinc-900/50 border border-zinc-800/80 p-4 space-y-2">
                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-wide">Respuesta del Tutor Socrático:</p>
                    <p className="text-sm text-zinc-200 leading-relaxed italic">
                      &quot;{responseFeedback}&quot;
                    </p>
                  </div>

                  <form onSubmit={handleSimSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-2">Tu Explicación Mejorada:</label>
                      <textarea
                        value={userExplanation}
                        onChange={(e) => setUserExplanation(e.target.value)}
                        placeholder="Ejemplo: 'Significa restar 5 en ambos lados para que la balanza siga equilibrada y la x quede sola...'"
                        rows={3}
                        className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-all resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!userExplanation.trim()}
                      className="w-full inline-flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-xs font-bold text-black hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Enviar Explicación Refinada
                      <Send className="size-3.5 ml-2" />
                    </button>
                  </form>
                </div>
              )}

              {simStep === "evaluating2" && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-in fade-in duration-300">
                  <div className="relative">
                    <div className="size-12 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
                    <Sparkles className="size-5 text-emerald-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-xs text-zinc-400 font-mono animate-pulse">
                    Validando razonamiento intuitivo...
                  </p>
                </div>
              )}

              {simStep === "success" && (
                <div className="flex flex-col items-center justify-center text-center py-8 space-y-6 animate-in zoom-in-95 duration-400">
                  <div className="size-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
                    <CheckCircle2 className="size-10" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white">¡Tema Dominado y Desbloqueado! 🌟</h3>
                    <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                      Has explicado con éxito el principio de equivalencia (la balanza). Entiendes el porqué de la operación y no solo memorizaste un truco mecánico. Tu ruta de aprendizaje ha avanzado.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                    <button
                      onClick={resetSimulator}
                      className="inline-flex h-9 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 px-4 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all"
                    >
                      Volver a Intentar
                    </button>
                    <Link
                      href="/chat"
                      className="inline-flex h-9 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 text-xs font-bold text-black hover:opacity-95 transition-all"
                    >
                      Probar Tutor Completo
                      <ArrowRight className="size-3.5 ml-1.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Hint Footer widget */}
            <div className="mt-6 pt-4 border-t border-zinc-900 text-center text-[10px] text-zinc-500 flex items-center justify-center gap-1.5">
              <span>💡</span>
              <span>Prueba escribiendo una respuesta vaga para ver cómo el Socratic Tutor te desafía.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Duolingo-like Route Section */}
      <section id="ruta" className="py-20 border-t border-zinc-900 bg-zinc-950/10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Visual Tree (Left Column - 7 Cols) - Replicates the provided progress layout identically */}
            <div className="lg:col-span-7 bg-[#09090b]/80 border border-zinc-800/60 rounded-3xl p-8 md:p-10 shadow-2xl relative min-h-[480px]">
              {/* Header inside progress widget */}
              <div className="mb-10 text-left">
                <p className="text-xs font-extrabold text-emerald-400 tracking-wider uppercase mb-1">
                  TU PROGRESO
                </p>
                <h3 className="text-2xl font-black text-white tracking-tight">
                  Ruta de Matemáticas
                </h3>
              </div>

              <div className="relative flex flex-col items-start w-full max-w-[340px] mx-auto select-none">
                {/* Node 1: Aritmética */}
                <div className="relative w-full h-24 pl-6 flex items-center">
                  <HexNode 
                    status="completed" 
                    title="Aritmética" 
                    onClick={() => setActiveNode("aritmetica")}
                    active={activeNode === "aritmetica"}
                  />
                  {/* Connector line under it */}
                  <div className="absolute left-[59.5px] top-[76px] w-[5px] h-[24px] bg-[#10b981]" />
                </div>

                {/* Node 2: Fracciones */}
                <div className="relative w-full h-24 pl-[70px] flex items-center">
                  <HexNode 
                    status="completed" 
                    title="Fracciones" 
                    onClick={() => setActiveNode("fracciones")}
                    active={activeNode === "fracciones"}
                  />
                  {/* Connector line under it */}
                  <div className="absolute left-[105.5px] top-[76px] w-[5px] h-[24px] bg-[#10b981]" />
                </div>

                {/* Node 3: Álgebra */}
                <div className="relative w-full h-24 pl-6 flex items-center">
                  <HexNode 
                    status="active" 
                    title="Álgebra" 
                    isNow={true}
                    onClick={() => setActiveNode("algebra")}
                    active={activeNode === "algebra"}
                  />
                  {/* Connector line under it (locked gray line) */}
                  <div className="absolute left-[59.5px] top-[80px] w-[5px] h-[20px] bg-[#2c2c30]" />
                </div>

                {/* Node 4: Geometría */}
                <div className="relative w-full h-24 pl-[70px] flex items-center">
                  <HexNode 
                    status="locked" 
                    title="Geometría" 
                    onClick={() => setActiveNode("geometria")}
                    active={activeNode === "geometria"}
                  />
                  {/* Connector line under it */}
                  <div className="absolute left-[105.5px] top-[76px] w-[5px] h-[24px] bg-[#2c2c30]" />
                </div>

                {/* Node 5: Trigonometría */}
                <div className="relative w-full h-24 pl-6 flex items-center">
                  <HexNode 
                    status="locked" 
                    title="Trigonometría" 
                    onClick={() => setActiveNode("trigonometria")}
                    active={activeNode === "trigonometria"}
                  />
                  {/* Connector line under it */}
                  <div className="absolute left-[59.5px] top-[76px] w-[5px] h-[24px] bg-[#2c2c30]" />
                </div>

                {/* Node 6: Estadística */}
                <div className="relative w-full h-20 pl-[70px] flex items-center">
                  <HexNode 
                    status="locked" 
                    title="Estadística" 
                    onClick={() => setActiveNode("estadistica")}
                    active={activeNode === "estadistica"}
                  />
                </div>
              </div>
            </div>

            {/* Node description info card (Right Column - 5 Cols) */}
            <div className="lg:col-span-5 bg-zinc-950 border border-zinc-800 rounded-2xl p-6 min-h-[300px] flex flex-col justify-between">
              {activeNode === "aritmetica" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="size-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">Módulo Completado</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">Nivel 1: Aritmética</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Operaciones fundamentales con números enteros, decimales, razones y proporciones. La base absoluta para todo cálculo posterior.
                  </p>
                  <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800 text-xs text-zinc-400">
                    <span className="font-semibold text-white">Reto Feynman superado:</span> &quot;Explicar las operaciones básicas usando analogías cotidianas.&quot;
                  </div>
                </div>
              )}

              {activeNode === "fracciones" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="size-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">Módulo Completado</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">Nivel 2: Fracciones</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Fracciones equivalentes, operaciones mixtas, porcentajes y simplificación lógica. Esencial para razonamiento numérico rápido.
                  </p>
                  <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800 text-xs text-zinc-400">
                    <span className="font-semibold text-white">Reto Feynman superado:</span> &quot;Explicar cómo funcionan las fracciones equivalentes usando trozos de pizza a un niño.&quot;
                  </div>
                </div>
              )}

              {activeNode === "algebra" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Sparkles className="size-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">Módulo Actual Activo</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">Nivel 3: Álgebra</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Ecuaciones de primer grado, sistemas de ecuaciones, leyes de los exponentes y despeje de variables. ¡Es la base del examen!
                  </p>
                  <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800 text-xs text-zinc-400">
                    <span className="font-semibold text-white">Próximo Reto Feynman:</span> Explicar por qué un número elevado a la potencia cero es igual a 1.
                  </div>
                </div>
              )}

              {activeNode === "geometria" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Lock className="size-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Módulo Bloqueado</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">Nivel 4: Geometría</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">
                    Teoremas de Pitágoras, áreas, volúmenes, congruencia y semejanza de triángulos. Se desbloqueará al dominar Álgebra.
                  </p>
                  <div className="p-3 px-4 rounded-xl bg-zinc-900/10 border border-zinc-900/50 text-xs text-zinc-600">
                    🔒 Requiere: Dominar Álgebra.
                  </div>
                </div>
              )}

              {activeNode === "trigonometria" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Lock className="size-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Módulo Bloqueado</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">Nivel 5: Trigonometría</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">
                    Funciones trigonométricas (seno, coseno, tangente), identidades y la circunferencia unitaria.
                  </p>
                  <div className="p-3 px-4 rounded-xl bg-zinc-900/10 border border-zinc-900/50 text-xs text-zinc-600">
                    🔒 Requiere: Dominar Geometría.
                  </div>
                </div>
              )}

              {activeNode === "estadistica" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Lock className="size-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Módulo Bloqueado</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">Nivel 6: Estadística</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">
                    Medidas de tendencia central, probabilidad básica, diagramas de caja y análisis de datos estadísticos.
                  </p>
                  <div className="p-3 px-4 rounded-xl bg-zinc-900/10 border border-zinc-900/50 text-xs text-zinc-600">
                    🔒 Requiere: Dominar Trigonometría.
                  </div>
                </div>
              )}

              <Link
                href="/chat"
                className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-xs font-bold text-black hover:opacity-95 transition-all text-center w-full"
              >
                Acceder a mi Ruta Completa
                <ArrowRight className="size-3.5 ml-1.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Detail Grid */}
      <section id="caracteristicas" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
            Características diseñadas para tu éxito
          </h2>
          <p className="text-zinc-400">
            EstudIAmigo no es un chatbot ordinario. Cada aspecto está estructurado para asegurar un estudio efectivo.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-6 space-y-4 transition-all hover:scale-[1.01] hover:border-zinc-700">
            <div className="size-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <Cpu className="size-5" />
            </div>
            <h3 className="text-lg font-bold text-zinc-200">Guardrails de Precisión</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Integramos barreras de seguridad de última generación para evitar alucinaciones. La IA se ciñe exclusivamente al temario oficial cargado por el usuario, previniendo respuestas incorrectas o fuera de contexto.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-6 space-y-4 transition-all hover:scale-[1.01] hover:border-zinc-700">
            <div className="size-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <Compass className="size-5" />
            </div>
            <h3 className="text-lg font-bold text-zinc-200">Retroalimentación Socrática</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              En lugar de dar la solución inmediatamente, la IA te ayuda a analizar tu propio razonamiento. Te desafía con preguntas estratégicas para que tú mismo descubras el fallo y la respuesta correcta.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-6 space-y-4 transition-all hover:scale-[1.01] hover:border-zinc-700">
            <div className="size-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <GraduationCap className="size-5" />
            </div>
            <h3 className="text-lg font-bold text-zinc-200">Pensado para Admisión</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Enfoque exclusivo en exámenes académicos y de selección de nivel superior. EstudIAmigo te prepara para la velocidad, exactitud y lógica que estas demandantes pruebas requieren en la realidad.
            </p>
          </div>
        </div>
      </section>



      {/* Team Section */}
      <section id="equipo" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 text-xs text-zinc-400 mb-4">
            <Users className="size-3.5 text-emerald-400" />
            <span>Creadores</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
            Desarrollado por <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent font-black">Equipo Yorhacks</span>
          </h2>
          <p className="text-zinc-400 text-sm">
            Creado con pasión para el Innovathon 2026. Un equipo dedicado a transformar la educación a través de la IA.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Member 1 */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/40 p-6 text-center space-y-4 transition-all hover:border-zinc-700">
            <div className="size-16 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-black font-black text-xl mx-auto shadow-lg shadow-emerald-500/10">
              YE
            </div>
            <div>
              <h3 className="font-bold text-zinc-200">Yorhel Hiram Esparza Heredia</h3>
            </div>
          </div>

          {/* Member 2 */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/40 p-6 text-center space-y-4 transition-all hover:border-zinc-700">
            <div className="size-16 rounded-full bg-gradient-to-tr from-teal-400 to-emerald-500 flex items-center justify-center text-black font-black text-xl mx-auto shadow-lg shadow-emerald-500/10">
              DG
            </div>
            <div>
              <h3 className="font-bold text-zinc-200">Diego Karim González Parra</h3>
            </div>
          </div>

          {/* Member 3 */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/40 p-6 text-center space-y-4 transition-all hover:border-zinc-700">
            <div className="size-16 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-black font-black text-xl mx-auto shadow-lg shadow-emerald-500/10">
              FC
            </div>
            <div>
              <h3 className="font-bold text-zinc-200">Fernando Contreras</h3>
            </div>
          </div>

          {/* Member 4 */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/40 p-6 text-center space-y-4 transition-all hover:border-zinc-700">
            <div className="size-16 rounded-full bg-gradient-to-tr from-teal-400 to-emerald-500 flex items-center justify-center text-black font-black text-xl mx-auto shadow-lg shadow-emerald-500/10">
              MC
            </div>
            <div>
              <h3 className="font-bold text-zinc-200">Misael Carrillo Moreno</h3>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner Section */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="relative rounded-3xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/5 to-transparent p-12 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />
          
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
            ¿Listo para dominar tu examen?
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto mb-8 text-sm sm:text-base">
            Únete a la nueva era del aprendizaje impulsada por Inteligencia Artificial. Deja atrás la memorización temporal y asegura tu lugar en la universidad de tus sueños.
          </p>

          <Link
            href="/chat"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-8 text-sm font-bold text-black hover:opacity-95 transition-all hover:scale-[1.03]"
          >
            Acceder al Tutor Socrático
            <ArrowRight className="size-4 ml-2" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-12 text-center text-xs text-zinc-600 bg-zinc-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="size-5 rounded bg-emerald-500/10 flex items-center justify-center">
              <Sparkles className="size-3 text-emerald-400" />
            </div>
            <span className="font-bold text-zinc-400">EstudIAmigo AI</span>
          </div>
          <p>© {new Date().getFullYear()} Equipo Yorhacks. Todos los derechos reservados.</p>
          <p className="text-[10px] text-zinc-700">Diseñado con Next.js + Tailwind CSS + Lucide Icons para el Innovathon 2026.</p>
        </div>
      </footer>
    </div>
  )
}
"use client"
import ReactMarkdown from "react-markdown"
import remarkMath from "remark-math"

import rehypeKatex from "rehype-katex"
import "katex/dist/katex.min.css"
import { useEffect, useRef, useState } from "react"
import {
  Sparkles,
  Menu,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
  MessageSquare,
  Settings,
  Camera,
  ArrowUp,
  X,
  Map,
} from "lucide-react"
import LearningPath, { PathNode } from "@/components/learning-path"

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  image?: string | null
}

type Session = {
  id: string
  title: string
}

const SESSIONS: Session[] = [
  { id: "s1", title: "Práctica de Álgebra" },
  { id: "s2", title: "Ecuaciones de Círculos Ejercicio #4" },
  { id: "s3", title: "Ayuda con fórmula cuadrática" },
  { id: "s4", title: "Sistemas de ecuaciones" },
  { id: "s5", title: "Estrategia de tiempo para el examen" },
]

const SUGGESTIONS = [
  "Resolver una ecuación lineal",
  "Explicar la fórmula cuadrática",
  "Ayuda con un problema razonado",
]

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hola, soy tu tutor de EstudiaAmigo AI. Sube una captura de pantalla de cualquier problema matemático o escribe tu pregunta, y te guiaré paso a paso. ¿En qué vamos a trabajar hoy?",
}

function renderContent(text: string) {
  return text.split("\n").map((line, i) => {
    if (line.trim() === "") return <div key={i} className="h-2" />

    if (line.startsWith("`") && line.endsWith("`") && line.length > 1) {
      return (
        <div
          key={i}
          className="my-2 rounded-lg border border-border bg-muted px-3.5 py-2.5 font-mono text-[0.95rem] text-foreground"
        >
          {line.slice(1, -1)}
        </div>
      )
    }

    const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean)
    return (
      <p key={i} className="leading-7">
        {parts.map((part, j) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={j} className="font-semibold text-foreground">
                {part.slice(2, -2)}
              </strong>
            )
          }
          if (part.startsWith("`") && part.endsWith("`")) {
            return (
              <code
                key={j}
                className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em] text-foreground"
              >
                {part.slice(1, -1)}
              </code>
            )
          }
          return <span key={j}>{part}</span>
        })}
      </p>
    )
  })
}

export default function Page() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME])
  const [inputText, setInputText] = useState("")
  const [attachedImage, setAttachedImage] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeId, setActiveId] = useState<string>("s1")
  const [showProgress, setShowProgress] = useState(true)
  const [nodes, setNodes] = useState<PathNode[]>([
    { id: "1", label: "Aritmética", state: "completed" },
    { id: "2", label: "Fracciones", state: "completed" },
    { id: "3", label: "Álgebra", state: "active" },
    { id: "4", label: "Geometría", state: "locked" },
    { id: "5", label: "Trigonometría", state: "locked" },
    { id: "6", label: "Estadística", state: "locked" },
  ])

  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, isTyping])

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [inputText])

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setAttachedImage(reader.result as string)
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  async function send(text: string, image: string | null) {
    const trimmed = text.trim()
    if (!trimmed && !image) return

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: trimmed,
      image,
    }
    
    setMessages((prev) => [...prev, userMsg])
    setInputText("")
    setAttachedImage(null)
    setIsTyping(true)

    try {
      let base64Image = null;
      if (image) {
        base64Image = image.split(",")[1]; 
      }

      // Determine active topic to send as context
      const activeTopic = nodes.find((n) => n.state === "active")?.label || "Álgebra"

      const response = await fetch("http://127.0.0.1:3000/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: trimmed,
          image: base64Image,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
          topic: activeTopic,
        }),
      })

      const data = await response.json()
      
      if (data.error) throw new Error(data.error)

      const hasApproved = data.explanation.includes("[TEMA_APROBADO]")
      const cleanContent = hasApproved
        ? data.explanation.replace("[TEMA_APROBADO]", "").trim()
        : data.explanation

      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: "assistant", content: cleanContent },
      ])

      if (hasApproved) {
        setNodes((prevNodes) => {
          const activeIndex = prevNodes.findIndex((n) => n.state === "active")
          if (activeIndex !== -1) {
            const updated = [...prevNodes]
            updated[activeIndex] = { ...updated[activeIndex], state: "completed" }
            if (activeIndex + 1 < updated.length) {
              updated[activeIndex + 1] = { ...updated[activeIndex + 1], state: "active" }
            }
            return updated
          }
          return prevNodes
        })
      }
    } catch (error) {
      console.error("FRONTEND FETCH ERROR DETECTED:", error)
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: "assistant", content: "Lo siento, ocurrió un error al procesar el problema. Por favor revisa la conexión con el servidor." },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isTyping) return
    send(inputText, attachedImage)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (!isTyping) send(inputText, attachedImage)
    }
  }

  function newChat() {
    setMessages([WELCOME])
    setActiveId("")
    setMobileOpen(false)
    setInputText("")
    setAttachedImage(null)
  }

  const canSend = (inputText.trim().length > 0 || attachedImage !== null) && !isTyping

  function SidebarContent({ isCollapsed }: { isCollapsed: boolean }) {
    return (
      <div className="flex h-full w-full flex-col bg-card">
        <div className="flex items-center justify-between gap-2 px-3 py-3.5">
          {!isCollapsed && (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Sparkles className="size-4" aria-hidden="true" />
              </div>
              <span className="truncate text-sm font-bold tracking-tight text-foreground">
                EstudiaAmigo AI <span className="text-primary"></span>
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              if (mobileOpen) setMobileOpen(false)
              else setCollapsed((c) => !c)
            }}
            aria-label={isCollapsed ? "Expandir barra lateral" : "Contraer barra lateral"}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {isCollapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
          </button>
        </div>

        <div className="px-3 pb-2">
          <button
            type="button"
            onClick={newChat}
            className={`flex h-10 items-center gap-2 rounded-xl bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 ${
              isCollapsed ? "w-10 justify-center px-0" : "w-full px-3.5"
            }`}
          >
            <Plus className="size-4 shrink-0" aria-hidden="true" />
            {!isCollapsed && <span>Nuevo chat</span>}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2">
          {!isCollapsed && (
            <p className="px-2 pb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Sesiones anteriores
            </p>
          )}
          <ul className="flex flex-col gap-0.5">
            {SESSIONS.map((s) => {
              const active = s.id === activeId
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveId(s.id)
                      setMobileOpen(false)
                    }}
                    title={s.title}
                    className={`flex h-9 w-full items-center gap-2.5 rounded-lg text-left text-sm transition-colors ${
                      isCollapsed ? "justify-center px-0" : "px-2.5"
                    } ${
                      active
                        ? "bg-accent font-medium text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                    }`}
                  >
                    <MessageSquare className="size-4 shrink-0" aria-hidden="true" />
                    {!isCollapsed && <span className="truncate">{s.title}</span>}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="border-t border-border/60 p-3">
          <button
            type="button"
            className={`flex h-10 items-center gap-2.5 rounded-lg text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground ${
              isCollapsed ? "w-10 justify-center px-0" : "w-full px-2.5"
            }`}
          >
            <Settings className="size-4 shrink-0" aria-hidden="true" />
            {!isCollapsed && <span>Configuración</span>}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-dvh bg-background">
      <aside
        className={`hidden shrink-0 border-r border-border/60 transition-[width] duration-300 md:block ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        <SidebarContent isCollapsed={collapsed} />
      </aside>

      {showProgress && (
        <aside className="hidden xl:block w-80 shrink-0 border-r border-border/60 overflow-y-auto no-scrollbar bg-neutral-950 p-6 animate-in slide-in-from-left duration-300">
          <LearningPath nodes={nodes} />
        </aside>
      )}

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 left-0 w-64 border-r border-border/60 shadow-xl">
            <SidebarContent isCollapsed={false} />
          </div>
        </div>
      )}

      <main className="flex h-dvh min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-3.5 sm:px-6">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Abrir menú"
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:hidden"
              >
                <Menu className="size-5" />
              </button>
              <h1 className="text-lg font-bold tracking-tight text-foreground">
                EstudiaAmigo <span className="text-primary">AI</span>
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowProgress((p) => !p)}
                className={`hidden xl:flex size-9 items-center justify-center rounded-lg border transition-all duration-200 ${
                  showProgress
                    ? "bg-orange-950/40 border-orange-500/30 text-orange-400 shadow-sm"
                    : "border-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
                title={showProgress ? "Ocultar ruta de aprendizaje" : "Mostrar ruta de aprendizaje"}
              >
                <Map className="size-5" />
              </button>
              <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-xs font-medium text-muted-foreground">Tutor IA Activo</span>
              </div>
            </div>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6">
            {messages.map((m) =>
              m.role === "user" ? (
                <div key={m.id} className="flex justify-end">
                  <div className="flex max-w-[85%] flex-col items-end gap-2">
                    {m.image && (
                      <img
                        src={m.image || "/placeholder.svg"}
                        alt="Problema subido"
                        className="max-h-64 w-auto rounded-2xl border border-border object-cover"
                      />
                    )}
                    {m.content && (
                      <div className="rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-[0.95rem] leading-7 text-primary-foreground">
                        {m.content}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div key={m.id} className="flex justify-start gap-3">
                  <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Sparkles className="size-3.5" aria-hidden="true" />
                  </div>
                  <div className="max-w-[85%] text-[0.95rem] text-foreground space-y-2">
                    <ReactMarkdown
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                      components={{
                        p: ({ children }) => <p className="leading-7">{children}</p>,
                        strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                        ol: ({ children }) => <ol className="list-decimal pl-5 my-2.5 space-y-1.5">{children}</ol>,
                        ul: ({ children }) => <ul className="list-disc pl-5 my-2.5 space-y-1.5">{children}</ul>,
                        li: ({ children }) => <li className="leading-7">{children}</li>,
                        pre: ({ children }) => <pre className="my-3 overflow-x-auto rounded-lg border border-border bg-muted p-4 font-mono text-[0.9rem] text-foreground">{children}</pre>,
                        code: ({ children, ...props }) => (
                          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em] text-foreground" {...props}>
                            {children}
                          </code>
                        ),
                      }}
                    >
                      {m.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ),
            )}

            {isTyping && (
              <div className="flex justify-start gap-3">
                <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Sparkles className="size-3.5" aria-hidden="true" />
                </div>
                <div className="flex items-center gap-2.5 rounded-2xl rounded-tl-md border border-border bg-card px-3.5 py-2.5">
                  <span className="flex items-end gap-1">
                    <span className="typing-dot size-1.5 rounded-full bg-primary" />
                    <span className="typing-dot size-1.5 rounded-full bg-primary [animation-delay:0.15s]" />
                    <span className="typing-dot size-1.5 rounded-full bg-primary [animation-delay:0.3s]" />
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    Analizando tu problema matemático...
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-border/60 bg-background/80 backdrop-blur-xl">
          <div className="mx-auto w-full max-w-3xl px-4 py-3 sm:px-6 sm:py-4">
            {messages.length === 1 && !isTyping && (
              <div className="mb-3 flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s, null)}
                    className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm text-foreground transition-colors hover:border-primary/40 hover:bg-accent"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {attachedImage && (
              <div className="mb-3 flex">
                <div className="relative">
                  <img
                    src={attachedImage || "/placeholder.svg"}
                    alt="Vista previa del adjunto"
                    className="size-20 rounded-xl border border-border object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setAttachedImage(null)}
                    aria-label="Eliminar adjunto"
                    className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-foreground text-background shadow-md transition-transform hover:scale-105"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="flex items-end gap-2 rounded-[1.75rem] border border-border bg-card p-2 shadow-sm transition-colors focus-within:border-primary/50"
            >
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                aria-label="Adjuntar una captura de pantalla"
                className="flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Camera className="size-5" />
              </button>

              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Haz una pregunta o sube un problema..."
                className="max-h-40 flex-1 resize-none bg-transparent py-2.5 text-[0.95rem] leading-6 text-foreground outline-none placeholder:text-muted-foreground"
              />

              <button
                type="submit"
                disabled={!canSend}
                aria-label="Enviar mensaje"
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
              >
                <ArrowUp className="size-5" />
              </button>
            </form>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              EstudiaAmigo AI puede cometer errores. Siempre revisa tu trabajo.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
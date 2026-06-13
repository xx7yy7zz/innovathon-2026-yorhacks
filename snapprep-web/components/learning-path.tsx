"use client"

import type React from "react"
import { Check, Lock, Star } from "lucide-react"

export type NodeState = "completed" | "active" | "locked"

export interface PathNode {
  id: string
  label: string
  state: NodeState
}

// Horizontal offset pattern for the winding path (in pixels) to create the zig-zag effect
const OFFSETS = [0, 34, 8, 40, 12, 30]

const HEX_CLIP = "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"

function Hexagon({ node }: { node: PathNode }) {
  const base = "relative flex items-center justify-center transition-all duration-300"

  if (node.state === "active") {
    return (
      <div className="relative flex size-16 items-center justify-center select-none">
        {/* Pulsing halo */}
        <span
          aria-hidden
          className="absolute -inset-1.5 bg-orange-500/20 blur-md rounded-full animate-pulse"
        />
        
        {/* Outer Hexagon Border */}
        <div
          className="absolute inset-0 bg-orange-500/50"
          style={{ clipPath: HEX_CLIP }}
        />
        
        {/* Outer Hexagon Fill */}
        <div
          className="absolute inset-[1.5px] bg-[#140b05]"
          style={{ clipPath: HEX_CLIP }}
        />

        {/* Inner Solid Hexagon */}
        <div
          className="relative flex size-11 items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600 shadow-md shadow-orange-500/50 hover:scale-105 transition-transform duration-200"
          style={{ clipPath: HEX_CLIP }}
        >
          <Star className="size-5 fill-white text-white animate-[spin_12s_linear_infinite]" />
        </div>
      </div>
    )
  }

  if (node.state === "completed") {
    return (
      <div className={`${base} size-14 hover:scale-105 cursor-pointer`}>
        <div
          className="flex size-14 items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600 shadow-md shadow-orange-600/30"
          style={{ clipPath: HEX_CLIP }}
        >
          <Check className="size-6 text-white" strokeWidth={3} />
        </div>
      </div>
    )
  }

  // locked
  return (
    <div className="relative flex size-14 items-center justify-center select-none opacity-60">
      {/* Outer Border */}
      <div
        className="absolute inset-0 bg-neutral-800"
        style={{ clipPath: HEX_CLIP }}
      />
      {/* Inner Fill */}
      <div
        className="absolute inset-[1.5px] flex size-[53px] items-center justify-center bg-[#171719]"
        style={{ clipPath: HEX_CLIP }}
      >
        <Lock className="size-5 text-neutral-500" />
      </div>
    </div>
  )
}

interface LearningPathProps {
  nodes: PathNode[]
}

export function LearningPath({ nodes }: LearningPathProps) {
  return (
    <nav
      aria-label="Learning path progression"
      className="w-full flex flex-col"
    >
      <header className="mb-8 select-none">
        <p className="text-xs font-bold uppercase tracking-widest text-orange-500">
          Tu progreso
        </p>
        <h2 className="text-xl font-bold tracking-tight text-neutral-100 mt-1">Ruta de Matemáticas</h2>
      </header>

      <ol className="relative flex flex-col gap-1.5">
        {nodes.map((node, i) => {
          const offset = OFFSETS[i] ?? 0
          const isLast = i === nodes.length - 1
          // The connector below this node is "solid orange" when this node is completed
          const connectorActive = node.state === "completed"

          return (
            <li key={node.id} className="relative flex flex-col">
              <div
                className="flex items-center gap-5"
                style={{ marginLeft: `${offset}px` }}
              >
                <div className="flex size-16 items-center justify-center">
                  <Hexagon node={node} />
                </div>
                <span
                  className={`text-sm font-semibold tracking-wide ${
                    node.state === "locked" ? "text-neutral-500" : "text-neutral-200"
                  }`}
                >
                  {node.label}
                  {node.state === "active" && (
                    <span className="ml-2.5 inline-block rounded-full bg-orange-950/50 border border-orange-500/30 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-orange-400">
                      Ahora
                    </span>
                  )}
                </span>
              </div>

              {/* Connecting line (positioned under the hexagon center) */}
              {!isLast && (
                <div
                  className="flex h-8 items-center justify-center"
                  style={{
                    width: "64px",
                    marginLeft: `${offset}px`,
                  }}
                >
                  <span
                    aria-hidden
                    className={`h-full w-1 rounded-full ${
                      connectorActive ? "bg-orange-500" : "bg-neutral-800"
                    }`}
                  />
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default LearningPath


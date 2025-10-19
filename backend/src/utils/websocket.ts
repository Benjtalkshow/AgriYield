import type { Server as HTTPServer } from "http"
import { Server as SocketIOServer, type Socket } from "socket.io"
import { getBlockchainService } from "../services/blockchain.services"

export class WebSocketManager {
  private io: SocketIOServer
  private connectedUsers: Map<string, string> = new Map()

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST"],
      },
    })

    this.setupMiddleware()
    this.setupEventHandlers()
    this.setupBlockchainListeners()
  }

  private setupMiddleware(): void {
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token
      if (!token) return next(new Error("Authentication error"))
      next()
    })
  }

  private setupEventHandlers(): void {
    this.io.on("connection", (socket: Socket) => {
      console.log(`[WebSocket] User connected: ${socket.id}`)

      socket.on("user:connect", (userId: string) => {
        this.connectedUsers.set(userId, socket.id)
        console.log(`[WebSocket] User ${userId} connected with socket ${socket.id}`)
      })

      socket.on("farm:subscribe", (farmId: string) => {
        socket.join(`farm:${farmId}`)
      })

      socket.on("investment:subscribe", (investmentId: string) => {
        socket.join(`investment:${investmentId}`)
      })

      socket.on("farm:unsubscribe", (farmId: string) => {
        socket.leave(`farm:${farmId}`)
      })

      socket.on("disconnect", () => {
        for (const [userId, socketId] of this.connectedUsers.entries()) {
          if (socketId === socket.id) {
            this.connectedUsers.delete(userId)
            console.log(`[WebSocket] User ${userId} disconnected`)
            break
          }
        }
      })
    })
  }

  private setupBlockchainListeners(): void {
    try {
      const blockchainService = getBlockchainService()

      blockchainService.on("blockchain:farmCreated", (data) => {
        this.io.emit("blockchain:farmCreated", data)
      })

      blockchainService.on("blockchain:investmentMade", (data) => {
        this.io.to(`farm:${data.farmId}`).emit("blockchain:investmentMade", data)
      })

      blockchainService.on("blockchain:fundsDisbursed", (data) => {
        this.io.to(`farm:${data.farmId}`).emit("blockchain:fundsDisbursed", data)
      })

      blockchainService.on("blockchain:proceedsDeposited", (data) => {
        this.io.to(`farm:${data.farmId}`).emit("blockchain:proceedsDeposited", data)
      })

      blockchainService.on("blockchain:payoutClaimed", (data) => {
        this.io.to(`investment:${data.investmentId}`).emit("blockchain:payoutClaimed", data)
      })

      console.log("[WebSocket] Blockchain listeners setup complete")
    } catch (error) {
      console.error("[WebSocket] Error setting up blockchain listeners:", error)
    }
  }

  broadcastToFarm(farmId: string, event: string, data: any): void {
    this.io.to(`farm:${farmId}`).emit(event, data)
  }

  broadcastToInvestment(investmentId: string, event: string, data: any): void {
    this.io.to(`investment:${investmentId}`).emit(event, data)
  }

  broadcastToAll(event: string, data: any): void {
    this.io.emit(event, data)
  }

  getIO(): SocketIOServer {
    return this.io
  }
}

let wsManager: WebSocketManager | null = null

export function initializeWebSocket(httpServer: HTTPServer): WebSocketManager {
  if (!wsManager) wsManager = new WebSocketManager(httpServer)
  return wsManager
}

export function getWebSocketManager(): WebSocketManager {
  if (!wsManager) throw new Error("WebSocket manager not initialized")
  return wsManager
}

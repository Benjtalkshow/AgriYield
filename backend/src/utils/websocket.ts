import type { Server as HTTPServer } from "http"
import { Server as SocketIOServer, type Socket } from "socket.io"

export class WebSocketService {
  private io: SocketIOServer | null = null
  private connectedUsers: Map<string, string> = new Map()

  initialize(httpServer: HTTPServer): void {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
      },
    })

    this.setupEventHandlers()
    console.log("[WebSocket] Service initialized")
  }

  private setupEventHandlers(): void {
    if (!this.io) return

    this.io.on("connection", (socket: Socket) => {
      console.log(`[WebSocket] User connected: ${socket.id}`)

      socket.on("user:connect", (userId: string) => {
        this.connectedUsers.set(userId, socket.id)
        console.log(`[WebSocket] User ${userId} connected with socket ${socket.id}`)
      })

      socket.on("farm:subscribe", (farmId: string) => {
        socket.join(`farm:${farmId}`)
        console.log(`[WebSocket] Socket ${socket.id} subscribed to farm ${farmId}`)
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

  broadcast(event: string, data: any): void {
    if (!this.io) {
      console.warn("[WebSocket] Cannot broadcast - service not initialized")
      return
    }
    this.io.emit(event, data)
  }

  broadcastToFarm(farmId: string, event: string, data: any): void {
    if (!this.io) return
    this.io.to(`farm:${farmId}`).emit(event, data)
  }

  broadcastToInvestment(investmentId: string, event: string, data: any): void {
    if (!this.io) return
    this.io.to(`investment:${investmentId}`).emit(event, data)
  }

  getIO(): SocketIOServer | null {
    return this.io
  }
}

let wsService: WebSocketService | null = null

export function initializeWebSocketService(httpServer?: HTTPServer): WebSocketService {
  if (!wsService) {
    wsService = new WebSocketService()
    if (httpServer) {
      wsService.initialize(httpServer)
    }
  }
  return wsService
}

export function getWebSocketService(): WebSocketService {
  if (!wsService) {
    wsService = new WebSocketService()
  }
  return wsService
}

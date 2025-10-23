import { AuthRequest } from "../middleware/auth.middleware"
import User from "../models/user.model"

export async function resolveWalletAddress(req: AuthRequest): Promise<string | null> {
  const maybeWallet = (req.user as Partial<{ walletAddress: string }>)?.walletAddress
  if (maybeWallet) return maybeWallet

  if (req.user?.userId) {
    const user = await User.findById(req.user.userId)
    return user?.walletAddress ?? null
  }

  return null
}

import type { Request, Response } from "express"
import { AuthService } from "../services/authService"
import { validateFarmerFields } from "../validators/auth.validator"
import type { AuthRequest } from "../middleware/auth.middleware"

export class AuthController {

    /**
     * POST /auth/signup
     * Register a new user (investor or farmer)
     */
    static async signup(req: Request, res: Response): Promise<void> {
        try {
            const { email, name, role, farmName, farmDescription, location, nin, magicToken } = req.body

            validateFarmerFields(req.body)

            const magicMetadata = await AuthService.authenticateWithMagic(magicToken)

            if (magicMetadata.email.toLowerCase() !== email.toLowerCase()) {
                res.status(400).json({
                    success: false,
                    message: "Email mismatch with Magic authentication",
                })
                return
            }

            // Check if user already exists
            const existingUser = await AuthService.userExists(email)
            if (existingUser) {
                res.status(409).json({
                    success: false,
                    message: "User with this email already exists",
                })
                return
            }

            // Register user
            const user = await AuthService.registerUser({
                email,
                name,
                role,
                farmName,
                farmDescription,
                location,
                nin,
                magicToken,
            })

            // Generate JWT token
            const token = AuthService.generateToken(String(user._id), user.email, user.role)

            res.status(201).json({
                success: true,
                message: "User registered successfully",
                data: {
                    user: {
                        id: user._id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        farmName: user.farmName,
                        location: user.location,
                        verified: user.verified,
                        kycStatus: user.kycStatus,
                    },
                    token,
                },
            })
        } catch (error: any) {
            console.error("[v0] Signup error:", error)
            res.status(500).json({
                success: false,
                message: error.message || "Registration failed",
            })
        }
    }


    /**
     * POST /auth/signin
     * Sign in existing user with Magic token
     */
    static async signin(req: Request, res: Response): Promise<void> {
        try {
            const { magicToken } = req.body

            // Authenticate with Magic and get user
            const { user, token, isNewUser } = await AuthService.loginWithMagic(magicToken)

            res.status(200).json({
                success: true,
                message: "Sign in successful",
                data: {
                    user: {
                        id: user._id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        farmName: user.farmName,
                        location: user.location,
                        walletAddress: user.walletAddress,
                        verified: user.verified,
                        kycStatus: user.kycStatus,
                        profileImageUrl: user.profileImageUrl,
                    },
                    token,
                    isNewUser,
                },
            })
        } catch (error: any) {
            console.error("Signin error:", error)

            if (error.message.includes("User not found")) {
                res.status(404).json({
                    success: false,
                    message: "User not found. Please sign up first.",
                })
                return
            }

            res.status(401).json({
                success: false,
                message: error.message || "Authentication failed",
            })
        }
    }

    /**
     * POST /auth/connect-wallet
     * Connect wallet address to user account (protected)
     */
    static async connectWallet(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { walletAddress } = req.body
            const userId = req.user?.userId

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: "Authentication required",
                })
                return
            }

            // Update user wallet
            const updatedUser = await AuthService.updateUserWallet(userId, walletAddress)

            if (!updatedUser) {
                res.status(404).json({
                    success: false,
                    message: "User not found",
                })
                return
            }

            res.status(200).json({
                success: true,
                message: "Wallet connected successfully",
                data: {
                    user: {
                        id: updatedUser._id,
                        email: updatedUser.email,
                        name: updatedUser.name,
                        role: updatedUser.role,
                        walletAddress: updatedUser.walletAddress,
                    },
                },
            })
        } catch (error: any) {
            console.error("[v0] Connect wallet error:", error)

            if (error.message.includes("already connected")) {
                res.status(409).json({
                    success: false,
                    message: error.message,
                })
                return
            }

            res.status(500).json({
                success: false,
                message: error.message || "Failed to connect wallet",
            })
        }
    }

    /**
     * GET /auth/profile
     * Get authenticated user profile (protected)
     */
    static async getProfile(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: "Authentication required",
                })
                return
            }

            // Get user by ID
            const user = await AuthService.getUserById(userId)

            if (!user) {
                res.status(404).json({
                    success: false,
                    message: "User not found",
                })
                return
            }

            const stats = await AuthService.getUserStats(userId)

            res.status(200).json({
                success: true,
                message: "Profile retrieved successfully",
                data: {
                    user: {
                        id: user._id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        profileImageUrl: user.profileImageUrl,
                        walletAddress: user.walletAddress,
                        farmName: user.farmName,
                        farmDescription: user.farmDescription,
                        location: user.location,
                        verified: user.verified,
                        kycStatus: user.kycStatus,
                        isActive: user.isActive,
                        lastLoginAt: user.lastLoginAt,
                        createdAt: user.createdAt,
                    },
                    stats,
                },
            })
        } catch (error: any) {
            console.error("[v0] Get profile error:", error)
            res.status(500).json({
                success: false,
                message: error.message || "Failed to retrieve profile",
            })
        }
    }
}

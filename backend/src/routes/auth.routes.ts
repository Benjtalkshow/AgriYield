import { Router } from "express"
import { AuthController } from "../controllers/auth.controller"
import { validate } from "../middleware/validation.middleware"
import { authenticate } from "../middleware/auth.middleware"
import { signupSchema, signinSchema, connectWalletSchema } from "../validators/auth.validator"

const router = Router()

/**
 * @route   POST /auth/signup
 * @desc    Register a new user (investor or farmer)
 * @access  Public
 */
router.post("/signup", validate(signupSchema), AuthController.signup)

/**
 * @route   POST /auth/signin
 * @desc    Sign in existing user with Magic token
 * @access  Public
 */
router.post("/signin", validate(signinSchema), AuthController.signin)

/**
 * @route   POST /auth/connect-wallet
 * @desc    Connect wallet address to user account
 * @access  Protected
 */
router.post("/connect-wallet", authenticate, validate(connectWalletSchema), AuthController.connectWallet)

/**
 * @route   GET /auth/profile
 * @desc    Get authenticated user profile
 * @access  Protected
 */
router.get("/profile", authenticate, AuthController.getProfile)

export default router

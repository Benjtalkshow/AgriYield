import { Router } from "express"
import { FarmController } from "../controllers/farm.controller"
import { authenticate, requireRole } from "../middleware/auth.middleware"
import { UserRole } from "../types/index"

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Farms
 *   description: Farm management and investment endpoints
 */

/**
 * Public routes
 */

/**
 * @swagger
 * /api/farms:
 *   get:
 *     summary: Get all farms
 *     tags: [Farms]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: farmType
 *         schema:
 *           type: string
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *       - in: query
 *         name: verified
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: farmer
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of farms
 */
router.get("/", FarmController.getAllFarms)

/**
 * @swagger
 * /api/farms/{farmId}:
 *   get:
 *     summary: Get single farm by ID
 *     tags: [Farms]
 *     parameters:
 *       - in: path
 *         name: farmId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Farm object
 *       404:
 *         description: Farm not found
 */
router.get("/:farmId", FarmController.getFarmById)

/**
 * @swagger
 * /api/farms/{farmId}/investments:
 *   get:
 *     summary: Get investments for a specific farm
 *     tags: [Farms]
 *     parameters:
 *       - in: path
 *         name: farmId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of investments
 */
router.get("/:farmId/investments", FarmController.getFarmInvestments)

/**
 * Authenticated routes (Farmer)
 */

/**
 * @swagger
 * /api/farms/metadata:
 *   post:
 *     summary: Create farm metadata
 *     tags: [Farms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Metadata created,  call smart contract
 *       401:
 *         description: Unauthorized
 */
router.post("/metadata", authenticate, requireRole(UserRole.Farmer), FarmController.createFarmMetadata)

/**
 * @swagger
 * /api/farms/{farmId}/metadata:
 *   put:
 *     summary: Update farm metadata
 *     tags: [Farms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: farmId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Farm metadata updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Farm not found
 */
router.put("/:farmId/metadata", authenticate, requireRole(UserRole.Farmer), FarmController.updateFarmMetadata)

/**
 * @swagger
 * /api/farms/user/investments:
 *   get:
 *     summary: Get investments for logged-in user
 *     tags: [Farms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of user investments
 *       401:
 *         description: Unauthorized
 */
router.get("/user/investments", authenticate, FarmController.getUserInvestments)

/**
 * Admin routes
 */

/**
 * @swagger
 * /api/farms/{farmId}/verify:
 *   post:
 *     summary: Verify farm (Admin only)
 *     tags: [Farms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: farmId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Verification transaction submitted
 *       500:
 *         description: Failed to verify farm
 */
router.post("/:farmId/verify", authenticate, requireRole(UserRole.Admin), FarmController.verifyFarm)

/**
 * @swagger
 * /api/farms/{farmId}/disburse:
 *   post:
 *     summary: Disburse funds to farmer (Admin only)
 *     tags: [Farms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: farmId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Fund disbursement transaction submitted
 *       500:
 *         description: Failed to disburse funds
 */
router.post("/:farmId/disburse", authenticate, requireRole(UserRole.Admin), FarmController.disburseFunds)

/**
 * @swagger
 * /api/farms/{farmId}/delist:
 *   post:
 *     summary: Delist/close farm (Admin only)
 *     tags: [Farms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: farmId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Farm delist transaction submitted
 *       500:
 *         description: Failed to delist farm
 */
router.post("/:farmId/delist", authenticate, requireRole(UserRole.Admin), FarmController.delistFarm)

/**
 * @swagger
 * /api/farms/{farmId}/sync:
 *   post:
 *     summary: Sync farm data from blockchain (Admin only)
 *     tags: [Farms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: farmId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Farm synced successfully
 *       404:
 *         description: Farm not found
 *       500:
 *         description: Failed to sync farm
 */
router.post("/:farmId/sync", authenticate, requireRole(UserRole.Admin), FarmController.syncFarm)

export default router

import { Router } from "express"
import { FarmController } from "../controllers/farm.controller"
import { authenticate } from "../middleware/auth.middleware"

const router = Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     Farm:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - farmerId
 *         - farmType
 *         - totalArea
 *         - cultivatedArea
 *         - irrigationType
 *         - expectedYield
 *       properties:
 *         name:
 *           type: string
 *           description: Farm name
 *         description:
 *           type: string
 *           description: Farm description
 *         location:
 *           type: object
 *           properties:
 *             address:
 *               type: string
 *             coordinates:
 *               type: object
 *               properties:
 *                 latitude:
 *                   type: number
 *                 longitude:
 *                   type: number
 *             state:
 *               type: string
 *             country:
 *               type: string
 *         farmerId:
 *           type: string
 *           description: ID of the farmer who owns this farm
 *         farmType:
 *           type: string
 *           enum: [crop, livestock, mixed, poultry, fishery]
 *         totalArea:
 *           type: number
 *           description: Total farm area in hectares
 *         cultivatedArea:
 *           type: number
 *           description: Cultivated area in hectares
 *         irrigationType:
 *           type: string
 *           enum: [rainfed, irrigated, supplemental]
 *         crops:
 *           type: array
 *           items:
 *             type: string
 *         status:
 *           type: string
 *           enum: [active, inactive, pending, completed]
 *         images:
 *           type: array
 *           items:
 *             type: string
 *         documents:
 *           type: array
 *           items:
 *             type: string
 *         expectedYield:
 *           type: number
 *           description: Expected yield in tons
 */

/**
 * @swagger
 * /api/farms:
 *   post:
 *     summary: Create a new farm
 *     tags: [Farms]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Farm'
 *     responses:
 *       201:
 *         description: Farm created successfully
 *       400:
 *         description: Invalid input
 */
router.post("/", authenticate, FarmController.createFarm)

/**
 * @swagger
 * /api/farms:
 *   get:
 *     summary: Get all farms with optional filtering
 *     tags: [Farms]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by farm status
 *       - in: query
 *         name: farmType
 *         schema:
 *           type: string
 *         description: Filter by farm type
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: Filter by state
 *       - in: query
 *         name: isVerified
 *         schema:
 *           type: boolean
 *         description: Filter by verification status
 *       - in: query
 *         name: farmerId
 *         schema:
 *           type: string
 *         description: Filter by farmer ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of farms
 */
router.get("/",authenticate, FarmController.getFarms)

/**
 * @swagger
 * /api/farms/search:
 *   get:
 *     summary: Search farms by location, crops, or farm type
 *     tags: [Farms]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: farmType
 *         schema:
 *           type: string
 *         description: Filter by farm type
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: Filter by state
 *       - in: query
 *         name: minArea
 *         schema:
 *           type: number
 *         description: Minimum farm area
 *       - in: query
 *         name: maxArea
 *         schema:
 *           type: number
 *         description: Maximum farm area
 *     responses:
 *       200:
 *         description: Search results
 */
router.get("/search",authenticate, FarmController.searchFarms)

/**
 * @swagger
 * /api/farms/{id}:
 *   get:
 *     summary: Get farm by ID
 *     tags: [Farms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Farm ID
 *     responses:
 *       200:
 *         description: Farm details
 *       404:
 *         description: Farm not found
 */
router.get("/:id",authenticate, FarmController.getFarmById)

/**
 * @swagger
 * /api/farms/{id}:
 *   put:
 *     summary: Update farm by ID
 *     tags: [Farms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Farm ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Farm'
 *     responses:
 *       200:
 *         description: Farm updated successfully
 *       404:
 *         description: Farm not found
 */
router.put("/:id",authenticate, FarmController.updateFarm)

/**
 * @swagger
 * /api/farms/{id}:
 *   delete:
 *     summary: Delete farm by ID
 *     tags: [Farms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Farm ID
 *     responses:
 *       200:
 *         description: Farm deleted successfully
 *       404:
 *         description: Farm not found
 */
router.delete("/:id",authenticate, FarmController.deleteFarm)

/**
 * @swagger
 * /api/farms/{id}/summary:
 *   get:
 *     summary: Get farm summary with investment and harvest data
 *     tags: [Farms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Farm ID
 *     responses:
 *       200:
 *         description: Farm summary
 */
router.get("/:id/summary",authenticate, FarmController.getFarmSummary)

/**
 * @swagger
 * /api/farms/{id}/verify:
 *   put:
 *     summary: Verify farm (admin only)
 *     tags: [Farms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Farm ID
 *     responses:
 *       200:
 *         description: Farm verified successfully
 *       404:
 *         description: Farm not found
 */
router.put("/:id/verify",authenticate, FarmController.verifyFarm)

/**
 * @swagger
 * /api/farms/farmer/{farmerId}:
 *   get:
 *     summary: Get farms by farmer ID
 *     tags: [Farms]
 *     parameters:
 *       - in: path
 *         name: farmerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Farmer ID
 *     responses:
 *       200:
 *         description: List of farmer's farms
 */
router.get("/farmer/:farmerId",authenticate, FarmController.getFarmsByFarmer)

/**
 * @swagger
 * /api/farms/pending:
 *   get:
 *     summary: Get all pending farms (admin function)
 *     tags: [Farms]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending farms
 */
router.get("/pending", FarmController.getPendingFarms)

/**
 * @swagger
 * /api/farms/{id}/delist:
 *   put:
 *     summary: Delist farm (admin function)
 *     tags: [Farms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Farm ID
 *     responses:
 *       200:
 *         description: Farm delisted successfully
 *       404:
 *         description: Farm not found
 */
router.put("/:id/delist", FarmController.delistFarm)

export default router
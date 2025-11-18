import { Router } from "express";
import { FurnitureController } from "../controllers/furnitureController";
// import { authenticateJWT } from "../middleware/authMiddleware"; // à ajouter plus tard si besoin

const router = Router();

// Route pour créer un meuble
router.post("/furniture", /* authenticateJWT, */ FurnitureController.createFurniture);

// Tu pourras ajouter d'autres routes ici plus tard (get, update, delete...)

export default router;
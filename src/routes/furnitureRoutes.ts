import { Router } from "express";
import { FurnitureController } from "../controllers/furnitureController";
// import { authenticateJWT } from "../middleware/authMiddleware"; // à ajouter plus tard si besoin

const router = Router();

router.post("/furniture", /* authenticateJWT, */ FurnitureController.createFurniture);
router.get("/furniture", FurnitureController.getAllFurnitures);
router.get("/furniture/:id", FurnitureController.getFurnitureById);
router.put("/furniture/:id", FurnitureController.updateFurniture);
router.delete("/furniture/:id", FurnitureController.deleteFurniture);
router.patch("/furniture/:id/submit", FurnitureController.submitFurniture);

export default router;
import { Router } from "express";
import { FurnitureController } from "../controllers/furnitureController";
import { authenticateJWT, authorizeRoles } from "../middleware/authMiddleware";

const router = Router();

router.get("/catalogue", FurnitureController.getApprovedFurnitures);

router.get("/furniture/:id", FurnitureController.getFurnitureById);

router.post("/furniture", authenticateJWT, authorizeRoles("SELLER"), FurnitureController.createFurniture);
router.put("/furniture/:id", authenticateJWT, authorizeRoles("SELLER"), FurnitureController.updateFurniture);


router.get("/furniture", authenticateJWT, authorizeRoles("ADMIN"), FurnitureController.getAllFurnitures);
router.patch("/furniture/:id/validate", authenticateJWT, authorizeRoles("ADMIN"), FurnitureController.validateFurniture);
router.patch("/furniture/:id/refuse", authenticateJWT, authorizeRoles("ADMIN"), FurnitureController.refuseFurniture);
router.delete("/furniture/:id", authenticateJWT, FurnitureController.deleteFurniture);

export default router;
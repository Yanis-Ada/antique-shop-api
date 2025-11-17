import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

router.post('/users', UserController.createUser);
router.post("/register", UserController.createUser);
router.post("/login", UserController.login);

router.get("/users", authenticateJWT, authorizeRoles("ADMIN"), UserController.getAllUsers);
router.get('/users/:id', authenticateJWT, authorizeRoles("ADMIN", "SELLER"), UserController.getUserById);
router.patch("/users/:id", authenticateJWT, authorizeRoles("ADMIN", "SELLER"), UserController.updateUser);
router.delete('/users/:id', authenticateJWT, authorizeRoles("ADMIN"), UserController.deleteUser);

export default router;
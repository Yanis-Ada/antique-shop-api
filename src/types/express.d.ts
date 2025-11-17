import { MyJwtPayload } from "../middleware/authMiddleware";

// On étend le type Request d'Express pour ajouter la propriété user
declare global {
  namespace Express {
    interface Request {
      user?: MyJwtPayload;
    }
  }
}
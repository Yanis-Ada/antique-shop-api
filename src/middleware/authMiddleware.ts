import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken";

interface MyJwtPayload extends JwtPayload {
  role: string;
}

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

// export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
//   const authHeader = req.headers.authorization;
//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res.status(401).json({ error: "Token manquant ou invalide." });
//   }

//   const token = authHeader.split(" ")[1];
//   console.log("Token reçu pour AUTHENTICATE:", token);
//   try {
//     console.log("Clé secrète utilisée pour VERIFY:", JWT_SECRET);
//     const decoded = jwt.verify(token, JWT_SECRET) as MyJwtPayload;
//     req.user = decoded; 
//     console.log(req.user);// Ajoute l'utilisateur décodé à la requête
//     next();
//   } catch (err) {
//     return res.status(401).json({ error: "Token invalide ou expiré." });
//   }
// }

export function authorizeRoles(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    console.log("Rôle de l'utilisateur pour AUTHORIZE:", req.user);

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: "Accès interdit : rôle insuffisant." });
    }
    next();
  };
}
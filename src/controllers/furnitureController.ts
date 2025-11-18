import { Request, Response } from "express";
import { PrismaClient } from "../generated/prisma/index.js";
const prisma = new PrismaClient();

export class FurnitureController {
  static async createFurniture(req: Request, res: Response): Promise<void> {
    try {
      const { title, description, price } = req.body;
      const sellerId = 12; // suppose que l'id du vendeur est dans req.user

      // Vérification des champs obligatoires
      if (!title || !description || !price || !sellerId) {
        res.status(400).json({ error: "Tous les champs sont requis." });
        return;
      }

      // Création du meuble en statut DRAFT
      const furniture = await prisma.furniture.create({
        data: {
          title,
          description,
          price: parseFloat(price),
          status: "DRAFT",
          sellerId,
        },
      });
 
      res.status(201).json(furniture);
    } catch (error) {
      console.error("Erreur lors de la création du meuble :", error);
      res.status(500).json({ error: "Erreur serveur lors de la création du meuble." });
    }
  }
}
import { Request, Response } from "express";
import { PrismaClient } from "../generated/prisma/index.js";
const prisma = new PrismaClient();

export class FurnitureController {
    static async createFurniture(req: Request, res: Response): Promise<void> {
      try {
        const { title, description, price, imageUrl, adminNotes } = req.body;
        const sellerId = 12; // temporaire

        if (!title || !description || !price || !sellerId || !imageUrl) {
          res.status(400).json({ error: "Tous les champs sont requis." });
          return;
        }

        const furniture = await prisma.furniture.create({
          data: {
            title,
            description,
            price: parseFloat(price),
            status: "DRAFT",
            sellerId,
            imageUrl,
            adminNotes,
          },
        });

        res.status(201).json(furniture);
      } catch (error) {
        console.error("Erreur lors de la création du meuble :", error);
        res.status(500).json({ error: "Erreur serveur lors de la création du meuble." });
      }
    }


    static async getAllFurnitures(req: Request, res: Response): Promise<void> {
      try {
        const furnitures = await prisma.furniture.findMany();
        res.status(200).json(furnitures);
      } catch (error) {
        console.error("Erreur lors de la récupération des meubles :", error);
        res.status(500).json({ error: "Erreur serveur lors de la récupération des meubles." });
      }
    }

    
    static async getFurnitureById(req: Request, res: Response): Promise<void> {
      try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
          res.status(400).json({ error: "ID invalide." });
          return;
        }

        const furniture = await prisma.furniture.findUnique({
          where: { id },
        });

        if (!furniture) {
          res.status(404).json({ error: "Meuble non trouvé." });
          return;
        }

        res.status(200).json(furniture);
      } catch (error) {
        console.error("Erreur lors de la récupération du meuble :", error);
        res.status(500).json({ error: "Erreur serveur lors de la récupération du meuble." });
      }
    }

    static async updateFurniture(req: Request, res: Response): Promise<void> {
      try {
        const id = Number(req.params.id);
        const { title, description, price, imageUrl, adminNotes } = req.body;

        if (isNaN(id)) {
          res.status(400).json({ error: "ID invalide." });
          return;
        }

        const furniture = await prisma.furniture.findUnique({ where: { id } });
        if (!furniture) {
          res.status(404).json({ error: "Meuble non trouvé." });
          return;
        }
        if (furniture.status !== "DRAFT") {
          res.status(403).json({ error: "Seuls les meubles en brouillon peuvent être modifiés." });
          return;
        }

        const updated = await prisma.furniture.update({
          where: { id },
          data: { title, description, price, imageUrl, adminNotes },
        });

        res.status(200).json(updated);
      } catch (error) {
        console.error("Erreur lors de la modification du meuble :", error);
        res.status(500).json({ error: "Erreur serveur lors de la modification du meuble." });
      }
    }

    static async deleteFurniture(req: Request, res: Response): Promise<void> {
      try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
          res.status(400).json({ error: "ID invalide." });
          return;
        }

        const furniture = await prisma.furniture.findUnique({ where: { id } });
        if (!furniture) {
          res.status(404).json({ error: "Meuble non trouvé." });
          return;
        }

        await prisma.furniture.delete({ where: { id } });
        res.status(204).send();
      } catch (error) {
        console.error("Erreur lors de la suppression du meuble :", error);
        res.status(500).json({ error: "Erreur serveur lors de la suppression du meuble." });
      }
    }

    static async submitFurniture(req: Request, res: Response): Promise<void> {
      try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
          res.status(400).json({ error: "ID invalide." });
          return;
        }

        const furniture = await prisma.furniture.findUnique({ where: { id } });
        if (!furniture) {
          res.status(404).json({ error: "Meuble non trouvé." });
          return;
        }
        if (furniture.status !== "DRAFT") {
          res.status(403).json({ error: "Seuls les meubles en brouillon peuvent être soumis à validation." });
          return;
        }

        const updated = await prisma.furniture.update({
          where: { id },
          data: { status: "PENDING" },
        });

        res.status(200).json(updated);
      } catch (error) {
        console.error("Erreur lors de la soumission du meuble :", error);
        res.status(500).json({ error: "Erreur serveur lors de la soumission du meuble." });
      }
    }
  }
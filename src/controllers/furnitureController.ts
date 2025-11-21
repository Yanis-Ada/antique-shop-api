import { Request, Response } from "express";
import { PrismaClient, FurnitureStatus } from "../generated/prisma/index.js";
const prisma = new PrismaClient();

export class FurnitureController {
    static async getApprovedFurnitures(req: Request, res: Response): Promise<void> {
      try {
        const furnitures = await prisma.furniture.findMany({
          where: { status: "APPROVED" },
        });
        res.status(200).json(furnitures);
      } catch (error) {
        res.status(500).json({ error: "Erreur serveur lors de la récupération du catalogue." });
      }
    }
  
    static async createFurniture(req: Request, res: Response): Promise<void> {
      try {
        const { title, description, price, imageUrl, adminNotes } = req.body;
        const sellerId = req.user?.userId;

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
        const status = req.query.status as FurnitureStatus | undefined;
        const where = status ? { status } : {};
        const furnitures = await prisma.furniture.findMany({ where });
        res.status(200).json(furnitures);
      } catch (error) {
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

        // Si le meuble est validé, tout le monde peut y accéder
        if (furniture.status === FurnitureStatus.APPROVED) {
          res.status(200).json(furniture);
          return;
        }

        // Vérifie que l'utilisateur est connecté
        const user = req.user;
        if (!user) {
          res.status(403).json({ error: "Accès interdit à cette annonce." });
          return;
        }

        // Si admin ou vendeur propriétaire, accès autorisé
        if (
          user.role === "ADMIN" ||
          (user.role === "SELLER" && furniture.sellerId === user.userId)
        ) {
          res.status(200).json(furniture);
          return;
        }

        // Sinon, accès interdit
        res.status(403).json({ error: "Accès interdit à cette annonce." });
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
        const user = req.user;
        const furniture = await prisma.furniture.findUnique({ where: { id } });

        if (!furniture) {
          res.status(404).json({ error: "Meuble non trouvé." });
          return;
        }

        // Seul le vendeur propriétaire ou l'admin peut supprimer
        if (
          user.role !== "ADMIN" &&
          !(user.role === "SELLER" && furniture.sellerId === user.userId)
        ) {
          res.status(403).json({ error: "Accès interdit." });
          return;
        }

        await prisma.furniture.delete({ where: { id } });
        res.status(200).json({ message: "Meuble supprimé." });
      } catch (error) {
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

    static async validateFurniture(req: Request, res: Response): Promise<void> {
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
        if (furniture.status !== "PENDING") {
          res.status(403).json({ error: "Seuls les meubles en attente peuvent être validés." });
          return;
        }
        const updated = await prisma.furniture.update({
          where: { id },
          data: { status: FurnitureStatus.APPROVED },
        });
        res.status(200).json(updated);
      } catch (error) {
        res.status(500).json({ error: "Erreur serveur lors de la validation du meuble." });
      }
    }

    static async refuseFurniture(req: Request, res: Response): Promise<void> {
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
        if (furniture.status !== "PENDING") {
          res.status(403).json({ error: "Seuls les meubles en attente peuvent être refusés." });
          return;
        }
        const updated = await prisma.furniture.update({
          where: { id },
          data: { status: FurnitureStatus.REJECTED },
        });
        res.status(200).json(updated);
      } catch (error) {
        res.status(500).json({ error: "Erreur serveur lors du refus du meuble." });
      }
    }
  }
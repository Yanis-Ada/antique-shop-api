import { Request, Response } from "express";
import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

export class UserController {
    static async createUser(req: Request, res: Response): Promise<void> {
        console.log("🚀 UserController.createUser appelé");
        console.log("📦 Données reçues (req.body):", req.body);

        try {
            // On récupère les nouveaux champs du modèle
            const { email, firstName, lastName } = req.body;

            console.log("📋 Données extraites:");
            console.log("  - email:", email);
            console.log("  - firstName:", firstName);
            console.log("  - lastName:", lastName);

            // Validation des données obligatoires
            if (!email || !firstName || !lastName) {
                console.log("❌ Validation échouée: email, firstName ou lastName manquant");
                res.status(400).json({ error: "Email, prénom et nom sont obligatoires." });
                return;
            }

            console.log("✅ Validation réussie, tentative de création en base...");

            // Création de l'utilisateur avec les nouveaux champs
            const user = await prisma.user.create({
                data: {
                    email,
                    firstName,
                    lastName,
                },
            });
            console.log("🎉 Utilisateur créé avec succès:", user);

            res.status(201).json(user);
            return;

        } catch (error) {
            console.log("💥 Erreur dans createUser:");
            if (error instanceof Error) {
                console.log("  - Type d'erreur:", error.constructor.name);
                console.log("  - Message:", error.message);
                console.log("  - Stack:", error.stack);
            } else {
                console.log("  - Erreur non standard:", error);
            }
            res.status(500).json({ error: "Erreur lors de la création de l'utilisateur." });
            return;
        }
    }

    static async getAllUsers(req: Request, res: Response): Promise<void> {
        try {
            const users = await prisma.user.findMany();
            res.status(200).json(users);
        } catch (error) {
            console.error("Erreur lors de la récupération des utilisateurs:", error);
            res.status(500).json({ error: "Erreur lors de la récupération des utilisateurs." });
        }
    }

    static async getUserById(req: Request, res: Response): Promise<void> {
        try {
            const userId = Number(req.params.id);
            if (isNaN(userId)) {
                console.log("Id utilisateur invalide:", req.params.id);
                res.status(400).json({ error: "ID utilisateur invalide." });
                return;
            }

            const user = await prisma.user.findUnique({
                where: { id: userId },
            });

            if (!user) {
                console.log("Utilisateur non trouvé pour id:", userId);
                res.status(404).json({ error: "Utilisateur non trouvé." });
                return;
            }

            console.log("Utilisateur trouvé:", user);
            res.status(200).json(user);
        } catch (error) {
            console.error("Erreur lors de la récupération de l'utilisateur:", error);
            res.status(500).json({ error: "Erreur lors de la récupération de l'utilisateur." });
        }
    }

    static async updateUser(req: Request, res: Response): Promise<void> {
        console.log("updateUser appelé avec id:", req.params.id, "et body:", req.body);
        try {
            const userId = Number(req.params.id);
            const { email, firstName, lastName } = req.body;

            if (isNaN(userId)) {
                res.status(400).json({ error: "Id utilisateur invalide." });
                return;
            }

            // Vérifier qu'au moins un champ à modifier est présent
            if (!email && !firstName && !lastName) {
                res.status(400).json({ error: "Aucune donnée à mettre à jour." });
                return;
            }

            const user = await prisma.user.update({
                where: { id: userId },
                data: {
                    ...(email && { email }),
                    ...(firstName && { firstName }),
                    ...(lastName && { lastName }),
                },
            });

            res.status(200).json(user);
        } catch (error) {
            console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
            res.status(500).json({ error: "Erreur serveur lors de la mise à jour de l'utilisateur." });
        }
    }
}
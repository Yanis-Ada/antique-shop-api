import { Request, Response} from "express";
import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

export class UserController {
    static async createUser(req: Request, res: Response): Promise<void> {
        console.log("🚀 UserController.createUser appelé");
        console.log("📦 Données reçues (req.body):", req.body);
        
        // J'essaie de créer l'utilisateur, mais ça peut échouer
        try {
            // Je récupère les informations envoyées par l'utilisateur
            const { email, name } = req.body;
            
            console.log("📋 Données extraites:");
            console.log("  - email:", email);
            console.log("  - name:", name);

            // Validation des données obligatoires
            if (!email || !name) {
                console.log("❌ Validation échouée: email ou name manquant");
                res.status(400).json({ error: "Email et nom sont obligatoires" });
                return;
            }

            console.log("✅ Validation réussie, tentative de création en base...");

            // Je demande à Prisma de créer l'utilisateur en base de données
            const user = await prisma.user.create({
                // Les données que je veux sauvegarder :
                data: {
                    email,
                    name,
                },
            });
            console.log("🎉 Utilisateur.ice créé avec succès:", user);

            // Je réponds à l'utilisateur que la création a réussi
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
            
            res.status(500).json({ error: "Erreur lors de la création de l'utilisateur.ice." });
            return;
        }
    }

    static async getAllUsers(req: Request, res: Response): Promise<void> {
        try {
            const users = await prisma.user.findMany();
            res.status(200).json(users);
        } catch (error) {
            console.error("Erreur lors de la récupération des utilisateur.ices:", error);
            res.status(500).json({ error: "Erreur lors de la récupération des utilisateur.ices." });
        }
    }

    static async getUserById(req: Request, res: Response): Promise<void> {
        try {
            const userId = Number(req.params.id);
            if (isNaN(userId)) {
                console.log("Id utilisateur.ice invalide:", req.params.id);
                res.status(400).json({ error: "ID utilisateur.ice invalide." });
                return;
            }

            const user = await prisma.user.findUnique({
                where: { id: userId },
            });

            if (!user) {
                console.log("Utilisateur.ice non trouvé.e pour id:", userId);
                res.status(404).json({ error: "Utilisateur.ice non trouvé.e." });
                return;
            }

            console.log("Utilisateur.ice trouvé.e:", user);
            res.status(200).json(user); 
        } catch (error) {
            console.error("Erreur lors de la récupération de l'utilisateur.ice:", error);
            res.status(500).json({ error: "Erreur lors de la récupération de l'utilisateur.ice." });
        }
    }
}

// "Je veux comprendre ce que l'utilisateur m'envoie et lui répondre"
import { Request, Response} from "express";

// "Je veux pouvoir sauvegarder en base de données"
import { PrismaClient } from "../generated/prisma/index.js";

// Création de ma "télécommande" pour parler à la base de données
const prisma = new PrismaClient();

// Création de ma classe qui va contenir toutes les actions sur les utilisateurs
export class UserController {
    // Méthode pour créer un nouvel utilisateur dans la base de données
    static async createUser(req: Request, res: Response) {
        console.log("🚀 UserController.createUser appelé");
        console.log("📦 Données reçues (req.body):", req.body);
        
        // J'essaie de créer l'utilisateur, mais ça peut échouer
        try {
            // Je récupère les informations envoyées par l'utilisateur
            const { email, name, role } = req.body;
            
            console.log("📋 Données extraites:");
            console.log("  - email:", email);
            console.log("  - name:", name);

            // Validation des données obligatoires
            if (!email || !name) {
                console.log("❌ Validation échouée: email ou name manquant");
                return res.status(400).json({ error: "Email et nom sont obligatoires" });
            }

            console.log("✅ Validation réussie, tentative de création en base...");

            // Je demande à Prisma de créer l'utilisateur en base de données
            const user = await prisma.user.create({
                // Les données que je veux sauvegarder :
                data: {
                    email,
                    name,
                    role: role || 'CONSUMER',
                },
            });

            console.log("🎉 Utilisateur créé avec succès:", user);

            // Je réponds à l'utilisateur que la création a réussi
            res.status(201).json(user);

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
        }
    }
}

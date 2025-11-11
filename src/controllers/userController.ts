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
        // J'essaie de créer l'utilisateur, mais ça peut échouer
        try {
            // Je récupère les informations envoyées par l'utilisateur
            const { email, name, role, googleId, avatarUrl } = req.body;

            // Je demande à Prisma de créer l'utilisateur en base de données
            const user = await prisma.user.create({
                // Les données que je veux sauvegarder :
                data: {
                    email,
                    name,
                    role: role || 'CONSUMER',
                    googleId,
                    avatarUrl,
                },
            });

            // Je réponds à l'utilisateur que la création a réussi
            res.status(201).json(user);

        } catch (error) {
            res.status(500).json({ error: "Erreur lors de la création de l'utilisateur." });
        }
    }
}

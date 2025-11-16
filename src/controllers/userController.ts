import { Request, Response } from "express";
import { PrismaClient } from "../generated/prisma/index.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const prisma = new PrismaClient();

function isValidPassword(password: string): boolean {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password);
}

export class UserController {
    static async createUser(req: Request, res: Response): Promise<void> {
        console.log("UserController.createUser appelé");
        console.log("Données reçues (req.body):", req.body);

        try {
            const { email, firstName, lastName, password, role } = req.body;

            // Validation des données obligatoires
            if (!email || !firstName || !lastName || !password) {
                res.status(400).json({ error: "Email, prénom, nom et mot de passe sont obligatoires." });
                return;
            }

            // Validation de la complexité du mot de passe
            if (!isValidPassword(password)) {
                res.status(400).json({ error: "Mot de passe trop faible. Il doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre." });
                return;
            }

            // Hash du mot de passe
            const hashedPassword = await bcrypt.hash(password, 10);

            // Création de l'utilisateur
            const user = await prisma.user.create({
                data: {
                    email,
                    firstName,
                    lastName,
                    password: hashedPassword,
                    role: role || "SELLER", // Par défaut SELLER si non précisé
                },
            });

            // On ne retourne jamais le mot de passe !
            res.status(201).json({ id: user.id, email: user.email, role: user.role });
            return;

        } catch (error) {
            console.log("Erreur dans createUser:", error);
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

    static async deleteUser(req: Request, res: Response): Promise<void> {
        try {
            const userId = Number(req.params.id);

            // Vérifie que l'ID est valide
            if (isNaN(userId)) {
                res.status(400).json({ error: "Id utilisateur invalide." });
                return;
            }

            // Vérifie que l'utilisateur existe
            const existingUser = await prisma.user.findUnique({ where: { id: userId } });
            if (!existingUser) {
                res.status(404).json({ error: "Utilisateur non trouvé." });
                return;
            }

            // Supprime l'utilisateur
            await prisma.user.delete({ where: { id: userId } });

            res.status(204).send(); // 204 = No Content
        } catch (error) {
            console.error("Erreur lors de la suppression de l'utilisateur:", error);
            res.status(500).json({ error: "Erreur serveur lors de la suppression de l'utilisateur." });
        }
    }

    static async login(req: Request, res: Response): Promise<void> {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: "Email et mot de passe requis." });
            return;
        }

        try {
            const user = await prisma.user.findUnique({ where: { email } });

            // Message d'erreur générique pour éviter de donner des infos à un attaquant
            if (!user) {
                res.status(401).json({ error: "Identifiants invalides." });
                return;
            }

            // Vérification du mot de passe
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                res.status(401).json({ error: "Identifiants invalides." });
                return;
            }

            // Génération du JWT
            const token = jwt.sign(
                { userId: user.id, role: user.role },
                JWT_SECRET,
                { expiresIn: "15min" }
            );

            res.status(200).json({ token, user: { id: user.id, email: user.email, role: user.role } });
        } catch (error) {
            res.status(500).json({ error: "Erreur serveur lors de la connexion." });
        }
    }
}
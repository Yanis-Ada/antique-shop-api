import { Request, Response } from "express";
import { PrismaClient, $Enums } from "../generated/prisma/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

const prisma = new PrismaClient();

function isValidPassword(password: string): boolean {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
}

export class UserController {
    static async createUser(req: Request, res: Response): Promise<void> {
        try {
            const { email, firstName, lastName, password, role } = req.body;
            if (!email || !firstName || !lastName || !password) {
                res.status(400).json({ error: "Tous les champs sont requis." });
                return;
            }
            if (!isValidPassword(password)) {
                res.status(400).json({ error: "Mot de passe trop faible (min 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre)." });
                return;
            }
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                res.status(400).json({ error: "Email déjà utilisé." });
                return;
            }
            const hashedPassword = await bcrypt.hash(password, 10);

            const validRoles = [$Enums.Role.SELLER, $Enums.Role.ADMIN];
            const userRole = validRoles.includes(role) ? role : $Enums.Role.SELLER;

            const user = await prisma.user.create({
                data: { email, firstName, lastName, password: hashedPassword, role: userRole },
            });

            const token = jwt.sign(
                { userId: user.id, role: user.role },
                JWT_SECRET,
                { expiresIn: "24h" }
            );
            res.status(201).json({ token, id: user.id, email: user.email, role: user.role });
        } catch (error) {
            console.error("Erreur lors de la création de l'utilisateur:", error);
            res.status(500).json({ error: "Erreur serveur lors de l'inscription." });
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
}
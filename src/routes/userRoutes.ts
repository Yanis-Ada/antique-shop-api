// J'importe Router pour créer mes chemins d'API (routes)
import { Router } from 'express';

// J'importe mon contrôleur pour utiliser ses méthodes
import { UserController } from '../controllers/userController';

// Je créé mon gestionnaire de routes (= une instance de Router)pour les utilisateurs
const router = Router();

// Route POST /users pour créer un nouvel utilisateur
router.post('/users', UserController.createUser);

// J'export mon router pour pouvoir l'utiliser dans le serveur principal
export default router;
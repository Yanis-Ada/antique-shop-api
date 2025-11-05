import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import { initializeDatabase } from './config/database';

// Charger les variables d'environnement
dotenv.config();

// Créer l'application Express
const app: Express = express();
const port = process.env.PORT || 3000;

// Configuration CORS pour permettre au frontend de communiquer
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true, // Nécessaire pour les cookies de session
}));

// Middleware pour parser le JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration des sessions
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS en production
    maxAge: 24 * 60 * 60 * 1000, // 24 heures
  },
}));

// Route de test simple
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Antique Shop API is running! 🏺',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

// Route de santé (health check)
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

// Gestion des erreurs 404
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Fonction de démarrage avec initialisation de la base
const startServer = async (): Promise<void> => {
  try {
    // Initialiser la base de données
    await initializeDatabase();
    console.log('🗄️ Base de données initialisée');

    // Démarrer le serveur
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3001'}`);
    });
  } catch (error) {
    console.error('Erreur lors du démarrage:', error);
    process.exit(1);
  }
};

// Démarrer l'application
startServer();

export default app;
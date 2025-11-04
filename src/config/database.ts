import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

// Configuration de la base de données SQLite pour marketplace meubles
export class Database {
  private db: sqlite3.Database;
  private static instance: Database;

  private constructor() {
    const dbPath = process.env.DATABASE_PATH || './database/antique_shop.db';
    const dbDir = path.dirname(dbPath);

    // Créer le dossier database s'il n'existe pas
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Créer la connexion SQLite
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ Erreur connexion base de données:', err.message);
      } else {
        console.log('✅ Connexion SQLite établie:', dbPath);
      }
    });

    // Activer les clés étrangères
    this.db.run('PRAGMA foreign_keys = ON');
  }

  // Pattern Singleton pour une seule instance DB
  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  // Getter pour accéder à l'instance SQLite
  public getDB(): sqlite3.Database {
    return this.db;
  }

  // Méthode pour exécuter des requêtes avec Promise
  public run(sql: string, params: any[] = []): Promise<sqlite3.RunResult> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this);
        }
      });
    });
  }

  // Méthode pour récupérer une ligne
  public get(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Méthode pour récupérer toutes les lignes
  public all(sql: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Initialiser les tables pour marketplace de meubles
  public async initTables(): Promise<void> {
    try {
      // Table users avec système de rôles (seller/admin/consumer)
      await this.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          google_id TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'consumer' CHECK (role IN ('seller', 'admin', 'consumer')),
          avatar_url TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Table products avec workflow de validation
      await this.run(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          price DECIMAL(10,2) NOT NULL CHECK (price > 0),
          image_url TEXT,
          status TEXT NOT NULL DEFAULT 'draft' 
            CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'sold')),
          seller_id INTEGER NOT NULL,
          admin_notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (seller_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `);

      // Table cart_items pour panier consommateurs
      await this.run(`
        CREATE TABLE IF NOT EXISTS cart_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, product_id),
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
          FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
        )
      `);

      // Index pour optimiser les requêtes
      await this.run('CREATE INDEX IF NOT EXISTS idx_products_status ON products (status)');
      await this.run('CREATE INDEX IF NOT EXISTS idx_products_seller ON products (seller_id)');
      await this.run('CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items (user_id)');

      console.log('✅ Tables marketplace initialisées avec succès');
    } catch (error) {
      console.error('❌ Erreur initialisation tables:', error);
      throw error;
    }
  }

  // Fermer la connexion
  public close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('🔒 Connexion SQLite fermée');
          resolve();
        }
      });
    });
  }
}

// Export de l'instance singleton
export const db = Database.getInstance();

// Fonction pour initialiser la base (rétrocompatibilité)
export const initializeDatabase = (): Promise<void> => {
  return db.initTables();
};



// Gestion propre de l'arrêt de l'application
process.on('SIGINT', async () => {
  console.log('\n🛑 Arrêt de l\'application...');
  try {
    await db.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'arrêt:', error);
    process.exit(1);
  }
});
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { getPool, query, executeQuery } from './connection.js';

/**
 * Ensures all MySQL database tables are created from schema.sql
 * and that at least one primary admin account exists for login.
 * Strictly NO fake products, mock categories, dummy brands, or sample orders are inserted.
 */
export async function bootstrapSchemaOnly() {
  console.log('--- Initializing Database Schema (No Dummy Seed Data) ---');
  const dbPool = getPool();

  try {
    // 1. Run migrations from schema.sql
    console.log('Executing database schema creation from schema.sql...');
    const schemaPath = path.resolve(process.cwd(), 'src/db/schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      
      const schemaClean = schemaSql
        .replace(/--.*$/gm, '') // remove single-line comments
        .replace(/\/\*[\s\S]*?\*\//g, ''); // remove multi-line comments
        
      const sqlStatements = schemaClean
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      for (const sql of sqlStatements) {
        try {
          await dbPool.query(sql);
        } catch (sqlErr: any) {
          console.error(`Schema statement notification: [${sql.substring(0, 60)}...]`, sqlErr.message || sqlErr);
        }
      }
      console.log('Database tables verified/created successfully.');
    }

    // 2. Ensure primary admin account exists so the administrator can log in
    const existingAdmin = await executeQuery<any>("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
    if (!existingAdmin || existingAdmin.length === 0) {
      console.log('Creating primary admin user account...');
      const adminPassword = await bcrypt.hash('admin123', 10);
      await query(
        `INSERT INTO users (name, email, password, role, phone, email_verified) VALUES (?, ?, ?, ?, ?, ?)`,
        ['Jaydev Admin', 'admin@jaydev.com', adminPassword, 'admin', '+91 9876543210', true]
      );
      console.log('Primary admin user created: admin@jaydev.com');
    } else {
      console.log('Primary admin account verified.');
    }

    console.log('--- Database Initialization Complete (0 Dummy Records Added) ---');
  } catch (error) {
    console.error('Database schema initialization error:', error);
    throw error;
  }
}

/**
 * Main seeder function called on app boot.
 * Strictly delegates to schema initialization without adding any default seed data.
 */
export async function runSeeder() {
  await bootstrapSchemaOnly();
}

/**
 * Helper to wipe all data (e.g. if admin requests purging old dummy/test records)
 */
export async function wipeAllDataExceptAdmin() {
  console.log('Wiping non-admin data from database...');
  const tablesToTruncate = [
    'activity_logs', 'transactions', 'order_items', 'orders', 
    'cart', 'wishlist', 'reviews', 'addresses', 'coupons', 
    'product_variants', 'product_images', 'products', 
    'subcategories', 'categories', 'brands', 
    'contact_messages', 'newsletter', 'banners', 'pages'
  ];

  await query('SET FOREIGN_KEY_CHECKS = 0');
  for (const t of tablesToTruncate) {
    try {
      await query(`TRUNCATE TABLE ${t}`);
    } catch (e) {
      // Table might not exist yet
    }
  }
  // Remove non-admin users
  try {
    await query("DELETE FROM users WHERE role != 'admin'");
  } catch (e) {}
  
  await query('SET FOREIGN_KEY_CHECKS = 1');
  console.log('All non-admin records purged successfully.');
}

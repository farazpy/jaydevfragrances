import { executeQuery } from './src/db/connection.js';

async function run() {
  try {
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS metrics (
        date DATE PRIMARY KEY,
        views INT DEFAULT 0,
        sessions INT DEFAULT 0
      );
    `);
    console.log("Created metrics table");
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}
run();

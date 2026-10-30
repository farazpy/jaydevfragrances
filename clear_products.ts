import { query } from './src/db/connection.js';

async function main() {
  console.log('Connecting to local MySQL database and clearing products...');
  try {
    const result = await query('DELETE FROM products');
    console.log('Successfully cleared all products from MySQL database!');
    console.log('Result:', result);
    process.exit(0);
  } catch (err) {
    console.error('CRITICAL: Error clearing products from MySQL database:', err);
    process.exit(1);
  }
}

main();

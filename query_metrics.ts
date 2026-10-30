import { executeQuery } from './src/db/connection.js';

async function run() {
  const rows = await executeQuery('SELECT * FROM metrics');
  console.log(rows);
  process.exit(0);
}
run();

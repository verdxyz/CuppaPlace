require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { getPool } = require('../src/utils/db');

(async () => {
  try {
    const pool = await getPool();
    const sql = fs.readFileSync(path.join(process.cwd(), 'migrations', '001_schema.sql'), 'utf-8');
    await pool.query(sql);
    console.log('Migration applied.');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();

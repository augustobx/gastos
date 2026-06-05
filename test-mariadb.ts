import * as mariadb from 'mariadb';

async function main() {
  console.log("Creating pool...");
  const pool = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'gastos'
  });
  console.log("Getting connection...");
  try {
    const conn = await pool.getConnection();
    console.log("Connected successfully!");
    conn.release();
  } catch (err) {
    console.error("Connection failed:", err);
  }
}
main();

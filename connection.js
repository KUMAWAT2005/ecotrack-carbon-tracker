const mysql = require("mysql2/promise");
require("dotenv").config();

let pool = null;

async function initializePool() {
  if (pool) {
    console.log("ℹ️ Database pool already initialized");
    return pool;
  }

  try {
    pool = await mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "root",
      database: process.env.DB_NAME || "ecotrack",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    console.log("✅ MySQL Connection Pool Created Successfully");
    return pool;
  } catch (error) {
    console.error("❌ Database pool initialization failed:", error.message);
    throw error;
  }
}

async function getPool() {
  if (!pool) {
    await initializePool();
  }
  return pool;
}

async function testConnection() {
  try {
    const currentPool = await getPool();
    const connection = await currentPool.getConnection();
    await connection.ping();
    connection.release();
    console.log("✅ Database connection test successful");
    return true;
  } catch (error) {
    console.error("❌ Database connection test failed:", error.message);
    return false;
  }
}

module.exports = {
  getPool,
  initializePool,
  testConnection
};

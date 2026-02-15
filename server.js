const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { initializePool, testConnection } = require("./db/connection");
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

// Load environment variables from root .env file
require("dotenv").config({ path: path.join(__dirname, '..', '.env') });

const app = express();

// Configure CORS properly - allow localhost with specific ports
const corsOptions = {
  origin: function(origin, callback) {
    // Allow requests from localhost (any port) and specific frontend port
    const allowedOrigins = [
      'http://localhost:5505',
      'http://127.0.0.1:5505',
      'http://localhost:5000',
      'http://127.0.0.1:5000'
    ];
    
    // If no origin (same-origin requests), allow
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS request blocked from origin: ${origin}`);
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Import routes
const authRoutes = require("./routes/auth");
const footprintRoutes = require("./routes/footprints");
const profileRoutes = require("./routes/profile");
const realtimeRoutes = require("./routes/realtime");
const otpRoutes = require("./routes/otp");

// Initialize database tables on startup
const initializeDatabase = async () => {
  try {
    // Connect to MySQL without database to create it
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "root"
    });

    console.log("🔗 Connected to MySQL server");

    // Read and execute schema
    const schemaPath = path.join(__dirname, "db", "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    // Split by semicolon and execute each statement
    const statements = schema.split(";").filter(stmt => stmt.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.query(statement);
        } catch (err) {
          // Index or table might already exist, continue
          if (!err.message.includes("already exists") && !err.message.includes("duplicate")) {
            console.warn("⚠️ Schema statement warning:", err.message);
          }
        }
      }
    }

    console.log("✅ Database schema initialized successfully");
    await connection.end();
  } catch (error) {
    console.error("⚠️ Database initialization warning:", error.message);
    // Continue anyway as database might already exist
  }
};

// Test DB connection
app.get("/test-db", (req, res) => {
  testConnection().then((connected) => {
    if (!connected) {
      return res.status(500).send("❌ DB Error");
    }
    res.send("✅ Database Connected Successfully");
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/footprints", footprintRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/realtime", realtimeRoutes);

const PORT = process.env.PORT || 5000;

// Start server after initializing database
const startServer = async () => {
  try {
    // Initialize database pool FIRST
    await initializePool();
    console.log("✅ Database pool initialized");
    
    // Then initialize database schema
    await initializeDatabase();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log("🚀 Server running on http://0.0.0.0:" + PORT);
      console.log("🌐 Access at: http://localhost:" + PORT);
      console.log("✨ Ready to accept requests!");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};
startServer();
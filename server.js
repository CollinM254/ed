const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");

// Import routes
const schoolRoutes = require("./routes/schoolRouter");
const parentRoutes = require("./routes/parentRoutes");
const learnerRoutes = require("./routes/learnerRoutes");
const videoRoutes = require("./routes/videoRoutes");
const adminSupportRoutes = require("./routes/adminSupportRoutes");
const teacherResourceRoutes = require("./routes/teacherResourceRoutes");
// ... other route imports ...

const app = express();
let server;
let io;

// Database connection - optimized for serverless
let cachedDb = null;
async function connectDB() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
      retryWrites: true,
      w: "majority",
    });
    console.log("MongoDB connected successfully");
    cachedDb = db;
    return db;
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
}

// CORS configuration
const corsOptions = {
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "x-auth-token",
    "user-type",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Backend API is running",
    status: "healthy",
    version: "1.0",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Routes
app.use("/api/schools", schoolRoutes);
app.use("/api/parents", parentRoutes);
app.use("/api/learners", learnerRoutes);
app.use("/api", videoRoutes);
app.use("/api/admin/support", adminSupportRoutes);
app.use("/api/schools/teacher-resources", teacherResourceRoutes);
app.use("/api/teacher-resources", teacherResourceRoutes);
// ... other routes ...

// Health check
app.get("/api/health", async (req, res) => {
  try {
    await connectDB();
    const dbStatus =
      mongoose.connection.readyState === 1 ? "connected" : "disconnected";
    res.json({
      status: "ok",
      database: dbStatus,
      mobileSupport: true,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Socket.io setup (only for local development)
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  server = http.createServer(app);
  io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  app.set("io", io);
}

// Vercel serverless function handler
if (process.env.VERCEL) {
  module.exports = async (req, res) => {
    // Initialize database connection for each request
    try {
      await connectDB();

      // Handle WebSocket upgrade requests
      if (req.headers.upgrade === "websocket") {
        res
          .status(426)
          .send("WebSocket not supported in serverless environment");
        return;
      }

      // Process regular HTTP requests
      return app(req, res);
    } catch (err) {
      console.error("Server error:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
} else {
  // Local development server
  const PORT = process.env.PORT || 5000;

  const startServer = async () => {
    try {
      await connectDB();
      const runningServer = server || app;

      runningServer.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running at http://0.0.0.0:${PORT}`);
      });
    } catch (err) {
      console.error("Failed to start server:", err);
      process.exit(1);
    }
  };

  startServer();
}


// require('dotenv').config();
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const http = require('http');
// const socketIo = require('socket.io');
// const helmet = require('helmet');
// const rateLimit = require('express-rate-limit');
// const mongoSanitize = require('express-mongo-sanitize');
// const hpp = require('hpp');
// const morgan = require('morgan');

// // Import routes
// const schoolRoutes = require('./routes/schoolRouter');
// const parentRoutes = require('./routes/parentRoutes');
// const learnerRoutes = require('./routes/learnerRoutes');
// const videoRoutes = require('./routes/videoRoutes');
// const adminSupportRoutes = require('./routes/adminSupportRoutes');
// const teacherResourceRoutes = require('./routes/teacherResourceRoutes');

// const app = express();
// let server;
// let io;

// // Enhanced Database connection with caching
// let cachedDb = null;
// async function connectDB() {
//   if (cachedDb && mongoose.connection.readyState === 1) {
//     console.log('Using cached DB connection');
//     return cachedDb;
//   }

//   try {
//     const db = await mongoose.connect(process.env.MONGODB_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//       serverSelectionTimeoutMS: 5000,
//       socketTimeoutMS: 30000,
//       retryWrites: true,
//       w: "majority",
//       maxPoolSize: 10,
//       minPoolSize: 2,
//       connectTimeoutMS: 30000
//     });
    
//     console.log("MongoDB connected successfully");
//     cachedDb = db;
//     return db;
//   } catch (err) {
//     console.error("MongoDB connection error:", err);
//     throw err;
//   }
// }

// // Security and performance middleware
// app.use(helmet());
// app.use(mongoSanitize());
// app.use(hpp());
// app.use(morgan('combined'));

// // Enhanced CORS configuration
// const allowedOrigins = [
//   'https://kidsedu-admin.vercel.app',
//   'https://kidsedu-cbe.vercel.app',
//   'https://teacher-kidsedu.vercel.app',
//   'https://kidsm.vercel.app',
//   'http://localhost:3000',
//   'capacitor://localhost',
//   'ionic://localhost'
// ];

// const corsOptions = {
//   origin: function (origin, callback) {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: [
//     "Content-Type",
//     "Authorization",
//     "X-Requested-With",
//     "x-auth-token",
//     "user-type"
//   ],
//   credentials: true,
//   optionsSuccessStatus: 200,
//   maxAge: 86400
// };

// app.use(cors(corsOptions));
// app.options("*", cors(corsOptions));

// // Request payload handling
// app.use(express.json({ limit: "25mb" }));
// app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// // Rate limiting
// const apiLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 1000,
//   message: 'Too many requests from this IP, please try again later'
// });
// app.use('/api/', apiLimiter);

// // Routes
// app.get("/", (req, res) => {
//   res.json({
//     message: "Backend API is running",
//     status: "healthy",
//     version: "1.0",
//     timestamp: new Date().toISOString(),
//     environment: process.env.NODE_ENV || "development",
//   });
// });

// app.use("/api/schools", schoolRoutes);
// app.use("/api/parents", parentRoutes);
// app.use("/api/learners", learnerRoutes);
// app.use("/api/videos", videoRoutes);
// app.use("/api/admin/support", adminSupportRoutes);
// app.use("/api/teacher-resources", teacherResourceRoutes);

// // Enhanced health check
// app.get("/api/health", async (req, res) => {
//   try {
//     await connectDB();
//     const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
    
//     res.json({
//       status: "ok",
//       database: dbStatus,
//       uptime: process.uptime(),
//       memoryUsage: process.memoryUsage(),
//       mobileSupport: true,
//       timestamp: new Date().toISOString(),
//     });
//   } catch (err) {
//     res.status(500).json({ 
//       status: "error", 
//       message: err.message,
//       stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
//     });
//   }
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error("Error:", err.stack);
  
//   const statusCode = err.statusCode || 500;
//   const message = err.message || 'Internal Server Error';
  
//   res.status(statusCode).json({
//     error: message,
//     ...(process.env.NODE_ENV === 'development' && { 
//       stack: err.stack,
//       details: err 
//     })
//   });
// });

// // Socket.io setup (only for local development)
// if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
//   server = http.createServer(app);
//   io = socketIo(server, {
//     cors: {
//       origin: allowedOrigins,
//       methods: ["GET", "POST"],
//       credentials: true
//     },
//     pingTimeout: 60000,
//     pingInterval: 25000
//   });

//   io.on("connection", (socket) => {
//     console.log("Client connected:", socket.id);
    
//     socket.on("disconnect", (reason) => {
//       console.log("Client disconnected:", socket.id, "Reason:", reason);
//     });
    
//     socket.on("error", (err) => {
//       console.error("Socket error:", err);
//     });
//   });

//   app.set("io", io);
// }

// // Vercel serverless function handler
// if (process.env.VERCEL) {
//   module.exports = async (req, res) => {
//     try {
//       // Initialize database connection
//       await connectDB();

//       // Handle WebSocket upgrade requests
//       if (req.headers.upgrade === "websocket") {
//         return res.status(426).json({
//           error: "WebSocket not supported",
//           message: "WebSocket connections are not supported in serverless environment"
//         });
//       }

//       // Process regular HTTP requests
//       return app(req, res);
//     } catch (err) {
//       console.error("Server error:", err);
//       res.status(500).json({ 
//         error: "Internal Server Error",
//         ...(process.env.NODE_ENV === 'development' && { 
//           message: err.message,
//           stack: err.stack 
//         })
//       });
//     }
//   };
// } else {
//   // Local development server
//   const PORT = process.env.PORT || 5000;

//   const startServer = async () => {
//     try {
//       await connectDB();
//       const runningServer = server || app;

//       runningServer.listen(PORT, "0.0.0.0", () => {
//         console.log(`
//           Server running in ${process.env.NODE_ENV || 'development'} mode
//           Listening on port ${PORT}
//           CORS allowed origins: ${allowedOrigins.join(', ')}
//         `);
//       });
//     } catch (err) {
//       console.error("Failed to start server:", err);
//       process.exit(1);
//     }
//   };

//   startServer();
// }

// const dotenv = require("dotenv");
// dotenv.config();

// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const http = require("http");
// const socketIo = require("socket.io");

// // Import routes
// const schoolRoutes = require("./routes/schoolRouter");
// const parentRoutes = require("./routes/parentRoutes");
// const learnerRoutes = require("./routes/learnerRoutes");
// const videoRoutes = require("./routes/videoRoutes");
// const adminSupportRoutes = require("./routes/adminSupportRoutes");
// const teacherResourceRoutes = require("./routes/teacherResourceRoutes");
// // ... other route imports ...

// const app = express();
// let server;
// let io;

// // Database connection - optimized for serverless with better timeout handling
// let cachedDb = null;
// let isConnecting = false;

// async function connectDB() {
//   // Return cached connection if available and healthy
//   if (cachedDb && mongoose.connection.readyState === 1) {
//     return cachedDb;
//   }

//   // Prevent multiple simultaneous connection attempts
//   if (isConnecting) {
//     throw new Error('Connection already in progress');
//   }

//   isConnecting = true;

//   try {
//     const db = await mongoose.connect(process.env.MONGODB_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//       serverSelectionTimeoutMS: 30000, // Increased from 5s to 30s
//       socketTimeoutMS: 45000, // Increased socket timeout
//       connectTimeoutMS: 30000, // Added connection timeout
//       maxPoolSize: 10, // Reduced for serverless
//       minPoolSize: 2, // Minimum connections
//       maxIdleTimeMS: 25000, // Close idle connections faster
//       waitQueueTimeoutMS: 20000, // Timeout for waiting for connection
//       retryWrites: true,
//       w: "majority",
//       retryReads: true, // Enable retry for reads
//     });
    
//     console.log("MongoDB connected successfully");
//     cachedDb = db;
//     isConnecting = false;
//     return db;
//   } catch (err) {
//     console.error("MongoDB connection error:", err);
//     isConnecting = false;
    
//     // Clean up cached connection on error
//     cachedDb = null;
//     throw err;
//   }
// }

// // Connection event handlers
// mongoose.connection.on('connected', () => {
//   console.log('Mongoose connected to MongoDB');
// });

// mongoose.connection.on('error', (err) => {
//   console.error('Mongoose connection error:', err);
//   cachedDb = null;
// });

// mongoose.connection.on('disconnected', () => {
//   console.log('Mongoose disconnected from MongoDB');
//   cachedDb = null;
// });

// // Handle connection close on process termination
// process.on('SIGINT', async () => {
//   try {
//     await mongoose.connection.close();
//     console.log('MongoDB connection closed through app termination');
//     process.exit(0);
//   } catch (err) {
//     console.error('Error closing MongoDB connection:', err);
//     process.exit(1);
//   }
// });

// // CORS configuration
// const corsOptions = {
//   origin: true,
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: [
//     "Content-Type",
//     "Authorization",
//     "X-Requested-With",
//     "x-auth-token",
//     "user-type",
//   ],
//   credentials: true,
//   optionsSuccessStatus: 200,
// };

// // Middleware
// app.use(cors(corsOptions));
// app.options("*", cors(corsOptions));
// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ extended: true }));

// // Request logging
// app.use((req, res, next) => {
//   console.log(`${req.method} ${req.path}`);
//   next();
// });

// // Root route
// app.get("/", (req, res) => {
//   res.json({
//     message: "Backend API is running",
//     status: "healthy",
//     version: "1.0",
//     timestamp: new Date().toISOString(),
//     environment: process.env.NODE_ENV || "development",
//   });
// });

// // Routes
// app.use("/api/schools", schoolRoutes);
// app.use("/api/parents", parentRoutes);
// app.use("/api/learners", learnerRoutes);
// app.use("/api", videoRoutes);
// app.use("/api/admin/support", adminSupportRoutes);
// app.use("/api/schools/teacher-resources", teacherResourceRoutes);
// app.use("/api/teacher-resources", teacherResourceRoutes);
// // ... other routes ...

// // Health check
// app.get("/api/health", async (req, res) => {
//   try {
//     await connectDB();
//     const dbStatus =
//       mongoose.connection.readyState === 1 ? "connected" : "disconnected";
//     res.json({
//       status: "ok",
//       database: dbStatus,
//       mobileSupport: true,
//       timestamp: new Date().toISOString(),
//     });
//   } catch (err) {
//     res.status(500).json({ 
//       status: "error", 
//       message: err.message,
//       database: "disconnected"
//     });
//   }
// });

// // Error handling
// app.use((err, req, res, next) => {
//   console.error("Error:", err.stack);
//   res.status(500).json({
//     error: "Internal Server Error",
//     message: process.env.NODE_ENV === "development" ? err.message : undefined,
//   });
// });

// // Socket.io setup (only for local development)
// if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
//   server = http.createServer(app);
//   io = socketIo(server, {
//     cors: {
//       origin: "*",
//       methods: ["GET", "POST"],
//     },
//   });

//   io.on("connection", (socket) => {
//     console.log("Client connected:", socket.id);
//     socket.on("disconnect", () => {
//       console.log("Client disconnected:", socket.id);
//     });
//   });

//   app.set("io", io);
// }

// // Vercel serverless function handler with connection optimization
// if (process.env.VERCEL) {
//   const vercelHandler = async (req, res) => {
//     // Initialize database connection for each request with timeout
//     let connectionTimeout;
    
//     try {
//       // Set a timeout for the entire request
//       const timeoutPromise = new Promise((_, reject) => {
//         connectionTimeout = setTimeout(() => {
//           reject(new Error('Request timeout - database connection took too long'));
//         }, 25000); // 25 second timeout for entire request
//       });

//       // Race between connection and timeout
//       await Promise.race([connectDB(), timeoutPromise]);
      
//       // Clear timeout if connection succeeds
//       clearTimeout(connectionTimeout);

//       // Handle WebSocket upgrade requests
//       if (req.headers.upgrade === "websocket") {
//         res.status(426).send("WebSocket not supported in serverless environment");
//         return;
//       }

//       // Process regular HTTP requests
//       return app(req, res);
      
//     } catch (err) {
//       console.error("Server error:", err);
      
//       // Clear timeout if it's still pending
//       if (connectionTimeout) clearTimeout(connectionTimeout);
      
//       res.status(500).json({ 
//         error: "Internal Server Error",
//         message: process.env.NODE_ENV === "development" ? err.message : "Service temporarily unavailable"
//       });
//     }
//   };

//   // Close connection after response in serverless environment
//   module.exports = async (req, res) => {
//     try {
//       await vercelHandler(req, res);
      
//       // Close connection after response is sent
//       if (mongoose.connection.readyState === 1) {
//         setTimeout(async () => {
//           try {
//             await mongoose.connection.close();
//             console.log('MongoDB connection closed after response');
//           } catch (closeErr) {
//             console.error('Error closing connection:', closeErr);
//           }
//         }, 1000); // Wait 1 second before closing
//       }
//     } catch (err) {
//       console.error('Error in request handler:', err);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
//   };
// } else {
//   // Local development server
//   const PORT = process.env.PORT || 5000;

//   const startServer = async () => {
//     try {
//       await connectDB();
//       const runningServer = server || app;

//       runningServer.listen(PORT, "0.0.0.0", () => {
//         console.log(`Server running at http://0.0.0.0:${PORT}`);
//         console.log(`Health check available at http://0.0.0.0:${PORT}/api/health`);
//       });
//     } catch (err) {
//       console.error("Failed to start server:", err);
//       process.exit(1);
//     }
//   };

//   startServer();
// }
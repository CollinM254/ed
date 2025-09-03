// //const mongoose = require('mongoose');
// //const dotenv = require('dotenv');
// //
// //dotenv.config();
// //
// //const connectDB = async () => {
// //  try {
// //    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://edu1:edu1@edu1.sgu6m.mongodb.net/?retryWrites=true&w=majority&appName=edu1';
// //      useNewUrlParser: true,
// //      useUnifiedTopology: true,
// //    });
// //    console.log('Connected to MongoDB');
// //  } catch (err) {
// //    console.error('MongoDB connection error:', err);
// //    process.exit(1); // Exit the process if MongoDB connection fails
// //  }
// //};
// //
// //module.exports = connectDB;

// const mongoose = require('mongoose');
// const dotenv = require('dotenv');

// dotenv.config();

// const connectDB = async () => {
//   try {
//     const MONGODB_URI = process.env.MONGODB_URI;

//     if (!MONGODB_URI) {
//       throw new Error("MONGODB_URI is not defined in environment variables");
//     }

//     await mongoose.connect(MONGODB_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });

//     console.log('Connected to MongoDB');
//   } catch (err) {
//     console.error('MongoDB connection error:', err);
//     process.exit(1); // Exit the process if MongoDB connection fails
//   }
// };

// module.exports = connectDB;


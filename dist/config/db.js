"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error('MONGODB_URI is not defined in .env file');
        }
        console.log('Attempting to connect to MongoDB...');
        const conn = await mongoose_1.default.connect(uri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`MongoDB Connection Error: ${error.message}`);
        }
        else {
            console.error('An unknown error occurred during MongoDB connection');
        }
    }
};
exports.default = connectDB;

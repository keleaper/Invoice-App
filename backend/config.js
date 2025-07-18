import dotenv from "dotenv";

dotenv.config();

export const config = {
    port: process.env.PORT || 5000,
    dbUrl: process.env.DATABASE_URL,
};

// named export - can have multiple in a file
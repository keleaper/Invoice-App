import dotenv from "dotenv";
dotenv.config();

const config = {
    port: process.env.PORT || 5000,
    dbUrl: process.env.DATABASE_URL,
};

export default config;
import pg from "pg";
import dotenv from "dotenv";

// PostgreSQL connection
const db = new pg.Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST, // website
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});


// connects to database and lets us know if we did or if there was an error. err.stack gives us the breakdown of what all happend before error
db.connect()
    .then(() => console.log("Connected to PostgreSQL")) // then if it works do this
    .catch(() => console.error("Connection error", error.stack)); // if theres an error do this


export default db;
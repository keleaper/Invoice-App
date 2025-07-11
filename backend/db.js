import pg from "pg";

// PostgreSQL connection
const db = new pg.Client({
    user: "postgres",
    host: "localhost", // website
    database: "user_info",
    password: "Back2back",
    port: 5432,
});


// connects to database and lets us know if we did or if there was an error. err.stack gives us the breakdown of what all happend before error
db.connect()
    .then(() => console.log("Connected to PostgreSQL")) // then if it works do this
    .catch(() => console.error("Connection error", error.stack)); // if theres an error do this


export default db;
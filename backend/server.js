import { config } from "./config.js";
import express from "express";
import cors from "cors";
import db from "./db.js";
import path from "path";
import { fileURLToPath } from "url";
import uploadRoute from "./upload.js";
// Authenication and password protection
import bcyrpt from "bcrypt";

const app = express(); // this is why our routes start with app.
const PORT = config.port;

// These are necessary especially when using type: "moudule", __dirname is not available by default so we need to manually create it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors()); // allows frontend to communicate with backend (frontend:3000 backend:5000 need CORS to allow front to call the backend)
app.use(express.json()); // Allows app to access req.body when client sends JSON data (via POST, PUT)
app.use(express.urlencoded({ extended: true })); // Enable access to req.body when form data is sumbitted as HTML forms (parases incoming requests with URL-encoded payloads; HTML forms)

app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // serves static files from a directory. Makes files in __dirname accessible via URL's that start with /uploads

app.use("/", uploadRoute); // Takes all routes defined inside uploadRoute and moutns on base path of main express app (aka this file)
// "/" followed by uploadRoute which = home url path + upload which is the name of the uploadRoute path


// POST register page
app.post("/register", async (req, res) => { // async because well be waiting on db and bcrypt operations
    const { email, password } = req.body; // req.body contains the email and passwrod the user submitted from the React form
    const hashed = await bcyrpt.hash(password, 10) // 10 is for salt rounds

    try {
        const regQuery = "INSERT INTO person (email, password) VALUES ($1, $2)";
        const stored = await db.query(regQuery, [email, hashed]); // ($1, $2), [email, hashed]  // SQL injection (Parameterized placeholder) $ allows us to tell SQL where going to use user input 

        if (stored) {
            res.json({ success: true })
        }
    } catch (error) {
        console.error("Error executing query", error.stack) // err.stack shows the error message and call stack (list of function calls in reverse order of execution) helpful for debugging
    }
    // // .query allows your Node.js application to perform database operations such as , select, insert, update, and delete
    // const regQuery = "INSERT INTO person (email, password) VALUES ($1, $2)";
    // await db.query(regQuery, [email, hashed]); // (%s, %s), [email, hashed]  // SQL injection (Parameterized placeholder) $ allows us to tell SQL where going to use user input 
       
    // catch (error)
    // error.stack shows the error message and call stack (list of function calls in reverse order of execution) helpful for debugging
    });



// POST login / home page
// /login is just the name assigned. Easier to understand this route handles login instead of just /
app.post("/login", async (req, res) => { // adds the / route and the end of our server url which is by default or login page.
    const { email, password } = req.body;

    try {
        const query = "SELECT * FROM person WHERE email = ($1)"; // used to have ${email} did not work (This syntax works)
        const result = await db.query(query, [email]); // result queries to db and does the query SQL and plugs in the users email from the req.body (User input)

        // result.rows - contains the matching rows of user info(if any)
        if (result.rows.length === 0) { // If no user was found with that email, send back a JSON response indicating login failed. 
            return res.json({ success: false, message: "User not found"})
        }

        const user = result.rows[0]; // first row returned from the query (should be the only one if emails are unique)
        const match = await bcyrpt.compare(password, user.password) // compares plain password the user entered with the hashed password (const hashed above) stored in db

        if (match) {
            return res.json({ success: true, message: "Login Successful", user: { id: user.id, email: user.email, is_admin: user.is_admin }}); // /login route now includes user.id in response
        } else {
            return res.json({ success: false, message: "Incorrect email or password"});
        }
    } catch (error) {
        console.error("Login error: ", error);
        res.status(500).json({ success: false, message: "Server error" });
    }

    db.end();
});

// This retrieves/gets the files we upload to uploads folder back to page
app.get("/files", async (req, res) => {

    const userId = req.query.userId;

    if (!userId) {
        return res.status(400).json({ error: "Missing userId" });
    }

    try {
        const result = await db.query("SELECT filepath FROM uploads WHERE user_id = $1 ORDER BY uploaded_at DESC", [userId]);

        res.json(result.rows); // return full object with filename + filepath
    } catch (err) { 
        console.error("Failed to read files from DB:", err);
        res.status(500).json({ error: "Failed to load files"});
    }
});

app.get("/admin/files", async (req, res) => {
    const isAdmin = req.query.isAdmin === "true";
    const userId = req.query.userId;

    if (!userId) {
        return res.status(400).json({ error: "Missing userId" });
    }

    try {
        let result;

        if (isAdmin) { 
            // admins see all files
            result = await db.query(`
                SELECT uploads.id, uploads.filepath, person.email 
                FROM uploads 
                JOIN person ON uploads.user_id = person.id 
                ORDER BY uploads.uploaded_at DESC
            `);
            // Join lets you attach any user info(like email or name) w/o extra queries
        } else {
            result = await db.query("SELECT id, filepath FROM uploads WHERE user_id = $1 ORDER BY uploaded_at DESC", [userId]);
        } // have to have id in the query too so the delete function works. This makes it so even if you're not an admin each result has an id

        res.json(result.rows);
    } catch (err) {
        console.error("Failed to get admin files:", err);
        res.status(500).json({ error: "Failed to fetch files" });
    }
});

app.delete("/admin/files/:id", async (req,res) => {
    const isAdmin = req.query.isAdmin === "true";
    const fileId = req.params.id;

    if (!isAdmin) {
        return res.status(403).json({ error: "Unauthorized" });
    }

    try {
        const result = await db.query("SELECT filepath FROM uploads WHERE id = $1", [fileId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "File not found" });
        }

        const relativePath = result.rows[0].filepath;
        const fullPath = path.join(__dirname, relativePath);

        await db.query("DELETE FROM uploads WHERE id = $1", [fileId]);
        res.json({ success: true });
    } catch (err) {
        console.error("Error deleting file:", err);
        res.status(500).json({ error: "Internal server error"});
    }
});

// Listen for server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})
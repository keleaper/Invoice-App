import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../AdminDashboard.css";

function AdminDashboard() {
    const [files, setFiles] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState (false);
    
    const navigate = useNavigate(); // to change routes


    /* 
        A "side effect" is anything that affects something outside the scope of the component, such as:
        - Fetching data (like from an API),
        - Reading/writing from localStorage 
    */

    useEffect(() => { // useEffect considered a "side-effect" runs after every render of the component (used for fetching data in our case getting items in our localStorage)
        const isAdmin = localStorage.getItem("isAdmin") === "true"; // fhecks if user in an admin by reading a flag saved in localStorage (only admins can view page)
        const userId = localStorage.getItem("userId"); // Gets the currently logged-in user's Id from localStorage

        if (!userId || !isAdmin) { // Takes to home page if user isnt logged in or isnt an admin. Done for security So they cant just type /admin/files manually and get access
            navigate("/"); 
            return;
        }

        axios.get("http://localhost:5000/admin/files", { // get request to fetch files (all if admin, or just the users if not)
            params: { isAdmin, userId } // passes isAdmin and userId as query parameters 
            // (on server side, express route can use these to: check if user is allowed to fetch all files (if admin) or only fetch their own files if not admin)
        })
        .then((res) => { // res or response is what we get from the .get request
            setFiles(res.data); // Stores the response data / files in state on success
        })
        .catch((err) => {
            console.error("Error fetching all files", err); // logs error if request fails
        });
    }, [navigate]); // This means the useEffect() only runs again if navigate changes (which is stable, so it only runs once on mount in practice).


    function backToInvoices() {
        navigate("/invoices");
    }

    function deleteUpload(fileId) {
        const isAdmin = localStorage.getItem("isAdmin") === "true"; // re-checks in the current user in an admin
        
        if (!isAdmin) { // if not admin exit early
            return;
        }

        const confirmDelete = window.confirm("Are you sure you want to delete this file?"); // Show browser pop up to confirm delete
        if (!confirmDelete) { // prevents accidental deletion
            return;
        }

        axios.delete(`http://localhost:5000/admin/files/${fileId}`, { // sends delete request to the server with file's ID
            params: { isAdmin } // passes isAdmin as query parameter
        })
        .then(() => {
            setFiles(prev => prev.filter(file => file.id !== fileId)); // return the file whos file.id does not = the fileId of the file were deleting and store that as files [array]
            // prev => is a callback function that represents the prev value of files (array of files before update)
            // .filter() - this creates a new array by filtering out the file whose id matches the fileId. (Keep every file except the one we just deleted)
        })
        .catch(err => {
            console.error("Failed to delete File:", err);
            alert("Could not delete the file.");
        });
    }

    function adminLogout() { // clears local storage and redirects to home/login page (ends session and prevents unauthorized actions)
        localStorage.removeItem("userId");
        localStorage.removeItem("isAdmin");

        navigate("/");
    }

    return (
        <div>
            <header className="dash-heading">
                <h1 className="dash-title">{localStorage.getItem("isAdmin") === "true" ? "All Files (Admin)" : "Your Files"}</h1>

                <div className="user-dropdown">
                    <button onClick={() => setDropdownOpen(!dropdownOpen)}>
                        {localStorage.getItem("email")} ▼
                    </button>

                    {dropdownOpen && (
                        <div className="dropdown-menu">
                            <button onClick={adminLogout}>Logout</button>
                        </div>
                    )}
                </div>
                
                <div className="header-left">
                    <button onClick={backToInvoices} style={{fontSize: "16px"}}>Invoices</button>    
                </div>
            </header>
            <ul className="file-grid">
                {files.map((file, i) => {
                    const isImage = /\.(jpe?g|png|gif|webp)$/i.test(file.filepath); // Test file extension. Because <img> only works on .jpg, .png, .gif, .webp

                    return (
                        <li className="file-card" key={i}>
                            {isImage ? (
                                <div className="file-image-wrapper">
                                    <div className="file-image-container">
                                        <img 
                                        className="file-image" 
                                        src={`http://localhost:5000${file.filepath}`} 
                                        alt="uploaded file" 
                                        />
                                    </div>
                                    <a 
                                        className="file-download" 
                                        href={`http://localhost:5000${file.filepath}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        >
                                        Download
                                    </a>
                                </div>
                                ) : (
                                    <div className="file-nonimage">
                                        <img src="/File-icon.png" alt="PDF icon" width="64" />
                                        <p>File: {file.filepath}</p>
                                        <a 
                                        className="file-download" 
                                        href={`http://localhost:5000${file.filepath}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        >
                                        Download
                                        </a>
                                    </div>
                            )}
                            <button onClick={() => deleteUpload(file.id)} className="file-delete">
                                Delete
                            </button>
                            <p className="file-uploader">
                                Uploaded by: 
                                <br />
                                <strong>{file.email}</strong>
                            </p>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export default AdminDashboard;
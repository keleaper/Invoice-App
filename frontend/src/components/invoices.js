import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../AdminDashboard.css";


function Invoices() {
    const [files, setFiles] = useState([]);
    const [fileList, setFileList] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState (false);

    const navigate = useNavigate();

    useEffect(() => {  
        const userId = localStorage.getItem("userId");

        if (!userId) { // Takes to home page if user isnt logged in. Done for security So they cant just type /admin manually and get access
            navigate("/"); 
            return;
        }

        const fetchFiles = async () => {
            try {
               const res = await axios.get(`http://localhost:5000/files?userId=${userId}`);
                setFileList(res.data); 
            } catch (err) {
                console.error("Error fetching files:", err);
            }
        };

        fetchFiles();
    }, []);

    function handleChange(event) {
        const newFiles = Array.from(event.target.files);
        setFiles((prevFile) => {
            return ([...prevFile, ...newFiles]);
        });
    }

    async function upload(event) {
        event.preventDefault();
        if (!files || files.length === 0) return alert("Please choose a file"); // if no file is selected alert will ask you to choose one

        const formData = new FormData();
        files.forEach(file => formData.append("invoice", file));
        formData.append("userId", localStorage.getItem("userId"));

        // const formData = new FormData(); // create new FormData object (easily construct a form payload, especially for file uploads)
        // files.forEach((fileItem) => { // loops through each file in the files array and appends them individually. Allows for each file not just one
        // formData.append("invoice", fileItem); // adds selected file to the FormData object with the key of "invoice" and appends one file(item) at a time
        // });

        try {
            const res = await axios.post("http://localhost:5000/upload", formData, { // sends POST request to backend route /upload with the formData
            headers: { "Content-Type": "multipart/form-data" } // sets content type header to "multipart/form-data" so the server knows it’s receiving a file upload.
        });

            const userId = localStorage.getItem("userId");
            const updatedList = await axios.get(`http://localhost:5000/files?userId=${userId}`);
            setFileList(updatedList.data);
            
            // setFileList((prev) => [...prev, ...res.data.files]);
            // setFiles(null);

            console.log("Invoice uploaded successfully", res.data);

            setFiles([]); // setting the files array to empty after successful upload so there is no repetition/double adding the same file (it was stuck)
        } catch (error) {
            console.error("upload failed:", error);
            alert("error uploading file")
        }

    };


    function handleLogout() {
        // clear session data
        localStorage.removeItem("userId");

        navigate("/");
    };

    return (
        <div>
            <header className="dash-heading">
                <h1 className="dash-title">Dashboard</h1>

                <div className="user-dropdown">
                    <button onClick={() => setDropdownOpen(!dropdownOpen)}>
                        {/*this gets the email because when we login we localStorage.setItem("email") this allows us to grab that and display here */}
                        {localStorage.getItem("email")} ▼
                    </button>

                    {dropdownOpen && (
                        <div className="dropdown-menu">
                            {localStorage.getItem("isAdmin") === "true" && (
                                <Link to="/admin" className="dropdown-link">View all Files</Link>
                            )}
                            <button onClick={handleLogout}>Logout</button>
                        </div>
                    )}
                </div>
            </header>

                <h2>Upload Invoice</h2>
                    <input type="file" onChange={handleChange} />
                    {files.map((fileItem, index) => ( // Does not need a return because we used ( ). Does need a parent elements tho i.e <div>
                        <div key={index}>
                            <p>{fileItem.name}</p>
                            <img 
                                src={URL.createObjectURL(fileItem)}
                                alt={`preview-${index}`}
                                style={{ width: 200, marginTop: 10 }}
                            />
                        </div>
                    ))}
                    <button onClick={upload} type="submit">Upload</button>

                <h3>Invoices</h3>
                    <ul className="file-grid">
                        {fileList.map((file, idx) => { // needs retrun something because we used { }
                            const isImage = /\.(jpe?g|png|gif|webp)$/i.test(file.filepath); // Test file extension. Because <img> only works on .jpg, .png, .gif, .webp

                            return (
                            <li className="file-card" key={idx}>
                                {isImage ? (
                                    <div className="file-image-wrapper">
                                        <div className="file-image-container">
                                            <img
                                            className="file-image"
                                            src={`http://localhost:5000${file.filepath}`}
                                            alt="invoice"
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
                                        <p>File: {file.filename}</p>
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
                            </li>
                            );
                        })}
                    </ul>
        </div>
    );
}

export default Invoices;
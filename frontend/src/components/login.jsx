import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../AdminDashboard.css";

// if info input is already in the database then direct them to invoice page
// otherwise show an error (wrong username or password)

function Login() {
    const [loginInfo, setLoginInfo] = useState({
        email: "",
        password: ""
    })

    const navigate = useNavigate();

  // Stores the value that the user inputs taking account of the field / name
  // if email gets changed then only updates email and leaves password prevValue
  function handleChange(event) {
    const { name, value } = event.target;

    setLoginInfo(prevValue => {
      return {...prevValue, [name]: value};
    });
  }

  async function handleLogin(event) {
    event.preventDefault();
    // compare info from user and whats in database
    try {
      const response = await axios.post("http://localhost:5000/login", loginInfo); // Sends POST request to url sending along loginInfo as request body
        if (response.data.success) {
            const {id, is_admin, email} = response.data.user; // destructued. was (response.data.user.id and response.data.is_admin)
            localStorage.setItem("userId", id) // saves user response under tag userId in localstorage 
            localStorage.setItem("isAdmin", is_admin)
            localStorage.setItem("email", email)

            navigate("/invoices") // redirect to invoices.js after successful login
        } else {
            alert(response.data.message || "Invalid credentials");
        }
      } catch (error) {
            console.error("Error submitting form: ", error.response.data)
            alert("An error occured while submitting the form.")
        }
    };


  return (
      <div className="container">
        <h1 className="loginHeading">Login to your account</h1>
        <strong>Hello, welcome back</strong>
        <form onSubmit={handleLogin} className="form-field">
          
          <div className="emailInput">
            <label htmlFor="email">
                Email:
                <input 
                    name="email" 
                    onChange={handleChange} 
                    required 
                    type="email"
                    id="email" 
                    placeholder="Email Address" 
                    value={loginInfo.email} 
                    style={{marginLeft: "5px"}}
                />
            </label>
          </div>

          <br />
              
          <div className="passwordInput">
            <label htmlFor="password">
                Password:
                <input 
                    name="password" 
                    onChange={handleChange} 
                    required 
                    type="password" 
                    id="password"
                    placeholder="Password" 
                    value={loginInfo.password} 
                    style={{marginLeft: "5px"}}
                />
            </label>
          </div>
            <button className="loginBtn" type="submit" value="Submit" >Login</button>
        </form>
        <div className="make-account">
          <p>No account?<Link to="/register">Sign up</Link></p>
        </div>
      </div>
  )
}
export default Login;
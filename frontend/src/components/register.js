import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

function Register() {
  const [loginInfo, setLoginInfo] = useState({
    email: "",
    password: ""
  })
  const [responseMessage, setResponseMessage] = useState("");

  const navigate = useNavigate();

  // Stores the value that the user inputs taking account of the field / name
  // if email gets changed then only updates email and leaves password prevValue
  function handleChange(event) {
    const { name, value } = event.target;

    setLoginInfo(prevValue => {
      return {...prevValue, [name]: value};
    });
  }

  async function handleRegister(event) {
    event.preventDefault();

    try {
      const response = await axios.post("http://localhost:5000/register", loginInfo); // Sends POST request to url sending along loginInfo as request body
        if (response.data.success) {
          navigate("/");
        }
        setResponseMessage(response.data.message);
      } catch (error) {
            console.error("Error: ", error)
            setResponseMessage("An error occured while submitting the form.")
        }
    };


  return (
      <div className="container">
        <h1 className="loginHeading">Register</h1>
        <form onSubmit={handleRegister} action="/register" method="POST" className="form-field"> {/*action- Route you want your server to handle the request. Method- How to want this info to be processed  */}
          
          <div className="emailInput">
            <label htmlFor="email">Email: </label>
            <input 
              name="email" 
              onChange={handleChange} 
              required 
              type="text"
              id="email" 
              placeholder="Email Address" 
              value={loginInfo.email} 
            /> 
          </div>
              
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
          <button type="submit" value="Submit" className="loginBtn">Register</button>
        </form>
        <div className="make-account">
         <p>Already have an account? <Link to="/">Login</Link></p> 
        </div>
        
        {responseMessage ? <p>{responseMessage}</p> : null}
      </div>
  )
}

export default Register;
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/register.css";


function Register() {

  const navigate = useNavigate();


  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  const handleRegister = async (e) => {

    e.preventDefault();

    setError("");


    if (
      !name ||
      !email ||
      !password ||
      !confirmPassword
    ) {

      setError(
        "Please complete all fields."
      );

      return;
    }


    if (
      password !==
      confirmPassword
    ) {

      setError(
        "Passwords do not match."
      );

      return;
    }


    try {

      setLoading(true);


      const response = await fetch(
        "http://127.0.0.1:8000/register",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            name: name,
            email: email,
            password: password
          })
        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        setError(
          data.detail ||
          "Registration failed."
        );

        return;
      }


      console.log(
        "Registered user:",
        data
      );


      navigate(
        "/"
      );

    }

    catch (error) {

      console.error(
        "Register error:",
        error
      );


      setError(
        "Unable to connect to the server."
      );

    }

    finally {

      setLoading(false);

    }

  };


  return (

    <div className="registerPage">

      <div className="registerCard">

        <div className="registerHeader">

          <div className="registerLogo">
            M
          </div>

          <h1>
            Create Account
          </h1>

          <p>
            Create your Medical RAG
            clinician account
          </p>

        </div>


        <form
          onSubmit={handleRegister}
          className="registerForm"
        >

          <div className="inputGroup">

            <label>
              Full Name
            </label>

            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
            />

          </div>


          <div className="inputGroup">

            <label>
              Email
            </label>

            <input
              type="email"
              placeholder="doctor@example.com"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
            />

          </div>


          <div className="inputGroup">

            <label>
              Password
            </label>

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
            />

          </div>


          <div className="inputGroup">

            <label>
              Confirm Password
            </label>

            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }
            />

          </div>


          {
            error &&
            (
              <div className="registerError">
                {error}
              </div>
            )
          }


          <button
            className="registerButton"
            type="submit"
            disabled={loading}
          >

            {
              loading
                ? "Creating account..."
                : "Create Account"
            }

          </button>

        </form>


        <p className="loginText">

          Already have an account?

          <button
            type="button"
            onClick={() =>
              navigate("/login")
            }
          >
            Sign in
          </button>

        </p>

      </div>

    </div>

  );

}


export default Register;
import React, { useState } from "react";

import {
  Activity,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import "../styles/login.css";


function Login() {

  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);


  const handleLogin = async (event) => {

  event.preventDefault();

  try {

    const response = await fetch(
      "http://127.0.0.1:8000/login",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({
          email: email,
          password: password
        })
      }
    );


    const data =
      await response.json();


    if (!response.ok) {

      alert(
        data.detail ||
        "Login failed"
      );

      return;
    }

//save jwt token inside local storage 
    localStorage.setItem(
      "access_token",
      data.access_token
    );


    localStorage.setItem(
      "user",
      JSON.stringify(
        data.user
      )
    );


    navigate(
      "/assistant"
    );

  }

  catch (error) {

    console.error(
      "Login error:",
      error
    );

  }

};


  return (

    <main className="loginPage">


      {/* ======================== */}
      {/* LEFT SIDE */}
      {/* ======================== */}

      <section className="loginBrandSection">


        <div className="loginBrandTop">

          <div className="loginLogoIcon">

            <Activity size={26} />

          </div>


          <div>

            <h2>
              Medical Record
            </h2>

            <span>
              Intelligence
            </span>

          </div>

        </div>



        <div className="loginBrandContent">

          <span className="loginSmallLabel">

            AI-Powered Medical Retrieval

          </span>


          <h1>

            Medical information,
            <br />

            <span>
              intelligently organized.
            </span>

          </h1>


          <p>

            Search medical transcriptions,
            retrieve relevant clinical
            information and generate
            evidence-grounded answers using
            AI-powered retrieval.

          </p>



          <div className="loginFeatureList">


            <div className="loginFeature">

              <ShieldCheck size={19} />

              <span>
                Evidence-grounded medical retrieval
              </span>

            </div>


            <div className="loginFeature">

              <ShieldCheck size={19} />

              <span>
                Semantic search across clinical records
              </span>

            </div>


            <div className="loginFeature">

              <ShieldCheck size={19} />

              <span>
                Traceable AI-generated answers
              </span>

            </div>


          </div>

        </div>



        <div className="loginBrandFooter">

          <p>

            Built for clinical information
            retrieval and documentation support.

          </p>

        </div>


      </section>



      {/* ======================== */}
      {/* RIGHT SIDE */}
      {/* ======================== */}

      <section className="loginFormSection">


        <div className="loginMobileLogo">

          <div className="loginLogoIcon">

            <Activity size={24} />

          </div>


          <div>

            <strong>
              Medical Record
            </strong>

            <span>
              Intelligence
            </span>

          </div>

        </div>



        <div className="loginFormWrapper">


          <div className="loginFormHeader">

            <span>
              Secure Clinical Workspace
            </span>


            <h1>
              Welcome back, Doctor
            </h1>


            <p>

              Sign in to access the medical
              intelligence platform.

            </p>

          </div>



          <form
            className="loginForm"
            onSubmit={handleLogin}
          >


            {/* EMAIL */}

            <div className="loginInputGroup">

              <label>
                Email address
              </label>


              <div className="loginInput">

                <Mail size={18} />

                <input
                  type="email"
                  placeholder="doctor@example.com"
                  value={email}
                  onChange={
                    event =>
                      setEmail(
                        event.target.value
                      )
                  }
                />

              </div>

            </div>



            {/* PASSWORD */}

            <div className="loginInputGroup">

              <div className="passwordLabel">

                <label>
                  Password
                </label>


                <button
                  type="button"
                  className="forgotPassword"
                >

                  Forgot password?

                </button>

              </div>


              <div className="loginInput">

                <Lock size={18} />


                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={
                    event =>
                      setPassword(
                        event.target.value
                      )
                  }
                />


                <button
                  type="button"
                  className="showPasswordButton"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                >

                  {
                    showPassword

                      ? <EyeOff size={18} />

                      : <Eye size={18} />
                  }

                </button>

              </div>

            </div>



            {/* REMEMBER */}

            <label className="rememberMe">

              <input
                type="checkbox"
              />

              <span>
                Remember me
              </span>

            </label>



            {/* LOGIN */}

            <button
              type="submit"
              className="loginButton"
            >

              Sign in

            </button>
            <button
  type="button"
  onClick={() => navigate("/register")}
>
  Create Account
</button>


          </form>



          <div className="loginSecurity">

            <ShieldCheck size={16} />

            <p>

              This system is designed for
              medical information retrieval
              and documentation support.
              Clinical decisions remain the
              responsibility of qualified
              healthcare professionals.

            </p>

          </div>


        </div>


      </section>


    </main>

  );

}

export default Login;
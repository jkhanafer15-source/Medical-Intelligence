import React, {
  useEffect,
  useState
} from "react";

import {
  Search,
  Bell
} from "lucide-react";

import {
  useNavigate
} from "react-router-dom";

import "../styles/layout.css";


function Topbar() {

  const navigate =
    useNavigate();


  const [
    user,
    setUser
  ] = useState(null);


  useEffect(
    () => {

      const fetchProfile =
        async () => {

          const token =
            localStorage.getItem(
              "access_token"
            );


          if (!token) {
            return;
          }


          try {

            const response =
              await fetch(
                "http://127.0.0.1:8000/profile",
                {
                  method: "GET",

                  headers: {
                    Authorization:
                      `Bearer ${token}`
                  }
                }
              );


            const data =
              await response.json();


            if (response.ok) {

              setUser(
                data.user
              );

            }

          }

          catch (error) {

            console.error(
              "TOPBAR PROFILE ERROR:",
              error
            );

          }

        };


      fetchProfile();

    },
    []
  );


  return (

    <header className="topbar">


      <div className="searchBox">

        <Search size={18} />

        <input
          type="text"
          placeholder="Search medical records..."
        />

      </div>



      <div className="topbarRight">


       



        <div
          className="doctorProfile"
          onClick={() =>
            navigate("/profile")
          }
        >


          <div className="doctorAvatar">

            {
              user?.profile_image

                ? (

                  <img
                    src={
                      `http://127.0.0.1:8000${user.profile_image}`
                    }
                    alt="Doctor profile"
                  />

                )

                : (

                  "DR"

                )
            }

          </div>


          <div className="doctorInfo">

            <strong>

              {
                user?.name ||
                "Doctor"
              }

            </strong>


            <span>
              Clinician
            </span>

          </div>


        </div>


      </div>


    </header>

  );

}


export default Topbar;
import React, {
  useEffect,
  useState
} from "react";

import {
  UserRound,
  Camera,
  Save,
  Mail,
  Calendar
} from "lucide-react";

import {
  useNavigate
} from "react-router-dom";

import Sidebar from "../components/Sidebar";
import MobileNavbar from "../components/MobileNavbar";
import Topbar from "../components/Topbar";

import "../styles/profile.css";


function Profile() {

  const navigate = useNavigate();


  // ========================================
  // STATES
  // ========================================

  const [
    user,
    setUser
  ] = useState(null);


  const [
    name,
    setName
  ] = useState("");


  const [
    image,
    setImage
  ] = useState(null);


  const [
    preview,
    setPreview
  ] = useState("");


  const [
    loading,
    setLoading
  ] = useState(true);


  const [
    saving,
    setSaving
  ] = useState(false);


  const [
    error,
    setError
  ] = useState("");


  const [
    success,
    setSuccess
  ] = useState("");


  // ========================================
  // GET PROFILE
  // ========================================

  useEffect(
    () => {

      const fetchProfile =
        async () => {

          const token =
            localStorage.getItem(
              "access_token"
            );


          if (!token) {

            setError(
              "You must login first."
            );

            setLoading(false);

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


            if (!response.ok) {

              throw new Error(
                data.detail ||
                "Could not load profile."
              );

            }


            setUser(
              data.user
            );


            setName(
              data.user.name
            );


            if (
              data.user.profile_image
            ) {

              setPreview(
                `http://127.0.0.1:8000${data.user.profile_image}`
              );

            }

          }

          catch (error) {

            setError(
              error.message
            );

          }

          finally {

            setLoading(false);

          }

        };


      fetchProfile();

    },
    []
  );


  // ========================================
  // IMAGE CHANGE
  // ========================================

  const handleImageChange = (
    event
  ) => {

    const selectedFile =
      event.target.files[0];


    if (!selectedFile) {

      return;

    }


    setImage(
      selectedFile
    );


    const imagePreview =
      URL.createObjectURL(
        selectedFile
      );


    setPreview(
      imagePreview
    );

  };


  // ========================================
  // UPDATE PROFILE
  // ========================================

  const handleSubmit =
    async event => {

      event.preventDefault();


      if (!name.trim()) {

        setError(
          "Name is required."
        );

        return;

      }


      const token =
        localStorage.getItem(
          "access_token"
        );


      try {

        setSaving(true);

        setError("");

        setSuccess("");


        const formData =
          new FormData();


        formData.append(
          "name",
          name
        );


        if (image) {

          formData.append(
            "profile_image",
            image
          );

        }


        const response =
          await fetch(
            "http://127.0.0.1:8000/profile",
            {
              method: "PUT",

              headers: {
                Authorization:
                  `Bearer ${token}`
              },

              body:
                formData
            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.detail ||
            "Could not update profile."
          );

        }


        // ========================================
        // UPDATE REACT STATE
        // ========================================

        setUser(
          data.user
        );


        setName(
          data.user.name
        );


        setImage(null);


        if (
          data.user.profile_image
        ) {

          setPreview(
            `http://127.0.0.1:8000${data.user.profile_image}`
          );

        }


        // ========================================
        // UPDATE LOCAL STORAGE
        // ========================================

        localStorage.setItem(
          "user",
          JSON.stringify(
            data.user
          )
        );


        setSuccess(
          "Profile updated successfully."
        );


        // ========================================
        // GO TO DASHBOARD
        // ========================================

        navigate(
          "/dashboard"
        );

      }

      catch (error) {

        setError(
          error.message
        );

      }

      finally {

        setSaving(false);

      }

    };


  // ========================================
  // LOADING
  // ========================================

  if (loading) {

    return (

      <div className="appLayout">

        <Sidebar />

        <div className="mainContent">

          <MobileNavbar />

          <Topbar />

          <main className="pageContent">

            <p>
              Loading profile...
            </p>

          </main>

        </div>

      </div>

    );

  }


  // ========================================
  // UI
  // ========================================

  return (

    <div className="appLayout">

      <Sidebar />


      <div className="mainContent">

        <MobileNavbar />

        <Topbar />


        <main className="pageContent">


          {/* HEADER */}

          <section className="profileHeader">

            <div>

              <span className="profileLabel">

                Account Settings

              </span>


              <h1>

                Doctor Profile

              </h1>


              <p>

                Manage your account information
                and profile picture.

              </p>

            </div>

          </section>



          <form
            className="profileCard"
            onSubmit={
              handleSubmit
            }
          >


            {/* PROFILE IMAGE */}

            <div className="profileImageSection">

              <div className="profileImageWrapper">

                {
                  preview

                    ? (

                      <img

                        src={
                          preview
                        }

                        alt="Doctor profile"

                        className="profileImage"

                      />

                    )

                    : (

                      <div className="profileImagePlaceholder">

                        <UserRound
                          size={46}
                        />

                      </div>

                    )
                }


                <label
                  className="profileCameraButton"
                >

                  <Camera
                    size={18}
                  />


                  <input

                    type="file"

                    accept="image/*"

                    onChange={
                      handleImageChange
                    }

                    hidden

                  />

                </label>

              </div>


              <div>

                <h2>

                  {
                    user?.name
                  }

                </h2>


                <p>

                  Click the camera icon
                  to change your profile picture.

                </p>

              </div>

            </div>



            {/* NAME */}

            <div className="profileFormGroup">

              <label>
                Full Name
              </label>


              <input

                type="text"

                value={
                  name
                }

                onChange={
                  event =>
                    setName(
                      event.target.value
                    )
                }

              />

            </div>



            {/* EMAIL */}

            <div className="profileFormGroup">

              <label>
                Email
              </label>


              <div className="profileReadonlyField">

                <Mail
                  size={17}
                />

                <span>

                  {
                    user?.email
                  }

                </span>

              </div>

            </div>



            {/* CREATED AT */}

            <div className="profileFormGroup">

              <label>
                Member Since
              </label>


              <div className="profileReadonlyField">

                <Calendar
                  size={17}
                />

                <span>

                  {
                    user?.created_at
                      ? new Date(
                          user.created_at
                        ).toLocaleDateString()
                      : ""
                  }

                </span>

              </div>

            </div>



            {/* ERROR */}

            {
              error && (

                <div className="profileError">

                  {error}

                </div>

              )
            }



            {/* SUCCESS */}

            {
              success && (

                <div className="profileSuccess">

                  {success}

                </div>

              )
            }



            {/* SAVE */}

            <button

              type="submit"

              className="saveProfileButton"

              disabled={
                saving
              }

            >

              <Save
                size={18}
              />

              {
                saving
                  ? "Saving..."
                  : "Save Changes"
              }

            </button>


          </form>


        </main>

      </div>

    </div>

  );

}


export default Profile;
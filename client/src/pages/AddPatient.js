import React, {
  useState
} from "react";

import {
  UserPlus
} from "lucide-react";

import {
  useNavigate
} from "react-router-dom";

import Sidebar from "../components/Sidebar";
import MobileNavbar from "../components/MobileNavbar";
import Topbar from "../components/Topbar";

import "../styles/addPatient.css";


function AddPatient() {

  const navigate =
    useNavigate();


  const [
    formData,
    setFormData
  ] = useState({

    name: "",

    medical_record_number: "",

    date_of_birth: "",

    sex: "",

    phone: ""

  });


  const [
    loading,
    setLoading
  ] = useState(false);


  const [
    error,
    setError
  ] = useState("");


  const handleChange = (
    event
  ) => {

    const {
      name,
      value
    } = event.target;


    setFormData(
      previous => ({

        ...previous,

        [name]:
          value

      })
    );

  };


  const handleSubmit = async event => {

  event.preventDefault();

  console.log("1. SUBMIT STARTED");

  const token =
    localStorage.getItem(
      "access_token"
    );

  try {

    setLoading(true);
    setError("");

    console.log(
      "2. SENDING DATA:",
      formData
    );

    const response =
      await fetch(
        "http://127.0.0.1:8000/patients",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`
          },

          body: JSON.stringify({
            name:
              formData.name,

            medical_record_number:
              formData.medical_record_number ||
              null,

            date_of_birth:
              formData.date_of_birth ||
              null,

            sex:
              formData.sex ||
              null,

            phone:
              formData.phone ||
              null
          })
        }
      );

    console.log(
      "3. RESPONSE RECEIVED:",
      response.status
    );

    const data =
      await response.json();

    console.log(
      "4. RESPONSE DATA:",
      data
    );

    if (!response.ok) {

      throw new Error(
        data.detail ||
        "Could not create patient."
      );

    }

    navigate("/analysis");

  }

  catch (error) {

    console.error(
      "CREATE PATIENT ERROR:",
      error
    );

    setError(
      error.message
    );

  }

  finally {

    console.log(
      "5. FINISHED"
    );

    setLoading(false);

  }

};

  return (

    <div className="appLayout">

      <Sidebar />


      <div className="mainContent">

        <MobileNavbar />

        <Topbar />


        <main className="pageContent">

          <section className="patientFormHeader">

            <div>

              <span className="patientFormLabel">

                Patient Management

              </span>

              <h1>
                Add Patient
              </h1>

              <p>
                Create a patient record before
                starting clinical session analysis.
              </p>

            </div>

          </section>


          <form
            className="patientForm"
            onSubmit={
              handleSubmit
            }
          >


            <div className="formGroup">

              <label>
                Patient Name *
              </label>

              <input

                type="text"

                name="name"

                value={
                  formData.name
                }

                onChange={
                  handleChange
                }

                placeholder=
                  "Enter patient full name"

              />

            </div>


            <div className="formGroup">

              <label>
                Medical Record Number
              </label>

              <input

                type="text"

                name=
                  "medical_record_number"

                value={
                  formData
                    .medical_record_number
                }

                onChange={
                  handleChange
                }

                placeholder=
                  "Example: MRN-10025"

              />

            </div>


            <div className="formGroup">

              <label>
                Date of Birth
              </label>

              <input

                type="date"

                name="date_of_birth"

                value={
                  formData.date_of_birth
                }

                onChange={
                  handleChange
                }

              />

            </div>


            <div className="formGroup">

              <label>
                Sex
              </label>

              <select

                name="sex"

                value={
                  formData.sex
                }

                onChange={
                  handleChange
                }

              >

                <option value="">
                  Select
                </option>

                <option value="Male">
                  Male
                </option>

                <option value="Female">
                  Female
                </option>

                <option value="Other">
                  Other
                </option>

                <option value="Unknown">
                  Unknown
                </option>

              </select>

            </div>


            <div className="formGroup">

              <label>
                Phone
              </label>

              <input

                type="text"

                name="phone"

                value={
                  formData.phone
                }

                onChange={
                  handleChange
                }

                placeholder=
                  "Patient phone number"

              />

            </div>


            {
              error && (

                <div className="patientFormError">

                  {error}

                </div>

              )
            }


            <button

              type="submit"

              className=
                "createPatientButton"

              disabled={
                loading
              }

            >

              <UserPlus
                size={18}
              />

              {
                loading
                  ? "Creating..."
                  : "Create Patient"
              }

            </button>


          </form>

        </main>

      </div>

    </div>

  );

}


export default AddPatient;
import React, {
  useEffect,
  useState
} from "react";

import {
  Search,
  UserRound,
  UserPlus,
  FileText,
  Phone,
  Calendar,
  ArrowRight
} from "lucide-react";

import {
  useNavigate
} from "react-router-dom";

import Sidebar from "../components/Sidebar";
import MobileNavbar from "../components/MobileNavbar";
import Topbar from "../components/Topbar";

import "../styles/patients.css";


function Patients() {

  const navigate =
    useNavigate();


  // ========================================
  // STATES
  // ========================================

  const [
    patients,
    setPatients
  ] = useState([]);


  const [
    search,
    setSearch
  ] = useState("");


  const [
    loading,
    setLoading
  ] = useState(true);


  const [
    error,
    setError
  ] = useState("");


  // ========================================
  // FETCH PATIENTS
  // ========================================

  useEffect(() => {

  const fetchPatients = async () => {

    console.log(
      "1. FETCH PATIENTS STARTED"
    );

    const token =
      localStorage.getItem(
        "access_token"
      );

    console.log(
      "2. TOKEN:",
      token
    );


    if (!token) {

      setError(
        "You must login first."
      );

      setLoading(false);

      return;
    }


    try {

      setLoading(true);
      setError("");


      console.log(
        "3. SENDING GET /patients"
      );


      const response =
        await fetch(
          `http://127.0.0.1:8000/patients?search=${encodeURIComponent(search)}`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );


      console.log(
        "4. RESPONSE:",
        response.status
      );


      const data =
        await response.json();


      console.log(
  "PATIENTS:",
  data.patients
);


      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Could not load patients."
        );

      }


      setPatients(
        data.patients || []
      );

    }

    catch (error) {

      console.error(
        "PATIENT FETCH ERROR:",
        error
      );

      setError(
        error.message
      );

    }

    finally {

      console.log(
        "6. FETCH FINISHED"
      );

      setLoading(false);

    }

  };


  fetchPatients();

}, [search]);


  // ========================================
  // SELECT PATIENT
  // ========================================

  const selectPatient = (
    patient
  ) => {

    navigate(
      `/analysis?patient=${patient.id}`
    );

  };


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


          {/* ========================= */}
          {/* HEADER */}
          {/* ========================= */}

          <section className="patientsHeader">

            <div>

              <span className="patientsLabel">

                Patient Management

              </span>


              <h1>

                Patients

              </h1>


              <p>

                Search and select one of your
                patients to review their records
                or start a new clinical analysis.

              </p>

            </div>


            <button
              className="addPatientButton"
              onClick={() =>
                navigate(
                  "/patients/add"
                )
              }
            >

              <UserPlus
                size={18}
              />

              Add Patient

            </button>

          </section>



          {/* ========================= */}
          {/* SEARCH */}
          {/* ========================= */}

          <section className="patientsSearch">

            <Search
              size={19}
            />


            <input

              type="text"

              placeholder=
                "Search by patient name or medical record number..."

              value={
                search
              }

              onChange={
                event =>
                  setSearch(
                    event.target.value
                  )
              }

            />

          </section>



          {/* ========================= */}
          {/* COUNT */}
          {/* ========================= */}

          <div className="patientsCount">

            {
              search

                ? `${patients.length} matching patients`

                : `${patients.length} patients`
            }

          </div>



          {/* ========================= */}
          {/* ERROR */}
          {/* ========================= */}

          {
            error && (

              <div className="patientsError">

                {error}

              </div>

            )
          }



          {/* ========================= */}
          {/* LOADING */}
          {/* ========================= */}

          {
            loading

              ? (

                <div className="patientsLoading">

                  Loading patients...

                </div>

              )

              : (

                <section className="patientsGrid">


                  {
                    patients.length > 0

                      ? (

                        patients.map(
                          patient => (

                            <div

                              className=
                                "patientCard"

                              key={
                                patient.id
                              }

                            >


                              {/* ================= */}
                              {/* CARD HEADER */}
                              {/* ================= */}

                              <div className="patientCardHeader">

                                <div className="patientAvatar">

                                  <UserRound
                                    size={24}
                                  />

                                </div>


                                <div>

                                  <h2>

                                    {
                                      patient.name
                                    }

                                  </h2>


                                  <span>

                                    {
                                      patient
                                        .medical_record_number
                                        ||
                                      "No MRN"
                                    }

                                  </span>

                                </div>

                              </div>



                              {/* ================= */}
                              {/* INFORMATION */}
                              {/* ================= */}

                              <div className="patientInformation">


                                <div>

                                  <FileText
                                    size={17}
                                  />

                                  <span>

                                    Sex:

                                    {" "}

                                    {
                                      patient.sex ||
                                      "Not specified"
                                    }

                                  </span>

                                </div>



                                <div>

                                  <Calendar
                                    size={17}
                                  />

                                  <span>

                                    DOB:

                                    {" "}

                                    {
                                      patient
                                        .date_of_birth
                                        ||
                                      "Not specified"
                                    }

                                  </span>

                                </div>



                                <div>

                                  <Phone
                                    size={17}
                                  />

                                  <span>

                                    {
                                      patient.phone ||
                                      "No phone"
                                    }

                                  </span>

                                </div>


                              </div>



                              {/* ================= */}
                              {/* SELECT */}
                              {/* ================= */}

                              <button

                                className=
                                  "selectPatientButton"

                                onClick={() =>
                                  selectPatient(
                                    patient
                                  )
                                }

                              >

                                Select Patient

                                <ArrowRight
                                  size={17}
                                />

                              </button>


                            </div>

                          )
                        )

                      )

                      : (

                        <div className="noPatients">

                          <UserRound
                            size={38}
                          />


                          <h2>

                            No patients found

                          </h2>


                          <p>

                            {
                              search

                                ? "No patient matches your search."

                                : "Add your first patient to begin."
                            }

                          </p>

                        </div>

                      )
                  }


                </section>

              )
          }


        </main>

      </div>

    </div>

  );

}


export default Patients;
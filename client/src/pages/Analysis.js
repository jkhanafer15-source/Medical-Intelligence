import React, {
  useEffect,
  useState
} from "react";
import {
  useNavigate
} from "react-router-dom";

import {
  Activity,
  UserRound,
  FileText,
  Brain,
  UserPlus,
  GitCompare,
  ClipboardList,
  Sparkles,
  LoaderCircle
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import MobileNavbar from "../components/MobileNavbar";
import Topbar from "../components/Topbar";

import "../styles/analysis.css";


function Analysis() {
const navigate = useNavigate();
  // ========================================
  // STATES
  // ========================================

  const [
    patients,
    setPatients
  ] = useState([]);


  const [
    selectedPatient,
    setSelectedPatient
  ] = useState("");


  const [
    currentNotes,
    setCurrentNotes
  ] = useState("");


  const [
    analysis,
    setAnalysis
  ] = useState(null);


  const [
    loadingPatients,
    setLoadingPatients
  ] = useState(true);


  const [
    analyzing,
    setAnalyzing
  ] = useState(false);


  const [
    error,
    setError
  ] = useState("");


  // ========================================
  // GET PATIENTS
  // ========================================

  useEffect(
    () => {

      const fetchPatients =
        async () => {

          const token =
            localStorage.getItem(
              "access_token"
            );


          if (!token) {

            setError(
              "You must login first."
            );

            setLoadingPatients(false);

            return;

          }


          try {

            const response =
              await fetch(
                "http://127.0.0.1:8000/patients",
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

            setLoadingPatients(
              false
            );

          }

        };


      fetchPatients();

    },
    []
  );


  // ========================================
  // RUN ANALYSIS
  // ========================================

  const runAnalysis =
    async () => {

      if (!selectedPatient) {

        setError(
          "Please select a patient."
        );

        return;

      }


      if (!currentNotes.trim()) {

        setError(
          "Please enter the current session notes."
        );

        return;

      }


      const token =
        localStorage.getItem(
          "access_token"
        );


      if (!token) {

        setError(
          "You must login first."
        );

        return;

      }


      try {

        setAnalyzing(true);

        setError("");

        setAnalysis(null);


        const response =
          await fetch(
            `http://127.0.0.1:8000/patients/${selectedPatient}/analysis`,
            {
              method: "POST",

              headers: {

                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`

              },

              body: JSON.stringify({

                current_notes:
                  currentNotes

              })
            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.detail ||
            "Patient analysis failed."
          );

        }


        console.log(
          "ANALYSIS RESULT:",
          data
        );


        setAnalysis(
          data
        );

      }

      catch (error) {

        console.error(
          "ANALYSIS ERROR:",
          error
        );


        setError(
          error.message
        );

      }

      finally {

        setAnalyzing(false);

      }

    };


  // ========================================
  // GET SELECTED PATIENT NAME
  // ========================================

  const selectedPatientData =
    patients.find(
      patient =>
        String(patient.id) ===
        String(selectedPatient)
    );


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

          <section className="analysisHeader">

            <div>

              <span className="analysisLabel">

                Clinical Intelligence

              </span>


              <h1>

                Patient Analysis

              </h1>


              <p>

                Review the patient's previous
                session and analyze documented
                changes using the multi-agent
                clinical workflow.

              </p>

            </div>


            <div className="analysisHeaderIcon">

              <Brain size={28} />

            </div>

          </section>



          {/* ========================= */}
          {/* INPUT AREA */}
          {/* ========================= */}

          <section className="analysisInputGrid">


            {/* ========================= */}
            {/* PATIENT */}
            {/* ========================= */}

            <div className="analysisPanel">

              <div className="analysisPanelHeader">

                <div className="analysisPanelIcon">

                  <UserRound
                    size={20}
                  />

                </div>


                <div>

                  <h2>
                    Patient
                  </h2>

                  <p>
                    Select one of your patients.
                  </p>

                </div>

              </div>

<button
  onClick={() =>
    navigate(
      "/patients/add"
    )
  }
>
  <UserPlus size={18} />

  Add Patient
</button>
              {
                loadingPatients

                  ? (

                    <p>
                      Loading patients...
                    </p>

                  )

                  : (

                    <select

                      className="patientSelect"

                      value={
                        selectedPatient
                      }

                      onChange={
                        event => {

                          setSelectedPatient(
                            event.target.value
                          );

                          setAnalysis(null);

                          setError("");

                        }
                      }

                    >

                      <option value="">

                        Select a patient

                      </option>


                      {
                        patients.map(
                          patient => (

                            <option

                              key={
                                patient.id
                              }

                              value={
                                patient.id
                              }

                            >

                              {
                                patient.name
                              }

                            </option>

                          )
                        )
                      }

                    </select>

                  )
              }


              {
                selectedPatientData && (

                  <div className="selectedPatient">

                    <UserRound
                      size={18}
                    />

                    <div>

                      <span>
                        Selected Patient
                      </span>

                      <strong>

                        {
                          selectedPatientData
                            .name
                        }

                      </strong>

                    </div>

                  </div>

                )
              }

            </div>



            {/* ========================= */}
            {/* CURRENT SESSION NOTES */}
            {/* ========================= */}

            <div className="analysisPanel sessionNotesPanel">

              <div className="analysisPanelHeader">

                <div className="analysisPanelIcon">

                  <FileText
                    size={20}
                  />

                </div>


                <div>

                  <h2>
                    Current Session
                  </h2>

                  <p>
                    Enter the doctor's notes
                    from the current session.
                  </p>

                </div>

              </div>


              <textarea

                className="analysisTextarea"

                placeholder=
                  "Enter current patient session notes..."

                value={
                  currentNotes
                }

                onChange={
                  event =>
                    setCurrentNotes(
                      event.target.value
                    )
                }

              />


              <div className="analysisActions">

                <span>

                  {
                    currentNotes.length
                  } characters

                </span>


                <button

                  className="runAnalysisButton"

                  onClick={
                    runAnalysis
                  }

                  disabled={
                    analyzing
                  }

                >

                  {
                    analyzing

                      ? (
                        <>
                          <LoaderCircle
                            size={18}
                            className="spinIcon"
                          />

                          Running Agents...
                        </>
                      )

                      : (
                        <>
                          <Activity
                            size={18}
                          />

                          Run Analysis
                        </>
                      )
                  }

                </button>

              </div>

            </div>


          </section>



          {/* ========================= */}
          {/* ERROR */}
          {/* ========================= */}

          {
            error && (

              <div className="analysisError">

                {error}

              </div>

            )
          }



          {/* ========================= */}
          {/* RUNNING */}
          {/* ========================= */}

          {
            analyzing && (

              <section className="agentRunningPanel">

                <LoaderCircle
                  size={28}
                  className="spinIcon"
                />


                <div>

                  <h3>
                    Multi-agent analysis
                    in progress
                  </h3>

                  <p>

                    Patient context, previous
                    session, comparison,
                    summarization and supervisor
                    agents are processing the
                    patient record.

                  </p>

                </div>

              </section>

            )
          }



          {/* ========================= */}
          {/* RESULTS */}
          {/* ========================= */}

          {
            analysis && (

              <section className="analysisResults">


                {/* ===================== */}
                {/* RESULT HEADER */}
                {/* ===================== */}

                <div className="resultsHeader">

                  <div>

                    <span className="analysisLabel">

                      Analysis Complete

                    </span>


                    <h2>

                      {
                        analysis.patient_name
                      }

                    </h2>

                  </div>


                  <Sparkles
                    size={24}
                  />

                </div>



                {/* ===================== */}
                {/* PREVIOUS SESSION */}
                {/* ===================== */}

                <div className="resultCard">

                  <div className="resultCardHeader">

                    <ClipboardList
                      size={20}
                    />

                    <h3>

                      Previous Session

                    </h3>

                  </div>


                  {
                    analysis.previous_session

                      ? (

                        <div className="previousSessionContent">

                          <div>

                            <span>
                              Doctor Notes
                            </span>

                            <p>

                              {
                                analysis
                                  .previous_session
                                  .doctor_notes ||
                                "No previous notes."
                              }

                            </p>

                          </div>


                          <div>

                            <span>
                              Session Summary
                            </span>

                            <p>

                              {
                                analysis
                                  .previous_session
                                  .session_summary ||
                                "No previous summary."
                              }

                            </p>

                          </div>

                        </div>

                      )

                      : (

                        <p>

                          No previous session was
                          found for this patient.
                          This is the first stored
                          analysis session.

                        </p>

                      )
                  }

                </div>



                {/* ===================== */}
                {/* COMPARISON */}
                {/* ===================== */}

                <div className="resultCard">

                  <div className="resultCardHeader">

                    <GitCompare
                      size={20}
                    />

                    <h3>

                      Session Comparison

                    </h3>

                  </div>


                  <div className="analysisText">

                    {
                      analysis.comparison ||
                      "No comparison available."
                    }

                  </div>

                </div>



                {/* ===================== */}
                {/* SUMMARY */}
                {/* ===================== */}

                <div className="resultCard">

                  <div className="resultCardHeader">

                    <FileText
                      size={20}
                    />

                    <h3>

                      Clinical Documentation
                      Summary

                    </h3>

                  </div>


                  <div className="analysisText">

                    {
                      analysis.summary ||
                      "No summary available."
                    }

                  </div>

                </div>



                {/* ===================== */}
                {/* SUPERVISOR */}
                {/* ===================== */}

                <div className="resultCard supervisorResult">

                  <div className="resultCardHeader">

                    <Brain
                      size={22}
                    />

                    <div>

                      <h3>

                        Supervisor Analysis

                      </h3>

                      <span>

                        Final multi-agent result

                      </span>

                    </div>

                  </div>


                  <div className="analysisText finalAnalysisText">

                    {
                      analysis.final_analysis
                    }

                  </div>

                </div>


              </section>

            )
          }


        </main>

      </div>

    </div>

  );

}


export default Analysis;
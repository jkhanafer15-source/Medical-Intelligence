import React, {
  useEffect,
  useState
} from "react";

import {
  FileText,
  Stethoscope,
  MessageSquare,
  MessagesSquare,
  Database,
  ArrowRight
} from "lucide-react";

import {
  useNavigate
} from "react-router-dom";

import Sidebar from "../components/Sidebar";
import MobileNavbar from "../components/MobileNavbar";
import Topbar from "../components/Topbar";
import StatCard from "../components/StatCard";

import "../styles/dashboard.css";


function Dashboard() {

  const navigate =
    useNavigate();


  // ========================================
  // DASHBOARD DATA
  // ========================================

  const [
    dashboardData,
    setDashboardData
  ] = useState({

    total_transcriptions: 0,

    total_specialties: 0,

    total_conversations: 0,

    total_messages: 0,

    specialties: [],

    recent_questions: []

  });


  const [
    loading,
    setLoading
  ] = useState(true);


  const [
    error,
    setError
  ] = useState("");


  // ========================================
  // USER
  // ========================================

  const storedUser =
    localStorage.getItem(
      "user"
    );


  const user =
    storedUser
      ? JSON.parse(
          storedUser
        )
      : null;


  // ========================================
  // FETCH DASHBOARD
  // ========================================

  useEffect(
    () => {

      const fetchDashboard =
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

            setLoading(true);

            setError("");


            const response =
              await fetch(
                "http://127.0.0.1:8000/dashboard",
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
                "Could not load dashboard."
              );

            }


            console.log(
              "DASHBOARD DATA:",
              data
            );


            setDashboardData(
              data
            );

          }

          catch (error) {

            console.error(
              "DASHBOARD ERROR:",
              error
            );


            setError(
              error.message
            );

          }

          finally {

            setLoading(false);

          }

        };


      fetchDashboard();

    },
    []
  );


  // ========================================
  // FORMAT DATE
  // ========================================

  const formatDate = (
    dateValue
  ) => {

    if (!dateValue) {

      return "";

    }


    const date =
      new Date(
        dateValue
      );


    return date.toLocaleString();

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
              Loading dashboard...
            </p>

          </main>

        </div>

      </div>

    );

  }


  // ========================================
  // ERROR
  // ========================================

  if (error) {

    return (

      <div className="appLayout">

        <Sidebar />


        <div className="mainContent">

          <MobileNavbar />

          <Topbar />


          <main className="pageContent">

            <p>
              {error}
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


          {/* ========================= */}
          {/* PAGE HEADER */}
          {/* ========================= */}

          <section className="dashboardHeader">

            <div>

              <span className="dashboardLabel">

                Medical Intelligence

              </span>


              <h1>

                Welcome, Dr. {
                  user?.name ||
                  "Doctor"
                }

              </h1>


              <p>

                Explore your medical
                transcription knowledge base
                and ask questions using
                AI-powered retrieval.

              </p>

            </div>


            <button

              className="askAssistantButton"

              onClick={() =>
                navigate(
                  "/assistant"
                )
              }

            >

              Ask AI Assistant

              <ArrowRight
                size={18}
              />

            </button>

          </section>



          {/* ========================= */}
          {/* STATISTICS */}
          {/* ========================= */}

          <section className="dashboardStats">


            <StatCard

              icon={
                <FileText
                  size={22}
                />
              }

              value={
                dashboardData
                  .total_transcriptions
                  .toLocaleString()
              }

              title=
                "Medical Transcriptions"

              description=
                "Records in knowledge base"

            />


            <StatCard

              icon={
                <Stethoscope
                  size={22}
                />
              }

              value={
                dashboardData
                  .total_specialties
              }

              title=
                "Medical Specialties"

              description=
                "Clinical categories"

            />


            <StatCard

              icon={
                <MessagesSquare
                  size={22}
                />
              }

              value={
                dashboardData
                  .total_conversations
              }

              title=
                "AI Conversations"

              description=
                "Your saved conversations"

            />


            <StatCard

              icon={
                <MessageSquare
                  size={22}
                />
              }

              value={
                dashboardData
                  .total_messages
              }

              title=
                "Chat Messages"

              description=
                "Messages in your conversations"

            />

          </section>



          {/* ========================= */}
          {/* DASHBOARD GRID */}
          {/* ========================= */}

          <section className="dashboardMainGrid">


            {/* ========================= */}
            {/* SPECIALTIES */}
            {/* ========================= */}

            <div className="dashboardPanel">

              <div className="panelHeader">

                <div>

                  <h2>

                    Medical Specialties

                  </h2>


                  <p>

                    Browse documents by
                    clinical specialty.

                  </p>

                </div>


                <button

                  className="textButton"

                  onClick={() =>
                    navigate(
                      "/transcriptions"
                    )
                  }

                >

                  View all

                  <ArrowRight
                    size={16}
                  />

                </button>

              </div>


              <div className="specialtyGrid">

                {
                  dashboardData
                    .specialties
                    .map(
                      specialty => (

                        <div

                          className=
                            "specialtyCard"

                          key={
                            specialty
                              .medical_specialty
                          }

                          onClick={() =>
                            navigate(
                              "/transcriptions"
                            )
                          }

                        >

                          <div className="specialtyIcon">

                            <Stethoscope
                              size={19}
                            />

                          </div>


                          <div>

                            <h3>

                              {
                                specialty
                                  .medical_specialty
                              }

                            </h3>


                            <span>

                              {
                                specialty.total
                              }

                              {" "}

                              transcriptions

                            </span>

                          </div>

                        </div>

                      )
                    )
                }

              </div>

            </div>



            {/* ========================= */}
            {/* RECENT QUESTIONS */}
            {/* ========================= */}

            <div className="dashboardPanel recentPanel">

              <div className="panelHeader">

                <div>

                  <h2>

                    Recent Questions

                  </h2>


                  <p>

                    Your latest AI searches.

                  </p>

                </div>

              </div>


              <div className="recentQuestions">


                {
                  dashboardData
                    .recent_questions
                    .length > 0

                    ? (

                      dashboardData
                        .recent_questions
                        .map(
                          (
                            item,
                            index
                          ) => (

                            <div

                              className=
                                "questionItem"

                              key={
                                item.id
                              }

                            >

                              <div className="questionNumber">

                                {
                                  index + 1
                                }

                              </div>


                              <div className="questionContent">

                                <p>

                                  {
                                    item.question
                                  }

                                </p>


                                <span>

                                  {
                                    formatDate(
                                      item.created_at
                                    )
                                  }

                                </span>

                              </div>

                            </div>

                          )
                        )

                    )

                    : (

                      <p>

                        No questions yet.
                        Start a conversation
                        with the AI assistant.

                      </p>

                    )
                }


              </div>


              <button

                className=
                  "fullAssistantButton"

                onClick={() =>
                  navigate(
                    "/assistant"
                  )
                }

              >

                Open AI Assistant

                <ArrowRight
                  size={17}
                />

              </button>

            </div>

          </section>



          {/* ========================= */}
          {/* RAG STATUS */}
          {/* ========================= */}

          <section className="ragStatusSection">

            <div className="ragStatusContent">

              <div className="ragIcon">

                <Database
                  size={24}
                />

              </div>


              <div>

                <h2>

                  Medical RAG Knowledge Base

                </h2>


                <p>

                  Your medical transcriptions
                  are chunked, embedded using
                  nomic-embed-text, and stored
                  inside ChromaDB.

                </p>

              </div>

            </div>


            <div className="ragStatus">

              <span className="statusDot">
              </span>

              Ready

            </div>

          </section>


        </main>

      </div>

    </div>

  );

}


export default Dashboard;
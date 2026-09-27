import React, {
  useEffect,
  useState
} from "react";

import {
  ArrowLeft,
  FileText,
  Stethoscope,
  Tag,
  BookOpen
} from "lucide-react";

import {
  useNavigate,
  useParams
} from "react-router-dom";

import Sidebar from "../components/Sidebar";
import MobileNavbar from "../components/MobileNavbar";
import Topbar from "../components/Topbar";

import "../styles/transcriptionDetails.css";


function TranscriptionDetails() {

  const navigate = useNavigate();

  const { id } = useParams();


  // ========================================
  // STATES
  // ========================================

  const [
    transcription,
    setTranscription
  ] = useState(null);


  const [
    loading,
    setLoading
  ] = useState(true);


  const [
    error,
    setError
  ] = useState("");


  // ========================================
  // FETCH TRANSCRIPTION
  // ========================================

  useEffect(
    () => {

      const fetchTranscription =
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
                `http://127.0.0.1:8000/transcriptions/${id}`,
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
                "Could not load transcription."
              );

            }


            console.log(
              "TRANSCRIPTION:",
              data
            );


            setTranscription(
              data.transcription
            );

          }

          catch (error) {

            console.error(
              "TRANSCRIPTION DETAILS ERROR:",
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


      fetchTranscription();

    },
    [id]
  );


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

            <div className="recordNotFound">

              <FileText
                size={40}
              />

              <h2>
                Loading transcription...
              </h2>

            </div>

          </main>

        </div>

      </div>

    );

  }


  // ========================================
  // ERROR / NOT FOUND
  // ========================================

  if (
    error ||
    !transcription
  ) {

    return (

      <div className="appLayout">

        <Sidebar />


        <div className="mainContent">

          <MobileNavbar />

          <Topbar />


          <main className="pageContent">

            <div className="recordNotFound">

              <FileText
                size={40}
              />

              <h2>

                Transcription not found

              </h2>

              <p>

                {
                  error ||
                  "The requested medical record could not be found."
                }

              </p>


              <button
                onClick={() =>
                  navigate(
                    "/transcriptions"
                  )
                }
              >

                Back to Transcriptions

              </button>

            </div>

          </main>

        </div>

      </div>

    );

  }


  // ========================================
  // KEYWORDS
  // ========================================

  const keywords =
    (
      transcription.keywords ||
      ""
    )
      .split(",")
      .map(
        keyword =>
          keyword.trim()
      )
      .filter(
        keyword =>
          keyword !== ""
      );


  // ========================================
  // TRANSCRIPTION PARAGRAPHS
  // ========================================

  const paragraphs =
    (
      transcription.transcription ||
      ""
    )
      .split("\n")
      .filter(
        paragraph =>
          paragraph.trim()
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


          {/* ====================== */}
          {/* BACK BUTTON */}
          {/* ====================== */}

          <button

            className="backButton"

            onClick={() =>
              navigate(
                "/transcriptions"
              )
            }

          >

            <ArrowLeft
              size={18}
            />

            Back to Transcriptions

          </button>



          {/* ====================== */}
          {/* HEADER */}
          {/* ====================== */}

          <section className="detailsHeader">

            <div className="detailsTitle">

              <div className="detailsIcon">

                <FileText
                  size={26}
                />

              </div>


              <div>

                <span className="pageLabel">

                  Medical Transcription

                </span>


                <h1>

                  {
                    transcription.sample_name
                  }

                </h1>


                <p>

                  Review the full medical
                  transcription and its
                  associated metadata.

                </p>

              </div>

            </div>

          </section>



          {/* ====================== */}
          {/* MAIN GRID */}
          {/* ====================== */}

          <section className="detailsGrid">


            {/* ====================== */}
            {/* FULL TRANSCRIPTION */}
            {/* ====================== */}

            <div className="transcriptionDocument">

              <div className="documentHeader">

                <div>

                  <BookOpen
                    size={20}
                  />

                  <h2>

                    Full Transcription

                  </h2>

                </div>

              </div>


              <div className="documentBody">

                {
                  paragraphs.length > 0

                    ? (

                      paragraphs.map(
                        (
                          paragraph,
                          index
                        ) => (

                          <p
                            key={
                              index
                            }
                          >

                            {
                              paragraph
                            }

                          </p>

                        )
                      )

                    )

                    : (

                      <p>

                        No transcription text
                        available.

                      </p>

                    )
                }

              </div>

            </div>



            {/* ====================== */}
            {/* METADATA */}
            {/* ====================== */}

            <aside className="recordMetadata">


              <div className="metadataHeader">

                <h2>

                  Record Information

                </h2>

                <p>

                  Structured metadata
                  associated with this
                  transcription.

                </p>

              </div>



              {/* ====================== */}
              {/* SPECIALTY */}
              {/* ====================== */}

              <div className="metadataItem">

                <div className="metadataIcon">

                  <Stethoscope
                    size={18}
                  />

                </div>


                <div>

                  <span>

                    Medical Specialty

                  </span>


                  <strong>

                    {
                      transcription
                        .medical_specialty ||
                      "Not specified"
                    }

                  </strong>

                </div>

              </div>



              {/* ====================== */}
              {/* DESCRIPTION */}
              {/* ====================== */}

              <div className="metadataItem">

                <div className="metadataIcon">

                  <FileText
                    size={18}
                  />

                </div>


                <div>

                  <span>

                    Description

                  </span>


                  <strong>

                    {
                      transcription
                        .description ||
                      "No description available"
                    }

                  </strong>

                </div>

              </div>



              {/* ====================== */}
              {/* KEYWORDS */}
              {/* ====================== */}

              <div className="metadataSection">

                <div className="metadataSectionTitle">

                  <Tag
                    size={17}
                  />

                  <h3>

                    Keywords

                  </h3>

                </div>


                <div className="detailsKeywords">

                  {
                    keywords.length > 0

                      ? (

                        keywords.map(
                          (
                            keyword,
                            index
                          ) => (

                            <span
                              key={
                                index
                              }
                            >

                              {
                                keyword
                              }

                            </span>

                          )
                        )

                      )

                      : (

                        <span>

                          No keywords

                        </span>

                      )
                  }

                </div>

              </div>


            </aside>


          </section>


        </main>

      </div>

    </div>

  );

}


export default TranscriptionDetails;
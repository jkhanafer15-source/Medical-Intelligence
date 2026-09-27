import React, {
  useEffect,
  useState
} from "react";

import {
  Search,
  SlidersHorizontal
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import MobileNavbar from "../components/MobileNavbar";
import Topbar from "../components/Topbar";
import TranscriptionCard from "../components/Transcriptioncard";

import "../styles/transcriptions.css";


function Transcriptions() {

  // ========================================
  // STATES
  // ========================================

  const [
    transcriptions,
    setTranscriptions
  ] = useState([]);


  const [
    page,
    setPage
  ] = useState(1);


  const [
    total,
    setTotal
  ] = useState(0);


  const [
    loading,
    setLoading
  ] = useState(true);


  const [
    error,
    setError
  ] = useState("");


  const [
    search,
    setSearch
  ] = useState("");


  const [
    specialty,
    setSpecialty
  ] = useState("All");


  // ========================================
  // PAGE SIZE
  // ========================================

  const limit = 20;


  // ========================================
  // FETCH TRANSCRIPTIONS
  // ========================================

  const fetchTranscriptions =
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
            `http://127.0.0.1:8000/transcriptions?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`,
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
            "Could not load transcriptions."
          );

        }


        console.log(
          "TRANSCRIPTIONS:",
          data
        );


        setTranscriptions(
          data.transcriptions || []
        );


        setTotal(
          data.total || 0
        );

      }

      catch (error) {

        console.error(
          "TRANSCRIPTIONS ERROR:",
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


  // ========================================
  // LOAD WHEN PAGE CHANGES
  // ========================================

  useEffect(
    () => {

      fetchTranscriptions();

    },
    [page,search]
  );


  // ========================================
  // SPECIALTIES
  // ========================================

  const specialties = [

    "All",

    ...new Set(

      transcriptions
        .map(
          item =>
            item.medical_specialty
        )
        .filter(Boolean)

    )

  ];


  // ========================================
  // SEARCH + FILTER
  // ========================================

  const filteredTranscriptions =
    transcriptions.filter(
      item => {

        const searchValue =
          search.toLowerCase();


        const sampleName =
          (
            item.sample_name ||
            ""
          ).toLowerCase();


        const description =
          (
            item.description ||
            ""
          ).toLowerCase();


        const keywords =
          (
            item.keywords ||
            ""
          ).toLowerCase();


        const medicalSpecialty =
          item.medical_specialty ||
          "";


        const matchesSearch =

          sampleName.includes(
            searchValue
          )

          ||

          description.includes(
            searchValue
          )

          ||

          keywords.includes(
            searchValue
          );


        const matchesSpecialty =

          specialty === "All"

          ||

          medicalSpecialty ===
          specialty;


        return (
          matchesSearch &&
          matchesSpecialty
        );

      }
    );


  // ========================================
  // PAGINATION
  // ========================================

  const totalPages =
    Math.ceil(
      total / limit
    );


  const handlePrevious = () => {

    if (page > 1) {

      setPage(
        previous =>
          previous - 1
      );

      setSearch("");

      setSpecialty("All");

    }

  };


  const handleNext = () => {

    if (
      page < totalPages
    ) {

      setPage(
        previous =>
          previous + 1
      );

      setSearch("");

      setSpecialty("All");

    }

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


          {/* ====================== */}
          {/* HEADER */}
          {/* ====================== */}

          <section className="transcriptionsHeader">

            <div>

              <span className="pageLabel">

                Medical Knowledge Base

              </span>


              <h1>

                Medical Transcriptions

              </h1>


              <p>

                Browse, search and explore
                medical transcription records
                from different specialties.

              </p>

            </div>


            <div className="recordCount">

              <strong>

                {total}

              </strong>

              <span>

                Records

              </span>

            </div>

          </section>



          {/* ====================== */}
          {/* FILTER BAR */}
          {/* ====================== */}

          <section className="transcriptionFilters">


            <div className="transcriptionSearch">

              <Search size={18} />


              <input

                type="text"

                placeholder=
                  "Search by title, description or keyword..."

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

            </div>


            <div className="specialtyFilter">

              <SlidersHorizontal
                size={18}
              />


              <select

                value={
                  specialty
                }

                onChange={
                  event =>
                    setSpecialty(
                      event.target.value
                    )
                }

              >

                {
                  specialties.map(
                    item => (

                      <option

                        key={
                          item
                        }

                        value={
                          item
                        }

                      >

                        {item}

                      </option>

                    )
                  )
                }

              </select>

            </div>

          </section>



          {/* ====================== */}
          {/* ERROR */}
          {/* ====================== */}

          {
            error && (

              <div className="noResults">

                <h2>
                  Unable to load transcriptions
                </h2>

                <p>
                  {error}
                </p>

              </div>

            )
          }



          {/* ====================== */}
          {/* LOADING */}
          {/* ====================== */}

          {
            loading && (

              <div className="noResults">

                <p>
                  Loading transcriptions...
                </p>

              </div>

            )
          }



          {/* ====================== */}
          {/* RESULTS */}
          {/* ====================== */}

          {
            !loading &&
            !error && (

              <>

                <section className="resultsInfo">

                  <p>

                    Showing

                    <strong>
                      {" "}
                      {
                        filteredTranscriptions.length
                      }
                      {" "}
                    </strong>

                    records on page

                    <strong>
                      {" "}
                      {page}
                    </strong>

                  </p>

                </section>



                {/* ====================== */}
                {/* TRANSCRIPTION GRID */}
                {/* ====================== */}

                {

                  filteredTranscriptions.length >
                  0

                    ? (

                      <section className="transcriptionsGrid">

                        {
                          filteredTranscriptions.map(
                            item => (

                              <TranscriptionCard

                                key={
                                  item.id
                                }

                                transcription={
                                  item
                                }

                              />

                            )
                          )
                        }

                      </section>

                    )

                    : (

                      <div className="noResults">

                        <Search
                          size={34}
                        />

                        <h2>

                          No transcriptions found

                        </h2>

                        <p>

                          Try changing your
                          search term or
                          specialty filter.

                        </p>

                      </div>

                    )

                }



                {/* ====================== */}
                {/* PAGINATION */}
                {/* ====================== */}

                <div className="pagination">


                  <button

                    type="button"

                    disabled={
                      page === 1
                    }

                    onClick={
                      handlePrevious
                    }

                  >

                    Previous

                  </button>


                  <span>

                    Page {page}

                    {" "}

                    of

                    {" "}

                    {
                      totalPages
                    }

                  </span>


                  <button

                    type="button"

                    disabled={
                      page >=
                      totalPages
                    }

                    onClick={
                      handleNext
                    }

                  >

                    Next

                  </button>


                </div>

              </>

            )
          }


        </main>

      </div>

    </div>

  );

}


export default Transcriptions;
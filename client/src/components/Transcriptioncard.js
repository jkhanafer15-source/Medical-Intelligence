import React from "react";

import {
  FileText,
  ArrowRight
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import "../styles/components.css";

function TranscriptionCard({
  transcription
}) {

  const navigate =
    useNavigate();


  return (

    <div className="transcriptionCard">

      <div className="transcriptionHeader">

        <div className="documentIcon">

          <FileText size={22} />

        </div>


        <div>

          <h3>
            {
              transcription.sample_name
            }
          </h3>

          <span className="specialtyBadge">

            {
              transcription.medical_specialty
            }

          </span>

        </div>

      </div>


      <p className="transcriptionDescription">

        {
          transcription.description
        }

      </p>


      {
        transcription.keywords && (

          <div className="keywords">

            {
              transcription.keywords
                .split(",")
                .slice(0, 4)
                .map(
                  (keyword, index) => (

                    <span key={index}>

                      {
                        keyword.trim()
                      }

                    </span>

                  )
                )
            }

          </div>

        )
      }


      <button
        className="viewButton"
        onClick={() =>
          navigate(
            `/transcriptions/${transcription.id}`
          )
        }
      >

        View transcription

        <ArrowRight size={17} />

      </button>

    </div>

  );
}

export default TranscriptionCard;
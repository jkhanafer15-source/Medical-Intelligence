import React from "react";

import {
  FileText
} from "lucide-react";

import "../styles/components.css";

function SourceCard({
  title,
  specialty,
  text
}) {

  return (

    <div className="sourceCard">

      <div className="sourceIcon">

        <FileText size={18} />

      </div>


      <div className="sourceContent">

        <strong>
          {title}
        </strong>

        <span>
          {specialty}
        </span>

        {
          text && (

            <p>
              {text}
            </p>

          )
        }

      </div>

    </div>

  );
}

export default SourceCard;
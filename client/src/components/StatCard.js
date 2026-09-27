import React from "react";

import "../styles/components.css";

function StatCard({
  icon,
  title,
  value,
  description
}) {

  return (

    <div className="statCard">

      <div className="statIcon">

        {icon}

      </div>


      <div className="statContent">

        <h3>
          {value}
        </h3>

        <p>
          {title}
        </p>

        {
          description && (

            <span>
              {description}
            </span>

          )
        }

      </div>

    </div>

  );
}

export default StatCard;
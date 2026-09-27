import React from "react";

import {
  Home,
  FileText,
  Sparkles,
  Settings,
    UserCircle,
  HelpCircle,
  Activity
} from "lucide-react";

import { NavLink } from "react-router-dom";

import "../styles/layout.css";

function Sidebar() {

  return (

    <aside className="sidebar">

      <div className="sidebarLogo">

        <div className="logoIcon">
          <Activity size={24} />
        </div>

        <div className="logoText">
          <h2>
            Medical Record
          </h2>

          <span>
            Intelligence
          </span>
        </div>

      </div>


      <nav className="sidebarNav">

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive
              ? "sidebarLink activeSidebarLink"
              : "sidebarLink"
          }
        >
          <Home size={19} />

          <span>
            Dashboard
          </span>
        </NavLink>


        <NavLink
          to="/transcriptions"
          className={({ isActive }) =>
            isActive
              ? "sidebarLink activeSidebarLink"
              : "sidebarLink"
          }
        >
          <FileText size={19} />

          <span>
            Transcriptions
          </span>
        </NavLink>


        <NavLink
          to="/assistant"
          className={({ isActive }) =>
            isActive
              ? "sidebarLink activeSidebarLink"
              : "sidebarLink"
          }
        >
          <Sparkles size={19} />

          <span>
            AI Assistant
          </span>
        </NavLink>
<NavLink
  to="/analysis"
  className="sidebarLink"
>
  <Activity size={20} />

  <span>
    Patient Analysis
  </span>
</NavLink>

<NavLink to="/patients"
className="sidebarLink">
  Patients
</NavLink>
      </nav>


      <div className="sidebarBottom">

       

        <button className="sidebarLink sidebarButton">

          <HelpCircle size={19} />

          <span>
            Help
          </span>

        </button>

      </div>

    </aside>

  );
}

export default Sidebar;
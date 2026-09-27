import React, { useState } from "react";

import {
  Menu,
  X,
  Home,
  FileText,
  Sparkles,
  Activity
} from "lucide-react";

import { NavLink } from "react-router-dom";

import "../styles/layout.css";

function MobileNavbar() {

  const [menuOpen, setMenuOpen] =
    useState(false);


  return (

    <header className="mobileNavbar">

      <div className="mobileLogo">

        <Activity size={24} />

        <span>
          Medical AI
        </span>

      </div>


      <button
        className="menuButton"
        onClick={() =>
          setMenuOpen(!menuOpen)
        }
      >

        {
          menuOpen
            ? <X size={26} />
            : <Menu size={26} />
        }

      </button>


      {
        menuOpen && (

          <nav className="mobileMenu">

            <NavLink
              to="/dashboard"
              onClick={() =>
                setMenuOpen(false)
              }
            >

              <Home size={18} />

              Dashboard

            </NavLink>


            <NavLink
              to="/transcriptions"
              onClick={() =>
                setMenuOpen(false)
              }
            >

              <FileText size={18} />

              Transcriptions

            </NavLink>


            <NavLink
              to="/assistant"
              onClick={() =>
                setMenuOpen(false)
              }
            >

              <Sparkles size={18} />

              AI Assistant

            </NavLink>

          </nav>

        )
      }

    </header>

  );
}

export default MobileNavbar;
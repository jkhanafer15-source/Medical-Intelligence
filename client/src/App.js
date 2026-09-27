import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Transcriptions from "./pages/Transcriptions";
import TranscriptionDetails from "./pages/TranscriptionDetails";
import Assistant from "./pages/Assistant";
import Register from "./pages/Register";
import Analysis from "./pages/Analysis";
import AddPatient from "./pages/AddPatient";
import Patients from "./pages/Patients";
import Profile from "./pages/Profile";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<Login />}
        />
<Route
  path="/patients"
  element={<Patients />}
/>
<Route
  path="/register"
  element={<Register />}
/>
<Route
  path="/patients/add"
  element={<AddPatient />}
/>
<Route
  path="/analysis"
  element={<Analysis />}
/>

<Route
  path="/profile"
  element={<Profile />}
/>

<Route
  path="/transcriptions/:id"
  element={
    <TranscriptionDetails />
  }
/>
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/transcriptions"
          element={<Transcriptions />}
        />

        <Route
          path="/transcriptions/:id"
          element={<TranscriptionDetails />}
        />

        <Route
          path="/assistant"
          element={<Assistant />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
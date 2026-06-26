import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";

import Landing from "./pages/Landing";
import Login from "./pages/Login";

import Frameworks from "./pages/Frameworks";
import Evidence from "./pages/Evidence";
import Risks from "./pages/Risks";
import Vendors from "./pages/Vendors";
import Questionnaire from "./pages/Questionnaire";
import Implementation from "./pages/Implementation";
import Employees from "./pages/Employees";
import Audits from "./pages/Audits";
import Comments from "./pages/Comments";
import Tasks from "./pages/Tasks";

import TrustCenter from "./pages/TrustCenter";
import Settings from "./pages/Settings";
import SOC2 from "./pages/SOC2";

import ControlDetails from "./pages/ControlDetails";
import Policies from "./pages/Policies";

import Assistant from "./pages/Assistant";

import ProfileSettings from "./pages/ProfileSettings";  
import Profile from "./pages/Profile";

import About from "./pages/About";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";

import PricingPage from "./pages/PricingPage";
import Testimonials from "./pages/Testimonials";

import SOC2Solution from "./pages/SOC2Solution";
import ISO27001Solution from "./pages/ISO27001Solution";
import HIPAASolution from "./pages/HIPAASolution";

function App() {
  return (
    <Routes>
      <Route
  path="/test"
  element={<h1 style={{fontSize:"50px"}}>TEST PAGE</h1>}
/>

<Route
  path="/profile"
  element={<Profile />}
/>

        <Route
  path="/profile-settings"
  element={<ProfileSettings />}
/>

<Route path="/about" element={<About />} />
<Route path="/faq" element={<FAQ />} />
<Route path="/contact" element={<Contact />} />

        <Route path="/frameworks" element={<Frameworks />} />
        <Route path="/evidence" element={<Evidence />} />
        <Route path="/risks" element={<Risks />} />
        <Route path="/vendors" element={<Vendors />} />
        <Route path="/questionnaire" element={<Questionnaire />} />
        <Route path="/implementation" element={<Implementation />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/audits" element={<Audits />} />
        <Route path="/comments" element={<Comments />} />
        <Route path="/tasks" element={<Tasks />} />

        <Route path="/trust-center" element={<TrustCenter />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/soc2" element={<SOC2 />} />

        <Route
  path="/control/:id"
  element={<ControlDetails />}
/>

<Route
  path="/pricing"
  element={<PricingPage />}
/>

<Route
  path="/testimonials"
  element={<Testimonials />}
/>

<Route
  path="/solutions/soc2"
  element={<SOC2Solution />}
/>

<Route
  path="/solutions/iso27001"
  element={<ISO27001Solution />}
/>

<Route
  path="/solutions/hipaa"
  element={<HIPAASolution />}
/>

    <Route path="/policies" element={<Policies />} />

    <Route path="/assistant" element={<Assistant />} />

      <Route
        path="/"
        element={<Landing />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
  path="/dashboard"
  element={<Dashboard />}
/>

    </Routes>
  );
}

export default App;

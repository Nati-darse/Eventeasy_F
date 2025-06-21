import React from 'react';
import HomePage from "./Pages/HomePage.jsx";
import { Route, Routes } from 'react-router-dom';
import Classify_SU from './Pages/Classify_SU.jsx';
import Login_org from './Pages/Login_org.jsx'; 
import Login_att from './Pages/Login_att.jsx'; 
// import { DarkModeProvider } from './context/DarkModeContext';
import EmailVerify from './Pages/EmailVerify.jsx';
import Attendee from './Pages/Attendee.jsx'; // Ensure this is the correct path to your Attendee component
import Organizer from './Pages/Organizer.jsx'; // Ensure this is the correct path to your Organizer component
import Admin from './Pages/Admin.jsx'; // Ensure this is the correct path to your Admin component
import UserManagement from './Pages/userManagement.jsx';
import EventManagement from './Pages/eventManagement.jsx'; // Ensure this is the correct path to your eventManagement component
import EventDetail from './Pages/eventDetail.jsx'; // Ensure this is the correct path to your eventDetail component
import AttendeeEventPage from './Pages/attendEvent.jsx';


export default function App() {
  return (
    <div>
       
      {/* <NavBar />  Make sure NavBar is included */}
      
      {/* Use Routes and Route to define paths correctly */}
      <Routes>
        <Route path="/" element={<HomePage />} />  {/* HomePage will render for the root path */}
        <Route path="/Classify" element={<Classify_SU />} />  {/* Ensure this is correct for the signup page */}
        <Route path="/Login_Organizer" element={<Login_org />} />  {/* Ensure this is correct for the signup page */}
        <Route path="/Login_Attendee" element={<Login_att />} />  {/* Ensure this is correct for the signup page */}
        <Route path="/email-verify" element={<EmailVerify />} />
        <Route path="/Attendee" element={<Attendee />} />  {/* Ensure this is correct for the signup page */}
        <Route path="/Organizer_Dashboard" element={<Organizer />} />  {/* Ensure this is correct for the signup page */}
        <Route path= "/admin" element = {<Admin />}/>
        <Route path= "/admin/user-management" element= {<UserManagement/>}/>
        <Route path="/admin/event-management" element={<EventManagement />} /> {/* Ensure this is correct for the event management page */}
        <Route path="/events/:eventId" element={<EventDetail />} />
        <Route path= "/attend/:id" element= {<AttendeeEventPage/>}/>

      </Routes>
     
    </div>
  );
}
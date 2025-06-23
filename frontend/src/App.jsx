import React from 'react';
import { Route, Routes } from 'react-router-dom';
import HomePage from "./Pages/HomePage.jsx";
import Classify_SU from './Pages/Classify_SU.jsx';
import Login_org from './Pages/Login_org.jsx'; 
import Login_att from './Pages/Login_att.jsx'; 
import EmailVerify from './Pages/EmailVerify.jsx';
import Attendee from './Pages/Attendee.jsx';
import Organizer from './Pages/Organizer.jsx';
import Admin from './Pages/Admin.jsx';
import UserManagement from './Pages/userManagement.jsx';
import EventManagement from './Pages/eventManagement.jsx';
import EventDetail from './Pages/eventDetail.jsx';
import AttendeeEventPage from './Pages/attendEvent.jsx';
import PaymentPage from './Pages/PaymentPage.jsx';
import SearchResults from './Pages/SearchResults.jsx';

export default function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/Classify" element={<Classify_SU />} />
        <Route path="/Login_Organizer" element={<Login_org />} />
        <Route path="/Login_Attendee" element={<Login_att />} />
        <Route path="/email-verify" element={<EmailVerify />} />
        <Route path="/Attendee" element={<Attendee />} />
        <Route path="/Organizer_Dashboard" element={<Organizer />} />
        <Route path="/admin" element={<Admin />}/>
        <Route path="/admin/user-management" element={<UserManagement/>}/>
        <Route path="/admin/event-management" element={<EventManagement />} />
        <Route path="/events/:eventId" element={<EventDetail />} />
        <Route path="/attend/:id" element={<AttendeeEventPage/>}/>
        <Route path="/payment/:eventId" element={<PaymentPage />} />
        <Route path="/payment/status" element={<PaymentPage />} />
        <Route path="/search" element={<SearchResults />} />
      </Routes>
    </div>
  );
}
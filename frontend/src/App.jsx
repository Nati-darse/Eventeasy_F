import React from 'react';
import NavBar from './components/navBar';  
import HomePage from "./Pages/HomePage";
import { Route, Routes } from 'react-router-dom';
import Classify_SU from './Pages/Classify_SU';
import Login_org from './Pages/Login_org'; 
import Login_att from './Pages/Login_att'; 
import EmailVerify from './Pages/EmailVerify';
import Attendee from './Pages/Attendee';
import Organizer from './Pages/Organizer';
import Admin from './Pages/Admin';
import UserManagement from './Pages/userManagement';
import EventManagement from './Pages/eventManagement';
import EventDetail from './Pages/eventDetail';
import AttendeeEventPage from './Pages/attendEvent';
import PaymentPage from './Pages/PaymentPage';

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
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/user-management" element={<UserManagement />} />
        <Route path="/admin/event-management" element={<EventManagement />} />
        <Route path="/events/:eventId" element={<EventDetail />} />
        <Route path="/attend/:id" element={<AttendeeEventPage />} />
        
        {/* Payment Routes */}
        <Route path="/payment/:eventId" element={<PaymentPage />} />
        <Route path="/payment/status" element={<PaymentPage />} />
        <Route path="/payment/success" element={<PaymentPage />} />
      </Routes>
    </div>
  );
}
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useToast } from '../hooks/useToast.jsx';

const EmailVerify = () => {
  console.log("EmailVerify component rendered!"); // Add this to see if it's being called

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const [resendMessage, setResendMessage] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (/[^0-9]/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== "" && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userToken = localStorage.getItem("token");

      if (!userToken) {
        toastError('You are not logged in. Please log in first.');
        navigate("/login");
        return;
      }

      const otpString = otp.join("");

      const response = await axios.post(
        "http://localhost:5000/Event-Easy/users/verify-otp",
        { otp: otpString },
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        setIsVerified(true);
        setShowSuccess(true);
        success('Email verified successfully! Please log in.');
        // Remove token and userEmail from localStorage for security
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        setTimeout(() => {
          navigate("/Login_Attendee");
        }, 2000);
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setError(error.response.data.message || "An error occurred. Please try again.");
      } else {
        setError("Connection issue. Is the server running?");
      }
    }
  };

  const handleResendOtp = async (e) => {
    e.preventDefault();
    setResendMessage("");
    setError("");
    setResendLoading(true);
    try {
      const userToken = localStorage.getItem("token");
      if (!userToken) {
        toastError('You are not logged in. Please log in first.');
        navigate("/login");
        return;
      }
      // Get user email from token or localStorage (assuming you store it)
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) {
        setError("User email not found. Please log in again.");
        setResendLoading(false);
        return;
      }
      const response = await axios.post(
        "http://localhost:5000/Event-Easy/users/send-verify-otp",
        { email: userEmail },
        {
          withCredentials: true,
        }
      );
      if (response.data.success) {
        setResendMessage("OTP resent successfully! Check your email.");
      } else {
        setError(response.data.message || "Failed to resend OTP.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setResendLoading(false);
    }
  };

  useEffect(() => {
    if (isVerified) {
      // Do not auto-navigate to dashboard, handled above
    }
  }, [isVerified]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <h1 className="text-3xl font-semibold text-center text-gray-800">Verify Your Email</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-4">
            <label htmlFor="otp" className="block text-lg font-medium text-gray-600">
              Enter the 6-digit OTP sent to your email:
            </label>
            <div className="grid grid-cols-6 gap-2 mt-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  id={`otp-${index}`}
                  value={digit}
                  onChange={(e) => handleOtpChange(e, index)}
                  maxLength="1"
                  className="w-12 h-12 text-center text-xl border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus={index === 0}
                />
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 mt-4 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Verify OTP
          </button>
        </form>
        
        {error && <p className="mt-4 text-center text-red-500">{error}</p>}
        {resendMessage && <p className="mt-4 text-center text-green-500">{resendMessage}</p>}
        <p className="mt-4 text-center text-sm text-gray-500">
          Didn't receive the OTP?{' '}
          <button
            className="text-indigo-600 hover:text-indigo-700 underline disabled:opacity-50"
            onClick={handleResendOtp}
            disabled={resendLoading}
            type="button"
          >
            {resendLoading ? 'Resending...' : 'Resend OTP'}
          </button>
        </p>
        {showSuccess && (
          <p className="mt-4 text-center text-green-600 font-semibold">Email verified! Redirecting to login...</p>
        )}
      </div>
    </div>
  );
};

export default EmailVerify;
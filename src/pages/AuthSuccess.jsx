import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function AuthSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const sendOTP = async () => {
      const params = new URLSearchParams(location.search);
      const email = params.get("email");

      if (!email) {
        navigate("/login");
        return;
      }

      localStorage.setItem("email", email);

      try {
        const res = await fetch(
          "https://ai-trading-system-1t02.onrender.com/api/auth/request-otp",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ email })
          }
        );

        const data = await res.json();

        console.log("AUTO OTP RESPONSE:", data);

        if (data.success) {
          navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
        } else {
          alert(data.message || "Failed to send OTP");
          navigate("/login");
        }

      } catch (error) {
        console.error("AUTO OTP ERROR:", error);
        alert("Unable to send OTP");
        navigate("/login");
      }
    };

    sendOTP();
  }, [location.search, navigate]);

  return (
    <div style={{ color: "white", textAlign: "center", marginTop: "100px" }}>
      Sending OTP...
    </div>
  );
}
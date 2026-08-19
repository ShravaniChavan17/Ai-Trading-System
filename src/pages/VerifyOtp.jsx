import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function VerifyOtp() {
    const navigate = useNavigate();
    const location = useLocation();

    const queryEmail = new URLSearchParams(location.search).get("email");
    const email = queryEmail || localStorage.getItem("email");

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const inputs = useRef([]);

    const [timer, setTimer] = useState(30);
    const [resendEnabled, setResendEnabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);

    // =====================================================
    // SAVE EMAIL
    // =====================================================
    useEffect(() => {
        if (email) {
            localStorage.setItem("email", email);
        }
    }, [email]);

    // =====================================================
    // AUTOMATICALLY SEND OTP WHEN PAGE OPENS
    // =====================================================
    useEffect(() => {
        if (!email) return;

        const sendInitialOTP = async () => {
            try {
                setSendingOtp(true);

                console.log("📧 Sending OTP automatically to:", email);

                const res = await fetch(
                    "https://ai-trading-system-1t02.onrender.com/api/auth/request-otp",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            email,
                        }),
                    }
                );

                const data = await res.json();

                console.log("AUTO OTP RESPONSE:", data);

                if (data.success) {
                    console.log("✅ OTP sent successfully");
                    setTimer(30);
                    setResendEnabled(false);
                } else {
                    console.error(
                        "❌ OTP sending failed:",
                        data.message
                    );
                }

            } catch (error) {
                console.error("❌ AUTO OTP ERROR:", error);
            } finally {
                setSendingOtp(false);
            }
        };

        sendInitialOTP();

    }, [email]);

    // =====================================================
    // TIMER
    // =====================================================
    useEffect(() => {
        if (timer <= 0) {
            setResendEnabled(true);
            return;
        }

        const interval = setInterval(() => {
            setTimer((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(interval);

    }, [timer]);

    // =====================================================
    // INPUT
    // =====================================================
    const handleChange = (value, index) => {
        if (!/^[0-9]?$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;

        setOtp(newOtp);

        if (
            value &&
            index < 5 &&
            inputs.current[index + 1]
        ) {
            inputs.current[index + 1].focus();
        }
    };

    // =====================================================
    // BACKSPACE
    // =====================================================
    const handleKeyDown = (e, index) => {
        if (
            e.key === "Backspace" &&
            !otp[index] &&
            index > 0 &&
            inputs.current[index - 1]
        ) {
            inputs.current[index - 1].focus();
        }
    };

    // =====================================================
    // PASTE OTP
    // =====================================================
    const handlePaste = (e) => {
        const paste = e.clipboardData.getData("text").trim();

        if (!/^\d{6}$/.test(paste)) return;

        const newOtp = paste.split("");

        setOtp(newOtp);

        if (inputs.current[5]) {
            inputs.current[5].focus();
        }
    };

    // =====================================================
    // VERIFY OTP
    // =====================================================
    const verifyOtp = async () => {
        const enteredOtp = otp.join("");

        if (enteredOtp.length !== 6) {
            alert("Enter full 6-digit OTP");
            return;
        }

        if (!email) {
            alert("Email missing. Please login again.");
            navigate("/login");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(
                "https://ai-trading-system-1t02.onrender.com/api/auth/verify-otp",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        otp: enteredOtp,
                    }),
                }
            );

            const data = await res.json();

            console.log("VERIFY OTP RESPONSE:", data);

            if (!res.ok || !data.success) {
                alert(
                    data.message ||
                    "OTP verification failed"
                );

                setLoading(false);
                return;
            }

            // OTP verified
            localStorage.setItem("email", email);

            console.log("✅ OTP VERIFIED");

            // Check whether PIN already exists
            const isPinSet = data.isPinSet ?? false;

            if (isPinSet) {
                console.log("➡️ PIN exists → Verify PIN");

                navigate(
                    `/verify-pin?email=${encodeURIComponent(email)}`
                );
            } else {
                console.log("➡️ PIN does not exist → Set PIN");

                navigate(
                    `/set-pin?email=${encodeURIComponent(email)}`
                );
            }

        } catch (error) {
            console.error(
                "❌ VERIFY OTP ERROR:",
                error
            );

            alert("Server error. Please try again.");

        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // RESEND OTP
    // =====================================================
    const resendOtp = async () => {
        if (!email) {
            alert("Email missing. Please login again.");
            navigate("/login");
            return;
        }

        try {
            setSendingOtp(true);

            console.log(
                "📧 Resending OTP to:",
                email
            );

            const res = await fetch(
                "https://ai-trading-system-1t02.onrender.com/api/auth/request-otp",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                    }),
                }
            );

            const data = await res.json();

            console.log("RESEND OTP RESPONSE:", data);

            if (data.success) {
                setTimer(30);
                setResendEnabled(false);
                setOtp(["", "", "", "", "", ""]);

                if (inputs.current[0]) {
                    inputs.current[0].focus();
                }

                alert("OTP resent successfully!");

            } else {
                alert(
                    data.message ||
                    "Failed to resend OTP"
                );
            }

        } catch (error) {
            console.error(
                "❌ RESEND OTP ERROR:",
                error
            );

            alert("Failed to resend OTP");

        } finally {
            setSendingOtp(false);
        }
    };

    // =====================================================
    // EMAIL MISSING
    // =====================================================
    if (!email) {
        return (
            <div
                style={{
                    color: "white",
                    textAlign: "center",
                    marginTop: "100px",
                }}
            >
                <h2>Email missing</h2>

                <p>
                    Please signup/login again.
                </p>

                <button
                    onClick={() => navigate("/login")}
                    style={{
                        marginTop: "20px",
                        padding: "10px 20px",
                        background: "#0ea5e9",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                    }}
                >
                    Go to Login
                </button>
            </div>
        );
    }

    // =====================================================
    // UI
    // =====================================================
    return (
        <div style={styles.container}>

            <div style={styles.card}>

                <h2 style={styles.title}>
                    Verify OTP
                </h2>

                <p style={styles.subtitle}>
                    {sendingOtp
                        ? "Sending verification code..."
                        : "Enter 6-digit code sent to"}
                </p>

                <p style={styles.email}>
                    {email}
                </p>

                {/* OTP INPUTS */}
                <div
                    style={styles.otpBox}
                    onPaste={handlePaste}
                >
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            type="text"
                            inputMode="numeric"
                            maxLength="1"
                            value={digit}
                            ref={(el) =>
                                (inputs.current[index] = el)
                            }
                            onChange={(e) =>
                                handleChange(
                                    e.target.value,
                                    index
                                )
                            }
                            onKeyDown={(e) =>
                                handleKeyDown(
                                    e,
                                    index
                                )
                            }
                            style={styles.input}
                        />
                    ))}
                </div>

                {/* VERIFY BUTTON */}
                <button
                    style={{
                        ...styles.button,
                        opacity:
                            loading ||
                            sendingOtp
                                ? 0.6
                                : 1,
                    }}
                    onClick={verifyOtp}
                    disabled={
                        loading ||
                        sendingOtp
                    }
                >
                    {loading
                        ? "Verifying..."
                        : "Verify OTP"}
                </button>

                {/* TIMER / RESEND */}
                <p style={styles.timer}>

                    {resendEnabled ? (
                        <span
                            style={styles.resend}
                            onClick={
                                sendingOtp
                                    ? undefined
                                    : resendOtp
                            }
                        >
                            {sendingOtp
                                ? "Sending..."
                                : "Resend OTP"}
                        </span>
                    ) : (
                        `Resend in ${timer}s`
                    )}

                </p>

            </div>
        </div>
    );
}

// =====================================================
// STYLES
// =====================================================

const styles = {
    container: {
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
            "linear-gradient(135deg,#0f172a,#1e293b)",
    },

    card: {
        background: "#0f172a",
        padding: "40px",
        borderRadius: "12px",
        textAlign: "center",
        color: "white",
        boxShadow: "0 0 20px #0ea5e9",
        minWidth: "350px",
    },

    title: {
        marginBottom: "10px",
    },

    subtitle: {
        opacity: 0.7,
    },

    email: {
        color: "#38bdf8",
        marginBottom: "20px",
        wordBreak: "break-word",
    },

    otpBox: {
        display: "flex",
        gap: "10px",
        justifyContent: "center",
        marginBottom: "20px",
    },

    input: {
        width: "45px",
        height: "55px",
        fontSize: "22px",
        textAlign: "center",
        borderRadius: "8px",
        border: "1px solid #38bdf8",
        background: "#020617",
        color: "white",
        outline: "none",
    },

    button: {
        width: "100%",
        padding: "12px",
        background: "#0ea5e9",
        border: "none",
        borderRadius: "8px",
        color: "white",
        cursor: "pointer",
        fontSize: "16px",
    },

    timer: {
        marginTop: "15px",
    },

    resend: {
        color: "#38bdf8",
        cursor: "pointer",
    },
};
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./KycProcess.css";

export default function KycProcess() {
  const email =
    new URLSearchParams(window.location.search).get("email") ||
    localStorage.getItem("email");

  const [step, setStep] = useState(1);

  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [pan, setPan] = useState("");

  const [aadhaar, setAadhaar] = useState(null);
  const [panImg, setPanImg] = useState(null);

  const [selfie, setSelfie] = useState(null);
  const [preview, setPreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ========================================
  // STEP 1 VALIDATION
  // ========================================

  const next1 = () => {
    if (!fullName.trim() || !dob) {
      alert("Please fill in all personal information.");
      return;
    }

    setStep(2);
  };

  // ========================================
  // STEP 2 VALIDATION
  // ========================================

  const next2 = () => {
    if (!pan.trim() || !aadhaar || !panImg) {
      alert("Please enter PAN number and upload both documents.");
      return;
    }

    setStep(3);
  };

  // ========================================
  // SUBMIT KYC
  // ========================================

  const submit = async () => {
    if (!email) {
      alert("Session expired. Please login again.");
      return;
    }

    if (!selfie) {
      alert("Please complete face verification.");
      return;
    }

    try {
      setLoading(true);

      const form = new FormData();

      form.append("email", email);
      form.append("fullName", fullName);
      form.append("dob", dob);
      form.append("panNumber", pan);

      form.append("aadhaarImage", aadhaar);
      form.append("panImage", panImg);
      form.append("selfieImage", selfie);

      const res = await axios.post(
        "http://localhost:5000/api/kyc/upload",
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data.success) {
        setSuccess(true);

        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1500);
      } else {
        alert("KYC submission failed.");
      }
    } catch (err) {
      console.error("KYC ERROR:", err);

      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Unable to upload KYC documents.";

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // UI
  // ========================================

  return (
    <div className="kyc-container">
      <Sidebar step={step} />

      <main className="kyc-main">
        <div className="kyc-header">
          <div className="security-badge">
            <span className="security-dot"></span>
            Secure KYC Verification
          </div>

          <h1 className="verify-title">Verify Identity</h1>

          <p className="verify-subtitle">
            Complete the verification process to secure your account.
          </p>
        </div>

        <Progress step={step} />

        <div className="kyc-card">
          {/* ======================================
              STEP 1
          ====================================== */}

          {step === 1 && (
            <div className="step-content">
              <div className="step-heading">
                <div className="step-icon">01</div>

                <div>
                  <h2>Personal Information</h2>
                  <p>Enter your basic details to continue.</p>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>

                <div className="input-wrapper">
                  <span className="input-icon">👤</span>

                  <input
                    id="fullName"
                    type="text"
                    className="input"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="dob">Date of Birth</label>

                <div className="input-wrapper">
                  <span className="input-icon">📅</span>

                  <input
                    id="dob"
                    type="date"
                    className="input"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                  />
                </div>
              </div>

              <button className="primary-btn" onClick={next1}>
                Continue
                <span>→</span>
              </button>

              <div className="privacy-note">
                <span>🔒</span>
                Your information is securely encrypted.
              </div>
            </div>
          )}

          {/* ======================================
              STEP 2
          ====================================== */}

          {step === 2 && (
            <div className="step-content">
              <div className="step-heading">
                <div className="step-icon">02</div>

                <div>
                  <h2>Verify Documents</h2>
                  <p>Upload clear images of your identity documents.</p>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="pan">PAN Number</label>

                <div className="input-wrapper">
                  <span className="input-icon">▣</span>

                  <input
                    id="pan"
                    type="text"
                    className="input pan-input"
                    placeholder="Enter PAN number"
                    value={pan}
                    onChange={(e) =>
                      setPan(e.target.value.toUpperCase())
                    }
                    maxLength={10}
                  />
                </div>
              </div>

              <div className="upload-grid">
                <FileCard
                  title="Aadhaar Card"
                  description="Upload Aadhaar"
                  file={aadhaar}
                  setFile={setAadhaar}
                  icon="🪪"
                />

                <FileCard
                  title="PAN Card"
                  description="Upload PAN card"
                  file={panImg}
                  setFile={setPanImg}
                  icon="📄"
                />
              </div>

              <ButtonRow
                back={() => setStep(1)}
                next={next2}
                nextText="Continue"
              />
            </div>
          )}

          {/* ======================================
              STEP 3
          ====================================== */}

          {step === 3 && (
            <div className="step-content">
              <div className="step-heading">
                <div className="step-icon">03</div>

                <div>
                  <h2>Face Verification</h2>
                  <p>Take a clear selfie to verify your identity.</p>
                </div>
              </div>

              <FaceCapture
                setSelfie={setSelfie}
                preview={preview}
                setPreview={setPreview}
              />

              <ButtonRow
                back={() => setStep(2)}
                next={() => {
                  if (!selfie) {
                    alert("Please capture or upload your selfie.");
                    return;
                  }

                  setStep(4);
                }}
                nextText="Continue"
              />
            </div>
          )}

          {/* ======================================
              STEP 4
          ====================================== */}

          {step === 4 && (
            <div className="step-content">
              <div className="step-heading">
                <div className="step-icon">04</div>

                <div>
                  <h2>Review Details</h2>
                  <p>Check your information before submitting.</p>
                </div>
              </div>

              <div className="review-container">
                <div className="review-left">
                  <ReviewRow label="Full Name" value={fullName} />
                  <ReviewRow label="Date of Birth" value={dob} />
                  <ReviewRow label="PAN Number" value={pan} />
                  <ReviewRow label="Email" value={email} />
                </div>

                <div className="review-right">
                  <ImageCard
                    label="Aadhaar"
                    file={aadhaar}
                  />

                  <ImageCard
                    label="PAN Card"
                    file={panImg}
                  />

                  {preview && (
                    <ImageCard
                      label="Selfie"
                      preview={preview}
                    />
                  )}
                </div>
              </div>

              <ButtonRow
                back={() => setStep(3)}
                next={submit}
                nextText={loading ? "Submitting..." : "Submit KYC"}
                disabled={loading}
              />

              <div className="privacy-note">
                <span>🔐</span>
                By submitting, you confirm that the information provided is
                accurate.
              </div>
            </div>
          )}
        </div>

        {success && <Success />}
      </main>
    </div>
  );
}

// ========================================
// SIDEBAR
// ========================================

function Sidebar({ step }) {
  const steps = [
    {
      number: "01",
      title: "Personal",
      description: "Basic information",
    },
    {
      number: "02",
      title: "Documents",
      description: "Identity verification",
    },
    {
      number: "03",
      title: "Face",
      description: "Face verification",
    },
    {
      number: "04",
      title: "Review",
      description: "Final confirmation",
    },
  ];

  return (
    <aside className="sidebar">
     
      <div className="sidebar-header">
        <h3>Verify Identity</h3>
        <p>Complete all steps below</p>
      </div>

      <div className="sidebar-steps">
        {steps.map((item, index) => {
          const currentStep = index + 1;

          const completed = step > currentStep;
          const active = step === currentStep;

          return (
            <div
              key={item.number}
              className={`sidebar-step ${
                active ? "active" : ""
              } ${completed ? "completed" : ""}`}
            >
              <div className="step-number">
                {completed ? "✓" : item.number}
              </div>

              <div className="sidebar-step-content">
                <div className="sidebar-step-title">
                  {item.title}
                </div>

                <div className="sidebar-step-description">
                  {item.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="sidebar-security">
        <div className="security-icon">🔒</div>

        <div>
          <strong>Secure & Private</strong>

          <p>
            Your personal documents are protected with secure
            encryption.
          </p>
        </div>
      </div>
    </aside>
  );
}

// ========================================
// PROGRESS
// ========================================

function Progress({ step }) {
  const percentage = (step / 4) * 100;

  return (
    <div className="progress-wrapper">
      <div className="progress-top">
        <span>Verification Progress</span>
        <strong>{step} of 4</strong>
      </div>

      <div className="progress">
        <div
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// ========================================
// FILE CARD
// ========================================

function FileCard({
  title,
  description,
  file,
  setFile,
  icon,
}) {
  return (
    <div className={`file-card ${file ? "uploaded" : ""}`}>
      <div className="file-icon">{icon}</div>

      <div className="file-title">{title}</div>

      <div className="file-description">
        {file ? file.name : description}
      </div>

      <label className="upload-box">
        <input
          type="file"
          hidden
          accept="image/*"
          onChange={(e) => {
            const selectedFile = e.target.files?.[0];

            if (selectedFile) {
              setFile(selectedFile);
            }
          }}
        />

        <span>
          {file ? "✓ Uploaded" : "Choose File"}
        </span>
      </label>
    </div>
  );
}

// ========================================
// FACE CAPTURE
// ========================================

function FaceCapture({
  setSelfie,
  preview,
  setPreview,
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [camera, setCamera] = useState(false);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    if (!camera) return;

    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: "user",
        },
        audio: false,
      })
      .then((mediaStream) => {
        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      })
      .catch((error) => {
        console.error("Camera error:", error);

        alert(
          "Unable to access camera. Please allow camera permission or upload a selfie."
        );

        setCamera(false);
      });

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [camera]);

  const startCamera = () => {
    setPreview(null);
    setSelfie(null);
    setCamera(true);
  };

  const capture = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!video || !canvas) {
      alert("Camera is not ready.");
      return;
    }

    if (!video.videoWidth || !video.videoHeight) {
      alert("Please wait for the camera to start.");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) return;

        setSelfie(blob);
        setPreview(URL.createObjectURL(blob));

        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }

        setCamera(false);
      },
      "image/jpeg",
      0.9
    );
  };

  const uploadSelfie = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setSelfie(file);
    setPreview(URL.createObjectURL(file));
    setCamera(false);

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  return (
    <div className="face-verification">
      <div className="face-area">
        {preview ? (
          <img
            src={preview}
            className="face-preview"
            alt="Selfie preview"
          />
        ) : camera ? (
          <video
            ref={videoRef}
            className="face-video"
            autoPlay
            playsInline
            muted
          />
        ) : (
          <div className="face-placeholder">
            <div className="face-placeholder-icon">
              📷
            </div>

            <strong>Camera Ready</strong>

            <span>
              Start your camera or upload a selfie
            </span>
          </div>
        )}
      </div>

      <canvas
        ref={canvasRef}
        className="hidden-canvas"
      />

      <div className="face-instruction">
        Position your face inside the frame and make sure
        your face is clearly visible.
      </div>

      <div className="face-buttons">
        {!camera && (
          <button
            type="button"
            className="camera-btn"
            onClick={startCamera}
          >
            📷 Start Camera
          </button>
        )}

        {camera && (
          <button
            type="button"
            className="camera-btn capture-btn"
            onClick={capture}
          >
            ◉ Capture Selfie
          </button>
        )}

        <label className="upload-selfie-btn">
          📁 Upload Selfie

          <input
            type="file"
            hidden
            accept="image/*"
            onChange={uploadSelfie}
          />
        </label>
      </div>
    </div>
  );
}

// ========================================
// BUTTON ROW
// ========================================

function ButtonRow({
  back,
  next,
  nextText = "Next",
  disabled = false,
}) {
  return (
    <div className="btn-row">
      <button
        type="button"
        className="back-btn"
        onClick={back}
        disabled={disabled}
      >
        ← Back
      </button>

      <button
        type="button"
        className="next-btn"
        onClick={next}
        disabled={disabled}
      >
        {nextText}

        {!disabled && <span>→</span>}
      </button>
    </div>
  );
}

// ========================================
// REVIEW ROW
// ========================================

function ReviewRow({ label, value }) {
  return (
    <div className="review-row">
      <div className="review-label">{label}</div>

      <div className="review-value">
        {value || "Not provided"}
      </div>
    </div>
  );
}

// ========================================
// IMAGE CARD
// ========================================

function ImageCard({ label, file, preview }) {
  const src = preview || (file ? URL.createObjectURL(file) : null);

  return (
    <div className="review-image-card">
      <div className="image-title">{label}</div>

      {src ? (
        <img
          src={src}
          className="review-image"
          alt={label}
        />
      ) : (
        <div className="image-empty">
          No image
        </div>
      )}
    </div>
  );
}

// ========================================
// SUCCESS
// ========================================

function Success() {
  return (
    <div className="success-overlay">
      <div className="success-card">
        <div className="success-icon">✓</div>

        <h2>KYC Completed</h2>

        <p>
          Your identity verification has been submitted
          successfully.
        </p>

        <div className="success-loading">
          Redirecting to dashboard...
        </div>
      </div>
    </div>
  );
}
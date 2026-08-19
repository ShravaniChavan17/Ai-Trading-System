import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  // ================= AUTH FLOW =================
  useEffect(() => {
    const checkAuthFlow = async () => {
      const email = localStorage.getItem("email");

      if (!email) {
        navigate("/login");
        return;
      }

      try {
        const res = await fetch(
          "https://ai-trading-system-1t02.onrender.com/api/auth/get-user",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
          }
        );

        const data = await res.json();

        console.log("DASHBOARD USER:", data);

        if (!data.success) {
          navigate("/login");
          return;
        }

        // OTP not verified
        if (!data.isVerified) {
          navigate(
            `/verify-otp?email=${encodeURIComponent(email)}`
          );
          return;
        }

        // PIN not created
        if (!data.isPinSet) {
          navigate(
            `/set-pin?email=${encodeURIComponent(email)}`
          );
          return;
        }

        // KYC not completed
        if (!data.kycCompleted) {
          navigate(
            `/kyc-process?email=${encodeURIComponent(email)}`
          );
          return;
        }
      } catch (err) {
        console.error("AUTH FLOW ERROR:", err);
      }
    };

    checkAuthFlow();
  }, [navigate]);

  // ================= USER =================
  const [user, setUser] = useState({
    name: "Shravani",
    balance: 0,
    invested: 0,
    profit: 0,
    todayProfit: 0,
    aiAccuracy: 87,
  });

  // ================= AI =================
  const [aiData, setAiData] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);

  // ================= LOAD DATA =================
  useEffect(() => {
    let savedWallet = parseFloat(
      localStorage.getItem("wallet")
    );

    // First-time wallet initialization
    if (!savedWallet || isNaN(savedWallet)) {
      savedWallet = 100000;
      localStorage.setItem("wallet", savedWallet);
    }

    const savedPortfolio = JSON.parse(
      localStorage.getItem("portfolio") || "{}"
    );

    // ================= INVESTED =================
    const invested = Object.values(savedPortfolio).reduce(
      (sum, p) => {
        return sum + (Number(p.amount) || 0);
      },
      0
    );

    // ================= CURRENT VALUE =================
    const currentValue = Object.entries(savedPortfolio).reduce(
      (sum, [symbol, p]) => {
        const entry = Number(p.entry) || 0;
        const amount = Number(p.amount) || 0;

        if (!entry) return sum;

        // Temporary price
        // Replace with live price later
        const currentPrice = 1200;

        return sum + (currentPrice / entry) * amount;
      },
      0
    );

    // ================= PROFIT =================
    const profit = currentValue - invested;

    // ================= UPDATE USER =================
    setUser((prev) => ({
      ...prev,
      balance: savedWallet,
      invested,
      profit,
      todayProfit: profit * 0.1,
    }));
  }, []);

  // ================= AI PREDICTION =================
  const runAIPrediction = async () => {
    try {
      setAiLoading(true);

      const coins = [
        "BTC-USD",
        "ETH-USD",
        "SOL-USD",
      ];

      const results = await Promise.all(
        coins.map(async (coin) => {
          const res = await axios.get(
            `https://ai-trading-system-1t02.onrender.com/api/ai/predict/${coin}?t=${Date.now()}`
          );

          return res.data?.data || res.data;
        })
      );

      console.log("AI RESULTS:", results);

      setAiData(
        Array.isArray(results)
          ? results
          : []
      );
    } catch (error) {
      console.error("AI ERROR:", error);
      setAiData([]);
    } finally {
      setAiLoading(false);
    }
  };

  // Run AI when dashboard loads
  useEffect(() => {
    runAIPrediction();
  }, []);

  // ================= MENU =================
  const menuItems = [
    {
      name: "Overview",
      path: "/dashboard/overview",
      icon: "📊",
    },
    {
      name: "Portfolio",
      path: "/dashboard/portfolio",
      icon: "💼",
    },
    {
      name: "AI Predictions",
      path: "/dashboard/ai-predictions",
      icon: "🤖",
    },
    {
      name: "Market",
      path: "/dashboard/market",
      icon: "📈",
    },
    {
      name: "Trade",
      path: "/dashboard/trade",
      icon: "🔁",
    },
    {
      name: "Trade History",
      path: "/dashboard/history",
      icon: "📜",
    },
    {
      name: "News Sentiment",
      path: "/dashboard/news",
      icon: "📰",
    },
    {
      name: "Auto Trading",
      path: "/dashboard/auto-trading",
      icon: "⚙️",
    },
  ];

  return (
    <div style={styles.container}>

      {/* ================= SIDEBAR ================= */}
      <div style={styles.sidebar}>

        <h2 style={styles.logo}>
          AI Trading
        </h2>

        {menuItems.map((item, index) => {
          const isActive =
            location.pathname === item.path;

          return (
            <Link
              key={index}
              to={item.path}
              style={{
                ...styles.menuItem,
                background: isActive
                  ? "#0ea5e9"
                  : "transparent",
                color: isActive
                  ? "white"
                  : "#cbd5e1",
              }}
            >
              <span style={{ marginRight: 10 }}>
                {item.icon}
              </span>

              {item.name}
            </Link>
          );
        })}
      </div>

      {/* ================= MAIN ================= */}
      <div style={styles.main}>

        {/* ================= TOPBAR ================= */}
        <div style={styles.topbar}>

          <h1>
            Dashboard
          </h1>

          <div style={styles.userBox}>

            <div style={styles.avatar}>
              {user?.name
                ? user.name[0].toUpperCase()
                : "U"}
            </div>

            <div>

              <div>
                {user.name}
              </div>

              <div
                style={{
                  fontSize: 12,
                  color: "#94a3b8",
                }}
              >
                ₹{user.balance.toFixed(2)}
              </div>

            </div>
          </div>
        </div>

        {/* ================= CARDS ================= */}
        <div style={styles.cards}>

          <Card
            title="Total Balance"
            value={`₹${user.balance.toFixed(2)}`}
          />

          <Card
            title="Invested"
            value={`₹${user.invested.toFixed(2)}`}
          />

          <Card
            title="Total Profit"
            value={`₹${user.profit.toFixed(2)}`}
            color="#22c55e"
          />

          <Card
            title="Today's Profit"
            value={`₹${user.todayProfit.toFixed(2)}`}
            color="#22c55e"
          />

          <Card
            title="AI Accuracy"
            value={`${user.aiAccuracy}%`}
            color="#38bdf8"
          />

        </div>

        {/* ================= AI PANEL ================= */}
        {!location.pathname.includes(
          "ai-predictions"
        ) && (

          <div style={styles.aiPanel}>

            <button
              onClick={runAIPrediction}
              style={styles.aiButton}
              disabled={aiLoading}
            >
              {aiLoading
                ? "Running AI..."
                : "Run AI Prediction"}
            </button>

            {Array.isArray(aiData) &&
              aiData.length > 0 && (

                <div style={{ marginTop: 20 }}>

                  <h3>
                    AI Predictions
                  </h3>

                  <table
                    style={{
                      width: "100%",
                      borderCollapse:
                        "collapse",
                      marginTop: 10,
                    }}
                  >

                    <thead>

                      <tr
                        style={{
                          background:
                            "#0f172a",
                        }}
                      >

                        <th style={styles.th}>
                          Coin
                        </th>

                        <th style={styles.th}>
                          Signal
                        </th>

                        <th style={styles.th}>
                          Confidence
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {aiData.map(
                        (item, index) => {

                          const coin =
                            item?.stock ||
                            item?.symbol ||
                            item?.coin ||
                            "Unknown";

                          const signal =
                            item?.signal ||
                            "HOLD";

                          const confidence =
                            item?.confidence ??
                            0;

                          return (
                            <tr
                              key={index}
                              style={{
                                textAlign:
                                  "center",
                              }}
                            >

                              <td
                                style={
                                  styles.td
                                }
                              >
                                {String(
                                  coin
                                ).replace(
                                  "-USD",
                                  ""
                                )}
                              </td>

                              <td
                                style={
                                  styles.td
                                }
                              >

                                <span
                                  style={{
                                    color:
                                      signal ===
                                      "BUY"
                                        ? "#22c55e"
                                        : signal ===
                                          "SELL"
                                        ? "#ef4444"
                                        : "#facc15",

                                    fontWeight:
                                      "bold",
                                  }}
                                >
                                  {signal}
                                </span>

                              </td>

                              <td
                                style={
                                  styles.td
                                }
                              >
                                {confidence}%
                              </td>

                            </tr>
                          );
                        }
                      )}

                    </tbody>

                  </table>

                </div>
              )}

          </div>
        )}

        {/* ================= PAGE CONTENT ================= */}
        <div style={styles.content}>
          <Outlet />
        </div>

      </div>
    </div>
  );
}

// =====================================================
// CARD
// =====================================================

function Card({
  title,
  value,
  color = "#0ea5e9",
}) {
  return (
    <div style={styles.card}>

      <div
        style={{
          color: "#94a3b8",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: 22,
          fontWeight: "bold",
          color,
        }}
      >
        {value}
      </div>

    </div>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = {

  container: {
    display: "flex",
    height: "100vh",
    background: "#020617",
    color: "white",
  },

  sidebar: {
    width: 250,
    background: "#020617",
    borderRight:
      "1px solid #1e293b",
    padding: 20,
  },

  logo: {
    marginBottom: 30,
    color: "#0ea5e9",
  },

  menuItem: {
    display: "block",
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    textDecoration: "none",
  },

  main: {
    flex: 1,
    padding: "20px 30px",
    overflowY: "auto",
  },

  topbar: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: 20,
    borderBottom:
      "1px solid #1e293b",
    paddingBottom: 10,
  },

  userBox: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "#0ea5e9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
  },

  cards: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(200px,1fr))",
    gap: 15,
    marginBottom: 20,
  },

  card: {
    background: "#020617",
    padding: 20,
    borderRadius: 12,
    border:
      "1px solid #1e293b",
  },

  aiPanel: {
    marginBottom: 20,
  },

  aiButton: {
    background: "#0ea5e9",
    padding: "10px 20px",
    borderRadius: 8,
    color: "white",
    border: "none",
    cursor: "pointer",
  },

  th: {
    padding: "10px",
    borderBottom:
      "1px solid #1e293b",
  },

  td: {
    padding: "10px",
    borderBottom:
      "1px solid #1e293b",
  },

  content: {
    marginTop: 20,
  },
};
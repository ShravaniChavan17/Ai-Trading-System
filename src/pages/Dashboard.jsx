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

      if (!email) return;

      try {
        const res = await fetch(
          "https://ai-trading-system-1t02.onrender.com/api/auth/get-user",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
          }
        );

        const data = await res.json();

        if (!data.success) {
          navigate("/login");
          return;
        }

        if (!data.isVerified) {
          navigate(`/verify-otp?email=${email}`);
          return;
        }

        if (!data.isPinSet) {
          navigate(`/set-pin?email=${email}`);
          return;
        }

        if (!data.kycCompleted) {
          navigate(`/kyc-process?email=${email}`);
          return;
        }

      } catch (err) {
        console.error("AUTH FLOW ERROR:", err);
      }
    };

    checkAuthFlow();
  }, []);

  // ================= USER =================
  const [user, setUser] = useState({
    name: "Shravani",
    balance: 0,
    invested: 0,
    profit: 0,
    todayProfit: 0,
    aiAccuracy: 87
  });

  const [aiData, setAiData] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);

  // ================= LOAD DATA =================
  useEffect(() => {

    let savedWallet = parseFloat(localStorage.getItem("wallet"));

    // ✅ First-time initialization
    if (!savedWallet || isNaN(savedWallet)) {
      savedWallet = 100000;
      localStorage.setItem("wallet", savedWallet);
    }
    const savedPortfolio = JSON.parse(
      localStorage.getItem("portfolio") || "{}"
    );

    // Calculate invested amount
    const invested = Object.values(savedPortfolio).reduce((sum, p) => {
      return sum + (p.amount || 0);
    }, 0);

    // Calculate current value
    const currentValue = Object.entries(savedPortfolio).reduce(
      (sum, [symbol, p]) => {
        const currentPrice = 1200; // Replace with live price if available
        return sum + ((currentPrice / p.entry) * p.amount);
      },
      0
    );

    const profit = currentValue - invested;

setUser(prev => ({
  ...prev,
  balance: savedWallet,
  invested,
  profit,
  todayProfit: profit * 0.1
}));

    

    setUser(prev => ({
      ...prev,
      balance: savedWallet,
      invested,
      profit,
      todayProfit: profit * 0.1
    }));

  }, []);

  // ================= AI =================
  const runAIPrediction = async () => {
    try {
      setAiLoading(true);

      const coins = ["BTC-USD", "ETH-USD", "SOL-USD"];

      const results = await Promise.all(
        coins.map(async (coin) => {
          const res = await axios.get(
            `https://ai-trading-system-1t02.onrender.com/api/ai/predict/${coin}?t=${Date.now()}`
          );

          return res.data.data || res.data;
        })
      );

      setAiData(results);

    } catch (error) {
      console.error("AI error:", error);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    runAIPrediction();
  }, []);

  const menuItems = [
    { name: "Overview", path: "/dashboard/overview", icon: "📊" },
    { name: "Portfolio", path: "/dashboard/portfolio", icon: "💼" },
    { name: "AI Predictions", path: "/dashboard/ai-predictions", icon: "🤖" },
    { name: "Market", path: "/dashboard/market", icon: "📈" },
    { name: "Trade", path: "/dashboard/trade", icon: "🔁" },
    { name: "Trade History", path: "/dashboard/history", icon: "📜" },
    { name: "News Sentiment", path: "/dashboard/news", icon: "📰" },
    { name: "Auto Trading", path: "/dashboard/auto-trading", icon: "⚙️" }
  ];

  return (
    <div style={styles.container}>

      {/* Sidebar */}
      <div style={styles.sidebar}>
        <h2 style={styles.logo}>AI Trading</h2>

        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={index}
              to={item.path}
              style={{
                ...styles.menuItem,
                background: isActive ? "#0ea5e9" : "transparent",
                color: isActive ? "white" : "#cbd5e1"
              }}
            >
              <span style={{ marginRight: 10 }}>{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* Main */}
      <div style={styles.main}>

        {/* Navbar */}
        <div style={styles.topbar}>
          <h1>Dashboard</h1>

          <div style={styles.userBox}>
            <div style={styles.avatar}>
              {user?.name ? user.name[0] : "U"}
            </div>

            <div>
              <div>{user.name}</div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>
                ₹{user.balance.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div style={styles.cards}>
          <Card title="Total Balance" value={`₹${user.balance.toFixed(2)}`} />
          <Card title="Invested" value={`₹${user.invested.toFixed(2)}`} />
          <Card title="Total Profit" value={`₹${user.profit.toFixed(2)}`} color="#22c55e" />
          <Card title="Today's Profit" value={`₹${user.todayProfit.toFixed(2)}`} color="#22c55e" />
          <Card title="AI Accuracy" value={`${user.aiAccuracy}%`} color="#38bdf8" />
        </div>

        {/* AI PANEL */}
        {!location.pathname.includes("ai-predictions") && (
          <div style={styles.aiPanel}>

            <button onClick={runAIPrediction} style={styles.aiButton}>
              {aiLoading ? "Running AI..." : "Run AI Prediction"}
            </button>

            {Array.isArray(aiData) && aiData.length > 0 && (
              <div style={{ marginTop: "20px" }}>
                <h3>AI Predictions</h3>

                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
                  <thead>
                    <tr style={{ background: "#0f172a" }}>
                      <th style={styles.th}>Coin</th>
                      <th style={styles.th}>Signal</th>
                      <th style={styles.th}>Confidence</th>
                    </tr>
                  </thead>

                 <tbody>
  {aiData.map((item, index) => (
    <tr key={index} style={{ textAlign: "center" }}>

      <td style={styles.td}>
        {(item?.stock || item?.symbol || item?.coin || "Unknown").replace("-USD", "")}
      </td>

      <td style={styles.td}>
        <span
          style={{
            color:
              item?.signal === "BUY"
                ? "#22c55e"
                : item?.signal === "SELL"
                  ? "#ef4444"
                  : "#facc15",
            fontWeight: "bold"
          }}
        >
          {item?.signal || "HOLD"}
        </span>
      </td>

      <td style={styles.td}>
        {item?.confidence ?? 0}%
      </td>

    </tr>
  ))}
</tbody>
                </table>
              </div>
            )}

          </div>
        )}

        <div style={styles.content}>
          <Outlet />
        </div>

      </div>
    </div>
  );
}

function Card({ title, value, color = "#0ea5e9" }) {
  return (
    <div style={styles.card}>
      <div style={{ color: "#94a3b8" }}>{title}</div>
      <div style={{ fontSize: 22, fontWeight: "bold", color }}>
        {value}
      </div>
    </div>
  );
}

const styles = {
  container: { display: "flex", height: "100vh", background: "#020617", color: "white" },
  sidebar: { width: 250, background: "#020617", borderRight: "1px solid #1e293b", padding: 20 },
  logo: { marginBottom: 30, color: "#0ea5e9" },
  menuItem: { display: "block", padding: 12, marginBottom: 10, borderRadius: 8, textDecoration: "none" },
  main: { flex: 1, padding: "20px 30px", overflowY: "auto" },
  topbar: { display: "flex", justifyContent: "space-between", marginBottom: 20, borderBottom: "1px solid #1e293b", paddingBottom: 10 },
  userBox: { display: "flex", gap: 10, alignItems: "center" },
  avatar: { width: 40, height: 40, borderRadius: "50%", background: "#0ea5e9", display: "flex", alignItems: "center", justifyContent: "center" },
  cards: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 15, marginBottom: 20 },
  card: { background: "#020617", padding: 20, borderRadius: 12, border: "1px solid #1e293b" },
  aiPanel: { marginBottom: 20 },
  aiButton: { background: "#0ea5e9", padding: "10px 20px", borderRadius: 8, color: "white", border: "none" },
  th: { padding: "10px", borderBottom: "1px solid #1e293b" },
  td: { padding: "10px", borderBottom: "1px solid #1e293b" },
  content: { marginTop: 20 }
};
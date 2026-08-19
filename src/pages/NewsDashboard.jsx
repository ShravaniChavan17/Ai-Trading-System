

// import { useEffect, useState } from "react";
// import TradingChart from "../components/TradingChart";

// const NewsDashboard = () => {

//   const [news, setNews] = useState([]);
//   const [stock, setStock] = useState("tesla");
//   const [timeLeft, setTimeLeft] = useState(7200);
//   const [action, setAction] = useState(null);

//   // 💰 WALLET
//   const [balance, setBalance] = useState(100000);

//   // 📊 HISTORY
//   const [history, setHistory] = useState([]);

//   // 💹 PROFIT / LOSS
//   const [profit, setProfit] = useState(0);
//   const [loss, setLoss] = useState(0);

//   // FETCH NEWS (🔥 UPDATED WITH SORTING)
//   useEffect(() => {
//     fetch(`http://localhost:5001/api/news-signal/${stock}?t=${Date.now()}`)
//       .then(res => res.json())
//       .then(data => {
//         const sorted = data.sort((a, b) => {
//           const priority = (s) =>
//             s === "POSITIVE" || s === "NEGATIVE" ? 1 : 0;
//           return priority(b.sentiment) - priority(a.sentiment);
//         });

//         setNews(sorted);
//       });
//   }, [stock]);

//   // TIMER
//   useEffect(() => {
//     const timer = setInterval(() => {
//       setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
//     }, 1000);

//     return () => clearInterval(timer);
//   }, []);

//   const formatTime = () => {
//     const h = Math.floor(timeLeft / 3600);
//     const m = Math.floor((timeLeft % 3600) / 60);
//     const s = timeLeft % 60;
//     return `${h}h ${m}m ${s}s`;
//   };

//   const getColor = (signal) => {
//     if (signal === "BUY") return "#22c55e";
//     if (signal === "SELL") return "#ef4444";
//     return "#f59e0b";
//   };

//   const getSymbol = (stock) => {
//     if (stock === "tesla") return "NASDAQ:TSLA";
//     if (stock === "apple") return "NASDAQ:AAPL";
//     if (stock === "bitcoin") return "BINANCE:BTCUSDT";
//   };

//   const getImpactLevel = (sentiment) => {
//     if (sentiment === "POSITIVE" || sentiment === "NEGATIVE") return "HIGH";
//     return "MEDIUM";
//   };

//   const getImpactColor = (level) => {
//     if (level === "HIGH") return "#ef4444";
//     if (level === "MEDIUM") return "#f59e0b";
//     return "#22c55e";
//   };

//   const getFinalDecision = (sentiment, impact) => {
//     if (sentiment === "POSITIVE" && impact === "HIGH") return "BUY";
//     if (sentiment === "NEGATIVE" && impact === "HIGH") return "SELL";
//     return "HOLD";
//   };

//   // 💥 TRADE HANDLER
//   const handleTrade = (type) => {
//     setAction(type);

//     let newBalance = balance;

//     if (type === "BUY") {
//       newBalance -= 1000;
//       setLoss(prev => prev + 1000);
//     }

//     if (type === "SELL") {
//       newBalance += 1200;
//       setProfit(prev => prev + 200);
//     }

//     setBalance(newBalance);

//     const trade = {
//       type,
//       stock,
//       amount: 1000,
//       time: new Date().toLocaleTimeString()
//     };

//     setHistory(prev => [...prev, trade]);

//     console.log("💰 Balance:", newBalance);
//     console.log("📊 Trade History:", [...history, trade]);

//     alert(`✅ ${type} executed!`);
//   };

//   return (
//     <div style={{ padding: "20px", color: "white" }}>

//       <h2>📰 News Sentiment</h2>

//       {/* 💰 WALLET */}
//       <div style={box}>
//         💰 Wallet Balance: ₹{balance}
//       </div>

//       {/* 💹 PROFIT LOSS */}
//       <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
//         <div style={{ ...box, color: "#22c55e" }}>
//           Profit: ₹{profit}
//         </div>
//         <div style={{ ...box, color: "#ef4444" }}>
//           Loss: ₹{loss}
//         </div>
//       </div>

//       {/* DROPDOWN */}
//       <select value={stock} onChange={(e) => setStock(e.target.value)} style={select}>
//         <option value="tesla">Tesla</option>
//         <option value="apple">Apple</option>
//         <option value="bitcoin">Bitcoin</option>
//       </select>

//       {/* CHART */}
//       <h3>📈 Stock Trend</h3>
//       <TradingChart symbol={getSymbol(stock)} />

//       {/* BUTTONS */}
//       <div style={{ marginTop: "20px" }}>
//         <button style={btn("#22c55e")} onClick={() => handleTrade("BUY")}>BUY</button>
//         <button style={btn("#ef4444")} onClick={() => handleTrade("SELL")}>SELL</button>
//         <button style={btn("#f59e0b")} onClick={() => handleTrade("HOLD")}>HOLD</button>
//       </div>

//       {/* LAST ACTION */}
//       {action && <div style={box}>🧾 Last Action: {action}</div>}

//       {/* NEWS */}
//       <div style={{ marginTop: "20px" }}>
//         {news.map((item, index) => {
//           const impact = getImpactLevel(item.sentiment);
//           const decision = getFinalDecision(item.sentiment, impact);

//           return (
//             <div
//               key={index}
//               style={{
//                 ...card,
//                 border:
//                   (item.sentiment === "POSITIVE" || item.sentiment === "NEGATIVE")
//                     ? "2px solid #ef4444"
//                     : "1px solid #1e293b"
//               }}
//             >
//               <h4>{item.title}</h4>

//               <p style={{ color: "#94a3b8" }}>
//                 Sentiment: <b>{item.sentiment}</b>
//               </p>

//               <span style={signal(getColor(item.signal))}>
//                 {item.signal}
//               </span>

//               {/* 🔥 ORIGINAL FEATURE (UNCHANGED) */}
//               <div style={impactBox}>
//                 ⏱ Impact: <b style={{ color: getImpactColor(impact) }}>{impact}</b>
//                 <br />
//                 🕒 Time Left: <b>{formatTime()}</b>
//               </div>

//               <button onClick={() => handleTrade(decision)} style={aiBtn}>
//                 Execute AI Trade
//               </button>
//             </div>
//           );
//         })}
//       </div>

//       {/* 📊 TRADE HISTORY TABLE */}
//       <h3 style={{ marginTop: "30px" }}>📊 Trade History</h3>

//       <table style={table}>
//         <thead>
//           <tr>
//             <th>Type</th>
//             <th>Stock</th>
//             <th>Amount</th>
//             <th>Time</th>
//           </tr>
//         </thead>

//         <tbody>
//           {history.map((t, i) => (
//             <tr key={i}>
//               <td>{t.type}</td>
//               <td>{t.stock}</td>
//               <td>₹{t.amount}</td>
//               <td>{t.time}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//     </div>
//   );
// };

// /* STYLES */

// const box = {
//   background: "#0f172a",
//   padding: "10px",
//   borderRadius: "8px",
//   marginBottom: "10px"
// };

// const select = {
//   padding: "8px",
//   marginBottom: "15px"
// };

// const btn = (bg) => ({
//   background: bg,
//   color: "white",
//   padding: "10px",
//   marginRight: "10px",
//   border: "none",
//   borderRadius: "6px"
// });

// const card = {
//   background: "#020617",
//   padding: "15px",
//   marginBottom: "10px",
//   borderRadius: "10px",
//   border: "1px solid #1e293b"
// };

// const signal = (bg) => ({
//   background: bg,
//   padding: "5px",
//   borderRadius: "5px"
// });

// const impactBox = {
//   marginTop: "10px",
//   padding: "10px",
//   background: "#0f172a",
//   borderRadius: "8px"
// };

// const aiBtn = {
//   marginTop: "10px",
//   background: "#0ea5e9",
//   padding: "5px",
//   border: "none",
//   borderRadius: "5px"
// };

// const table = {
//   width: "100%",
//   marginTop: "10px",
//   borderCollapse: "collapse"
// };

// export default NewsDashboard;



import { useEffect, useState } from "react";
import TradingChart from "../components/TradingChart";

const NewsDashboard = () => {

  const [news, setNews] = useState([]);
  const [summary, setSummary] = useState({});
  const [stock, setStock] = useState("tesla");

  const [sentimentStats, setSentimentStats] = useState({
    bullish: 0,
    neutral: 0,
    bearish: 0
  });

  const [balance, setBalance] = useState(100000);
  const [profit, setProfit] = useState(0);
  const [loss, setLoss] = useState(0);
  const [history, setHistory] = useState([]);

  // ================= FETCH REAL DATA =================
  useEffect(() => {

    const fetchData = () => {
      fetch(`https://ai-trading-system-1t02.onrender.com/api/news-signal/${stock}?t=${Date.now()}`)
        .then(res => res.json())
        .then(data => {

          console.log("API DATA:", data);

          if (!data) return;

          // 🔥 SET NEWS + SUMMARY
          setNews(data.news || []);
          setSummary(data.summary || {});

          // 🔥 CALCULATE PERCENTAGES
          const total =
            (data.summary?.bullish || 0) +
            (data.summary?.bearish || 0) +
            (data.summary?.neutral || 0);

          if (total > 0) {
            setSentimentStats({
              bullish: (data.summary.bullish / total) * 100,
              bearish: (data.summary.bearish / total) * 100,
              neutral: (data.summary.neutral / total) * 100
            });
          }

        })
        .catch(err => console.error(err));
    };

    fetchData();

    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);

  }, [stock]);

  // ================= TRADE =================
  const handleTrade = (type) => {
    let newBalance = balance;

    if (type === "BUY") {
      newBalance -= 1000;
      setLoss(prev => prev + 1000);
    }

    if (type === "SELL") {
      newBalance += 1200;
      setProfit(prev => prev + 200);
    }

    setBalance(newBalance);

    setHistory(prev => [
      ...prev,
      {
        type,
        stock,
        amount: 1000,
        time: new Date().toLocaleTimeString()
      }
    ]);
  };

  const getSymbol = () => {
    if (stock === "tesla") return "NASDAQ:TSLA";
    if (stock === "apple") return "NASDAQ:AAPL";
    return "BINANCE:BTCUSDT";
  };

  const getSignalColor = () => {
    if (summary.marketSignal === "BUY") return "#22c55e";
    if (summary.marketSignal === "SELL") return "#ef4444";
    return "#f59e0b";
  };

  return (
    <div style={{ padding: 20, color: "white" }}>

      <h2>📰 AI News Sentiment Dashboard</h2>

      {/* 🧠 AI SUMMARY */}
      <div style={summaryBox}>
        <h3>🧠 AI Market Signal</h3>

        <p>
          Signal:
          <span style={{ color: getSignalColor(), marginLeft: 10 }}>
            {summary.marketSignal || "HOLD"}
          </span>
        </p>

        <p>Confidence: {summary.confidence || 0}%</p>
      </div>

      {/* 📊 BIAS BAR */}
      <div style={biasBox}>
        <h3>📊 Overall Daily Bias</h3>

        <div style={barWrapper}>
          <div style={{ ...bar, width: `${sentimentStats.bullish}%`, background: "#22c55e" }} />
          <div style={{ ...bar, width: `${sentimentStats.neutral}%`, background: "#64748b" }} />
          <div style={{ ...bar, width: `${sentimentStats.bearish}%`, background: "#ef4444" }} />
        </div>

        <div style={statsRow}>
          <span style={{ color: "#22c55e" }}>Bullish: {sentimentStats.bullish.toFixed(0)}%</span>
          <span style={{ color: "#64748b" }}>Neutral: {sentimentStats.neutral.toFixed(0)}%</span>
          <span style={{ color: "#ef4444" }}>Bearish: {sentimentStats.bearish.toFixed(0)}%</span>
        </div>
      </div>

      {/* 💰 WALLET */}
      <div style={box}>💰 Wallet: ₹{balance}</div>

      {/* PROFIT LOSS */}
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ ...box, color: "#22c55e" }}>Profit: ₹{profit}</div>
        <div style={{ ...box, color: "#ef4444" }}>Loss: ₹{loss}</div>
      </div>

      {/* STOCK SELECT */}
      <select value={stock} onChange={(e) => setStock(e.target.value)} style={select}>
        <option value="tesla">Tesla</option>
        <option value="apple">Apple</option>
        <option value="bitcoin">Bitcoin</option>
      </select>

      {/* 📈 CHART */}
      <TradingChart symbol={getSymbol()} />

      {/* 🔥 AUTO TRADE BUTTON */}
      <div style={{ marginTop: 20 }}>
        <button
          style={btn("#22c55e")}
          onClick={() => handleTrade(summary.marketSignal || "HOLD")}
        >
          Execute {summary.marketSignal}
        </button>
      </div>

      {/* 📰 NEWS */}
      <div style={newsBox}>
        <h3>📰 Latest News</h3>

        {news.map((n, i) => (
          <div key={i} style={newsCard}>
            <p>{n.title}</p>
            <span style={{ color: getSignalColor() }}>
              {n.sentiment}
            </span>
          </div>
        ))}
      </div>

      {/* 📊 HISTORY */}
      <h3>📊 Trade History</h3>

      <table style={table}>
        <thead>
          <tr>
            <th>Type</th>
            <th>Stock</th>
            <th>Amount</th>
            <th>Time</th>
          </tr>
        </thead>

        <tbody>
          {history.map((t, i) => (
            <tr key={i}>
              <td>{t.type}</td>
              <td>{t.stock}</td>
              <td>₹{t.amount}</td>
              <td>{t.time}</td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
};

/* ================= STYLES ================= */

const summaryBox = {
  background: "#020617",
  padding: 20,
  borderRadius: 12,
  marginBottom: 20,
  border: "1px solid #1e293b"
};

const biasBox = {
  background: "#0f172a",
  padding: 20,
  borderRadius: 12,
  marginBottom: 20
};

const barWrapper = {
  display: "flex",
  height: 20,
  borderRadius: 10,
  overflow: "hidden"
};

const bar = { height: "100%" };

const statsRow = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: 10
};

const box = {
  background: "#0f172a",
  padding: 10,
  borderRadius: 8,
  marginTop: 10
};

const select = { padding: 8, marginTop: 10 };

const btn = (bg) => ({
  background: bg,
  color: "white",
  padding: 10,
  border: "none",
  borderRadius: 6
});

const newsBox = {
  marginTop: 20
};

const newsCard = {
  background: "#0f172a",
  padding: 10,
  marginBottom: 10,
  borderRadius: 8
};

const table = {
  width: "100%",
  marginTop: 20
};

export default NewsDashboard;
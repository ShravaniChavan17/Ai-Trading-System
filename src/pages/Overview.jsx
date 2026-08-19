// import React, { useEffect, useState } from "react";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Tooltip,
//   Legend,
//   Filler
// } from "chart.js";
// import { Line } from "react-chartjs-2";

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Tooltip,
//   Legend,
//   Filler
// );

// export default function Overview() {

//   const [portfolio, setPortfolio] = useState([]);
//   const [holdings, setHoldings] = useState([]);
//   const [signals, setSignals] = useState([]);
//   const [market, setMarket] = useState([]);

//   useEffect(() => {

//     // Portfolio chart data
//     setPortfolio([100000, 102000, 101500, 108000, 112000, 120000, 125000]);

//     // Holdings
//     setHoldings([
//       { symbol: "RELIANCE", qty: 10, buy: 2500, current: 2620 },
//       { symbol: "TCS", qty: 5, buy: 3200, current: 3150 },
//       { symbol: "INFY", qty: 8, buy: 1400, current: 1520 }
//     ]);

//     // AI signals
//     setSignals([
//       { symbol: "RELIANCE", signal: "BUY", confidence: 92 },
//       { symbol: "TCS", signal: "SELL", confidence: 84 },
//       { symbol: "INFY", signal: "HOLD", confidence: 71 }
//     ]);

//     // Market
//     setMarket([
//       { symbol: "NIFTY 50", price: 22450, change: 0.85 },
//       { symbol: "BANKNIFTY", price: 48200, change: -0.42 },
//       { symbol: "SENSEX", price: 73450, change: 1.12 }
//     ]);

//   }, []);

//   const chartData = {
//     labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
//     datasets: [
//       {
//         label: "Portfolio Value",
//         data: portfolio,
//         borderColor: "#22c55e",
//         backgroundColor: "rgba(34,197,94,0.2)",
//         fill: true,
//         tension: 0.4
//       }
//     ]
//   };

//   const chartOptions = {
//     plugins: {
//       legend: {
//         labels: { color: "white" }
//       }
//     },
//     scales: {
//       x: {
//         ticks: { color: "white" }
//       },
//       y: {
//         ticks: { color: "white" }
//       }
//     }
//   };

//   return (
//     <div>

//       {/* Chart */}
//       <div style={styles.card}>
//         <h3>Portfolio Performance</h3>
//         <Line data={chartData} options={chartOptions} />
//       </div>

//       {/* Grid */}
//       <div style={styles.grid}>

//         {/* Holdings */}
//         <div style={styles.card}>
//           <h3>Holdings</h3>
//           {holdings.map((h, i) => {
//             const profit = (h.current - h.buy) * h.qty;
//             return (
//               <div key={i} style={styles.row}>
//                 <div>{h.symbol}</div>
//                 <div>{h.qty}</div>
//                 <div>₹{h.current}</div>
//                 <div style={{
//                   color: profit >= 0 ? "#22c55e" : "#ef4444"
//                 }}>
//                   ₹{profit}
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         {/* AI Predictions */}
//         <div style={styles.card}>
//           <h3>AI Predictions</h3>
//           {signals.map((s, i) => (
//             <div key={i} style={styles.row}>
//               <div>{s.symbol}</div>
//               <div style={{
//                 color:
//                   s.signal === "BUY"
//                     ? "#22c55e"
//                     : s.signal === "SELL"
//                     ? "#ef4444"
//                     : "#eab308"
//               }}>
//                 {s.signal}
//               </div>
//               <div>{s.confidence}%</div>
//             </div>
//           ))}
//         </div>

//         {/* Market Watchlist */}
//         <div style={styles.card}>
//           <h3>Market Watchlist</h3>
//           {market.map((m, i) => (
//             <div key={i} style={styles.row}>
//               <div>{m.symbol}</div>
//               <div>₹{m.price}</div>
//               <div style={{
//                 color: m.change >= 0 ? "#22c55e" : "#ef4444"
//               }}>
//                 {m.change}%
//               </div>
//             </div>
//           ))}
//         </div>

//       </div>

//     </div>
//   );
// }

// const styles = {

//   card: {
//     background: "#020617",
//     border: "1px solid #1e293b",
//     borderRadius: 12,
//     padding: 20,
//     marginBottom: 20
//   },

//   grid: {
//     display: "grid",
//     gridTemplateColumns: "1fr 1fr",
//     gap: 20
//   },

//   row: {
//     display: "flex",
//     justifyContent: "space-between",
//     padding: 10,
//     borderBottom: "1px solid #1e293b"
//   }

// };

import { useNavigate } from "react-router-dom";
import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  Legend
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  Legend
);

export default function Overview() {

  const [btc, setBtc] = useState([]);
  const [eth, setEth] = useState([]);
  const [sol, setSol] = useState([]);
  const [labels, setLabels] = useState([]);

  const wsBTC = useRef(null);
  const wsETH = useRef(null);
  const wsSOL = useRef(null);

  const navigate = useNavigate();

  const [holdings, setHoldings] = useState([]);
  const [signals, setSignals] = useState([]);
  const [market, setMarket] = useState([]);

  // 🔥 LIVE PRICE STREAM
  useEffect(() => {

    wsBTC.current = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@trade");
    wsETH.current = new WebSocket("wss://stream.binance.com:9443/ws/ethusdt@trade");
    wsSOL.current = new WebSocket("wss://stream.binance.com:9443/ws/solusdt@trade");

    wsBTC.current.onmessage = (e) => {
      const price = parseFloat(JSON.parse(e.data).p);
      setBtc(p => [...p.slice(-20), price]);
      setLabels(p => [...p.slice(-20), new Date().toLocaleTimeString()]);
    };

    wsETH.current.onmessage = (e) => {
      const price = parseFloat(JSON.parse(e.data).p);
      setEth(p => [...p.slice(-20), price]);
    };

    wsSOL.current.onmessage = (e) => {
      const price = parseFloat(JSON.parse(e.data).p);
      setSol(p => [...p.slice(-20), price]);
    };

    return () => {
      wsBTC.current.close();
      wsETH.current.close();
      wsSOL.current.close();
    };

  }, []);

  // 🔥 MARKET + HOLDINGS
  useEffect(() => {

    const fetchMarketData = async () => {
      try {
        const res = await fetch("https://api.binance.com/api/v3/ticker/24hr");
        const data = await res.json();

        const getData = (symbol) =>
          data.find(d => d.symbol === symbol);

        setHoldings([
          {
            symbol: "BTCUSDT",
            qty: 0.5,
            buy: 65000,
            current: parseFloat(getData("BTCUSDT")?.lastPrice)
          },
          {
            symbol: "ETHUSDT",
            qty: 2,
            buy: 1900,
            current: parseFloat(getData("ETHUSDT")?.lastPrice)
          },
          {
            symbol: "SOLUSDT",
            qty: 10,
            buy: 75,
            current: parseFloat(getData("SOLUSDT")?.lastPrice)
          }
        ]);

        setMarket([
          {
            symbol: "BTCUSDT",
            price: parseFloat(getData("BTCUSDT")?.lastPrice),
            change: parseFloat(getData("BTCUSDT")?.priceChangePercent)
          },
          {
            symbol: "ETHUSDT",
            price: parseFloat(getData("ETHUSDT")?.lastPrice),
            change: parseFloat(getData("ETHUSDT")?.priceChangePercent)
          },
          {
            symbol: "SOLUSDT",
            price: parseFloat(getData("SOLUSDT")?.lastPrice),
            change: parseFloat(getData("SOLUSDT")?.priceChangePercent)
          }
        ]);

      } catch (err) {
        console.error(err);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 5000);

    return () => clearInterval(interval);

  }, []);

  // 🔥 AI PREDICTIONS
  useEffect(() => {

    const fetchAI = async () => {
      try {
        const coins = ["BTC-USD", "ETH-USD", "SOL-USD"];

        const results = await Promise.all(
          coins.map(c =>
            axios.get(`http://localhost:5001/api/ai/predict/${c}`)
          )
        );

        setSignals(results.map(r => r.data.data));

      } catch (err) {
        console.log("AI error:", err);
      }
    };

    fetchAI();

  }, []);

  return (
    <div>

      {/* 🔥 DATA GRID */}
      <div style={styles.grid}>

        {/* Holdings */}
        <div style={styles.card}>
          <h3>Holdings</h3>
          {holdings.map((h, i) => {
            const profit = (h.current - h.buy) * h.qty;
            return (
              <div key={i} style={styles.row}>
                <div>{h.symbol}</div>
                <div>{h.qty}</div>
                <div>₹{h.current ? h.current.toFixed(2) : "--"}</div>
                <div style={{ color: profit >= 0 ? "#22c55e" : "#ef4444" }}>
                  ₹{profit.toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Market Watchlist with Graph */}
        <div style={styles.card}>
          <h3>Market Watchlist</h3>

          {market.map((m, i) => (
            <div
              key={i}
              style={styles.marketRow}
              onClick={() => navigate(`/chart/${m.symbol}`)}
            >

              <div style={styles.marketLeft}>
                <div style={styles.logo}>📊</div>
                <div>{m.symbol}</div>
              </div>

              <div style={{ width: 120, height: 40 }}>
                <Line
                  data={{
                    labels: labels?.slice(-15) || [],
                    datasets: [
                      {
                        data:
                          m.symbol === "BTCUSDT"
                            ? (btc?.slice(-15) || [])
                            : m.symbol === "ETHUSDT"
                            ? (eth?.slice(-15) || [])
                            : (sol?.slice(-15) || []),
                        borderColor: "#22c55e",
                        tension: 0.4,
                        pointRadius: 0
                      }
                    ]
                  }}
                  options={{
                    plugins: { legend: { display: false } },
                    scales: { x: { display: false }, y: { display: false } }
                  }}
                />
              </div>

              <div>₹{m.price ? m.price.toFixed(2) : "--"}</div>

              <div style={{
                color: m.change >= 0 ? "#22c55e" : "#ef4444"
              }}>
                {m.change ? m.change.toFixed(2) : "--"}%
              </div>

            </div>
          ))}
        </div>

        {/* AI Predictions */}
        <div style={styles.card}>
          <h3>AI Predictions</h3>
          {signals.map((s, i) => (
  <div key={i} style={styles.row}>
    
    {/* ✅ STOCK NAME FIX */}
    <div>
      {(s.stock || s.symbol || "BTC").replace("-USD", "")}
    </div>

    <div style={{
      color:
        s.signal === "BUY"
          ? "#22c55e"
          : s.signal === "SELL"
          ? "#ef4444"
          : "#eab308"
    }}>
      {s.signal}
    </div>

    <div>{s.confidence}%</div>

  </div>
))}
        </div>

      </div>

    </div>
  );
}

const styles = {
  card: {
    background: "#020617",
    border: "1px solid #1e293b",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    padding: 10,
    borderBottom: "1px solid #1e293b"
  },
  marketRow: {
    display: "grid",
    gridTemplateColumns: "2fr 2fr 1fr 1fr",
    alignItems: "center",
    padding: 10,
    borderBottom: "1px solid #1e293b",
    cursor: "pointer"
  },
  marketLeft: {
    display: "flex",
    alignItems: "center",
    gap: 10
  },
  logo: {
    width: 30,
    height: 30,
    background: "#1e293b",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6
  }
};
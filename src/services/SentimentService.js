export const getSentiment = async (coin) => {
  try {
    const response = await fetch("https://ai-trading-system-1t02.onrender.com/sentiment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ coin })
    });

    const data = await response.json();
    return data.sentiment;
  } catch (error) {
    console.error(error);
    return "NEUTRAL";
  }
};
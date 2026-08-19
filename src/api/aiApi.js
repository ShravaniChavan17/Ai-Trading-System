import axios from "axios"

const API_URL = "https://ai-trading-system-1t02.onrender.com/api/ai/predict"

export async function fetchPrediction(symbol, timeframe) {

    const response = await axios.post(API_URL, {
        symbol,
        timeframe
    })

    return response.data
}
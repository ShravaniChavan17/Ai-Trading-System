import axios from "axios"

const API_URL = "http://localhost:5000/api/ai/predict"

export async function fetchPrediction(symbol, timeframe) {

    const response = await axios.post(API_URL, {
        symbol,
        timeframe
    })

    return response.data
}
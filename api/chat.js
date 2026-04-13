export default async function handler(req, res) {
    try {
        const { image, mimeType } = req.body;

        if (!image) {
            return res.status(400).json({ error: "No image received" });
        }

        const API_KEY = process.env.GROQ_API_KEY;

        // 1. Updated Model to Llama 4 Scout (Production Vision Model)
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "meta-llama/llama-4-scout-17b-16e-instruct", 
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: "Analyze this Japanese auction sheet. Extract grade, chassis, damage, and risk."
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:${mimeType};base64,${image}`
                                }
                            }
                        ]
                    }
                ],
                temperature: 0.1 // Keeps OCR extraction precise
            })
        });

        // 2. Safe JSON Parsing
        const data = await response.json();

        if (!response.ok) {
            console.error("Groq API Error:", data);
            return res.status(response.status).json({
                error: data.error?.message || "Groq API failed"
            });
        }

        return res.status(200).json({
            result: data.choices?.[0]?.message?.content || "No AI response"
        });

    } catch (error) {
        console.error("Server crash:", error);
        // Ensure we always return JSON, even on a crash
        return res.status(500).json({
            error: "Internal Server Error",
            details: error.message
        });
    }
}

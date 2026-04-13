export default async function handler(req, res) {
    try {
        const { image, mimeType } = req.body;

        if (!image) {
            return res.status(400).json({ error: "No image received" });
        }

        const API_KEY = process.env.GROQ_API_KEY;

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                // Updated to the current production-ready vision model
                model: "llama-3.2-11b-vision-preview", 
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
                // Optional: Adjust temperature for more consistent OCR extraction
                temperature: 0.1 
            })
        });

        const data = await response.json();

        // Log the full response for debugging during the model transition
        console.log("Groq Response Status:", response.status);

        if (!response.ok) {
            return res.status(response.status).json({
                error: data.error?.message || "Groq API request failed"
            });
        }

        return res.status(200).json({
            result: data.choices?.[0]?.message?.content || "No AI response"
        });

    } catch (error) {
        console.error("Server error:", error);
        return res.status(500).json({
            error: error.message
        });
    }
}

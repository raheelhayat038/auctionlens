export default async function handler(req, res) {
    try {
        const { image, mimeType } = req.body;
        const API_KEY = process.env.GROQ_API_KEY;

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
                        role: "system",
                        content: "You are a data extractor. Extract data from Japanese auction sheets into short, 1-3 word bullet points. No conversational text."
                    },
                    {
                        role: "user",
                        content: [
                            { type: "text", text: "MODEL, GRADE, CHASSIS, DAMAGE." },
                            {
                                type: "image_url",
                                image_url: { url: `data:${mimeType};base64,${image}` }
                            }
                        ]
                    }
                ],
                temperature: 0.0, // Absolute consistency
                max_tokens: 150   // Limits the response length physically
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ error: data.error?.message || "Groq Error" });
        }

        return res.status(200).json({
            result: data.choices?.[0]?.message?.content || "No data found."
        });

    } catch (error) {
        console.error("Backend Error:", error);
        return res.status(500).json({ error: error.message });
    }
}

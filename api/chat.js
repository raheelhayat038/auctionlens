export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

    try {
        const { image, mimeType } = req.body;
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "meta-llama/llama-4-scout-17b-16e-instruct", 
                messages: [
                    {
                        role: "system",
                        content: `You are an expert Auction Inspector. Extract data and provide SHORT, 1-paragraph descriptions.
                        FORMAT EXACTLY:
                        YEAR: [val]
                        MAKE: [val]
                        MODEL: [val]
                        GRADE: [val]
                        CHASSIS: [val]
                        SUMMARY: [One concise paragraph of overall condition]
                        INTERIOR: [One concise paragraph listing key cabin flaws]
                        EXTERIOR: [One concise paragraph explaining diagram marks]
                        VERDICT: [One short sentence: BUY, CAUTION, or AVOID]`
                    },
                    {
                        role: "user",
                        content: [
                            { type: "text", text: "Analyze this sheet. Keep every section to exactly one paragraph. No bullet points." },
                            { type: "image_url", image_url: { url: `data:${mimeType};base64,${image}` } }
                        ]
                    }
                ],
                temperature: 0.1,
                max_tokens: 500 // Lowered to force conciseness
            })
        });

        const data = await response.json();
        res.status(200).json({ result: data.choices[0].message.content });
    } catch (e) { res.status(500).json({ error: e.message }); }
}

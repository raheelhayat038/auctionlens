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
                        content: "Extract data from Japanese auction sheets. Format: Grade: [val], Chassis: [val], Diagram: [marks]. If Grade is 4.5/5 but damage marks (W/XX) exist, add 'POTENTIALLY TAMPERED'."
                    },
                    {
                        role: "user",
                        content: [
                            { type: "text", text: "Extract: Grade, Chassis, and Diagram marks." },
                            { type: "image_url", image_url: { url: `data:${mimeType};base64,${image}` } }
                        ]
                    }
                ],
                temperature: 0,
                max_tokens: 250
            })
        });

        const data = await response.json();
        res.status(200).json({ result: data.choices[0].message.content });
    } catch (e) { res.status(500).json({ error: e.message }); }
}

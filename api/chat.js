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
                        content: "Extract auction data. Format exactly as: Year: [val], Make: [val], Model: [val], Grade: [val], Chassis: [val], Notes: [short summary], Diagram: [marks]. If Grade 4.5+ but has W/XX marks, add 'POTENTIALLY TAMPERED'."
                    },
                    {
                        role: "user",
                        content: [
                            { type: "text", text: "Identify Year, Make, Model, Grade, Chassis, Inspector Notes summary, and Diagram marks." },
                            { type: "image_url", image_url: { url: `data:${mimeType};base64,${image}` } }
                        ]
                    }
                ],
                temperature: 0,
                max_tokens: 500
            })
        });

        const data = await response.json();
        res.status(200).json({ result: data.choices[0].message.content });
    } catch (e) { res.status(500).json({ error: e.message }); }
}

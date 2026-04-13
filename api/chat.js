// ... inside your handler function ...
body: JSON.stringify({
    // UPDATE THIS LINE
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
    temperature: 0.1 // Keeping this low helps with accurate OCR extraction
})

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    const { text } = request.body;
    if (!text) {
        return response.status(400).json({ error: 'Text is required' });
    }

    try {
        const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer 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`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://draft-aiy.vercel.app/",
                "X-Title": "Draft AIY"
            },
            body: JSON.stringify({
                model: "meta-llama/llama-3.3-70b-instruct",
                messages: [
                    {
                        role: "system",
                        content: "You are the Cognitive Core agent of Draft AIY. Given a draft text, rephrase it into up to 5 highly concise keywords or core concepts separated by a middot (·). Example: Protocol · Zero-Illusion · Execution. Output ONLY the keywords."
                    },
                    { role: "user", content: text }
                ]
            })
        });

        const data = await aiResponse.json();
        if (data.error) throw new Error(data.error.message);

        const resultText = data.choices[0].message.content.trim();
        return response.status(200).json({ result: resultText });
    } catch (error) {
        console.error("OpenRouter Error:", error);
        return response.status(500).json({ error: error.message || 'Error communicating with Cognitive Core' });
    }
}

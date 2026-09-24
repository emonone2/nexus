const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const MODEL = "gemini-3.8-flash";

export async function askGemini(prompt, systemInstruction = "You are Gemini, a helpful social assistant.") {
  if (!API_KEY) {
    console.warn("VITE_GEMINI_API_KEY not found in environment variables. Falling back to Mock responses.");
    return mockResponse(prompt);
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        }
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || "Gemini API Error");
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response text found.";
  } catch (err) {
    console.error("Gemini API call failed, using mock fallback:", err);
    return mockResponse(prompt);
  }
}

export async function chatWithGemini(messages, systemInstruction = "You are Gemini, the official AI Companion for the Nexus Social platform. Be conversational, intelligent, engaging, and friendly. Help with code, design, or social chat!") {
  if (!API_KEY) {
    return mockResponse(messages[messages.length - 1]?.text || "");
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
    
    // Map standard messages array to Gemini contents structure
    const contents = messages.slice(-15).map(msg => ({
      role: msg.sender === "me" ? "user" : "model",
      parts: [{ text: msg.text }]
    }));

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        }
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || "Gemini API Error");
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response text found.";
  } catch (err) {
    console.error("Gemini Chat API call failed, using mock fallback:", err);
    return mockResponse(messages[messages.length - 1]?.text || "");
  }
}

function mockResponse(prompt) {
  const p = prompt.toLowerCase();
  if (p.includes("hello") || p.includes("hi")) {
    return "Hello there! I am your Gemini AI Assistant on Nexus. How can I brighten your day today? ✨";
  }
  if (p.includes("help")) {
    return "I would love to help! I can write posts, design outlines, code React apps, or just hang out. What are we working on?";
  }
  if (p.includes("post") || p.includes("write")) {
    return "Here is a draft post for you:\n\n'Just exploring the future of social networking on Nexus! The design, speed, and real-time features are incredible. ✨🚀 #NexusFuture #NextGen'";
  }
  return `That sounds interesting! As your Gemini AI Assistant on Nexus, I am here to help you design, code, write posts, and connect with friends. Let me know what you'd like to do next! 🌟`;
}

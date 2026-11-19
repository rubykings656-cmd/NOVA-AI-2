
export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    const json = (data, status = 200) =>
      new Response(JSON.stringify(data), {
        status,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    if (request.method === "GET") {
      return json({
        status: "online",
        name: "NOVA AI 2.0",
        company: "MESLER TECHNOLOGIES"
      });
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }

    if (!env.OPENROUTER_API_KEY) {
      return json({ error: "AI service is not configured." }, 500);
    }

    try {
      const body = await request.json();
      const message = body?.message;

      if (typeof message !== "string" || !message.trim()) {
        return json({ error: "Please enter a message." }, 400);
      }

      if (message.length > 4000) {
        return json({ error: "Message is too long." }, 400);
      }

      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: env.AI_MODEL || "openai/gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: "You are NOVA AI, a helpful AI assistant created by MESLER TECHNOLOGIES. Be accurate, clear, friendly and safe."
              },
              {
                role: "user",
                content: message.trim()
              }
            ]
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        return json({
          error: "AI provider request failed.",
          details: result.error?.message || "Please try again later."
        }, 502);
      }

      const reply = result.choices?.[0]?.message?.content;

      if (!reply) {
        return json({ error: "The AI returned no reply." }, 502);
      }

      return json({ reply });

    } catch (error) {
      return json({
        error: "NOVA AI could not process your request."
      }, 500);
    }
  }
};

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    try {
      const body = await request.json();

      if (!body.prompt || typeof body.prompt !== "string") {
        return new Response(
          JSON.stringify({ error: "Invalid or missing prompt" }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }

      const prompt = body.prompt.trim();

      // Use the built-in AI binding
      const result = await env.ai.run(
        "@cf/stabilityai/stable-diffusion-xl-base-1.0",
        { prompt }
      );

      // Debug log
      console.log("AI Result:", JSON.stringify(result));

      if (!result || Object.keys(result).length === 0) {
        return new Response(
          JSON.stringify({ error: "AI model returned an empty result." }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }

      return new Response(JSON.stringify({ result }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (err) {
      console.error("Error during image generation:", err);

      return new Response(
        JSON.stringify({ error: err.message || "Unexpected error" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  },
};

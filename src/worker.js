export default {
  async fetch(request, env, ctx) {
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
      console.log("Received POST body:", JSON.stringify(body));

      const prompt = body.prompt?.trim();
      if (!prompt) {
        console.log("Invalid prompt:", prompt);
        return new Response(JSON.stringify({ error: "Missing prompt" }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }

      console.log("Calling Stability model with prompt:", prompt);

      const imageStream = await env.ai.run(
        "@cf/stabilityai/stable-diffusion-xl-base-1.0",
        { prompt }
      );

      return new Response(imageStream, {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (err) {
      console.error("Worker POST failed:", err.stack || err.message || err);
      return new Response(JSON.stringify({ error: "Internal Error", detail: err.message }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  },
};

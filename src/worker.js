export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const { prompt } = await request.json();

      const aiResponse = await fetch("https://api.cloudflare.com/client/v4/accounts/48c282dc6802f0eda22f52bd973920fe/ai/run/@cf/meta/stabilityai/stable-diffusion-xl-base-1.0", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${env.CLOUDFLARE_API_TOKEN}`
        },
        body: JSON.stringify({ prompt })
      });

      const result = await aiResponse.json();

      if (result.success && result.result && result.result.length > 0) {
        return new Response(JSON.stringify({ result: result.result }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } else {
        return new Response(JSON.stringify({ error: "Failed to generate image", details: result }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  }
}

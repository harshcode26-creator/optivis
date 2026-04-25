const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const REQUEST_TIMEOUT_MS = 7000;

const FALLBACK_MODELS = [
  "inclusionai/ling-2.6-1t:free", 
  "inclusionai/ling-2.6-flash:free",
  "liquid/lfm-2.5-1.2b-thinking:free",
  "liquid/lfm-2.5-1.2b-instruct:free",
  "nvidia/nemotron-3-nano-30b-a3b:free"


  // "tencent/hy3-preview:free",
  // "z-ai/glm-4.5-air:free",
  // "baidu/qianfan-ocr-fast:free",
  // "google/gemma-4-26b-a4b-it:free",
  // "google/gemma-4-31b-it:free",
  // "google/lyria-3-pro-preview",
  // "google/lyria-3-clip-preview",
  // "nvidia/nemotron-3-super-120b-a12b:free",
  // "minimax/minimax-m2.5:free",
  // "nvidia/nemotron-nano-12b-v2-vl:free",
  // "qwen/qwen3-next-80b-a3b-instruct:free",
  // "nvidia/nemotron-nano-9b-v2:free",
  // "openai/gpt-oss-20b:free",
  // "openai/gpt-oss-20b:free",
  // "z-ai/glm-4.5-air:free",
  // "qwen/qwen3-coder:free",
  // "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
  // "nousresearch/hermes-3-llama-3.1-405b:free",
  // "google/gemma-3n-e2b-it:free",
  // "google/gemma-3-4b-it:free",
  // "google/gemma-3-27b-it:free",
  // "meta-llama/llama-3.2-3b-instruct:free"
];

const buildInsightsPrompt = (text) => `Analyze the following employee check-in responses.

Tasks:
1. Identify main blockers (short phrases)
2. Determine overall sentiment (positive, neutral, negative)
3. Provide a 1-line summary

Return ONLY JSON:

{
  "blockers": [],
  "sentiment": "",
  "summary": ""
}

Responses:
${text}`;

const safeJsonParse = (value) => {
  if (!value || typeof value !== "string") {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    const fencedMatch = value.match(/```json\s*([\s\S]*?)\s*```/i);

    if (fencedMatch?.[1]) {
      try {
        return JSON.parse(fencedMatch[1]);
      } catch {
        return null;
      }
    }

    const jsonMatch = value.match(/\{[\s\S]*\}/);

    if (!jsonMatch?.[0]) {
      return null;
    }

    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      return null;
    }
  }
};

const normalizeInsights = (data) => {
  if (!data || typeof data !== "object") {
    return null;
  }

  return {
    blockers: Array.isArray(data.blockers)
      ? data.blockers.filter((item) => typeof item === "string")
      : [],
    sentiment: typeof data.sentiment === "string" ? data.sentiment : "",
    summary: typeof data.summary === "string" ? data.summary : "",
  };
};

const callOpenRouterModel = async (model, text) => {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return null;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "user",
            content: buildInsightsPrompt(text),
          },
        ],
      }),
      signal: controller.signal,
    });

    const rawBody = await response.text();
    const parsedBody = safeJsonParse(rawBody);

    if (!response.ok) {
      throw new Error(parsedBody?.error?.message || `OpenRouter request failed with ${response.status}`);
    }

    const content = parsedBody?.choices?.[0]?.message?.content;
    const parsedInsights = normalizeInsights(safeJsonParse(content));

    return parsedInsights;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const generateInsights = async (text = "") => {
  const inputText = typeof text === "string" ? text.trim() : "";

  if (!inputText) {
    return null;
  }

  for (const model of FALLBACK_MODELS) {
    try {
      const result = await callOpenRouterModel(model, inputText);
      console.log("Trying model:", model);

      if (result) {
        return result;
        console.log(result);
      }
    } catch (error) {
      console.error(`OpenRouter model failed: ${model}`, error.message);
    }
  }

  return null;
};

export { FALLBACK_MODELS, buildInsightsPrompt };
export default generateInsights;

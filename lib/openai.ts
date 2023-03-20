const headers = {
  Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  "Content-Type": "application/json",
};

const url = "https://api.openai.com/v1/chat/completions";

export async function fetchOpenAI(body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(
      `Bad response from OpenAI API: ${res.status} ${res.statusText}`
    );
  }
  const result = await res.json();
  return result?.choices?.[0]?.message?.content;
}

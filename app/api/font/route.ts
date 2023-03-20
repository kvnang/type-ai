import { NextResponse } from "next/server";

export const runtime = "edge";

const system = {
  role: "system",
  content: `You know everything about the history and modern usage of typography. You have very strong opinions about which typefaces are good and for which purpose. 
  The user will give a prompt and you will recommend free fonts for their needs that are available on Google Fonts. 
  Do not suggest fonts that are not on the Google Fonts list. Respond only with a valid JSON object that has three fields: 
   'message': a short message to the user with your recommendation, 
   'recommendation': an array of objects with the font category (e.g. heading, body), the font name, and appropriate font weight (e.g. {category: 'heading', name: 'Roboto', weight: 700}),
  And ensure that the JSON object is the only thing in the response and is valid and properly escaped.`,
};

const headers = {
  Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  "Content-Type": "application/json",
};

const url = "https://api.openai.com/v1/chat/completions";

async function fetchFromApi(body: unknown) {
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

async function getSampleText(message: string) {
  const body = {
    model: "gpt-3.5-turbo",
    temperature: 1.5,
    messages: [
      {
        role: "user",
        content: `Respond with a Markdown string only. Try to combine various headings (#, ##, ###). Please write a 300-word essay with a subtle, witty reference to this message: ${message}`,
      },
    ],
  };

  const response = await fetchFromApi(body);

  return JSON.parse(JSON.stringify({ sample: response }));
}

async function getResponse(message: string) {
  const body = {
    model: "gpt-3.5-turbo",
    temperature: 1.5,
    messages: [
      system,
      {
        role: "user",
        content: `Respond with a JSON object only. My request: ${message}`,
      },
    ],
  };

  try {
    console.log("Fetching response");
    const response = await fetchFromApi(body);
    console.log("DONE Fetching response");

    try {
      const { message, recommendation } = JSON.parse(response);
      return { message, recommendation };
    } catch (e) {
      console.log(`ERROR ${e}`);
      console.log("retrying ...");
      // Retry once, letting the API know that the response was bad
      body.messages.push({
        role: "user",
        content: `Your response was not valid JSON. The error was "${
          (e as Error).message
        }". Please respond with just a JSON object, without any explanation nor sorry, and nothing else.`,
      });
      const retriedResponse = await fetchFromApi(body);

      // sometimes the AI returns a message in markdown format, with the JSON object after a paragraph text
      // Get JSON from response using regex

      console.log("retriedResponse", retriedResponse);
      // const jsonRegex = /```json([\s\S]*?)```|```([\s\S]*?)```/g;
      // const match = jsonRegex.exec(retriedResponse);
      // if (match) {
      //   const json = match[1] || match[2];
      //   console.log(match);
      //   const { message, recommendation, sample } = JSON.parse(json);
      //   return NextResponse.json({ message, recommendation, sample });
      // }

      const { message, recommendation } = JSON.parse(retriedResponse);
      return { message, recommendation };
    }
  } catch (e) {
    console.error(e);
    return { message: "Error", recommendation: [] };
  }
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const message = formData.get("message") as string;

  if (!message) {
    return NextResponse.json({ message: "No message provided" });
  }

  console.log("getting sample text");
  const { sample } = await getSampleText(message);
  console.log("DONE getting sample text");

  const { message: responseMessage, recommendation } = await getResponse(
    message
  );

  return NextResponse.json({
    message: responseMessage,
    recommendation,
    sample,
  });
}
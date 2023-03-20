"use client";

import * as React from "react";
import { Spinner } from "@/components/Spinner";
import ReactMarkdown from "react-markdown";

const fetchResponse = async (form: HTMLFormElement) => {
  const formData = new FormData(form);
  const response = await fetch(form.action, {
    method: form.method,
    headers: {
      "Content-Type": form.enctype,
    },
    body: new URLSearchParams(formData as URLSearchParams).toString(),
  });

  const json = await response.json();
  console.log(json);
  return json;
};

const fetchSample = async (form: HTMLFormElement) => {
  const formData = new FormData(form);
  const response = await fetch("/api/sample", {
    method: form.method,
    headers: {
      "Content-Type": form.enctype,
    },
    body: new URLSearchParams(formData as URLSearchParams).toString(),
  });

  const json = await response.json();
  console.log(json);
  return json;
};

export function Form() {
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<Record<string, any>>({});

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);

    const form = event.currentTarget;

    const [response, sample] = await Promise.all([
      fetchResponse(form),
      fetchSample(form),
    ]);

    console.log("DONE");

    setResult({
      ...response,
      sample,
    });

    setLoading(false);
  };

  React.useEffect(() => {
    // Load google font
    if (result?.recommendation) {
      result.recommendation.forEach((recommendation: any) => {
        const googleFontUrl = `https://fonts.googleapis.com/css2?family=${recommendation.name
          .replace(" ", "+")
          .replace(" ", "+")}&display=swap`;
        const link = document.createElement("link");
        link.href = googleFontUrl;
        link.rel = "stylesheet";
        link.dataset.id = "ai-font";
        document.head.appendChild(link);
      });
    }

    // Remove google font
    return () => {
      const links = document.querySelectorAll('link[data-id="ai-font"]');
      links.forEach((link) => link.remove());
    };
  }, [result]);

  return (
    <div className="max-w-2xl mx-auto">
      <form
        action="/api/font"
        method="POST"
        encType="application/x-www-form-urlencoded"
        onSubmit={onSubmit}
      >
        <div className="mb-4">
          <label htmlFor="message">
            <div className="mb-2">
              <span>Message</span>
            </div>
            <textarea
              // type="text"
              name="message"
              id="message"
              rows={4}
              placeholder="I need two fonts for a restaurant website with traditional Mexican cuisine, preferably with a handwritten feel."
              className="rounded-md w-full px-4 py-2 bg-white shadow-md resize-y disabled:bg-slate-100 disabled:text-slate-400"
              required
              disabled={loading}
            />
          </label>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="disabled:opacity-50 disabled:pointer-events-none inline-flex items-center"
          >
            <span>
              {loading ? "Generating ... please wait a moment" : "Generate"}
            </span>{" "}
            {loading ? <Spinner className="ml-2" /> : null}
          </button>
        </div>
      </form>
      {result && result.recommendation?.[0].name ? (
        <div>
          <div className="my-10">
            <div className="prose">
              <p>{result.message}</p>
            </div>
          </div>
          <div className="mb-10">
            <ul className="flex flex-wrap -m-4">
              {result.recommendation?.map((recommendation: any) => (
                <li key={recommendation.name} className="p-4">
                  <div className="uppercase text-xs mb-1">
                    {recommendation.category}
                  </div>
                  <div className="font-medium">{recommendation.name}</div>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-10 shadow-lg bg-white">
            <div
              className="prose prose-headings:[font-family:var(--ai-heading-font)] prose-headings:[font-weight:var(--ai-heading-weight)]"
              style={
                {
                  "--ai-heading-font": result.recommendation[0].name,
                  "--ai-heading-weight": result.recommendation[0].weight,
                  "--ai-body-font":
                    result.recommendation[1]?.name ||
                    result.recommendation[0].name,
                  "--ai-body-weight":
                    result.recommendation[1]?.weight ||
                    result.recommendation[0].weight ||
                    400,
                  fontFamily: "var(--ai-body-font)",
                  fontWeight: "var(--ai-body-weight)",
                } as React.CSSProperties
              }
            >
              <ReactMarkdown>{result.sample}</ReactMarkdown>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

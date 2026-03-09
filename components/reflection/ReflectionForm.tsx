"use client";

import { useState } from "react";

export default function ReflectionForm() {
  const [text, setText] = useState("");
  const [reflection, setReflection] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReflect() {
    if (!text) return;

    setLoading(true);

    const res = await fetch("/api/reflect", {
      method: "POST",
      body: JSON.stringify({
        text,
      }),
    });

    const data = await res.json();

    setReflection(data.reflection);
    setLoading(false);
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">

      <textarea
        className="w-full border border-[#D6D2CD] rounded-xl p-6 min-h-[200px] text-lg"
        placeholder="Begin writing here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button
        onClick={handleReflect}
        className="border border-[#D6D2CD] px-6 py-3 rounded-lg hover:bg-[#EAE6E1]"
      >
        Reflect
      </button>

      {loading && (
        <p className="text-gray-500 italic">Reflecting...</p>
      )}

      {reflection && (
        <div className="space-y-4">

          <div>
            <h3 className="text-sm text-gray-500 uppercase">
              Your words
            </h3>
            <p className="mt-2">{text}</p>
          </div>

          <div>
            <h3 className="text-sm text-gray-500 uppercase">
              Reflection
            </h3>
            <p className="mt-2 italic">{reflection}</p>
          </div>

        </div>
      )}

    </div>
  );
}
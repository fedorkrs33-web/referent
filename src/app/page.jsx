'use client';

import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClick = async (action) => {
    if (!url) return;
    setLoading(true);
    setResult("");

    try {
      const res = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, action }),
      });
      const data = await res.json();
      setResult(data.result || "Нет ответа от сервера");
    } catch {
      setResult("Ошибка при обращении к серверу.");
    }

    setLoading(false);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-black px-4 py-12">
      <div className="w-full max-w-xl p-8 bg-white dark:bg-zinc-900 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-zinc-800 dark:text-white">AI Article Assistant</h1>

        <input
          type="url"
          placeholder="Вставьте URL англоязычной статьи"
          className="w-full p-3 border border-zinc-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-white dark:border-zinc-700"
          value={url}
          onChange={e => setUrl(e.target.value)}
        />

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button
            className="flex-1 px-4 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            disabled={!url || loading}
            onClick={() => handleClick('about')}
          >О чем статья?</button>
          <button
            className="flex-1 px-4 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition disabled:opacity-50"
            disabled={!url || loading}
            onClick={() => handleClick('thesis')}
          >Тезисы</button>
          <button
            className="flex-1 px-4 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
            disabled={!url || loading}
            onClick={() => handleClick('telegram')}
          >Пост для Telegram</button>
        </div>

        <div className="min-h-[100px] w-full p-4 border border-zinc-200 rounded-md bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
          {loading ? "Генерация ответа..." : (result || "Результат появится здесь.")}
        </div>
      </div>
    </main>
  );
}
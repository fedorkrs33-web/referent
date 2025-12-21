'use client';

import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleExtract = async () => {
    setLoading(true);
    setResult(null);
    try {
      const resp = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, action: 'json' }), // ключевое: action: 'json'
      });
      const data = await resp.json();
      setResult(data.article || data.error || "Нет данных");
    } catch {
      setResult("Ошибка!");
    }
    setLoading(false);
  };

  const handleClick = async (action) => {
    if (!url) {
      setResult('Введите URL статьи');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      const res = await fetch('/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, action }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Неизвестная ошибка');
      }

      setResult(data.text);
    } catch (err) {
      setResult(`❌ Ошибка: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-black px-4 py-12">
      <div className="w-full max-w-xl p-8 bg-white dark:bg-zinc-900 rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center text-zinc-800 dark:text-white">Помощник по написанию статей на основе ИИ</h1>

        <input
          type="url"
          placeholder="Вставьте URL англоязычной статьи"
          className="w-full p-3 border border-zinc-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-white dark:border-zinc-700"
          value={url}
          onChange={e => setUrl(e.target.value)}
        />

        <div className="flex flex-row space-x-8 mb-8 justify-center">
  <button
    className="w-44 h-24 rounded-lg bg-blue-800 text-white text-lg font-semibold hover:bg-blue-900 transition disabled:opacity-50"
    disabled={!url || loading}
    onClick={() => handleExtract('about')}
  >Структура статьи</button>
  <button
    className="w-44 h-24 rounded-lg bg-blue-800 text-white text-lg font-semibold hover:bg-blue-900 transition disabled:opacity-50"
    disabled={!url || loading}
    onClick={() => handleClick('about')}
  >О чем статья?</button>
  <button
    className="w-44 h-24 rounded-lg bg-blue-800 text-white text-lg font-semibold hover:bg-blue-900 transition disabled:opacity-50"
    disabled={!url || loading}
    onClick={() => handleClick('thesis')}
  >Тезисы</button>
  <button
    className="w-44 h-24 rounded-lg bg-blue-800 text-white text-lg font-semibold hover:bg-blue-900 transition disabled:opacity-50"
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
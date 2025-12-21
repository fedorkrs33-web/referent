'use client';

import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

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

      // Если результат - объект (для action === 'json'), преобразуем в JSON строку
      if (action === 'json' && data.article) {
        setResult(JSON.stringify(data.article, null, 2));
      } else {
        setResult(data.text || data.error || "Нет данных");
      }
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
            className="w-44 h-24 rounded-lg bg-blue-500 text-white text-lg font-semibold hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!url || loading}
            onClick={() => handleClick('json')}
          >Парсинг</button>
          <button
            className="w-44 h-24 rounded-lg bg-emerald-500 text-white text-lg font-semibold hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!url || loading}
            onClick={() => handleClick('about')}
          >О чем статья?</button>
          <button
            className="w-44 h-24 rounded-lg bg-violet-500 text-white text-lg font-semibold hover:bg-violet-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!url || loading}
            onClick={() => handleClick('thesis')}
          >Тезисы</button>
          <button
            className="w-44 h-24 rounded-lg bg-amber-500 text-white text-lg font-semibold hover:bg-amber-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!url || loading}
            onClick={() => handleClick('telegram')}
          >Пост для Telegram</button>
        </div>

        <div className="min-h-[100px] w-full p-4 border border-zinc-200 rounded-md bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
          {loading ? (
            "Генерация ответа..."
          ) : result ? (
            <pre className="whitespace-pre-wrap text-sm font-mono">{result}</pre>
          ) : (
            "Результат появится здесь."
          )}
        </div>
      </div>
    </main>
  );
}
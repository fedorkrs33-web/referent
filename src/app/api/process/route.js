import { callGigaChat } from '../../lib/aiClient';
import { parseArticle } from '../../lib/parser'
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { url, action } = await request.json();
    if (!url) {
      return NextResponse.json({ error: "URL обязателен" }, { status: 400 });
    }

    // Получаем данные статьи
    const article = await parseArticle(url);

    // Если требуется просто JSON для вывода:
    if (action === 'json') {
      return NextResponse.json({ article });
    }

    // Формируем промпт для ИИ
    let prompt = '';
    switch (action) {
      case 'about':
        prompt = `О чём статья "${article.title}": ${article.content}`;
        break;
      case 'thesis':
        prompt = `Выдели 3–5 ключевых тезисов из статьи "${article.title}": ${article.content}`;
        break;
      case 'telegram':
        prompt = `Напиши короткий яркий пост для Telegram по статье "${article.title}": ${article.content}`;
        break;
      default:
        return NextResponse.json({ error: 'Неверное действие' }, { status: 400 });
    }

    // Запрос к GigaChat
    const result = await callGigaChat([{ role: 'user', content: prompt }]);
    // Ответ клиенту
    return NextResponse.json({ text: result });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
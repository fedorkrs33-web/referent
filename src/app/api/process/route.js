import { parseArticle } from '@/lib/parser';

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

    // Дальше — обычная логика обработки ИИ (если action: "summary", "theses" и т.п.)
    // Можно передавать только контент, либо title+content, или свой промпт.
    // Например:
    // prompt = `Кратко опиши, о чём статья "${article.title}": ${article.content}`;
    // и далее отправлять в callGigaChat.

    // ...
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

    // 1. Парсим статью
    const article = await parseArticle(url);

    // 2. Формируем промпт
    let prompt = '';
    switch (action) {
      case 'summary':
        prompt = `Кратко опиши, о чём статья: ${text}`;
        break;
      case 'theses':
        prompt = `Выдели 3–5 ключевых тезисов: ${text}`;
        break;
      case 'telegram':
        prompt = `Напиши короткий, яркий пост для Telegram. Эмоционально: ${text}`;
        break;
      default:
        return NextResponse.json({ error: 'Неверное действие' }, { status: 400 });
    }

    // 3. Запрос к GigaChat
    const result = await callGigaChat([{ role: 'user', content: prompt }]);

    // 4. Ответ
    return NextResponse.json({ text: result });
  } catch (error) {
    console.error('Ошибка в API:', error);
    return NextResponse.json(
      { error: 'Не удалось обработать запрос' },
      { status: 500 }
    );
  }
}

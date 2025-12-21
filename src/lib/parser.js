import axios from 'axios';
import { load } from 'cheerio';

export async function parseArticle(url) {
  try {
    // Получаем HTML
    const { data: html } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ReferentBot/1.0)' },
      timeout: 10000
    });

    const $ = load(html);

    // Удаляем мусор
    $('script, style, nav, header, footer, aside, .sidebar, .ads').remove();

    // Заголовок
    let title = $('meta[property="og:title"]').attr('content')
      || $('title').text()
      || $('h1').first().text()
      || '';

    // Дата публикации
    let date =
      $('meta[property="article:published_time"]').attr('content')
      || $('time').attr('datetime')
      || $('time').text()
      || $("meta[name='pubdate']").attr('content')
      || '';

    // Основной контент
    let content =
      $('article').text()
      || $('.post').text()
      || $('.content').text()
      || $('main').text()
      || $('body').text();

    content = content.replace(/\s+/g, ' ').trim();

    // Обрезаем очень длинные статьи для GigaChat
    if (content.length > 8000) content = content.slice(0, 8000);

    // Также уберём лишние пробелы и переносы
    title = title.replace(/\s+/g, ' ').trim();
    date = date.replace(/\s+/g, ' ').trim();

    return { date, title, content };
  } catch (error) {
    console.error('Ошибка парсинга статьи:', error.message);
    throw new Error(`Не удалось загрузить статью: ${error.message}`);
  }
}
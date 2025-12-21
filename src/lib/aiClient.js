// src/lib/aiClient.js
import axios from 'axios';
import https from 'https';
import { randomUUID } from 'crypto';

// Базовый URL для GigaChat API
const API_URL = process.env.NEXT_PUBLIC_GIGACHAT_API_URL || 'https://gigachat.devices.sberbank.ru/api/v1';
const OAUTH_URL = process.env.NEXT_PUBLIC_GIGACHAT_OAUTH_URL || 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth';

// Создаём https agent, который игнорирует ошибки самоподписанных сертификатов (только для разработки!)
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

// Кеш токена (токены обычно живут около 30 минут)
let cachedToken = null;
let tokenExpiresAt = null;

/**
 * Получает OAuth токен для доступа к GigaChat API
 */
async function getAccessToken() {
  // Проверяем, есть ли валидный кешированный токен
  if (cachedToken && tokenExpiresAt && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const authKey = process.env.NEXT_PUBLIC_GIGACHAT_AUTH_KEY;
  
  if (!authKey || authKey === 'ваш_authorization_key_здесь') {
    throw new Error('Authorization key не настроен. Убедитесь, что в .env.local указан NEXT_PUBLIC_GIGACHAT_AUTH_KEY');
  }

  try {
    // Генерируем уникальный идентификатор запроса
    const rqUID = randomUUID();

    const response = await axios.post(
      OAUTH_URL,
      'scope=GIGACHAT_API_PERS',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'RqUID': rqUID,
          'Authorization': `Basic ${authKey}`
        },
        httpsAgent: httpsAgent,
        timeout: 30000
      }
    );

    if (response.data && response.data.access_token) {
      cachedToken = response.data.access_token;
      // Устанавливаем время истечения токена (обычно 30 минут, но используем 25 для безопасности)
      const expiresIn = response.data.expires_at ? 
        new Date(response.data.expires_at).getTime() - Date.now() :
        25 * 60 * 1000; // 25 минут в миллисекундах
      tokenExpiresAt = Date.now() + expiresIn;
      
      return cachedToken;
    } else {
      throw new Error('Не удалось получить токен. Ответ от сервера: ' + JSON.stringify(response.data));
    }
  } catch (error) {
    const errorMessage = error.response?.data?.error_description || error.response?.data?.error || error.message;
    const statusCode = error.response?.status;
    
    console.error('Ошибка получения токена GigaChat:', {
      status: statusCode,
      message: errorMessage,
      data: error.response?.data
    });
    
    if (statusCode === 401) {
      throw new Error('Неверный Authorization key (401). Проверьте NEXT_PUBLIC_GIGACHAT_AUTH_KEY в .env.local');
    }
    
    throw new Error(`Ошибка получения токена: ${errorMessage}`);
  }
}

export async function callGigaChat(messages) {
  // Получаем токен доступа через OAuth
  let token = await getAccessToken();

  try {
    const endpoint = `${API_URL}/chat/completions`;
    
    const response = await axios.post(
      endpoint,
      {
        model: 'GigaChat',
        messages,
        temperature: 0.7,
        max_tokens: 1024
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        httpsAgent: httpsAgent,
        timeout: 30000
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
    const statusCode = error.response?.status;
    
    // Если токен истёк (401), попробуем получить новый и повторить запрос
    if (statusCode === 401) {
      console.log('Токен истёк, получаем новый...');
      // Сбрасываем кеш токена
      cachedToken = null;
      tokenExpiresAt = null;
      
      try {
        // Получаем новый токен
        token = await getAccessToken();
        
        // Повторяем запрос с новым токеном
        const retryResponse = await axios.post(
          `${API_URL}/chat/completions`,
          {
            model: 'GigaChat',
            messages,
            temperature: 0.7,
            max_tokens: 1024
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            httpsAgent: httpsAgent,
            timeout: 30000
          }
        );
        
        return retryResponse.data.choices[0].message.content;
      } catch (retryError) {
        throw new Error('Не удалось получить новый токен после истечения. Проверьте NEXT_PUBLIC_GIGACHAT_AUTH_KEY');
      }
    }
    
    console.error('Ошибка GigaChat:', {
      status: statusCode,
      message: errorMessage,
      data: error.response?.data
    });
    
    if (statusCode === 403) {
      throw new Error('Доступ запрещён. Проверьте права доступа');
    } else if (statusCode === 404) {
      throw new Error(`Эндпоинт не найден (404). Проверьте:\n1. Правильность NEXT_PUBLIC_GIGACHAT_API_URL в .env.local\n2. Актуальную документацию GigaChat API на https://developers.sber.ru/\n3. Текущий URL: ${API_URL}`);
    } else if (statusCode >= 500) {
      throw new Error('Ошибка сервера GigaChat. Попробуйте позже');
    }
    
    throw new Error(`Ошибка подключения к ИИ: ${errorMessage}`);
  }
}

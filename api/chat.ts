import type { IncomingMessage, ServerResponse } from 'http';
import { GoogleGenAI } from '@google/genai';

const SYSTEM_PROMPT = `Sen İshak Alper'in web sitesinde bulunan bir danışmanlık asistanısın. Her zaman Türkçe konuş.

İshak Alper hakkında:
- "Çıplak Gösteren Gözlükler" kitabının yazarı
- Karanlık psikoloji, ilişki dinamikleri ve kişisel dönüşüm konularında uzman
- Görme engeli olan, bunu aşarak başarıya ulaşmış ve ilham veren bir yazar ve danışman
- Felsefe, psikoloji ve zihinsel güç üzerine içerikler üretiyor

Sunduğu danışmanlık hizmetleri (birebir VIP seanslar):
1. Zihinsel Yeniden İnşa — Sınırlayıcı inançları kaldırma, öz farkındalık geliştirme, zihinsel blokları aşma
2. Finansal Uyanış & Özgürlük Psikolojisi — Para ile ilişki, bolluk zihniyeti, finansal özgürlük psikolojisi
3. İlişki Dinamikleri & Sınır Çizme Sanatı — Sağlıklı ilişki kurma, sınır koyma, toksik ilişkilerden çıkış
4. Karanlık Psikoloji & İnsan Okuma Sanatı — Manipülasyon tespiti, insan analizi, beden dili okuma
5. Bütünsel Enerji & Biyohack — Zihinsel ve fiziksel optimizasyon, enerji yönetimi
6. VIP Dönüşüm & Stratejik Yaşam Tasarımı — Kapsamlı birebir destek, yaşam hedefleri belirleme

Görevin:
- Ziyaretçilerin danışmanlık hizmetleri hakkındaki sorularını yanıtlamak
- Hangi hizmetin onlara uygun olduğunu anlamalarına yardımcı olmak
- Danışmanlık almak isteyenleri /iletisim sayfasına yönlendirmek (iletişim formu doldurmalarını söyle)
- Kitap hakkında soruları yanıtlamak
- KISA yanıtlar ver (2-4 cümle maksimum)
- Sıcak, motive edici ve profesyonel bir ton kullan`;

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'API yapılandırma hatası' }));
    return;
  }

  let body: { messages?: Array<{ role: string; text: string }> } = {};
  try {
    const raw = await new Promise<string>((resolve, reject) => {
      let data = '';
      req.on('data', chunk => (data += chunk));
      req.on('end', () => resolve(data));
      req.on('error', reject);
    });
    body = JSON.parse(raw);
  } catch {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: 'Geçersiz istek' }));
    return;
  }

  const messages = body.messages || [];
  if (!messages.length) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: 'Mesaj gerekli' }));
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    const contents = messages.map(msg => ({
      role: msg.role as 'user' | 'model',
      parts: [{ text: msg.text }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        maxOutputTokens: 400,
      },
    });

    res.statusCode = 200;
    res.end(JSON.stringify({ reply: response.text }));
  } catch (err) {
    console.error('Gemini API error:', err);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Yapay zeka yanıt hatası. Lütfen tekrar deneyin.' }));
  }
}

const TELEGRAM_BOT_TOKEN = '8969958338:AAHXzPVaQ5nEXLxOnM4eTBuJul3i3PKK6sA';
const TELEGRAM_CHAT_ID = '1408464066';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  try {
    const raw = req.body;
    const body = (raw && typeof raw === 'object') ? raw : JSON.parse(raw || '{}');
    const text = typeof body.text === 'string' ? body.text : '';
    if (!text) {
      res.status(400).json({ ok: false, error: 'text is required' });
      return;
    }

    const params = new URLSearchParams({
      chat_id: TELEGRAM_CHAT_ID,
      text: text,
      parse_mode: 'HTML'
    });

    const response = await fetch('https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    const data = await response.json();
    res.status(response.ok ? 200 : 502).json({ ok: response.ok, ...data });
  } catch (e) {
    res.status(500).json({ ok: false, error: String((e && e.message) || e) });
  }
};
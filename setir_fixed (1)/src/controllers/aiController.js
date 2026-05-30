const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;

async function gemini(prompt) {
  const res = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.candidates[0].content.parts[0].text;
}

function parseJSON(raw) {
  try {
    return JSON.parse(raw.replace(/```json\n?|```/g, '').trim());
  } catch (e) {
    const m = raw.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    throw new Error('JSON parse xətası');
  }
}

const checkGrammar = async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Mətn tələb olunur.' });
  try {
    const raw = await gemini(
      `Sən peşəkar Azərbaycan dili qrammatika yoxlayıcısısın. YALNIZ JSON ver:
{"score":<0-100>,"corrected":"<tam düzəldilmiş mətn>","errors":[{"original":"<səhv hissə>","fixed":"<düzgün variant>","explanation":"<Azərbaycanca qısa izahat>","type":"grammar|spelling|punctuation|style|clarity"}],"stats":{"grammar":<say>,"spelling":<say>,"style":<say>,"clarity":<say>}}
Mətn: """${text}"""`
    );
    res.json(parseJSON(raw));
  } catch (err) {
    res.status(500).json({ error: 'AI xətası: ' + err.message });
  }
};

const changeTone = async (req, res) => {
  const { text, tone } = req.body;
  if (!text || !tone) return res.status(400).json({ error: 'Mətn və ton tələb olunur.' });
  const toneMap = { resmi: 'rəsmi, hörmətli', dost: 'dostcasına, mehriban', pesekar: 'peşəkar biznes', qisa: 'çox qısa, konkret' };
  try {
    const result = await gemini(`Aşağıdakı mətni "${toneMap[tone] || tone}" tonda yenidən yaz. Yalnız yenidən yazılmış mətni qaytar.\n\nMətn: """${text}"""`);
    res.json({ result: result.trim() });
  } catch (err) {
    res.status(500).json({ error: 'AI xətası: ' + err.message });
  }
};

const improveText = async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Mətn tələb olunur.' });
  try {
    const raw = await gemini(
      `Bu Azərbaycan dilindəki mətni analiz et. YALNIZ JSON:
{"improved":"<yaxşılaşdırılmış mətn>","changes":["<nə dəyişdirildi>"]}
Mətn: """${text}"""`
    );
    res.json(parseJSON(raw));
  } catch (err) {
    res.status(500).json({ error: 'AI xətası: ' + err.message });
  }
};

const checkVocab = async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Mətn tələb olunur.' });
  try {
    const raw = await gemini(
      `Bu mətndəki zəif/adi sözlər üçün güclü alternativlər tap. YALNIZ JSON:
{"suggestions":[{"word":"<orijinal>","alternatives":["<alt1>","<alt2>","<alt3>"],"reason":"<niyə>"}]}
Mətn: """${text}"""`
    );
    res.json(parseJSON(raw));
  } catch (err) {
    res.status(500).json({ error: 'AI xətası: ' + err.message });
  }
};

const checkPlagiat = async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Mətn tələb olunur.' });
  try {
    const raw = await gemini(
      `Bu mətni orijinallıq baxımından analiz et. YALNIZ JSON:
{"score":<0-100>,"status":"Orijinal|Şübhəli|Kopyalanmış","comment":"<Azərbaycanca izahat>","suspicious":["<şübhəli hissə>"],"originality_aspects":["<niyə orijinal>"]}
Mətn: """${text}"""`
    );
    res.json(parseJSON(raw));
  } catch (err) {
    res.status(500).json({ error: 'AI xətası: ' + err.message });
  }
};

const summarizeText = async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Mətn tələb olunur.' });
  try {
    const raw = await gemini(
      `Bu mətni analiz et. YALNIZ JSON:
{"summary":"<Azərbaycanca 2-4 cümləlik xülasə>","key_points":["<əsas fikir1>","<əsas fikir2>","<əsas fikir3>"],"word_count":<söz sayı>,"reading_time":"<oxuma vaxtı dəqiqə>"}
Mətn: """${text}"""`
    );
    res.json(parseJSON(raw));
  } catch (err) {
    res.status(500).json({ error: 'AI xətası: ' + err.message });
  }
};

const generateText = async (req, res) => {
  const { prompt, type } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt tələb olunur.' });
  const typeMap = { email: 'professional e-mail', esse: 'akademik esse', cv: 'professional CV müraciət məktubu', post: 'sosial media postu (hashtaglarla)', meqale: 'informativ məqalə', brainstorm: 'strukturlaşdırılmış beyin fırtınası' };
  try {
    const result = await gemini(`Azərbaycan dilində ${typeMap[type] || 'mətn'} formatında yaz. Yalnız hazır mətni qaytar.\n\nİstək: ${prompt}`);
    res.json({ result: result.trim() });
  } catch (err) {
    res.status(500).json({ error: 'AI xətası: ' + err.message });
  }
};

const rewriteText = async (req, res) => {
  const { text, goal } = req.body;
  if (!text) return res.status(400).json({ error: 'Mətn tələb olunur.' });
  const goalMap = { akademik: 'akademik üslubda', biznes: 'biznes yazışma üslubunda', cariz: 'şəxsi, mehriban üslubda', sosial: 'sosial media üçün cəlbedici üslubda' };
  const style = goalMap[goal] || 'professional üslubda';
  try {
    const raw = await gemini(
      `Bu mətni ${style} yenidən yaz. YALNIZ JSON:
{"rewritten":"<yenidən yazılmış>","paraphrase":"<qısa parafraz>"}
Mətn: """${text}"""`
    );
    res.json(parseJSON(raw));
  } catch (err) {
    res.status(500).json({ error: 'AI xətası: ' + err.message });
  }
};

module.exports = { checkGrammar, changeTone, improveText, checkVocab, checkPlagiat, summarizeText, generateText, rewriteText };

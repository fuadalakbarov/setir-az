const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

async function groq(prompt) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3
    })
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.choices[0].message.content;
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
    const raw = await groq(`Sən peşəkar Azərbaycan dili qrammatika yoxlayıcısısın. YALNIZ JSON ver:\n{"score":<0-100>,"corrected":"<tam düzəldilmiş mətn>","errors":[{"original":"<səhv hissə>","fixed":"<düzgün variant>","explanation":"<Azərbaycanca qısa izahat>","type":"grammar|spelling|punctuation|style|clarity"}],"stats":{"grammar":<say>,"spelling":<say>,"style":<say>,"clarity":<say>}}\nMətn: """${text}"""`);
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
    const result = await groq(`Aşağıdakı mətni "${toneMap[tone] || tone}" tonda yenidən yaz. Yalnız yenidən yazılmış mətni qaytar.\n\nMətn: """${text}"""`);
    res.json({ result: result.trim() });
  } catch (err) {
    res.status(500).json({ error: 'AI xətası: ' + err.message });
  }
};

const improveText = async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Mətn tələb olunur.' });
  try {
    const raw = await groq(`Bu Azərbaycan dilindəki mətni analiz et. YALNIZ JSON:\n{"improved":"<yaxşılaşdırılmış mətn>","changes":["<nə dəyişdirildi>"]}\nMətn: """${text}"""`);
    res.json(parseJSON(raw));
  } catch (err) {
    res.status(500).json({ error: 'AI xətası: ' + err.message });
  }
};

const checkVocab = async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Mətn tələb olunur.' });
  try {
    const raw = await groq(`Bu mətndəki zəif/adi sözlər üçün güclü alternativlər tap. YALNIZ JSON:\n{"suggestions":[{"word":"<orijinal>","alternatives":["<alt1>","<alt2>","<alt3>"],"reason":"<niyə>"}]}\nMətn: """${text}"""`);
    res.json(parseJSON(raw));
  } catch (err) {
    res.status(500).json({ error: 'AI xətası: ' + err.message });
  }
};

const checkPlagiat = async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Mətn tələb olunur.' });
  try {
    const raw = await groq(`Bu mətni orijinallıq baxımından analiz et. YALNIZ JSON:\n{"score":<0-100>,"status":"Orijinal|Şübhəli|Kopyalanmış","comment":"<Azərbaycanca izahat>","suspicious":["<şübhəli hissə>"],"originality_aspects":["<niyə orijinal>"]}\nMətn: """${text}"""`);
    res.json(parseJSON(raw));
  } catch (err) {
    res.status(500).json({ error: 'AI xətası: ' + err.message });
  }
};

const summarizeText = async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Mətn tələb olunur.' });
  try {
    const raw = await groq(`Bu mətni analiz et. YALNIZ JSON:\n{"summary":"<Azərbaycanca 2-4 cümləlik xülasə>","key_points":["<əsas fikir1>","<əsas fikir2>","<əsas fikir3>"],"word_count":<söz sayı>,"reading_time":"<oxuma vaxtı dəqiqə>"}\nMətn: """${text}"""`);
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
    const result = await groq(`Azərbaycan dilində ${typeMap[type] || 'mətn'} formatında yaz. Yalnız hazır mətni qaytar.\n\nİstək: ${prompt}`);
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
    const raw = await groq(`Bu mətni ${style} yenidən yaz. YALNIZ JSON:\n{"rewritten":"<yenidən yazılmış>","paraphrase":"<qısa parafraz>"}\nMətn: """${text}"""`);
    res.json(parseJSON(raw));
  } catch (err) {
    res.status(500).json({ error: 'AI xətası: ' + err.message });
  }
};

module.exports = { checkGrammar, changeTone, improveText, checkVocab, checkPlagiat, summarizeText, generateText, rewriteText };

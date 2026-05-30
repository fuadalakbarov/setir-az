const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  checkGrammar, changeTone, improveText, checkVocab,
  checkPlagiat, summarizeText, generateText, rewriteText
} = require('../controllers/aiController');

router.post('/grammar',  checkGrammar);
router.post('/tone',     changeTone);
router.post('/improve',  improveText);
router.post('/vocab',    checkVocab);
router.post('/plagiat',  checkPlagiat);
router.post('/summary',  summarizeText);
router.post('/generate', generateText);
router.post('/rewrite',  rewriteText);

module.exports = router;

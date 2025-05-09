const express = require('express');
const router = express.Router();
const { generateCombinedPdf } = require('../controllers/offerController');
const Joi = require('joi');

const schema = Joi.object({
  offerLetters: Joi.array().items(
    Joi.object({
      roll_no: Joi.string().required(),
      full_name: Joi.string().required(),
      fileId: Joi.string().required(), // ✅ NEW
    })
  ).required()
});

router.post('/generate', async (req, res) => {
  try {
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { offerLetters } = req.body;
    console.log(offerLetters);

    const pdfBytes = await generateCombinedPdf(offerLetters);

    // Send PDF as binary response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="combined.pdf"');
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error('Route error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to generate PDF' });
  }
});

module.exports = router;
import { Router, Request, Response, NextFunction } from 'express';
import { body, query, validationResult } from 'express-validator';
import multer from 'multer';
import { parse } from 'csv-parse/sync';
import rateLimit from 'express-rate-limit';
import { Feedback } from '../models/Feedback';
import { analyzeFeedback } from '../services/aiService';

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

const csvUploadLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many CSV uploads. Max 3 per hour per IP.' },
});

// POST /api/feedback
router.post(
  '/',
  [
    body('rawText')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('rawText is required and must be a non-empty string'),
    body('source')
      .isIn(['manual', 'csv'])
      .withMessage('source must be "manual" or "csv"'),
  ],
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { rawText, source } = req.body;
      const feedback = await Feedback.create({ rawText, source });

      try {
        const analysis = await analyzeFeedback(rawText);
        feedback.sentiment = analysis.sentiment;
        feedback.category = analysis.category;
        feedback.summary = analysis.summary;
        feedback.confidence = analysis.confidence;
        feedback.analyzedAt = new Date();
        await feedback.save();
      } catch (aiErr) {
        console.error('AI analysis failed, feedback saved without analysis:', aiErr);
      }

      res.status(201).json(feedback);
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/feedback/csv
router.post(
  '/csv',
  csvUploadLimit,
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded. Send a CSV as form-data field "file".' });
      return;
    }

    let rows: Record<string, string>[];
    try {
      rows = parse(req.file.buffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      }) as Record<string, string>[];
    } catch {
      res.status(400).json({ error: 'Failed to parse CSV. Ensure it is valid CSV with a rawText column.' });
      return;
    }

    if (rows.length === 0) {
      res.status(400).json({ error: 'CSV file is empty.' });
      return;
    }

    if (rows.length > 50) {
      res.status(400).json({ error: 'CSV exceeds the 50-row limit.' });
      return;
    }

    let successful = 0;
    let failed = 0;

    for (const row of rows) {
      const rawText = row.rawText?.trim();
      if (!rawText) {
        failed++;
        continue;
      }

      const source: 'manual' | 'csv' = row.source === 'manual' ? 'manual' : 'csv';

      try {
        const feedback = await Feedback.create({ rawText, source });
        try {
          const analysis = await analyzeFeedback(rawText);
          feedback.sentiment = analysis.sentiment;
          feedback.category = analysis.category;
          feedback.summary = analysis.summary;
          feedback.confidence = analysis.confidence;
          feedback.analyzedAt = new Date();
          await feedback.save();
        } catch (aiErr) {
          console.error('AI analysis failed for CSV row:', aiErr);
        }
        successful++;
      } catch (dbErr) {
        console.error('Failed to save CSV row:', dbErr);
        failed++;
      }
    }

    res.status(200).json({ total: rows.length, successful, failed });
  }
);

// GET /api/feedback
router.get(
  '/',
  [
    query('source')
      .optional()
      .isIn(['manual', 'csv'])
      .withMessage('source must be "manual" or "csv"'),
  ],
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const filter: Record<string, string> = {};
      if (req.query.source) {
        filter.source = req.query.source as string;
      }

      const feedbackList = await Feedback.find(filter).sort({ createdAt: -1 });
      res.json(feedbackList);
    } catch (err) {
      next(err);
    }
  }
);

export default router;

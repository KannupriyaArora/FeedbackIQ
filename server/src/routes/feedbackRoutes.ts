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
// NOTE: userId is trusted from the client. In production, verify it server-side
// using Clerk's JWT (e.g. with @clerk/backend verifyToken) instead of trusting req.body.
router.post(
  '/',
  [
    body('userId').isString().trim().notEmpty().withMessage('userId is required'),
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
      const { userId, rawText, source } = req.body;
      const feedback = await Feedback.create({ userId, rawText, source });

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
// NOTE: userId is trusted from the client. In production, verify it server-side
// using Clerk's JWT (e.g. with @clerk/backend verifyToken) instead of trusting req.body.
router.post(
  '/csv',
  csvUploadLimit,
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.body?.userId as string | undefined;
    if (!userId) {
      res.status(400).json({ error: 'userId is required.' });
      return;
    }

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
        const feedback = await Feedback.create({ userId, rawText, source });
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

    res.status(201).json({ total: rows.length, successful, failed });
  }
);

// GET /api/feedback/stats?userId=xxx
router.get(
  '/stats',
  [query('userId').isString().trim().notEmpty().withMessage('userId query param is required')],
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const userMatch = { userId: req.query.userId as string };

      const [result] = await Feedback.aggregate([
        { $match: userMatch },
        {
          $facet: {
            total: [{ $count: 'count' }],
            sentimentCounts: [
              { $match: { sentiment: { $ne: null } } },
              { $group: { _id: '$sentiment', count: { $sum: 1 } } },
            ],
            topCategories: [
              { $match: { category: { $ne: null } } },
              { $group: { _id: '$category', count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 5 },
              { $project: { _id: 0, category: '$_id', count: 1 } },
            ],
            avgConfidence: [
              { $match: { confidence: { $ne: null } } },
              { $group: { _id: null, avg: { $avg: '$confidence' } } },
            ],
          },
        },
      ]);

      const total: number = result.total[0]?.count ?? 0;

      const sentimentMap: Record<string, number> = {};
      for (const { _id, count } of result.sentimentCounts as { _id: string; count: number }[]) {
        sentimentMap[_id] = count;
      }

      res.json({
        total,
        positive: sentimentMap['positive'] ?? 0,
        negative: sentimentMap['negative'] ?? 0,
        neutral: sentimentMap['neutral'] ?? 0,
        topCategories: result.topCategories as { category: string; count: number }[],
        averageConfidence: Number((result.avgConfidence[0]?.avg ?? 0).toFixed(2)),
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/feedback?userId=xxx
router.get(
  '/',
  [
    query('userId').isString().trim().notEmpty().withMessage('userId query param is required'),
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
      const filter: Record<string, string> = { userId: req.query.userId as string };
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

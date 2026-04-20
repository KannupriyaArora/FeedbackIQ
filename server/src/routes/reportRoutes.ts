import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { Types } from 'mongoose';
import { Report, generateSlug } from '../models/Report';
import { IFeedback } from '../models/Feedback';

const router = Router();

// POST /api/reports
router.post(
  '/',
  [
    body('title').isString().trim().notEmpty().withMessage('title is required'),
    body('feedbackIds').isArray({ min: 1 }).withMessage('feedbackIds must be a non-empty array'),
    body('feedbackIds.*')
      .custom((v) => Types.ObjectId.isValid(v))
      .withMessage('each feedbackId must be a valid ObjectId'),
  ],
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { title, feedbackIds } = req.body as { title: string; feedbackIds: string[] };

      if (feedbackIds.length > 500) {
        res.status(400).json({ error: 'Reports are limited to 500 entries.' });
        return;
      }

      let slug = generateSlug();
      for (let i = 0; i < 5; i++) {
        const existing = await Report.findOne({ slug });
        if (!existing) break;
        slug = generateSlug();
      }

      const report = await Report.create({ title, feedbackIds, slug });
      res.status(201).json({ slug: report.slug });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/reports/:slug
router.get(
  '/:slug',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const report = await Report.findOne({ slug: req.params.slug }).populate('feedbackIds');

      if (!report) {
        res.status(404).json({ error: 'Report not found.' });
        return;
      }

      const entries = report.feedbackIds as unknown as IFeedback[];
      const total = entries.length;
      const positive = entries.filter((e) => e.sentiment === 'positive').length;
      const negative = entries.filter((e) => e.sentiment === 'negative').length;
      const neutral = entries.filter((e) => e.sentiment === 'neutral').length;

      const catMap: Record<string, number> = {};
      for (const entry of entries) {
        if (entry.category) catMap[entry.category] = (catMap[entry.category] ?? 0) + 1;
      }
      const topCategories = Object.entries(catMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([category, count]) => ({ category, count }));

      const withConfidence = entries.filter((e) => e.confidence !== null);
      const averageConfidence =
        withConfidence.length > 0
          ? Number(
              (
                withConfidence.reduce((s, e) => s + (e.confidence ?? 0), 0) /
                withConfidence.length
              ).toFixed(2)
            )
          : 0;

      res.json({
        _id: report._id,
        title: report.title,
        slug: report.slug,
        createdAt: report.createdAt,
        entries,
        stats: { total, positive, negative, neutral, topCategories, averageConfidence },
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;

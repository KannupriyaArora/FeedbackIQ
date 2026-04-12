import { Router, Request, Response, NextFunction } from 'express';
import { body, query, validationResult } from 'express-validator';
import { Feedback } from '../models/Feedback';

const router = Router();

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
      res.status(201).json(feedback);
    } catch (err) {
      next(err);
    }
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

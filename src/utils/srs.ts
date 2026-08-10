export interface SRSState {
  interval: number; // Days until next review
  repetition: number; // Consecutive successful reviews
  easeFactor: number; // Ease multiplier (default 2.5)
  nextReview: string; // ISO 8601 date string for next scheduled review
}

/**
 * Calculates updated Spaced Repetition System (SRS) metrics based on performance.
 * Follows an SM-2 inspired spacing schedule.
 */
export function calculateNextSRS(
  isCorrect: boolean,
  currentState?: Partial<SRSState>
): SRSState {
  const currentInterval = currentState?.interval ?? 0;
  const currentRepetition = currentState?.repetition ?? 0;
  const currentEaseFactor = currentState?.easeFactor ?? 2.5;

  let newInterval = 1;
  let newRepetition = 0;
  let newEaseFactor = currentEaseFactor;

  if (isCorrect) {
    newRepetition = currentRepetition + 1;
    newEaseFactor = Math.min(3.5, currentEaseFactor + 0.1);

    if (newRepetition === 1) {
      newInterval = 1;
    } else if (newRepetition === 2) {
      newInterval = 3;
    } else {
      newInterval = Math.round((currentInterval || 3) * newEaseFactor);
    }
  } else {
    newRepetition = 0;
    newInterval = 1;
    newEaseFactor = Math.max(1.3, currentEaseFactor - 0.2);
  }

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + newInterval);

  return {
    interval: newInterval,
    repetition: newRepetition,
    easeFactor: Number(newEaseFactor.toFixed(2)),
    nextReview: nextDate.toISOString(),
  };
}

export type AyahSRSStatus = 'due' | 'weak' | 'learning' | 'mastered' | 'new';

export interface SRSPriorityResult {
  priorityScore: number;
  status: AyahSRSStatus;
  daysUntilReview: number;
}

/**
 * Calculates a priority score for ordering Ayah review questions in quizzes.
 * Higher priority score means the Ayah segment should be tested earlier.
 */
export function calculateSRSPriority(
  progress?: {
    correctCount?: number;
    mistakeCount?: number;
    interval?: number;
    repetition?: number;
    easeFactor?: number;
    nextReview?: string;
    lastAttempt?: string;
  }
): SRSPriorityResult {
  if (!progress) {
    return { priorityScore: 50, status: 'new', daysUntilReview: 0 };
  }

  const mistakes = progress.mistakeCount || 0;
  const correct = progress.correctCount || 0;
  const easeFactor = progress.easeFactor ?? 2.5;
  const repetition = progress.repetition ?? 0;
  const interval = progress.interval ?? 0;
  const now = new Date();

  let daysUntilReview = 0;
  if (progress.nextReview) {
    const nextDate = new Date(progress.nextReview);
    const diffTime = nextDate.getTime() - now.getTime();
    daysUntilReview = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  const isDue = daysUntilReview <= 0 && !!progress.nextReview;

  const totalAttempts = mistakes + correct;
  const mistakeRate = totalAttempts > 0 ? mistakes / totalAttempts : 0;
  const isWeak = mistakes > 0 && (mistakeRate >= 0.25 || easeFactor < 2.2 || repetition === 0);

  let priorityScore = 0;

  if (isDue) {
    priorityScore += 1000 + Math.abs(daysUntilReview) * 50; // Overdue items get top priority
  }

  if (isWeak) {
    priorityScore += 500 + Math.round(mistakeRate * 400); // Weak segments get high priority
  }

  // Factor in low ease factor
  priorityScore += Math.round((3.5 - easeFactor) * 120);

  // Factor in low repetition
  if (repetition === 0) priorityScore += 150;
  else if (repetition < 3) priorityScore += 60;

  let status: AyahSRSStatus = 'learning';

  if (isDue) {
    status = 'due';
  } else if (isWeak) {
    status = 'weak';
  } else if (repetition >= 4 && interval >= 7) {
    status = 'mastered';
    priorityScore -= 200;
  } else if (totalAttempts === 0) {
    status = 'new';
  } else {
    status = 'learning';
  }

  return {
    priorityScore,
    status,
    daysUntilReview,
  };
}

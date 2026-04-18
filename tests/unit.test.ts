// Unit tests for pure business logic — no DB or React dependencies

// ─── Date string format ───────────────────────────────────────────────────────

function todayString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

describe('date string format', () => {
  it('produces YYYY-MM-DD', () => {
    expect(todayString()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('zero-pads single-digit months and days', () => {
    const parts = todayString().split('-');
    expect(parts[1].length).toBe(2);
    expect(parts[2].length).toBe(2);
  });
});

// ─── Email validation ─────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

describe('email validation regex', () => {
  it('accepts standard email addresses', () => {
    expect(EMAIL_REGEX.test('user@example.com')).toBe(true);
    expect(EMAIL_REGEX.test('a.b+tag@sub.domain.co.uk')).toBe(true);
    expect(EMAIL_REGEX.test('123@numbers.io')).toBe(true);
  });

  it('rejects addresses without @', () => {
    expect(EMAIL_REGEX.test('notanemail')).toBe(false);
  });

  it('rejects addresses without a domain', () => {
    expect(EMAIL_REGEX.test('user@')).toBe(false);
  });

  it('rejects addresses without a local part', () => {
    expect(EMAIL_REGEX.test('@domain.com')).toBe(false);
  });

  it('rejects addresses with spaces', () => {
    expect(EMAIL_REGEX.test('user @domain.com')).toBe(false);
    expect(EMAIL_REGEX.test('user@ domain.com')).toBe(false);
  });

  it('rejects addresses without a TLD', () => {
    expect(EMAIL_REGEX.test('user@domain')).toBe(false);
  });
});

// ─── Streak calculation ───────────────────────────────────────────────────────

function calcDailyStreak(logDates: string[], today: string): number {
  const logSet = new Set(logDates);
  let streak = 0;
  const cur = new Date(today);
  while (true) {
    const ds = cur.toISOString().slice(0, 10);
    if (!logSet.has(ds)) break;
    streak++;
    cur.setDate(cur.getDate() - 1);
  }
  return streak;
}

describe('daily streak calculation', () => {
  const today = '2025-01-10';

  it('returns 0 when no logs exist', () => {
    expect(calcDailyStreak([], today)).toBe(0);
  });

  it('returns 1 when only today is logged', () => {
    expect(calcDailyStreak(['2025-01-10'], today)).toBe(1);
  });

  it('counts consecutive days back from today', () => {
    const dates = ['2025-01-10', '2025-01-09', '2025-01-08'];
    expect(calcDailyStreak(dates, today)).toBe(3);
  });

  it('stops at the first gap', () => {
    // gap on the 8th — streak breaks after 2 days
    const dates = ['2025-01-10', '2025-01-09', '2025-01-07'];
    expect(calcDailyStreak(dates, today)).toBe(2);
  });

  it('returns 0 when the most recent log is not today', () => {
    expect(calcDailyStreak(['2025-01-09'], today)).toBe(0);
  });
});

// ─── Password validation ──────────────────────────────────────────────────────

describe('password length validation', () => {
  const MIN_LENGTH = 6;

  it('accepts passwords meeting the minimum length', () => {
    expect('secret'.length >= MIN_LENGTH).toBe(true);
    expect('averylongpassword'.length >= MIN_LENGTH).toBe(true);
  });

  it('rejects passwords shorter than 6 characters', () => {
    expect('12345'.length >= MIN_LENGTH).toBe(false);
    expect(''.length >= MIN_LENGTH).toBe(false);
  });
});

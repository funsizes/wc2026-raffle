import type { Match } from '$lib/types';
import { isLiveMatch } from '$lib/utils/matches';
import { KICKOFF_TO_NUM, NUM_TO_GROUND } from './schedule';
import type { BracketScore, FeedMatch } from './types';

const KNOCKOUT_STAGES = new Set(['LAST_32', 'LAST_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'FINAL']);

function toBracketScore(match: Match): BracketScore | undefined {
  const { home, away } = match.score.fullTime;
  if (home === null || away === null) return undefined;
  return { ft: [home, away] };
}

export function matchesToFeed(matches: Match[] | null): Record<number, FeedMatch> {
  const feed: Record<number, FeedMatch> = {};
  if (!matches) return feed;

  for (const match of matches) {
    if (!KNOCKOUT_STAGES.has(match.stage)) continue;

    const kickoffMs = new Date(match.utcDate).getTime();
    const num = KICKOFF_TO_NUM.get(kickoffMs);
    if (num == null) continue;

    feed[num] = {
      num,
      team1: match.homeTeam.name,
      team2: match.awayTeam.name,
      score: toBracketScore(match),
      utcDate: match.utcDate,
      ground: NUM_TO_GROUND.get(num) ?? '',
      status: match.status,
      minute: match.minute,
      injuryTime: match.injuryTime
    };
  }

  return feed;
}

export function normalizeFeed(feed: Record<number, FeedMatch>): Record<number, FeedMatch> {
  return feed;
}

export function winnerIndex(score?: BracketScore): 0 | 1 | null {
  if (!score) return null;
  const s = score.p ?? score.et ?? score.ft;
  if (!s || s.length < 2 || s[0] === s[1]) return null;
  return s[0] > s[1] ? 0 : 1;
}

export function scoreLabel(score?: BracketScore): string {
  if (!score) return '';
  if (score.p) {
    const base = score.et ?? score.ft ?? score.p;
    return `${base[0]}–${base[1]} (${score.p[0]}–${score.p[1]} pens)`;
  }
  if (score.et) return `${score.et[0]}–${score.et[1]} a.e.t.`;
  if (score.ft) return `${score.ft[0]}–${score.ft[1]}`;
  return '';
}

export function isFeedLive(entry?: FeedMatch): boolean {
  if (!entry?.status) return false;
  return entry.status === 'IN_PLAY' || entry.status === 'PAUSED';
}

export function isFeedFinished(entry?: FeedMatch): boolean {
  return entry?.status === 'FINISHED';
}

export function feedHasScore(entry?: FeedMatch): boolean {
  return !!entry?.score?.ft || !!entry?.score?.et || !!entry?.score?.p;
}

export { isLiveMatch };

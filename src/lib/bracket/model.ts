import { CHILDREN, LIVE_MS, NODE_NUMS, PARENT, R32SET, SOON_MS, levelOf } from './constants';
import { winnerIndex, scoreLabel, isFeedLive, feedHasScore } from './adapter';
import type { BracketNode, FeedMatch } from './types';

export interface RoundLabels {
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
  champion: string;
  tbd: string;
}

export function buildModel(feed: Record<number, FeedMatch>): Record<number, BracketNode> {
  const node: Record<number, BracketNode> = {};
  const winners: Record<number, string | null> = {};

  function participants(num: number): [string | null, string | null] {
    if (R32SET.has(num)) {
      const m = feed[num] ?? {};
      return [m.team1 ?? null, m.team2 ?? null];
    }
    const [c1, c2] = CHILDREN[num];
    return [winner(c1), winner(c2)];
  }

  function winner(num: number): string | null {
    if (num in winners) return winners[num];
    const p = participants(num);
    const sc = feed[num]?.score;
    const idx = winnerIndex(sc);
    let w: string | null = null;
    if (idx != null && p[idx]) w = p[idx];
    winners[num] = w;
    return w;
  }

  for (const num of NODE_NUMS) {
    const p = participants(num);
    const m = feed[num] ?? {};
    const sc = m.score;
    node[num] = {
      participants: p,
      winner: winner(num),
      score: sc,
      label: scoreLabel(sc),
      utcDate: m.utcDate,
      date: m.date ?? '',
      time: m.time ?? '',
      ground: m.ground ?? '',
      status: m.status
    };
  }

  return node;
}

export function kickoffMs(node: Pick<BracketNode, 'utcDate' | 'date' | 'time'>): number | null {
  if (node.utcDate) {
    const ms = new Date(node.utcDate).getTime();
    return Number.isNaN(ms) ? null : ms;
  }
  return kickoffInstant(node.date, node.time);
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function kickoffInstant(dateStr: string, timeStr: string): number | null {
  const dm = (dateStr || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const tm = (timeStr || '').match(/^(\d{1,2}):(\d{2})(?:\s*UTC([+-])(\d{1,2})(?::(\d{2}))?)?/);
  if (!dm || !tm) return null;
  const sign = tm[3] === '-' ? -1 : 1;
  const offMin = tm[3] ? sign * (+tm[4] * 60 + (+tm[5] || 0)) : 0;
  const asUTC = Date.UTC(+dm[1], +dm[2] - 1, +dm[3], +tm[1], +tm[2]);
  const ms = asUTC - offMin * 60_000;
  return Number.isNaN(ms) ? null : ms;
}

export function kickoffLabel(node: Pick<BracketNode, 'utcDate' | 'date' | 'time'>, tbd: string): string {
  if (!node.utcDate && !node.date) return tbd;
  const ms = kickoffMs(node);
  if (ms == null) {
    const m = node.date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    const day = m ? `${+m[3]} ${MONTHS[+m[2] - 1]}` : node.date;
    return node.time ? `${day} · ${node.time}` : day;
  }
  const d = new Date(ms);
  const day = d.toLocaleDateString([], { day: 'numeric', month: 'short' });
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });
  return `${day} · ${time}`;
}

export function matchStatus(node: BracketNode, now: number): '' | 'live' | 'soon' {
  if (node.label || feedHasScore({ score: node.score } as FeedMatch)) return '';
  if (!node.participants[0] || !node.participants[1]) return '';
  if (isFeedLive({ status: node.status } as FeedMatch)) return 'live';

  const ms = kickoffMs(node);
  if (ms == null) return '';
  const diff = ms - now;
  if (diff <= 0) return now < ms + LIVE_MS ? 'live' : '';
  return diff <= SOON_MS ? 'soon' : '';
}

export function roundName(num: number, labels: Pick<RoundLabels, 1 | 2 | 3 | 4 | 5>): string {
  return labels[levelOf(num) as 1 | 2 | 3 | 4 | 5] ?? '';
}

export { PARENT };

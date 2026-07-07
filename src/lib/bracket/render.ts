import { CHILDREN, NODE_NUMS, PARENT, ROOT, R32SET, levelOf, nationClass, venueLabel } from './constants';
import {
  CAP_W,
  FLAG_ORDER,
  RADIUS,
  angleOf,
  capsulePath,
  connectorSegments,
  flagAngle,
  pt,
  trophySvg
} from './geometry';
import { kickoffLabel, liveClockLabel, matchStatus, roundName, type RoundLabels } from './model';
import type { BracketFlag, BracketNode, BracketTip } from './types';

export type { RoundLabels } from './model';

function escapeAttr(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

function hlClass(tip: BracketTip): string {
  return tip.status ? ` ${tip.status}` : '';
}

function tipFor(
  model: Record<number, BracketNode>,
  num: number,
  now: number,
  labels: RoundLabels
): BracketTip {
  const n = model[num];
  const teams = `${n.participants[0] || labels.tbd} vs ${n.participants[1] || labels.tbd}`;
  const status = matchStatus(n, now);
  const liveClock = status === 'live' ? liveClockLabel(n) : '';
  return {
    round: roundName(num, labels),
    teams,
    score: n.label,
    when:
      status === 'live'
        ? liveClock || kickoffLabel(n, labels.tbd)
        : n.label
          ? ''
          : kickoffLabel(n, labels.tbd),
    status,
    venue: venueLabel(n.ground)
  };
}

function tipAttrs(tip: BracketTip, ground: string): string {
  return (
    `data-round="${escapeAttr(tip.round)}" data-teams="${escapeAttr(tip.teams)}" ` +
    `data-score="${escapeAttr(tip.score || '')}" data-when="${escapeAttr(tip.when || '')}" ` +
    `data-status="${escapeAttr(tip.status || '')}" data-venue="${escapeAttr(tip.venue || '')}" ` +
    `data-ground="${escapeAttr(ground || '')}"`
  );
}

type ConnForkState = '' | 'live' | 'soon' | 'win' | 'out';

function forkState(
  side: 0 | 1,
  num: number,
  model: Record<number, BracketNode>,
  now: number
): ConnForkState {
  const node = model[num];
  const here = matchStatus(node, now);
  if (here === 'live') return 'live';
  if (here === 'soon') return 'soon';

  if (!R32SET.has(num)) {
    const childNum = CHILDREN[num][side];
    const childHere = matchStatus(model[childNum], now);
    if (childHere === 'live') return 'live';
    if (childHere === 'soon') return 'soon';
  }

  const winner = node.winner;
  const participant = node.participants[side];
  if (winner && participant) return participant === winner ? 'win' : 'out';
  return '';
}

function getConnectorForkStateClass(state: ConnForkState): string {
  return state ? `conn-${state}` : '';
}

export interface BracketRenderOutput {
  svgHtml: string;
  flags: BracketFlag[];
  newWinners: Record<number, string>;
}

export function renderBracket(
  model: Record<number, BracketNode>,
  prevWinners: Record<number, string>,
  labels: RoundLabels
): BracketRenderOutput {
  const now = Date.now();
  const newWinners: Record<number, string> = {};
  const flags: BracketFlag[] = [];

  FLAG_ORDER.forEach((f, i) => {
    const team = model[f.num].participants[f.slot] || '';
    if (!team) return;
    const [x, y] = pt(RADIUS[0], flagAngle(i));
    const win = model[f.num].winner;
    const elim = win && win !== team;
    const tip = tipFor(model, f.num, now, labels);
    flags.push({
      x,
      y,
      team,
      cls:
        'r0' +
        (elim ? ' eliminated' : win === team ? ' win' : '') +
        hlClass(tip),
      tip,
      ground: model[f.num].ground
    });
  });

  let conns = '';
  let dots = '';
  let caps = '';

  for (const num of NODE_NUMS) {
    const lvl = levelOf(num);
    const gAttr = `data-ground="${escapeAttr(model[num].ground)}"`;
    const tip = tipFor(model, num, now, labels);
    caps += `<path class="bracket-cap cap${nationClass(model[num].ground) ? ' ' + nationClass(model[num].ground) : ''}" d="${capsulePath(num)}" stroke-width="${CAP_W[lvl]}" ${gAttr} ${tipAttrs(tip, model[num].ground)}/>`;
    if (lvl <= 4) {
      const segs = connectorSegments(num);
      const f1 = forkState(0, num, model, now);
      const f2 = forkState(1, num, model, now);

      const connectorFork1StateClass = getConnectorForkStateClass(f1);
      const connectorFork2StateClass = getConnectorForkStateClass(f2);

      // add fork paths
      conns += `<path class="bracket-conn conn-fork1 ${connectorFork1StateClass}" d="${segs.fork1}" ${gAttr}/>`;
      conns += `<path class="bracket-conn conn-fork2 ${connectorFork2StateClass}" d="${segs.fork2}" ${gAttr}/>`;

      // add fork bridge paths
      conns += `<path class="bracket-conn conn-bridge1 ${connectorFork1StateClass}" d="${segs.bridge1}" ${gAttr}/>`;
      conns += `<path class="bracket-conn conn-bridge2 ${connectorFork2StateClass}" d="${segs.bridge2}" ${gAttr}/>`;
    }

    if (num === ROOT) continue;

    const [x, y] = pt(RADIUS[lvl], angleOf(num));
    const w = model[num].winner;
    if (w) {
      newWinners[num] = w;
      const pop = prevWinners[num] !== w ? ' pop' : '';
      const nextNum = PARENT[num];
      const nextTip = nextNum != null ? tipFor(model, nextNum, now, labels) : tipFor(model, num, now, labels);
      const advanced =
        nextNum != null && model[nextNum] && model[nextNum].winner === w ? ' win' : '';
      flags.push({
        x,
        y,
        team: w,
        cls: `r${lvl}${advanced}${pop}${hlClass(nextTip)}`,
        tip: nextTip,
        ground: model[num].ground
      });
    } else {
      dots += `<circle class="bracket-dot dot" cx="${x}" cy="${y}" r="5" ${gAttr}/>`;
    }
  }

  const finalNode = model[ROOT];
  const finalG = `data-ground="${escapeAttr(finalNode.ground)}"`;
  const sf1 = pt(RADIUS[4], angleOf(101));
  const sf2 = pt(RADIUS[4], angleOf(102));
  let center = `<line class="bracket-center-line center-line" x1="${sf1[0]}" y1="${sf1[1]}" x2="${sf2[0]}" y2="${sf2[1]}" ${finalG}/>`;

  let champFlag: BracketFlag | null = null;
  if (finalNode.winner) {
    newWinners[ROOT] = finalNode.winner;
    const pop = prevWinners[ROOT] !== finalNode.winner ? ' pop' : '';
    const t = tipFor(model, ROOT, now, labels);
    t.round = labels.champion;
    champFlag = {
      x: 500,
      y: 500,
      team: finalNode.winner,
      cls: `champ${pop}`,
      tip: t,
      ground: finalNode.ground
    };
  } else {
    center += trophySvg();
  }

  const svgHtml = `<svg viewBox="0 0 1000 1000" aria-hidden="true">${caps}${conns}${center}${dots}</svg>`;
  const allFlags = champFlag ? flags.concat([champFlag]) : flags;

  return { svgHtml, flags: allFlags, newWinners };
}

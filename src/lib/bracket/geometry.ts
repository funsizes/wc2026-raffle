import { CHILDREN, R32SET, ROOT, levelOf } from './constants';

export const CX = 500;
export const CY = 500;
export const RADIUS: Record<number, number> = { 0: 430, 1: 344, 2: 260, 3: 178, 4: 98, 5: 0 };
export const STEP = 360 / 32;
export const CAP_W: Record<number, number> = { 1: 82, 2: 72, 3: 66, 4: 64, 5: 64 };

function dfsFlags(num: number): { num: number; slot: 0 | 1 }[] {
  if (R32SET.has(num)) return [{ num, slot: 0 }, { num, slot: 1 }];
  const [a, b] = CHILDREN[num];
  return dfsFlags(a).concat(dfsFlags(b));
}

export const FLAG_ORDER = dfsFlags(ROOT);

export function flagAngle(i: number): number {
  return i < 16 ? -(i + 0.5) * STEP : (i - 16 + 0.5) * STEP;
}

const angleMemo: Record<number, number> = {};

export function angleOf(num: number): number {
  if (num in angleMemo) return angleMemo[num];

  let a: number;
  if (R32SET.has(num)) {
    const idx: number[] = [];
    FLAG_ORDER.forEach((f, i) => {
      if (f.num === num) idx.push(i);
    });
    a = (flagAngle(idx[0]) + flagAngle(idx[1])) / 2;
  } else {
    const [c1, c2] = CHILDREN[num];
    a = (angleOf(c1) + angleOf(c2)) / 2;
  }

  return (angleMemo[num] = a);
}

export function pt(radius: number, angDeg: number): [number, number] {
  const r = (angDeg * Math.PI) / 180;
  return [CX + radius * Math.sin(r), CY - radius * Math.cos(r)];
}

export function childFlagAngle(num: number, slot: 0 | 1): number {
  let target = -1;
  for (let i = 0; i < FLAG_ORDER.length; i++) {
    if (FLAG_ORDER[i].num === num && FLAG_ORDER[i].slot === slot) {
      target = i;
      break;
    }
  }
  return flagAngle(target);
}

function splitQuadratic(
  start: [number, number],
  control: [number, number],
  end: [number, number]
): { bridge1: string; bridge2: string } {
  const mid: [number, number] = [
    0.25 * start[0] + 0.5 * control[0] + 0.25 * end[0],
    0.25 * start[1] + 0.5 * control[1] + 0.25 * end[1]
  ];
  const ctrl1: [number, number] = [
    0.5 * (start[0] + control[0]),
    0.5 * (start[1] + control[1])
  ];
  const ctrl2: [number, number] = [
    0.5 * (control[0] + end[0]),
    0.5 * (control[1] + end[1])
  ];
  return {
    bridge1: `M${start[0]} ${start[1]} Q${ctrl1[0]} ${ctrl1[1]} ${mid[0]} ${mid[1]}`,
    bridge2: `M${mid[0]} ${mid[1]} Q${ctrl2[0]} ${ctrl2[1]} ${end[0]} ${end[1]}`
  };
}

export function connectorSegments(num: number): {
  fork1: string;
  fork2: string;
  bridge1: string;
  bridge2: string;
} {
  const lvl = levelOf(num);
  const Rc = RADIUS[lvl - 1];
  const Rp = RADIUS[lvl];
  const [c1, c2] = R32SET.has(num)
    ? [{ ang: childFlagAngle(num, 0) }, { ang: childFlagAngle(num, 1) }]
    : [{ ang: angleOf(CHILDREN[num][0]) }, { ang: angleOf(CHILDREN[num][1]) }];
  const ap = angleOf(num);
  const A1 = pt(Rp, c1.ang);
  const A2 = pt(Rp, c2.ang);
  const C1 = pt(Rc, c1.ang);
  const C2 = pt(Rc, c2.ang);
  const P = pt(Rp, ap);
  const ctrl: [number, number] = [2 * P[0] - 0.5 * (A1[0] + A2[0]), 2 * P[1] - 0.5 * (A1[1] + A2[1])];
  const { bridge1, bridge2 } = splitQuadratic(A1, ctrl, A2);
  return {
    fork1: `M${C1[0]} ${C1[1]} L${A1[0]} ${A1[1]}`,
    fork2: `M${A2[0]} ${A2[1]} L${C2[0]} ${C2[1]}`,
    bridge1,
    bridge2
  };
}

export function capsulePath(num: number): string {
  const lvl = levelOf(num);
  const R = RADIUS[lvl - 1];
  if (num === ROOT) {
    const [x1, y1] = pt(R, angleOf(101));
    const [x2, y2] = pt(R, angleOf(102));
    return `M${x1} ${y1} L${x2} ${y2}`;
  }
  const [a1, a2] = R32SET.has(num)
    ? [childFlagAngle(num, 0), childFlagAngle(num, 1)]
    : [angleOf(CHILDREN[num][0]), angleOf(CHILDREN[num][1])];
  const [x1, y1] = pt(R, a1);
  const [x2, y2] = pt(R, a2);
  return `M${x1} ${y1} A ${R} ${R} 0 0 ${a2 >= a1 ? 1 : 0} ${x2} ${y2}`;
}

export function trophySvg(): string {
  return `<g class="trophy" transform="translate(${CX},${CY})">
    <path d="M-14,-38 L14,-38 L10,-18 L18,-18 C18,2 8,14 -2,18 L2,28 L-2,28 L-6,18 C-16,14 -26,2 -26,-18 L-18,-18 Z" fill="#c8a24a" stroke="#2a2823" stroke-width="1.5"/>
    <rect x="-20" y="28" width="40" height="6" rx="2" fill="#c8a24a" stroke="#2a2823" stroke-width="1.5"/>
  </g>`;
}

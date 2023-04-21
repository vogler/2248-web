// seconds to duration string sep. by ':', always leading zeros; t is seconds, xs is array of units (smallest unit right)
const durationFmtLZ = (t: number, xs: number[]): string => {
  const d = xs.pop();
  if (!d) return t.toString();
  return (t >= d ? durationFmtLZ(Math.floor(t / d), xs) + ':' : '') + (t % d + '').padStart(2, '0');
};
// seconds to duration string sep. by units; t is seconds, xs is array of units (smallest unit right)
const durationFmt = (t: number, uv: number[], un: string[]): string => {
  const v = uv.pop(); // unit value
  const n = un.pop() || '?'; // unit name
  if (!v) return t.toString();
  const r = t % v + ''; // rest
  return (t >= v ? durationFmt(Math.floor(t / v), uv, un) + r.padStart(2, '0') : r) + n;
};

export const duration = (t: number) => durationFmt(Math.floor(t/1000), [24, 60, 60], ['d','h','m','s']);

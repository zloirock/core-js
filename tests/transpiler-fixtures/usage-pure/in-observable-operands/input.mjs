export function check(flag, trace) {
  const box = { get items() { trace.push('read'); return []; } };
  let realm = { Symbol: { iterator: 'custom' } };
  if (flag) realm = globalThis;
  return ['flat' in box.items, (trace.touch, realm).Symbol.iterator in []];
}

const effects = [];
export function read(choose) {
  const { from, of } = choose ? (() => { effects.push([1].at(0)); return Array; })() : Array;
  return [from([1]), of(2)];
}
export function fallback({ from, missing = 7 } = globalThis.window?.Array || (effects.push('fallback'), Array)) {
  return [from([3]), missing];
}
export { effects };

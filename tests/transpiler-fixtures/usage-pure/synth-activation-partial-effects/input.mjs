// A partial static capture keeps its computed key and residual default in source order.
// Nested instance claims stay active before the body and the extracted from call.
const effects = [];
export function read(choose) {
  const { [(effects.push('key'), 'from')]: from, missing = (effects.push('default'), 7) } = choose
    ? (() => { effects.push([1].at(0)); return Array; })() : Array;
  effects.push('body');
  return [from([3]), missing];
}
export { effects };

// `'from' in (Array ?? Object)` cannot fold to a single static receiver,
// so the `in` check stays raw and only the `Array.from` / `Object.fromEntries`
// usages in the following statements get polyfilled independently.
const a = 'from' in (Array ?? Object);
const b = Array.from(src);
const c = Object.fromEntries(pairs);
export { a, b, c };

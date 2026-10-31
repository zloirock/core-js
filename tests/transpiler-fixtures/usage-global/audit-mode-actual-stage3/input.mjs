// `mode: 'actual'` includes Stage 3+ proposals on top of stable. RegExp.escape (Stage 3)
// is included in `actual` polyfill set; `mode: 'stable'` would skip it
const safe = RegExp.escape('a.b*');
const last = [1, 2, 3].at(-1);
console.log(safe, last);

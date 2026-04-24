// many independent (non-nested) polyfill transforms in one file - hits the fast path
// (`#hasNesting()` returns false) so the sort-desc-by-start + overwrite loop fires.
// each line triggers a distinct polyfill to verify they don't cross-contaminate
Array.from(a);
Object.fromEntries(b);
Array.of(1, 2, 3);
Array.isArray(c);
Number.isInteger(d);
Number.isFinite(e);
String.raw`${ f }`;
Symbol.for('x');
Object.values(g);
Object.entries(h);

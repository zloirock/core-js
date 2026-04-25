// many independent, non-nested polyfills in one file - exercises the fast path for the
// transform queue (no composition between entries). each line triggers a distinct polyfill
// so their rewrites shouldn't leak into each other's ranges
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

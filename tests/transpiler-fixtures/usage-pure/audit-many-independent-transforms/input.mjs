// many independent, non-nested polyfills in one file. each line triggers a distinct
// polyfill so their rewrites shouldn't leak into each other
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

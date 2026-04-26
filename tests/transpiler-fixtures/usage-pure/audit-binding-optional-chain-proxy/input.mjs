// binding via optional chain on a proxy global `self?.Promise`: through the alias,
// subsequent references still resolve to the pure-mode `Promise` polyfill.
const P = self?.Promise;
P.resolve(1);

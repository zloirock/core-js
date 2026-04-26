// binding via optional chain on a proxy global `self?.Promise`: subsequent uses through
// the alias `P` still resolve to the polyfilled `Promise` constructor.
const P = self?.Promise;
P.resolve(1);

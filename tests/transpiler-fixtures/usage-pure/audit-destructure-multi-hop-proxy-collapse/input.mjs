// proxy-global chain with TWO intermediate hops (`globalThis.self.window.Array`). every proxy
// hop between the root and the constructor leaf must COLLAPSE, leaving `_globalThis.Array`
const { of, other } = globalThis.self.window.Array;
of(1, 2);
console.log(other);

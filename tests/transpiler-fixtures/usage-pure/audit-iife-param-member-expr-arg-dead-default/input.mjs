// An IIFE destructure param with a DEFAULT, invoked with a proxy-global MEMBER-EXPRESSION call-arg. The
// param-default is a polyfill dead-end for the destructured key(s) (`Object.from` / `Object.of` /
// `Object.allSettled` do not exist), so the live safe-access arg supersedes it and its static polyfill is
// synth-swapped in. Cases: a direct member, a deeper proxy hop (`globalThis.self.Array`), and a multi-key
// pattern. A default that itself carries a polyfill would instead stay the synth target (the live fallback
// for an undefined call-arg).
const a = (({ from } = Object) => from([1]))(globalThis.Array);

const b = (({ of } = Object) => of(1, 2))(globalThis.self.Array);

const c = (({ allSettled, any } = Object) => allSettled([]))(globalThis.Promise);

export { a, b, c };

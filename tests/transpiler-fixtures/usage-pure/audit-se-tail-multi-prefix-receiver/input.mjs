// SE-tail receiver with MULTIPLE leading expressions: `(a(), b(), globalThis).flat?.(0)`.
// the prefix loop maps every leading expression's source text - not just the first - and
// the substituted tail keeps the SE shape intact (`(a(), b(), _globalThis)`)
declare const a: () => void;
declare const b: () => void;
(a(), b(), globalThis).flat?.(0);

// A realm read of a global the build is told not to inject decides nothing: an engine lacking it reads
// `undefined` there and runs the right, whose static keeps its module (`Array.from`). A bare name an
// engine lacks throws before the right could run, so the right needs nothing (no `Array.of` module).
const list = [1, 2];
export const viaRealm = (globalThis.Iterator || Array).from(list);
export const viaBare = (Iterator || Array).of(list);

// A realm read of a global the build is told not to inject still decides: the data subset carries `Iterator`,
// so the right never runs and its static loads nothing (no `Array.from` module), as over a bare name an engine
// lacking it throws on before the right could run (no `Array.of` module). A realm read of one the subset lacks
// at the mode decides nothing: the right's static keeps its module (`Array.fromAsync`).
const list = [1, 2];
export const viaRealm = (globalThis.Iterator || Array).from(list);
export const viaBare = (Iterator || Array).of(list);
export const viaUncarried = (globalThis.AsyncIterator || Array).fromAsync(list);

// A realm read of a global the build is told not to substitute still decides: the data subset carries `Iterator`,
// so the right never runs and the read over it takes the left's own static, raw as the excluded entries leave it,
// as over a bare name an engine lacking it throws on before the right could run. A realm read of one the subset
// lacks at the mode decides nothing: a member read over it takes the right's static through the identity guard.
const list = [1, 2];
export const viaRealm = (globalThis.Iterator || Array).from(list);
export const viaBare = (Iterator || Array).of(list);
export const viaUncarried = (globalThis.AsyncIterator || Array).fromAsync(list);

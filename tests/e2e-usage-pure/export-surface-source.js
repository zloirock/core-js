// exported destructure hosts whose emitted extraction statements must keep every user binding on
// the module surface and no emitter-internal temp: SE-key + live-default memo hosts (both memo
// flavours) and a flatten-claimed declaration with a later-declarator receiver memo. consumed by
// `export-surface.js`, which asserts this module's namespace - the export list is observable only
// from the outside, so the assertions cannot live here
let keyEvals = 0;
function se() {
  keyEvals += 1;
  return null;
}
function fallback() {
  return 'default';
}
const holder = { p: [1, 2, 3] };
export const { [(se(), 'with')]: w = fallback(), [(se(), 'toSpliced')]: t } = [9];
// eslint-disable-next-line es/no-nonstandard-array-prototype-properties -- plain sibling binding of an intentionally absent key
export const { [(se(), 'flat')]: m = fallback(), other } = holder.p;
// eslint-disable-next-line @stylistic/one-var-declaration-per-line -- the flatten + later-declarator pairing is under test
export const { Array: { from } } = globalThis, { [(se(), 'at')]: fl } = holder.p;
export function keyEvalCount() {
  return keyEvals;
}

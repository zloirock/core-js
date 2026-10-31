// static-FALLBACK path (only the receiver swaps to the pure ctor; the member is NOT polyfilled):
// a trailing optional CALL `?.(` is a genuine guard for the possibly-undefined member and must
// survive the rewrite (native returns undefined on a missing member; stripping it would throw)
const r = Promise.noSuchStatic?.(1);
r;

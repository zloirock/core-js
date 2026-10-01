// a mutation key the canons cannot read could have replaced ANY member - the receiver
// deopts whole and its reads stay on the live global
import { key, obj, flag } from './keys.mjs';
Array[key] = function patched() { return []; };
export const assigned = Array.from('ab');
// the in-check and a destructure read consult the same deopt - no fold, no ponyfill binding
export const probedIn = 'from' in Array;
delete Map[key];
export const deleted = Map.groupBy([1], x => x);
[Iterator[key]] = [1];
export const destructured = Iterator.range(0, 3);
// a for-in member head assigns the slot per iteration - same unreadable-key deopt
for (String[key] in obj);
export const iterated = String.raw({ raw: ['x'] });
export const { raw: destructuredRaw } = String;
// a value-fan receiver deopts EVERY branch the write can land on
(flag ? Number : JSON)[key] = () => 1;
export const branchedFirst = Number.isFinite(1);
export const branchedSecond = JSON.rawJSON('1');
// the optional-member delete spelling classifies like its plain twin
delete RegExp?.[key];
export const optionalDeleted = RegExp.escape('a');
// a SHADOWED receiver is a local, not the global - its write records nothing, so the
// same-named untouched builtin keeps its substitution (control and negative in one)
export function scoped(Promise) { Promise[key] = 1; return Promise; }
export const control = Promise.try(() => 1);

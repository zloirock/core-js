import { makeNestedSource } from './export-retained-input.js';

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

// The receiver is opaque here; extracting a nested method still owes one read per getter.
const nestedSource = makeNestedSource();
export const { Array: { prototype: { at: nestedAt } }, Object: { keys: nestedKeys }, other: nestedOther } = nestedSource;

export const bindingEvents = [];
function beforeStaticBinding() { bindingEvents.push(typeof keyedFrom); }
function afterStaticBinding() { bindingEvents.push(typeof keyedFrom); }
// var keeps the pre-initialization observation meaningful after Babel lowers lexical declarations.
// eslint-disable-next-line no-var -- observing the hoisted binding is the behavior under test
export var { [(beforeStaticBinding(), 'from')]: keyedFrom, [(afterStaticBinding(), 'isArray')]: keyedIsArray } = Array;

export const nestedBindingEvents = [];
// eslint-disable-next-line no-var -- an exported nested key observes the hoisted source binding
export var { before: keyedBefore, x: { [(nestedBindingEvents.push(typeof nestedFrom), 'from')]: nestedFrom }, after: keyedAfter } = { before: 1, x: Array, after: 2 };

export const realmEvents = [];
let realmSource = {
  before: undefined,
  // eslint-disable-next-line es/no-accessor-properties -- the effectful getter is the exported constructor's source
  get realm() { realmEvents.push('getter'); return globalThis; },
  after: 2,
};
const { before: realmBefore = (realmSource = {}, 1), realm: { Map: RealmMap }, after: realmAfter } = realmSource;
export { RealmMap, realmBefore, realmAfter };

const exportedRealm = {
  // eslint-disable-next-line es/no-accessor-properties -- the getter keeps its effect under an export declaration
  get realm() { realmEvents.push('export'); return globalThis; },
};
export const { realm: { Promise: RealmPromise } } = exportedRealm;

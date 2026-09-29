// a realm key that names no built-in is an unknown slot, capitalised or not: its inner default runs
// wherever the realm leaves the slot empty, so the default is mirrored and the slot keeps its own
// read - on every host below alike. the last row is the control: a known built-in is the realm's
// own slot, whose default never runs
function use() {/* empty */}
const { Deno: { env } = {} } = globalThis;
const { UserMaps: { groupBy } = Map } = globalThis;
let fromAsync;
({ UserArrays: { fromAsync } = Array } = globalThis);
for (const { UserPromises: { allSettled } = Promise } of [globalThis]) use(allSettled);
const [{ UserObjects: { fromEntries } = Object }] = [globalThis];
const key = 'UserStrings';
const { [key]: { raw } = String } = globalThis;
const { self: { UserNumbers: { isInteger } = Number } = {} } = globalThis;
const realm = globalThis;
const { UserOwners: { hasOwn } = Object } = realm;
const { userLists: { of } = Array } = globalThis;
const { userRanges: { at } = [1, 2] } = globalThis;
const [{ self: { userFinders: { includes } = [1, 2] } }] = [globalThis];
const { Math: { sumPrecise } = {} } = globalThis;
use(env, groupBy, fromAsync, fromEntries, raw, isInteger, hasOwn, of, at, includes, sumPrecise);

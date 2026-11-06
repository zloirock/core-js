// Unknown realm slots keep live defaults and their own reads. Instance dispatch folds both
// the slot and its fallback; static defaults keep their mirrors. A known global makes its default dead.
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

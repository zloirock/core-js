// a realm key that names no built-in is an unknown slot, capitalised or not: where the realm leaves
// it empty the inner default is what the leaf reads, so the default's static is injected on every
// host below - one static per row, so a dropped host shows in the import set. the last row is the
// control: a known built-in keeps its own claim
function use() {/* empty */}
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
use(groupBy, fromAsync, fromEntries, raw, isInteger, hasOwn, of, at, includes, sumPrecise);

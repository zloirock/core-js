// Literal containers can bind the realm object and resolve the Promise superclass directly.
// A property read from the realm is uncertain and selects the polyfill only after an identity check.
// Unresolved unions, defaults and non-global containers keep their native superclass reads.
// Distinct static methods make every row observable.
const [arrayWrap] = [globalThis];
const { slot: objectWrap } = { slot: globalThis };
const { keyRead } = globalThis;
const [nonGlobal] = [somethingElse];
const [unionWrap] = cond ? [globalThis] : [somethingElse];
const [defaulted = somethingElse] = [];
export class ViaArray extends arrayWrap.Promise { static m() { return super.any([]); } }
export class ViaObject extends objectWrap.Promise { static m() { return super.allSettled([]); } }
export class BailKeyRead extends keyRead.Promise { static m() { return super.race([]); } }
export class BailNonGlobal extends nonGlobal.Promise { static m() { return super.reject(); } }
export class BailUnion extends unionWrap.Promise { static m() { return super.resolve(); } }
export class BailDefault extends defaulted.Promise { static m() { return super.all([]); } }

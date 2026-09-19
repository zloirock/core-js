// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.

// A single property keeps its key effect before the extraction and default.
const { [(e1(), 'at')]: a = dfltA() } = recvA;

// The key, extraction and default all run before the following sibling declarator.
const { [(e2(), 'flat')]: f = dfltB() } = recvB, other = 1;

// A literal receiver is captured once before its key effect and extraction.
const { [(e3(), 'includes')]: i = dfltC() } = [7, 8];

// eliminate arm (array-wrapped sole binding, pure key): no residual survives, the guard
// wraps the extraction in place
const [{ toReversed = dfltD() }] = [recvD];

// Destructuring evaluates each key, read and default before the next property.
// The first default therefore runs before the second key effect.
const { [(e4(), 'findLast')]: fl = dfltE(), [(e5(), 'findLastIndex')]: fli } = recvE;

const { [(e6(), 'toSorted')]: ts = dfltF(), ...restF } = recvF;

// Multiple properties share one captured receiver and retain their native key, read
// and default order in the declaration.
const { [(e7(), 'with')]: w7 = dfltG(), [(e8(), 'toSpliced')]: t8 } = [9];

export { a, f, i, toReversed, other, fl, fli, ts, restF, w7, t8 };

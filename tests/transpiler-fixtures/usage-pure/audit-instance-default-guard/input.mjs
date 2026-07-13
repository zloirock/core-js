// an instance dispatcher may return undefined on a foreign receiver (its own-property read),
// so a user default on an instance-extraction leaf stays LIVE behind the `=== void 0` guard;
// with a kept SE key the guarded extraction evaluates AFTER the key's effect (native order).
// static/global extractions keep dropping the default - their pure bindings are always defined

// standalone arm: trailing sibling declarator after the kept-key residual
const { [(e1(), 'at')]: a = dfltA() } = recvA;

// sibling-declarator arm: the guarded extraction lands between the residual and the sibling
const { [(e2(), 'flat')]: f = dfltB() } = recvB, other = 1;

// memoized const-literal receiver: the memo ref numbers before the guard ref
const { [(e3(), 'includes')]: i = dfltC() } = [7, 8];

// eliminate arm (array-wrapped sole binding, pure key): no residual survives, the guard
// wraps the extraction in place
const [{ toReversed = dfltD() }] = [recvD];

// native evaluates a destructure PER PROP (key, read, default, next key): the residual
// splits at a live-defaulted entry, so its guard runs BEFORE the following prop's key
// effect, and post-split entries ride the same trailing chain
const { [(e4(), 'findLast')]: fl = dfltE(), [(e5(), 'findLastIndex')]: fli } = recvE;

// rest keeps the pattern whole (rest gathers by exclusion of its own pattern's keys), so
// keys batch before the guard - a documented boundary
const { [(e6(), 'toSorted')]: ts = dfltF(), ...restF } = recvF;

// memoized receiver + split: both segments and the guard read the shared ref; the extraction
// PLACEMENT differs per emitter (the text emitter's preceding statements vs the AST emitter's
// comma chain - a pre-existing cosmetic, side-effect order is identical)
const { [(e7(), 'with')]: w7 = dfltG(), [(e8(), 'toSpliced')]: t8 } = [9];

export { a, f, i, toReversed, other, fl, fli, ts, restF, w7, t8 };

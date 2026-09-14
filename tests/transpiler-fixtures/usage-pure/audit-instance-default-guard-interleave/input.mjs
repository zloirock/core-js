// PATTERN axis of the per-prop interleave: segments and guards alternate exactly like the
// native per-prop evaluation (key, read, default, next key)

// both props defaulted: two guards, two segments
const { [(e1(), 'at')]: a = dfltA(), [(e2(), 'flat')]: f = dfltB() } = recvA;

// Three defaulted properties preserve key, extraction and default order from left to right.
const { [(e3(), 'includes')]: i = dfltC(), [(e4(), 'findLast')]: fl = dfltD(), [(e5(), 'findLastIndex')]: fli = dfltE() } = recvB;

// a later default may read the PRIOR extracted binding (bound before its key evaluates)
const { [(e6(), 'toSorted')]: ts = dfltF(), [(e7(), 'toReversed')]: tr = ts } = recvC;

// two declarators of one declaration, each with its own split
const { [(e8(), 'flatMap')]: fm = dfltG(), [(e9(), 'entries')]: en } = recvD,
  { [(e10(), 'with')]: w10 = dfltH(), [(e11(), 'keys')]: ks } = recvE;

// shared memoized receiver with two guards: one `_ref`, guards read it in order (typed -
// both defaults dead at runtime, the shape still locks ref sharing and numbering)
const { [(e12(), 'fill')]: fi = dfltI(), [(e13(), 'find')]: fnd = dfltJ() } = [7, 8];

// a nested assignment under a USER nav the extraction owns dispatches on the nav (`recvF.codes`,
// read once) and the consumed slot leaves with the host - the declaration host's answer
let m;
({ codes: { findIndex: m = dfltK() } } = recvF);

export { a, f, i, fl, fli, ts, tr, fm, en, w10, ks, fi, fnd, m };

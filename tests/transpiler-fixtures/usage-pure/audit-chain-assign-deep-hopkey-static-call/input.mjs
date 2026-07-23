// a DEEP chain-assign root (`(r = globalThis)[hopKey]...`, not the peeled outer) whose buried hop-key carries
// a side effect and whose leaf is a static CALL: the whole receiver flattens into ONE side-effect sequence
// both emitters render identically, the chain-assign spliced at its eval position (before the hop-key SE that
// runs after it) via `chainAssignInsertAt`. gated on a terminal static-method CALL (a memoized value-read
// would split the emitters). distinct static + instance method per line.
let r;
let c = 0;
const k = () => (c++, 'self');
export const dottedKey = (r = globalThis)[(c++, 'self')].Array.of(1, 2);
export const callKey = (r = globalThis)[k()].Array.from([3]).at(0);

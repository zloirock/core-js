// rest-pattern variant of multi-prop SE-prefix lift. extracted polyfilled prop must lift
// the SE prefix exactly once; the surviving rest-pattern receives the bare proxy in its
// init slot - duplicating the SE inside the remainder pattern would re-evaluate the side
// effect on the destructure rebuild
let sideEffectCount = 0;
const sideEffect = () => sideEffectCount++;
const { Array: { from }, ...rest } = (sideEffect(), globalThis);

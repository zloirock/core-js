// an UNPOLYFILLED plain key beside a polyfilled one in a per-branch synth: each branch literal
// carries the polyfill for the resolvable key and re-reads the unresolvable one through THAT
// branch's receiver - the runtime picks the branch, both keys stay branch-consistent
let cond = true;
const r = (({ from, custom } = cond ? Array : Iterator) => [from([1]), custom])();

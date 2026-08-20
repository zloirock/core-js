// an UNPOLYFILLED side-effecting computed key beside a polyfilled one in a synth-swap pattern:
// the literal mirrors the SE key as its PLAIN string name and the value reads the receiver by
// that static name - the prefix effect stays on the pattern key and runs exactly once (cloning
// the SE expression into the receiver read would re-run it when the literal is built)
let c = 0;
const r = (({ from, [(c++, 'custom')]: x } = Array) => [from([1]), x, c])();

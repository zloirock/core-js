// the composed two-step over an UNTYPED receiver: nothing says what the value is, so the outer hop
// dispatches GENERICALLY - the surface is what the hop reads, and the key names it whatever the
// receiver turns out to be. spelling the hop raw fired the source's default on the very path the
// ponyfill answers, which is the arm a foreign receiver actually takes
function viaParam(o) {
  const { at: { name: viaHop } = {} } = o;
  return viaHop;
}
// ... and the receiver needs no re-readable token of its own: the hop step spells it ONCE, inside
// its own dispatch, so a CALL and a literal compose exactly like a binding - and the claim INSIDE
// such a receiver keeps its own step, because the spelling is read LIVE rather than copied at
// registration (a copy taken before that rewrite dropped the inner `slice`)
const viaCall = mk();
const { at: { name: fromCall } = {} } = viaCall;
const { at: { name: fromLiteral } = {} } = [1, 2];
const { at: { name: fromInnerClaim } = {} } = [1, 2].slice();
export { fromCall, fromLiteral, fromInnerClaim };
try {
  risky();
} catch ({ at: { name: viaCatch } = {} }) {
  use(viaCatch);
}
// the CATCH host is the same question one relocation further: the caught value has no type either,
// and its flat twin already dispatches generically
try {
  risky();
} catch ({ at: caught = 1 }) {
  use(caught);
}
try {
  risky();
} catch ({ at: flat }) {
  use(flat);
}
export { viaParam };
// ... and a receiver whose CONSTRUCTOR this pass already substituted needs no hop dispatch at all:
// the ponyfill carries the method on its own prototype, which is why the flat twin of the same read
// is native. an instance method pure adds to a NATIVE prototype is the other case, and it dispatches
const mapRecv = new Map();
const { keys: { at: fromReplacedCtor } = [] } = mapRecv;
const arrayRecv = new Array(3);
const { flat: { at: fromNativeProto } = [] } = arrayRecv;
export { fromReplacedCtor, fromNativeProto };

// the composed two-step over an UNTYPED receiver: nothing says what the value is, so the outer hop
// dispatches GENERICALLY - the surface is what the hop reads, and the key names it whatever the
// receiver turns out to be. spelling the hop raw fired the source's default on the very path the
// ponyfill answers, which is the arm a foreign receiver actually takes
function viaParam(o) {
  const { at: { name: viaHop } = {} } = o;
  return viaHop;
}
export { viaParam };

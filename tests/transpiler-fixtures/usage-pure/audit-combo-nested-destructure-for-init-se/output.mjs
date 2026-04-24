import _globalThis from "@core-js/pure/actual/global-this";
// combo: nested proxy-global destructure from `globalThis` in for-init position + preceding
// side-effect expression in SequenceExpression init + body uses the destructured binding
function se() {
  return _globalThis;
}
for (const {
  Array: {
    from
  }
} = (se(), _globalThis); false;) from([]);
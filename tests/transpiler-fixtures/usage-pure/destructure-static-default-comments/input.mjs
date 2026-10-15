// Static pure bindings remove their unreachable defaults together with the comments inside them.
// Comments on a removed default must not annotate the surviving receiver prefix.

const { Array: { of = /* removed default */ fallback(/*#__PURE__*/ make()) } } = (/* receiver prefix */ touch(), this);
const { Array: { from = /* removed optional default */ fallback(/*#__PURE__*/ make()) } } = (/* optional receiver prefix */ touch?.(), this);
const { Object: { hasOwn = /*#__PURE__*/ factory() } } = (/* leading default receiver */ touchLeading(), this);
export { of, from, hasOwn };

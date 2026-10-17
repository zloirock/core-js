import _includes from "@core-js/pure/actual/instance/includes";
var _ref;
// A written function signature admits array and string returns.
// Only those includes variants are needed, even though no single Type fits.
const choose = () => true;
const box: {
  fn?: (value: string[] | string) => string[] | string;
} = {};
box.fn = (value: string[] | string): string[] | string => value;
const arg = choose() ? ["a", "b"] : "abcd";
use(_includes(_ref = box.fn(arg)).call(_ref, "b"));
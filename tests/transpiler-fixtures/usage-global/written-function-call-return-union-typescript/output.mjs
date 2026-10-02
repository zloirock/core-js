import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.includes";
// A written function signature admits array and string returns.
// Only those includes variants are needed, even though no single Type fits.
const choose = () => true;
const box: {
  fn?: (value: string[] | string) => string[] | string;
} = {};
box.fn = (value: string[] | string): string[] | string => value;
const arg = choose() ? ["a", "b"] : "abcd";
use(box.fn(arg).includes("b"));
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// A property getter may replace a later element's source binding.
// Extraction still reads the value captured before destructuring started.
export function read(first, second) {
  let later = second;
  const earlier = first(() => {
    later = replacement();
  });
  const [, _ref] = [earlier, later];
  const at = _at(earlier);
  const includes = _includes(_ref);
  return [at, includes];
}
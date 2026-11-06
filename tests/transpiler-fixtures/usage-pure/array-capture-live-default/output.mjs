import _includes from "@core-js/pure/actual/instance/includes";
// A live default supplies the captured value, never the original undefined source.
export function read(source) {
  const [_ref = fallback()] = [source],
    includes = _includes(_ref);
  return includes;
}
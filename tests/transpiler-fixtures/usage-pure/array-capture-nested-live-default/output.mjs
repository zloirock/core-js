// A pattern-valued claim keeps the default when its wrapper is normalized.
export function read(source) {
  const [_ref = fallback()] = [source];
  const {
    at: {
      length
    }
  } = _ref;
  return length;
}
// A pattern-valued claim keeps the default when its wrapper is normalized.
export function read(source) { const [{ at: { length } } = fallback()] = [source]; return length; }

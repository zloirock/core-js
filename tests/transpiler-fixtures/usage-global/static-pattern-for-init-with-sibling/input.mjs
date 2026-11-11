// A pattern-valued static stays an extraction beside a live loop-head sibling.
export function read(key) {
  for (const { from: { length }, [key]: other } = globalThis.Array; ;) return [length, other];
}

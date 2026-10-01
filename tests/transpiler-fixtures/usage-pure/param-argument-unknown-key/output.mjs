// Replacing an IIFE argument with a mirror has the same key collision risk.
export function read(key) {
  return (({
    at,
    [key]: other
  }) => [at, other])([7]);
}
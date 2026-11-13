// A receiver getter can observe a later rest binding in its TDZ.
export function read(probe = () => tail,
  { at } = { get at() { return probe(); } }, ...tail) { return at; }

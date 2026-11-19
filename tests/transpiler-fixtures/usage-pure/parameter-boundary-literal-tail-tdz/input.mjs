// A receiver getter can observe a later default binding in its TDZ.
export function read(probe = () => tail,
  { at } = { get at() { return probe(); } }, tail = {}) { return at; }

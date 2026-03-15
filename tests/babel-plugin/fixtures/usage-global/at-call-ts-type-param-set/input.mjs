function first<T>(s: Set<T>): T { return s.values().next().value; }
const x: Set<string> = new Set(['a']);
first(x).at(0).trim();

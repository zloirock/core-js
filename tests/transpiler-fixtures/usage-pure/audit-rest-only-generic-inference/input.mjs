// rest-only generic `function fn<T>(...xs: T[]): T` — T binds to element type of the first rest-arg
// so `s.at(0)` resolves to string.at, not the conservative array fallback
function fn<T>(...xs: T[]): T { return xs[0]; }
const s = fn('hello', 'world');
s.at(0);

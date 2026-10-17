// An identity return takes its value from the runtime argument position.
// A changed iterator prevents peeling the spread's literal element as that value.
Array.prototype[Symbol.iterator] = function* () { yield 'text'; };
export const result = ((value) => value)(...[[1]]).at(0);

// `const from = Array.from` followed by `from('hi')`: the call's return must narrow to
// Array. distinct chained methods exercise different return-type branches: `at` is
// generic-or-array, `flatMap` / `findLastIndex` are Array-only
const from = Array.from;
const xs = from('hi');
const a = xs.at(0);
const b = xs.flatMap(x => [x, x]);
const c = xs.findLastIndex(x => x === 'h');
export { a, b, c };

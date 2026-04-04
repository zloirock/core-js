type StringOrArray = string | number[];
function foo(x: StringOrArray) {
  if (typeof x === 'string') {
    x.at(-1);
  }
}

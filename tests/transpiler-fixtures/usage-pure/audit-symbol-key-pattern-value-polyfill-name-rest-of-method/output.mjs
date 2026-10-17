import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
const arr = [3];
const {
  [_Symbol$iterator]: {
    name,
    ...restOfMethod
  }
} = arr;
export { name };
export { restOfMethod };
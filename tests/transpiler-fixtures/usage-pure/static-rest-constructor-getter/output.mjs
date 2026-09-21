import _Promise from "@core-js/pure/actual/promise";
// The getter runs once and returns the same constructor index that supplies rest.
const source = {
  get value() {
    hit();
    return _Promise;
  }
};
const {
  value: {
    all,
    ...rest
  }
} = source;
export { all, rest };
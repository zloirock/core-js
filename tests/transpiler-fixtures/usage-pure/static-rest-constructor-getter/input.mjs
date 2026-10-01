// The getter runs once and returns the same constructor index that supplies rest.
const source = {
  get value() {
    hit();
    return Promise;
  },
};
const { value: { all, ...rest } } = source;
export { all, rest };

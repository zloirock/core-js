// A getter returning the rest source requires the full constructor family.
const source = {
  get value() {
    hit();
    return Promise;
  },
};
const { value: { all, ...rest } } = source;
export { all, rest };

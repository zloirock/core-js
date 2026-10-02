// A paired computed getter supplies the prefix of an inner setter-only default.
// The getter runs once, and only the array default supplies includes.
const key = "wrap";
for (const {
  wrap: {
    data: { includes } = [8, 9]
  }
} of [{
  get [key]() { return { set data(value) {} }; },
  set wrap(value) {}
}]) {
  use(includes.call([8, 9], 9));
}

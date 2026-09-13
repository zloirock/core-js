// Object-rest keeps the affected catch pattern native, including its named method slots.
// Independent reads and key/default expressions still receive their own polyfills.
const leaf = [5, 6];
try {
  throw {
    get data() {
      log();
      return leaf;
    }
  };
} catch ({
  data: {
    [(key(), 'at')]: method = fallback(),
    ...rest
  }
}) {
  use(method.call(leaf, -1), rest);
}
// Object-rest keeps the affected loop pattern native at its original evaluation point.
// Independent reads and key/default expressions still receive their own polyfills.
const leaf = [5, 6];
for (const {
  data: {
    [(key(), 'at')]: method = fallback(),
    ...rest
  }
} of [{
  get data() {
    log();
    return leaf;
  }
}]) {
  use(method.call(leaf, -1), rest);
}
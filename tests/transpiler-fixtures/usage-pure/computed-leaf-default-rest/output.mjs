// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
const leaf = [5, 6];
leaf.extra = 7;
const source = {
  before: 1,
  get data() {
    log();
    return leaf;
  },
  after: 2
};
const {
  before,
  data: {
    [(key(), 'at')]: method = fallback(),
    ...rest
  },
  after
} = source;
use(before, method.call(leaf, -1), rest.extra, after);
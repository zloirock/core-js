// A user object holding constructors mirrors as a realm root only where a binding leaf asks for it: with
// member targets alone the statics stay native in both emitters (an accepted limit), and one binding beside
// them mirrors the whole pattern, the member targets included.
const src = { Object, Array };
const o = {};
({ Array: { from: o.f, of: o.g } } = src);
let values;
({ Object: { entries: o.e, values } } = src);
export { o, values };

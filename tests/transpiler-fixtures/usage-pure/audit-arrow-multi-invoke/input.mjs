// Multiple calls keep the shared arrow body unchanged. The Array argument supplies its
// polyfilled static through a mirror; the Set argument retains its own constructor surface.
const fn = ({ from }) => from([1, 2, 3]);
fn(Array);
fn(Set);

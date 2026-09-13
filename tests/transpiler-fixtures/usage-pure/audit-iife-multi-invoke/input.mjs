// Multiple calls keep the parameter pattern unchanged. Each caller supplies its own value:
// Array receives a mirror with its from method, while Set keeps its constructor surface.
const fn = ({ from }) => from;
fn(Array);
fn(Set);

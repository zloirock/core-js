// nested destructure rooted in a user-owned local (`baz`) is no proxy-global chain, so nothing
// resolves by NAME here - what resolves is the hop the source itself reads. the leaf level keeps a
// sibling, so the shape flattens onto its twin (`{ at, bar } = baz.foo`) and the hop reads ONCE
// into a memo the dispatch and the residual share
const { foo: { at, bar } } = baz;
at(1); bar();

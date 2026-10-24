import _at from "@core-js/pure/actual/instance/at";
// nested destructure rooted in a user-owned local (`baz`) is no proxy-global chain, so nothing
// resolves by NAME here - what resolves is the hop the source itself reads. the leaf level keeps a
// sibling, so the shape flattens onto its twin (`{ at, bar } = baz.foo`) and the hop reads ONCE
// into a memo the dispatch and the residual share
const {
    foo: _ref
  } = baz,
  at = _at(_ref),
  {
    bar
  } = _ref;
at(1);
bar();
// A logical destructure init reads its key off the operand the selection yields: a `??` left the build
// decides (`Array`) takes its own static; an unknown left beside a constructor owning the key as a
// static (`Stub ?? Object`) keeps its own read, the static mirrored into the right; `&&` yields its right.
const { from } = Array ?? Stub;
const { keys } = Stub ?? Object;
const { entries } = Array && Map;

// The first binding receives its fallback before the computed key reads it.
function pick({ of, [of]: picked } = Array) {
  return [of, picked];
}
pick();

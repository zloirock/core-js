// a sibling COMPUTED key reads the polyfilled binding (`[of]: picked`). the key expression
// evaluates in param scope against the just-bound `of`, so relocating `of` via body-extract
// would strand it. the read is detected inside the computed key and the emitter bails to
// inline-default, keeping `of` bound. (no rest sibling: the computed key alone forces the bail)
function pick({ of, [of]: picked } = Array) {
  return [of, picked];
}
pick();

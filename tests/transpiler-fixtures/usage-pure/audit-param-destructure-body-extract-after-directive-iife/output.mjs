import _Array$from from "@core-js/pure/actual/array/from";
// param-destructure body-extract must land the inserted `let from = _Array$from;` AFTER the
// directive prologue, else the directive is pushed past position 0 and demoted. rest sibling
// excludes synth-swap so the body-extract path fires; custom directive dodges the spec ban on
// `"use strict"` with non-simple params. immediately-invoked, so every call site is visible
// and caller-lossy param emissions stay sound (the declared-fn twin keeps its params verbatim)
(function run({
  from: _unused,
  ...rest
} = Array) {
  "my custom directive";

  let from = _Array$from;
  return [from([1]), rest];
})();
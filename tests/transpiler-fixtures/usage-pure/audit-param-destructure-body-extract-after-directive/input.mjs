// param-destructure body-extract must land the inserted `let from = _Array$from;` AFTER the
// directive prologue, else the directive is pushed past position 0 and demoted. rest sibling
// excludes synth-swap so the body-extract path fires; custom directive dodges the spec ban on
// `"use strict"` with non-simple params. EXPORTED here, so external callers stay invisible and
// params can't be proven lossless - the body-extract is locked by the immediately-invoked twin
function run({ from, ...rest } = Array) {
  "my custom directive";
  return [from([1]), rest];
}
export { run };

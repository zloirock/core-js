// a user-import computed key in a PARAM-DEFAULT destructure is synth-safe (stable in-scope binding):
// the gate allows it, so the synth mirrors `[X]: receiver[X]` and still polyfills the sibling `from`,
// rather than bailing to body-extract. only a bare global or a core-js-sourced (rewritten symbol)
// import would bail
import X from "x";
function f({ [X]: y, from } = Array) {
  return [y, from];
}
f();

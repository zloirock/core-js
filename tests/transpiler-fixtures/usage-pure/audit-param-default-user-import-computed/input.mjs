// An imported key prevents a parameter mirror. The closed caller uses the default,
// allowing the named static to extract into the body without replaying the key.
import X from "x";
function f({ [X]: y, from } = Array) {
  return [y, from];
}
f();

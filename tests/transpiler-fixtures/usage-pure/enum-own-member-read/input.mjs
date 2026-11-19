// A runtime enum member is an own data value, including in computed-key expressions.
// The string value must remain a native read rather than dispatching an instance method.
enum E {
  at = "at"
}
use(E.at);
const box = {
  [E.at]: 1
};
use(box);

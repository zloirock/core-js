import _Array$from from "@core-js/pure/actual/array/from";
// private method with a preceding rest-collected param plus shorthand-with-default destructure
// (`#foo(...args, { from = [], [TAG]: tag } = Array)`). body-extract for the shorthand-default
// must still land inside the private method body, not the surrounding ClassDeclaration. the
// rest param exercises the param-list walk before the destructured param, ensuring the
// enclosing-function lookup picks the ClassPrivateMethod and not the class itself
const TAG = 't';
class C {
  #foo(arg, {
    [TAG]: tag
  } = Array, ...rest) {
    let from = _Array$from;
    return [arg, from, tag, rest];
  }
  call() {
    return this.#foo(0);
  }
}
new C().call();
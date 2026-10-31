import _Array$from from "@core-js/pure/actual/array/from";
// babel private method `#foo` is a function-like scope owner (own param scope + block
// body). body-extract for shorthand-with-default destructure must land inside the private
// method body. before the fix, the enclosing-function walker walked past
// `ClassPrivateMethod` to the surrounding ClassDeclaration, which has no body to insert
// into - the body-extract decl either crashed or landed at the wrong scope
const TAG = 't';
class C {
  #foo({
    from = [],
    [TAG]: tag
  } = {
    from: _Array$from,
    [TAG]: Array[TAG]
  }) {
    return [from, tag];
  }
  call() {
    return this.#foo();
  }
}
new C().call();
class Foo {
  bar() {
    return 'hello';
  }
}

const foo = new Foo();
const fn = foo.bar;
fn.name.at(0);

// Two-hop class inheritance: `Sub extends Mid extends Base`, with a namespace
// merged onto `Base`. `Sub.build()` must look up `build` through two layers of
// `extends` to find Base's namespace export and narrow the result to `Base`.
// `.at(0)` on the result must NOT emit Array#at or String#at - user class only.
class Base {}
namespace Base {
  export function build(): Base {
    return new Base();
  }
}
class Mid extends Base {}
class Sub extends Mid {}

Sub.build().at(0);

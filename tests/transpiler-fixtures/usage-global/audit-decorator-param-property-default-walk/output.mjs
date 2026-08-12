import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.string.iterator";
// the DEFAULT-bearing twin of the plain parameter-property decorator walk. A default turns the
// wrapper's inner slot into a pattern the scope walker refuses, so the unplugin pipeline rewrites
// the param before walking it - and the rewrite lands on a node type whose decorators the walker
// does NOT auto-reach, which is exactly the case the manual walk covers. Each decorator and the
// default itself take a distinct global so a dropped one cannot hide behind a sibling.
class Foo {
  constructor(@inject(Array.from([1]))
  @log(Array.of(2))
  private p = Object.fromEntries([])) {}
}
import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// the DEFAULT-bearing twin of the plain parameter-property decorator walk. A default turns the
// wrapper's inner slot into a pattern the scope walker refuses, so the unplugin pipeline rewrites
// the param before walking it - and the rewrite lands on a node type whose decorators the walker
// does NOT auto-reach, which is exactly the case the manual walk covers. Each decorator and the
// default itself take a distinct global so a dropped one cannot hide behind a sibling.
class Foo {
  constructor(@inject(_Array$from([1]))
  @log(_Array$of(2))
  private p = _Object$fromEntries([])) {}
}
import _at from "@core-js/pure/actual/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// the straight-line value narrow has the same read side: an instance field initializer reads the
// binding at `new`-time, after the array write that textually follows the class, so the string
// init proves nothing there and both families inject. the static field reads at class-eval and keeps
// the string
let listOrText = 'abc';
listOrText = 'def';
class Widget {
  first = _at(listOrText).call(listOrText, 0);
  static tag = _includesMaybeString(listOrText).call(listOrText, 'a');
}
listOrText = ['a', 'b'];
new Widget();
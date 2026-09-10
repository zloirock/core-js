import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
// the straight-line value narrow has the same read side: an instance field initializer reads the
// binding at `new`-time, after the array write that textually follows the class, so the string
// init proves nothing there and both families inject. the static field reads at class-eval and keeps
// the string
let listOrText = 'abc';
listOrText = 'def';
class Widget {
  first = listOrText.at(0);
  static tag = listOrText.includes('a');
}
listOrText = ['a', 'b'];
new Widget();
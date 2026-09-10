import "core-js/modules/es.object.to-string";
import "core-js/modules/es.object.values";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.string.iterator";
// an INSTANCE field initializer runs per construction, not when the class definition is reached, so a
// key written there cannot kill the declarator's own value - the read still observes `from`, and the
// over-inject-safe union owes both statics. the STATIC field beside it is the negative: that one runs
// at class-eval, ahead of its read, so only the written key injects there
let deferred = 'from';
class Late {
  ran = (deferred = 'of', 1);
}
Array[deferred]([1, 2]);
let immediate = 'entries';
class Early {
  static ran = (immediate = 'values', 1);
}
Object[immediate]({
  a: 1
});
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// outer ParenthesizedExpression wrap on the callee (oxc preserves explicit parens; babel
// usually strips them at parse time, but reparses from source can surface them again).
// the peel loop walks through any layers of paren wrapping until the SequenceExpression
// becomes visible, so the SE prefix `spy()` is still recovered
function spy() {
  return 1;
}
spy();
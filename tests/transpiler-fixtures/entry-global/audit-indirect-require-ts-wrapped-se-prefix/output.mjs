import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// TS-wrapped indirect require: `getEntrySource` peels the TS `as` / `!` / `<>` wrappers to detect
// and remove the entry, so the SequenceExpression SE prefix must be peeled through the SAME wrapper
// set - peeling only ParenthesizedExpression stopped at the TSAsExpression and silently dropped the
// `spy()` prefix. both plugins now keep it.
function spy() {
  return 1;
}
spy();
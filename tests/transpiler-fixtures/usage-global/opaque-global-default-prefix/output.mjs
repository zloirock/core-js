import "core-js/modules/es.object.to-string";
import "core-js/modules/es.error.is-error";
import "core-js/modules/es.aggregate-error.constructor";
import "core-js/modules/es.aggregate-error.cause";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A defined global claim drops its default without losing the initializer prefix or residual.
const {
  AggregateError: AE = fallback(),
  other
} = (effect(), globalThis);
use(AE, other);
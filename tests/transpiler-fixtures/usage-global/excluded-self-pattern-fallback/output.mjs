import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.self";
// The fallback still supplies the pattern when the excluded realm slot is absent.
// Global mode is a presence control; entry exclusion belongs to pure mode.
const {
  from
} = globalThis.self?.Array ?? {};
consume(from);
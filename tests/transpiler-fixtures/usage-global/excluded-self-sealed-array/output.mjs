import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.self";
// A seal above an excluded optional realm slot keeps the native throw.
// Global mode is a presence control; entry exclusion belongs to pure mode.
consume((globalThis.self?.Array).from);
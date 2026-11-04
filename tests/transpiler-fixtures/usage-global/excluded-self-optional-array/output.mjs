import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// An excluded environment slot can be absent; its optional guard stays live.
// Global mode is a presence control; entry exclusion belongs to pure mode.
consume(globalThis.self?.Array);
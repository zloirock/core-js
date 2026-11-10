import "core-js/modules/es.array.at";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// An instance dispatcher cannot move a plain read into the optional branch.
use((note(), globalThis.window?.self).self?.Array.prototype.at);
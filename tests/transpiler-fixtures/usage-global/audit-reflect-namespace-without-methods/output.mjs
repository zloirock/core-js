import "core-js/modules/es.reflect.namespace";
import "core-js/modules/es.global-this";
// a VALUE-only usage (feature detect / escaped value) injects just the namespace entry -
// the object existence - and no method modules
export const supported = globalThis.Reflect ? "yes" : "no";
export const escaped = Reflect;
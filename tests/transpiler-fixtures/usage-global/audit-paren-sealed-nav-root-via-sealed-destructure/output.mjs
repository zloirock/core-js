import "core-js/modules/es.array.at";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
export const {
  at: viaSealedDestructure
} = globalThis.window?.self.window?.Array.of(9);
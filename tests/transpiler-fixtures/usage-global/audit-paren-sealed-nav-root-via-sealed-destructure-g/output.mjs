import "core-js/modules/es.object.entries";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
export const {
  entries: viaSealedDestructureG
} = (globalThis.window?.self.window).Object;
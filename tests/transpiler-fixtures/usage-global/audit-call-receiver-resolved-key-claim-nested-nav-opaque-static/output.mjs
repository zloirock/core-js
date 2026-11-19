import "core-js/modules/es.global-this";
import "core-js/modules/es.json.stringify";
import "core-js/modules/es.string.at";
import "core-js/modules/web.self";
export const nestedNavOpaqueStatic = globalThis.window?.self.JSON.stringify({
  c: 3
}).at(globalThis.window?.self.Math.round(0.4));
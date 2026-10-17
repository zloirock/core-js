import "core-js/modules/es.array.at";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
export const spineCallBeforeArg = globalThis.window?.self.Object.keys({
  a: 1
}).at(globalThis.window?.self.Math.round(0.4));
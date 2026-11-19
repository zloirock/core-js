import "core-js/modules/es.object.freeze";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
export function viaSealedSynthG({
  freeze: gf
} = (globalThis.window?.self.window).Object) {
  return gf;
}
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// a TEMPLATE-literal hop key resolves like the dotted spelling through the canonical key fold
const tk = () => globalThis;
export const viaTemplateKey = tk()?.window?.[`self`]?.Array.of(20).at(0);
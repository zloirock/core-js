import "core-js/modules/es.object.entries";
import "core-js/modules/es.string.repeat";
import "core-js/modules/es.string.pad-end";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.of";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.global-this";
import "core-js/modules/es.json.stringify";
import "core-js/modules/es.math.hypot";
import "core-js/modules/es.math.trunc";
import "core-js/modules/es.number.parse-float";
import "core-js/modules/es.number.to-fixed";
import "core-js/modules/es.string.from-code-point";
import "core-js/modules/es.string.includes";
import "core-js/modules/web.self";
// every span this pipeline measures by counting brackets is TEXT that can carry a string, and a
// bracket inside one is not structure: the chain-growth gate, the layer rebalance that re-opens
// swallowed groups, the memo-slot walk and the extraction-decl split all read source through that
// lens. counted as structure they stop the span at the wrong token, and what follows is either
// truncated or swallowed. one static and one instance method per line, so a row that stops
// resolving is visible in the import set too.
export const argParen = (() => globalThis)()?.window?.Array.of(')').at(0);
export const keyParen = globalThis.window?.Object.entries({
  ')': 1
}).flat();
export const tailParen = globalThis.self.String.fromCodePoint(40).padEnd(4, ')');
export const bothParens = globalThis.window?.Number.parseFloat('1.5(').toFixed(1);
export const nestedQuote = globalThis.self.JSON.stringify({
  a: '")'
}).includes('a');

// the same lens on the extraction side: the decl split looks for the binding's own ` = `, and a
// default re-emitted from source can hold brackets and an ` = ` of its own
let seCount = 0;
export const {
  hypot = ')'
} = (seCount++, Math);
let seCount2 = 0;
export const {
  trunc = '} = x'
} = (seCount2++, Math);
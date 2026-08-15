import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.repeat";
import "core-js/modules/es.string.pad-start";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a destructured name binds a MEMBER of its container, so the call lane has to descend the key
// path to reach the member's signature: handing back the container's own annotation leaves a
// destructured method with no return type at all, while the same method read as `i.m()` keeps it.
// the property line is the control - those already resolved, so the gap was the call half
interface Api {
  list(): number[];
  pick(x: number): number[];
  pick(x: string): string;
  text: () => string;
  xs: number[];
}
declare const api: Api;
declare const pair: [() => number[], string];
const {
  list,
  text
} = api;
const {
  xs
} = api;
const [made] = pair;
export const a = list().at(0);
export const b = text().padStart(2);
export const c = xs.flat();
export const d = made().includes(1);
// an OVERLOADED member has no single answer without the call site, and this lane resolves the NAME:
// picking a head would be a guess, so the read widens to the generic dispatch instead
export const e = api.pick(1).at(0);
const {
  pick
} = api;
export const f = pick(1).at(0);
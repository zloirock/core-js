// a proxy-global CONSTRUCTOR-static consumed by an outer hop before an instance method
// (`globalThis.Map.name.at(0)` - `.name` reads off the `_Map` collapse, then `.at` dispatches): the
// instance-receiver resolution must DEFER the mid-chain `globalThis.Map -> _Map` collapse so that static
// rewrite composes INSIDE the receiver text. collapsing it here too left the outer content as `_Map.name`,
// so the inner `globalThis.Map` needle could not be located -> unplugin compose crash (babel mutates the
// AST in one pass, so it was benign). covers direct / side-effect-prefix / alias proxy-global roots
let eff = () => 0;
const p = globalThis;
export const a = globalThis.Map.name.at(0);
export const b = (eff(), globalThis).Set.name.padStart(5);
export const c = p.Promise.name.includes('P');

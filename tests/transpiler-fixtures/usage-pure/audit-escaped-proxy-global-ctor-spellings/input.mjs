// every spelling that reaches the ONE proxy-global surface hands out the same constructor, so an
// escape through any of them widens the entry alike: a redundant proxy hop, an alias of the
// surface, a zero-arg IIFE returning it, and a container slot holding it - in a value position and
// as an extends base, whose subclass reads a static only the widened entry installs
const g = globalThis;
const ns = { g: globalThis };
hand(globalThis.self.Map);
hand(g.Set);
hand((() => globalThis)().WeakMap);
export class Sub extends ns.g.Promise {}
use(Sub.try);

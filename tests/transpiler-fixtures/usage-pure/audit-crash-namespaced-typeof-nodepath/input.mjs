// `typeof NS.X` namespaced type-query resolution must recover a real NodePath (consumers call
// `.get(...)`), not a synthetic {node, scope} - otherwise the whole transform aborts. covers all
// four sinks (ReturnType / ConstructorParameters / typeof-static-call / InstanceType), one per
// distinct array method so each emitted import maps to its line. both plugins. regression lock
namespace NS1 { export function fn(x) { return [1, 2, 3]; } }
type T1 = ReturnType<typeof NS1.fn>;
const v1: T1 = [1, 2, 3];
v1.at(0);

class Base { constructor(p: number[]) {} }
namespace NS2 { export class Cls extends Base {} }
type P2 = ConstructorParameters<typeof NS2.Cls>[0];
const p2: P2 = [1];
p2.flat();

namespace NS3 { export class Cls { static make(x) { return [1, 2, 3]; } } }
declare const m3: typeof NS3.Cls;
m3.make(0).flatMap(x => x);

namespace NS4 { export class Cls extends Array<number> {} }
type I4 = InstanceType<typeof NS4.Cls>;
const i4: I4 = [];
i4.includes(1);

// Every TS form whose body never reaches the output carries real parameter and binding PATTERNS,
// and a downgrade set asked for one of them would be owed to a signature nothing runs. The domain
// is closed, so it is spelled out here whole: the LAST declaration is the same pattern where it
// does run, and its modules are what the rest of the file must not add to.
declare function ambientFunction({ a, ...rest }: O): void;
declare const { b, ...ambientBinding }: O;
declare class AmbientClass { m({ c, ...rest }: O): void; }
declare namespace AmbientNamespace { function f({ d, ...rest }: O): void; }
declare module "ambient-module" { export function f({ e, ...rest }: O): void; }
interface AmbientInterface { m({ f, ...rest }: O): void }
type AmbientAlias = { m({ g, ...rest }: O): void };
abstract class AbstractHost { abstract m({ h, ...rest }: O): void; }
export function overloaded({ i, ...rest }: O): void;
export function overloaded(o) { return o; }
export function emitted({ j, ...rest }: O) { return [j, rest]; }

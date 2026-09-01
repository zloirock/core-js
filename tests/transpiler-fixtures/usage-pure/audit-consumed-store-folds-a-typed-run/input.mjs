// the consumed-store fold through the TYPE layer, and the two sides of what a type wrapper means
// here: one written around the run's own SPAN is erased with the read it wrapped, while one written
// around the VALUE the store hands on SURVIVES the render - the runtime narrowing the collapse
// performs outranks the wider type, and the assertion still describes what the variable holds
let e = 0;
let held: any;
function dh(): typeof globalThis {
  return globalThis;
}
export const castInsideRun = (held = ((e++, globalThis.self) as any).window).Map.name;
export const nonNullInsideRun = (held = (e++, globalThis.self)!.window).Map.name;
export const castOnCallRoot = (held = ((e++, dh()) as any).self.window).Map.name;
export const castAroundValue = (held = ((e++, globalThis.self).window as any)).Map.name;
export const satisfiesAroundValue = (held = ((e++, globalThis.self).window satisfies object)).Map.name;
export const castAroundPlainValue = (held = (globalThis.self as any)).Map.name;
export { e, held };

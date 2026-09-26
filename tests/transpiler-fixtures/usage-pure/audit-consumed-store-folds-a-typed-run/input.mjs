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

// ... and the same two sides where what the wrapper sits on is a span a FOLD leaves behind: the
// assertion over the folded run goes with it - what is left is the binding, which asserts nothing
// less - while the one the store holds still describes the value the variable keeps
export const castOverFold = (globalThis.self.window as any).customProp;
export const nonNullOverFold = globalThis.self.window!.customProp;
export const castOverGuardedFold = (globalThis.self?.window as any).customProp;

// ... and the same rule where the render is the STORE's own: the wrapper over the span it replaces
// goes with it, in whatever host the run stands (the declarator answered it first, and the other
// hosts reach this render through their own routes)
let stored: any;
export function inReturn() { return ((stored = globalThis).self.window as any).customProp; }
export const inTemplate = `${ ((stored = globalThis).self.window as any).customProp }`;
export const inTernary = e ? ((stored = (e++, globalThis)).self.window as any).customProp : 0;
export { e, held, stored };

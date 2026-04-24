// local parameter named `Symbol` shadows the global - even though the receiver is
// wrapped in a TS `as any` cast, plugin must respect the binding and skip polyfilling;
// expression stays untouched
function f(Symbol: any, obj: any) {
  return obj[(Symbol as any).iterator];
}
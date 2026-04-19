// local `Symbol` shadows global - asSymbolRef's binding guard must fire even through TS wrapper;
// no polyfill, expression untouched
function f(Symbol: any, obj: any) {
  return obj[(Symbol as any).iterator];
}
// A bare global base class wrapped in a TS cast (`(Array as any)`) in the extends clause still
// resolves to the global, so the instance-method polyfill is injected as for `extends (Array)`
class C extends (Array as any) {}
new C().at(0);

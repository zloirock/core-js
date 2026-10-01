// Without a newTarget argument, `Reflect.construct(C, [])` is just `new C(...)`: the result is a C
// instance, so `C.m`'s `number[]` return drives the array-specific `.at` polyfill. Confirms the
// 2-arg form still resolves from the target (the newTarget branch does not over-trigger).
class C { m() { return [1, 2, 3]; } }
Reflect.construct(C, []).m().at(0);

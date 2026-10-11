// a member an explicit store puts on a function is the file's own (`Object.assign(fn, { make })`), not one
// `Function.prototype` carries: a constructor passed to it reaches a body the census does not read there, so it
// keeps its statics, whichever store spelled the member
function Host() {}
Object.assign(Host, { make(C) { return C; } });
export const made = Host.make(Map);
function Other() {}
Reflect.defineProperty(Other, 'take', { value: C => C });
export const taken = Other.take(Promise);
function Third() {}
Object.defineProperties(Third, { give: { value: C => C } });
export const given = Third.give(Symbol);

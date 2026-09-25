// a closure returning an alias of a class member hands the member's constructor on, so a static
// read off a slot holding the closure's call is served by that static's own entry - through a
// static field and a static getter alike
class Fields { static P = Promise; }
class Getters { static get M() { return Map; } }
const field = Fields.P;
const got = Getters.M;
const viaField = () => field;
const viaGetter = () => got;
const list = [viaField()];
export const attempted = typeof list[0].try;
export const grouped = typeof [viaGetter()][0].groupBy;

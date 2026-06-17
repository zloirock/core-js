// `super.from(...)` from inside a NON-static method: `super` here is the parent PROTOTYPE
// (`Array.prototype`), not the constructor, so `super.from` is `Array.prototype.from` - undefined
// (`from` is a static on the Array constructor, not on the prototype). no pure-mode static is
// reachable this way, so the call is left untouched (importing a static `from` would be wrong; the
// call is itself a runtime TypeError on the missing prototype member). empty rewrite is correct
class C extends Array { m() { return super.from([1]); } }

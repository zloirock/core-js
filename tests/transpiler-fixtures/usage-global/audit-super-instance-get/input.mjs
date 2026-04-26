// instance-method access via `super.method` (no call): the lookup is rewritten through
// the superclass binding, with the polyfill emitted accordingly.
class C extends Map { m() { return super.get(1); } }

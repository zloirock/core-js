// instance super.X (not static) - user-pure-import hint-mapping doesn't apply.
// polyfill skipped by design: `super.intersection` on a prototype-only method would
// need instance-receiver semantics the plugin can't synthesize for super
import MySet from '@core-js/pure/actual/set';
class C extends MySet {
  extend(other) { return super.intersection(other); }
}

// `class C extends NS.Base` with `super.allSettled(...)` where the namespace object NS is reassigned
// AFTER the class - the class still extends NS.Base (Promise), so super.allSettled is Promise.allSettled
// and usage-global must inject es.promise.all-settled. exercises the namespace-container resolver
// (bindingContainerValue), distinct from the direct-alias super path; usage-pure bails.
const NS = { Base: Promise };
class C extends NS.Base {
  static make() {
    return super.allSettled([]);
  }
}
NS = {};

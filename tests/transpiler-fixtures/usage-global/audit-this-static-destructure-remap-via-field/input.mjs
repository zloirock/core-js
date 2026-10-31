// usage-global twin of the this-static destructure remap: the inherited static's module is
// injected (the source stays untouched - the patched global serves the inherited read);
// a static field initializer is a static context; an assignment pattern routes through
// the same funnel
class FieldInit extends Array {
  static p = (() => { const { of } = this; return of; })();
}
export const viaField = FieldInit.p;

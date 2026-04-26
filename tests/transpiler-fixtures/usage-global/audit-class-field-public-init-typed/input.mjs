// class-field type inference must select the right polyfill entry in usage-global mode too.
// `x = []` -> Array; `s = ''` -> String. distinct methods per type confirm WHICH field's
// inference triggered WHICH import: `flat` is Array-only, `repeat` is String-only. without
// correct narrowing, plugin would over-inject generic instance variants for both fields
export class C {
  x = [];
  s = '';
  flatten() { return this.x.flat(); }
  triple() { return this.s.repeat(3); }
}

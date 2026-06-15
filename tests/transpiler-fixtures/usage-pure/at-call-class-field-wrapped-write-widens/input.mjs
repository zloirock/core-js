// A class-field write through a transparent wrapper (TS `!`) must still widen the field's inferred
// type. `this.field! = s` adds `string` to a field initialized as `number[]`, so `this.field.at`
// must resolve to the GENERIC instance helper - a wrapper-blind write index would strand the write
// (the target stays the unpeeled TSNonNull), keep the stale array narrow, and emit `_atMaybeArray`,
// which throws on the string value at runtime (ie:11).
class C {
  field = [1];
  m(s: string) {
    this.field! = s;
    return this.field.at(0);
  }
}

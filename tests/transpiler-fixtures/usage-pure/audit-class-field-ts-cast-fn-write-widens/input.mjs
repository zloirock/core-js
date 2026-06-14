// a function-valued field wrapped in a TS cast is still recognized as a function, so its
// internal `this.field = ...` write folds into the field-flow union and widens the type -> generic
// `_at` instead of an array-specific Maybe (the field is a string at runtime once `reset` runs)
class C {
  field = [1, 2];
  reset = (() => { this.field = "s"; }) as () => void;
  m() {
    return this.field.at(0);
  }
}

// a class METHOD is a writable slot exactly like a function-valued field: `this.m = ...` puts a
// foreign function in it, and the declared body's return type no longer describes what a call
// yields. narrowing off that body would dispatch a type-specific helper onto the replacement's
// value and throw
class Overwritten {
  rows() { return [1, 2]; }
  swap() { this.rows = () => "text"; }
  read() { return this.rows().at(0); }
}
export const values = [new Overwritten().read()];

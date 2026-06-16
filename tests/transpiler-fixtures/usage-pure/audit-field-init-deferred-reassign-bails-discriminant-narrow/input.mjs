// a binding reassigned inside an instance class-field initializer (which runs at CONSTRUCTION time,
// deferred from its lexical position) can change before a later use, so a `typeof` discriminant
// narrow must NOT trust it - the read-side soundness gate has to treat the field-init reassignment
// like a captured-function one and bail to the generic helper (the array-specific helper would throw
// on the foreign string value on ie:11)
function f(v: string | number[]) {
  let x: string | number[] = v;
  class C {
    g = (x = "str");
  }
  new C();
  if (typeof x !== "string") {
    return x.at(0);
  }
  return undefined;
}
f([[1]]);

// repeated module-wide writes to the same open-typed static field with mutually compatible
// RHS types (both Array) fold into a single Array slot and narrow dispatch stays sound.
// confirms the candidate collector reaches every write site, not just the last one
class Foo { static bar: any = null; }
const arr1 = [1, 2];
const arr2 = [3, 4];
Foo.bar = arr1;
Foo.bar = arr2;
Foo.bar.at(0);

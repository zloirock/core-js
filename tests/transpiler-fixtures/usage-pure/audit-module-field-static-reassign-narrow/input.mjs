// open-annotation (`: any`) suppresses the typed dispatch, so the field's runtime shape
// has to come from module-wide RHS writes. class-side falls back to the field-flow scan when
// the annotation resolves to nothing; object-side synthesises candidates from external writes
// alone via the no-prop fallback. both routes must produce array narrow (_atMaybeArray /
// _includesMaybeArray) on these distinct methods to confirm each path fired independently
class Foo { static bar: any = null; }
Foo.bar = [1, 2, 3];
Foo.bar.at(0);

const Bar: any = {};
Bar.items = ["x", "y"];
Bar.items.includes("x");

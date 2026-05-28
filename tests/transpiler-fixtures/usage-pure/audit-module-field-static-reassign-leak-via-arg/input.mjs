// `take(Foo)` leaks the class binding through a user function arg whose mutation profile
// is unknown - closure builder bails to null, static-field external write scan stays unsound,
// and the open `: any` annotation falls through to generic `_at`. without the leak gate, the
// scan would emit narrow `_atMaybeArray` even though `take` could swap `Foo.bar` to a
// non-array value
class Foo { static bar: any = null; }
function take(o: any) { return o; }
take(Foo);
Foo.bar = [1, 2];
Foo.bar.at(0);

// two module-wide writes assign incompatible types (Array vs string) to the same open-typed
// static field. union-incompatible candidates collapse to null - polyfill dispatch can't pick
// a narrow at-receiver and routes to generic `_at` instead of unsoundly preferring the last
// seen array write
class Foo { static bar: any = null; }
Foo.bar = [1, 2];
Foo.bar = "str";
Foo.bar.at(0);

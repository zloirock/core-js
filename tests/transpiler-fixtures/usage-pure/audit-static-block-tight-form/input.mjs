// static block without space between `static` and `{` must still allow var-scope
// anchor for nested polyfill ref allocation
class C {
  static{
    const arr = [1, 2, 3];
    arr.includes(2);
  }
}
new C();

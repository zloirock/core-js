import _from from "@core-js/pure/actual/array/from";
// A class constructor runs its body at the matching new invocation.
// The default pattern and computed key keep their source evaluation order.
class Box {
  constructor([{
    from,
    [(effect(), 'extra')]: extra
  } = Array]) {
    from = _from;
    use(from, extra);
  }
}
new Box([void 0]);
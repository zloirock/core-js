// A class constructor runs its body at the matching new invocation.
// The default pattern and computed key keep their source evaluation order.
class Box {
  constructor([{ from, [(effect(), 'extra')]: extra } = Array]) {
    use(from, extra);
  }
}
new Box([void 0]);

// class static blocks are statement-list hosts too
class K {
  static {
    let try2;
    (({ try: try2 } = Promise), use());
    K.r = try2;
  }
}
export { K };

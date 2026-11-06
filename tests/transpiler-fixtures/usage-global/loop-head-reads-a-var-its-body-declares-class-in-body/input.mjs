const K = Array;
export function classInBody() {
  for (var i = K.of(4); !i;) {
    class K {}
    i = K;
  }
  return i;
}

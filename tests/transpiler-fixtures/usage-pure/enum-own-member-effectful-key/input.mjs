// A proven enum own-slot read leaves its computed-key effects visitable.
// The array claim inside the key is independent of the enum member named at.
enum E {
  at = "at"
}
use(E[([1, 2].includes(2), "at")]);

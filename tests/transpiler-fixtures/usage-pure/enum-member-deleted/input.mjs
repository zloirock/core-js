// Deletion removes own presence; a foreign prototype may now supply the method.
enum E {
  at = "at"
}
delete E.at;
E.__proto__ = Array.prototype;
use(E.at);

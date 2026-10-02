// An unknown consumer may change the enum object and its prototype.
enum E {
  at = "at"
}
mutate(E);
use(E.at);

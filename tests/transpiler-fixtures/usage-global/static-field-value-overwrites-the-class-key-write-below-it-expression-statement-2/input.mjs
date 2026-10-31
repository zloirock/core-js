let D = Set;
function define() {
  return class {
    static held = (D = Array);
    [(D = Iterator, 'd')] = 1;
  };
}
define();

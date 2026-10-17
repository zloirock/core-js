// the same shape with no name collision: the control that pins the name as the only variable
function strangerWithoutCollision() {
  class Unrelated {}
  class Tainted extends Unrelated {}
  new Tainted().entries = "string";
}
strangerWithoutCollision();
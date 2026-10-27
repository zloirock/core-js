// The null test observes the stored value after both sequence prefixes.
// The index runs only in the live branch and after the store it reads.
let held;
function read(value) {
  return (outer(), (inner(), held = value))?.at(index(held));
}
read(source);

// `this` inside an object-literal method is that literal, so a member whose name collides with a
// built-in instance method reads the literal's OWN data property - a plain object never carries the
// built-in. once the object leaks the receiver stops being provable and the collision has to be
// treated as a real instance-method access again. each row reads its field with a method carrying
// BOTH an array and a string variant, so the same row also reports whether the field itself stayed
// narrowed - with a single-family method neither half of that would be visible in the import set
const bag = {
  entries: [1, 2],
  read() {
    return this.entries.at(0);
  }
};
bag.read();
export const leaked = {
  keys: [1, 2],
  read() {
    return this.keys.includes(1);
  }
};

{
  // The leading block and Program both start at zero, but their boxes are different bindings.
  // Each escaping constructor must carry its family. Keep this block first, ahead of the comment.
  const box = { value: Map };
  hand(box.value);
}
const box = { value: Promise };
hand(box.value);

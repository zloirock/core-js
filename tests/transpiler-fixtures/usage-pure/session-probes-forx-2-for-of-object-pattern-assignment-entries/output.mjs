// A literal-object for-of head retains its native entries read and const binding.
// A later assignment must not turn that binding into a mutable extraction.
{
  for (const {
    w: {
      entries
    }
  } of [{
    w: Object
  }]) {
    entries = 1;
  }
}
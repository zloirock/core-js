// minifier-collapsed destructure-in-sequence nested inside another such statement: the outer
// `(fn, ({y} = obj2))` and the inner `(eff(), ({x} = obj))` both match the split shape. the
// pre-pass must split the outermost first and re-parse before reaching the inner, instead of
// overwriting both on one MagicString (which double-splits an already-edited chunk)
(function () {
  eff();
  ({
    x
  } = obj);
});
({
  y
} = obj2);
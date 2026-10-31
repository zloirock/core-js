// distinct static-method polyfills with overlapping prefix shape would collide on the
// hint-prefix slot if uniqueName were not consulted per allocation. each entry must land
// on its own binding via skip-1 + suffix increment
const _Array$from = "user-shadow";
const x = Array.from([1]);
const y = Array.of(2, 3);

// intermediate hop with a NON-optional outer call (`.filter(...)`, no `?.`): the chain still
// combines because the inner `flat?.()` introduces the `?.`, and the `.map(...)` hop threads onto
// the inner result; the outer emits a plain `.call` rather than the `?.call` short-circuit form
const arr = [1, 2];
arr.flat?.().map(x => x * 2).filter(y => y > 4);

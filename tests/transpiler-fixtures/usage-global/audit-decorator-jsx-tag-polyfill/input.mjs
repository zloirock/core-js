// JSX elements used inside a decorator position (`@(<Map />)` and `@(<Set.X />)`)
// must still trigger global polyfill detection on the JSX tag root. The first
// decorator references the global `Map` directly, the second references `Set` as
// the root of a member-expression JSX tag. Each class should emit its respective
// global polyfill (`es.map` / `es.set`), proving JSX inside decorators is scanned
// identically to JSX at expression position.
@(<Map />)
class WithMap {}
@(<Set.X />)
class WithSetRoot {}

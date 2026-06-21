// JSX elements at decorator position (`@(<Map />)` and `@(<Set.X />)`) must still trigger
// global polyfill detection on the JSX tag root. first decorator references `Map` directly,
// the second references `Set` as the root of a member-expression tag. each class emits its
// own global (`es.map` / `es.set`), proving decorator JSX is scanned like expression JSX.
@(<Map />)
class WithMap {}
@(<Set.X />)
class WithSetRoot {}

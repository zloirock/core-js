// A type-parameter outranks a same-named global: the annotation names the parameter, so the
// receiver stays opaque instead of picking up the built-in container's methods. A qualified
// reference cannot be shadowed, an ordinary parameter name leaves the global alone, and a
// parameter that carries a constraint still resolves through it.
declare const v: any;
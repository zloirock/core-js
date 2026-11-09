// Combining instance calls retains an optional method in the surviving tail.
export function read(a) { return a.flat?.().at(0).foo?.().bar; }

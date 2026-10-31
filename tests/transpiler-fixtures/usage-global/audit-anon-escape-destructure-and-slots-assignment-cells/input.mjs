// a field write through the anon's slot path breaks the zero-external-write premise of the
// local narrow, so the anon bails to generic even though it is never held
const written = { a: { cells: ['w'], peek() { return this.cells.at(7); } } };
written.a.cells = 5;

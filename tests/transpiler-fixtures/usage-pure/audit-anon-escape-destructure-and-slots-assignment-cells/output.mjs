import _at from "@core-js/pure/actual/instance/at";
// a field write through the anon's slot path breaks the zero-external-write premise of the
// local narrow, so the anon bails to generic even though it is never held
const written = {
  a: {
    cells: ['w'],
    peek() {
      var _ref;
      return _at(_ref = this.cells).call(_ref, 7);
    }
  }
};
written.a.cells = 5;
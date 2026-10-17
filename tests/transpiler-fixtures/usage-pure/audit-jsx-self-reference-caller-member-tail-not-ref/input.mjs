// NEGATIVE: a member-expression TAIL is a prop on another binding, not a reference.
export const memberTailNotRef = (function K({ ['entries']: entries } = Object) {
  return <Other.K x={1}>{entries({ a: 1 }).length}</Other.K>;
})();

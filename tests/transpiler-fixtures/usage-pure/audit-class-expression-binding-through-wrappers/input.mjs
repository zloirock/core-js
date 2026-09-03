// a class expression bound to a name resolves its own static field whatever wraps it between the
// declarator and the class - source parens, a cast - and the anonymous form answers like the named
// one. every row spends a method the Array and Iterator families SHARE, so each row proves its own
// narrowing: a receiver that stopped resolving brings that row's Iterator twin in beside the Array
// module. an EXPORTED binding stays generic on purpose - an importer may overwrite the field - and
// its row is the one that MUST carry the second family
const named = class X { static list = [1]; };
const wrapped = (class Y { static list = [2]; });
const cast = class Z { static list = [3]; } as any;
const anonymous = class { static list = [4]; };
export const exported = class W { static list = [5]; };
export const r = [
  named.list.map(v => v),
  wrapped.list.filter(Boolean),
  cast.list.flatMap(v => v),
  anonymous.list.find(Boolean),
  exported.list.at(0),
];

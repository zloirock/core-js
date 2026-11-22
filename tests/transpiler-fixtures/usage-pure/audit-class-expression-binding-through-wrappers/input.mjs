// Each private binding has an array field. The exported field can be replaced by an importer.
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
  named.list.at(0),
  wrapped.list.at(0),
  cast.list.at(0),
  anonymous.list.at(0),
  exported.list.at(0),
];

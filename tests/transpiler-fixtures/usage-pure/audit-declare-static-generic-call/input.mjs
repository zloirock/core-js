// Static method on `declare class` with explicit method-level type-arg.
// resolveClassMemberNode TSDeclareMethod branch threads only classSubst, not call-site
// method-level type args - Box.make<string>() return type stays raw T[] (generic Array).
declare class Box {
  static make<T>(): T[];
}
const r = Box.make<string>();
r.at(0);

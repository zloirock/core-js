// Intersection without Promise inside Awaited: `Awaited<{items: T[]} & {tags: U[]}>` per
// TS spec returns the intersection itself (Awaited<T> = T when T is not Promise). Member
// lookup through the intersection finds `items` / `tags` and narrows their array element
// types. resolveAwaitedAnnotation distribute over intersection per-branch returns each
// plain object; findTypeMember's intersection branch picks first matching key. Distinct
// methods per line so each access traces to its branch
async function objs() {
  type T = { items: number[] } & { tags: string[] };
  declare const r: Awaited<T>;
  r.items.at(0);
  r.tags.includes('x');
}
objs();

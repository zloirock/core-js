function getArr(): number[] {
  return [];
}
const a = getArr;
const b = a;
const c = b;
const d = c;
const e = d;
const f = e;
f().at(-1);

function getArr(): number[] {
  return [];
}
const f1 = getArr;
const f2 = f1;
const f3 = f2;
const f4 = f3;
const f5 = f4;
const f6 = f5;
const f7 = f6;
const f8 = f7;
const f9 = f8;
const f10 = f9;
f10().at(-1);

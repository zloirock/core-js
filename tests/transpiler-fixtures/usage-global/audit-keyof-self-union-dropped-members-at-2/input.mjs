interface Homo {
  as: number[];
  bs: boolean[];
}
declare const h: Homo[keyof Homo];
export const r3 = h.at(1);

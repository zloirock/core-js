const arr = [3, [1, 2]];
const {
  [cond ? "flat" : "at"]: m
} = arr;
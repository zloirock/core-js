// every statement-list host splits, including a switch-case consequent
let groupBy2;
switch (cond) {
  case 1:
    (({ groupBy: groupBy2 } = Map), use());
    break;
}
export const r4 = groupBy2;

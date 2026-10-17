let T2 = Object;
for (T2 of [(eff(), Reflect)]) { break; }
T2.ownKeys(x);

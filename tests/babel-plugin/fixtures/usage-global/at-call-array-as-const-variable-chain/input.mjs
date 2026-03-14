const arr = ['hello', 42];
const ref = arr as const;
ref[0].at(0);

// wrapped head write target - TS cast around the object
const d: number[] = [6, 7];
for ((d as any).values of fns) {
  d.values();
}

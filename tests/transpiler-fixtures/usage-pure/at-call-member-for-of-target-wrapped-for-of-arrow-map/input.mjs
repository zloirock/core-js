// control: a DIFFERENT receiver's same-named method is not part of the write set
const e = [8, 9];
const f = [10];
for (e.map of fns) {
  f.map(x => x);
}

// two distinct aliased statics (`const of = Array.of`, `const from = Array.from`) each
// must narrow their call's return to Array independently. distinct instance methods per
// receiver lock that the two alias registrations don't conflate across receivers
const of = Array.of;
const from = Array.from;
const arr1 = of(1, 2, 3);
const arr2 = from('hi');
arr1.at(-1);
arr2.findLast(x => x);
arr1.flat();
arr2.flatMap(x => x);

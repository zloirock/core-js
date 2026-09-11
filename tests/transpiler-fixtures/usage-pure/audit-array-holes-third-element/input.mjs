// array-pattern with holes `[,, third]`: skip slots must not shift the binding index;
// `third` resolves to the third real element and gets the array-instance polyfill.
const [,, third] = ['a', 'b', 'c'];
third.at(0);

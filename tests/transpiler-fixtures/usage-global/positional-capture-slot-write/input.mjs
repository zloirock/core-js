// Capturing an object keeps its identity, so writes through an alias widen its field.
const box = { y: [1] };
const [saved] = [box];
const alias = saved;
alias.y = '02';
saved.y.at;

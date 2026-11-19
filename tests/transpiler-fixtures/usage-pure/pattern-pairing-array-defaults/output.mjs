// Nested defaults preserve the supplied array and its methods.
const [[{
  at
} = [7]] = [[3]]] = source;
at.call([5], 0);
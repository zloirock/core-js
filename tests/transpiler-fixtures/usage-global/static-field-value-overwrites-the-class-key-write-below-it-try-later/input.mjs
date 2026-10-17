let C = Iterator;
class InstanceFieldOverKey {
  held = (C = Array);
  [(C = Promise, 'c')] = 1;
}
export const tryLater = () => C.try(() => 1);

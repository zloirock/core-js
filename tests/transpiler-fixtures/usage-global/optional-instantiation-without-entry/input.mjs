const box = {
  read<T>(value: T) { return [this === box, value]; }
};
(box.read<number>)?.(7);

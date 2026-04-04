const obj = {
  get items() { return () => ['x', 'y']; }
};
obj.items().at(0).small();

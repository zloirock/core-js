const C = class extends Set {
  first() { return this.values().next().value; }
};

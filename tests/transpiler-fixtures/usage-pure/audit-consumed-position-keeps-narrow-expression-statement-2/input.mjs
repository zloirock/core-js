const taggedSubstitution = {
  cells: [1, 2],
  read() {
    return this.cells.at(0);
  }
};
tag`${ taggedSubstitution }`;

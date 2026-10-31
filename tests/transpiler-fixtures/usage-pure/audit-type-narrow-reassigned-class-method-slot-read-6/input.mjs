// a PRIVATE method has no writable slot at all - nothing can replace it, so it keeps its narrow
class Sealed {
  #rows() { return [11, 12]; }
  read() { return this.#rows().includes(11); }
}
export const values = [new Sealed().read()];

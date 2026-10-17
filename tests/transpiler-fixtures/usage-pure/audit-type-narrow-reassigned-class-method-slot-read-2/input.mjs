// the same slot with NO write keeps its narrow - the declaration is all there is
class Intact {
  items() { return [3, 4]; }
  read() { return this.items().includes(3); }
}
export const values = [new Intact().read()];

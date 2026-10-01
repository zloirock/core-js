// Private field writes retain their union within the declaring class.
class Box {
  #data = [10, 20];
  change() { this.#data = "1020"; }
  read() { return this.#data.includes("02"); }
}
const box = new Box();
box.change();
export const result = box.read();

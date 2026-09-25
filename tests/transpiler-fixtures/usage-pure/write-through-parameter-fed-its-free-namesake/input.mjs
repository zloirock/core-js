// A write through a parameter whose callers pass a free name spelled like the parameter itself: the
// census reads what those callers pass, which names the parameter again - the fan's depth bound ends
// that walk and the transform completes, the later static read served as usual
export class Loader {
  load() { scope.store(texture, texData); }
  create() { this.store(texture, 1); }
  store(texture, texData) {
    texture.image.data = texData.data;
  }
}
export const r = Array.from([1]);

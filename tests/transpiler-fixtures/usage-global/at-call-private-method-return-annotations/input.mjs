// a PRIVATE method carries its return annotation on the method node itself, the way a public one
// does, so a call through `#name` narrows by it. the bodies are opaque, or the annotation would be
// redundant with the inferred return; the two reads use DIFFERENT methods, or in usage-global the
// shared import would fold both rows into one and hide either of them going wide
export class Box {
  #chars(): string[] { return JSON.parse('[]'); }
  #label(): string { return JSON.parse('""'); }
  read() { return [this.#chars().at(0), this.#label().includes('a')]; }
}

// A private method called through an optional receiver retains its brand and this-value.
export class Box {
  #at() { return [2]; }
  read(box) { return box?.#at?.().includes(2); }
  first(list) { return list[0].#at?.()?.[(effect(), 'includes')](2); }
}

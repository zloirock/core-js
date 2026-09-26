// Object.assign installs the constructor into a retained slot.
// Its later static read needs the namespace entry.
const w = { k: Object };
Object.assign(w, { k: Map });
const result = typeof w.k.groupBy;

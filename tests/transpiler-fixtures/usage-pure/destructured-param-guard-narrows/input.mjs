// a guard narrows a name destructured out of a parameter as it narrows a plain parameter: the
// pattern's annotation types the container, and the name's own union is what the guard splits
export function initial({ title }: { title: string | string[] }) {
  if (typeof title === 'string') return title.at(0);
}
export function hasTag([tags]: [string | string[]], tag: string) {
  if (Array.isArray(tags)) return tags.includes(tag);
}

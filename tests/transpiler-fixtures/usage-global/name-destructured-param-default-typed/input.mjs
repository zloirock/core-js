export function process({ name }: { name: string } = { name: 'hello' }) {
  return name.at(0);
}

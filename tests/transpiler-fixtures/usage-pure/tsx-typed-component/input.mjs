interface Props {
  items: string[];
}
function List({ items }: Props) {
  return <ul>{items.map(x => <li>{x}</li>)}</ul>;
}

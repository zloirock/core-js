interface Item { tag: string }
type ItemAlias = Item;
function check(item: ItemAlias) {
  item.tag.includes('x');
}

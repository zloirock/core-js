import "core-js/modules/es.array.at";
interface DataSource {
  getItems(): string[];
}
function foo(ds: DataSource) {
  const fn = ds.getItems;
  fn().at(0);
}
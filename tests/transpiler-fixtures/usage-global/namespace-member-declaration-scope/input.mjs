type Row = string;
namespace Model {
  type Row = number[];
  export interface Base { data: Row }
  export interface View extends Base {}
}
export function first(box: Model.View) {
  return box.data.at(0);
}

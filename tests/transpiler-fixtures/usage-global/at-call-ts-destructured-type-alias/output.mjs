import "core-js/modules/es.string.at";
type Result = {
  label: string;
  value: number;
};
declare function getResult(): Result;
const {
  label
}: Result = getResult();
label.at(0);
import "core-js/modules/es.string.at";
const enum Color {
  Red = "RED",
  Green = "GREEN",
  Blue = "BLUE",
}
const c: Color = Color.Red;
c.at(-1);
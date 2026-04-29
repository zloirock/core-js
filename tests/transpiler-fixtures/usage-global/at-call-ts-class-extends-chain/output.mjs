import "core-js/modules/es.array.at";
class Base extends Array {}
class Derived extends Base {}
new Derived().at(-1);
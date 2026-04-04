import "core-js/modules/es.string.at";
interface Base {
  name: string;
}
interface User extends Base {
  age: number;
}
function greet(user: User) {
  user.name.at(0);
}
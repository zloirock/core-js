import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// Each iteration captures its current element before the name is rebound.
// A later iteration may hold another receiver family, so instance dispatch remains wide.
let value = [0, 2];
for (let i = 0; i < 2; i++) {
  const [saved] = [value];
  use(_at(saved).call(saved, -1), _includes(saved).call(saved, '02'));
  value = '02';
}
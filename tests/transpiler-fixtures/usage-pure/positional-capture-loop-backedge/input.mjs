// Each iteration captures its current element before the name is rebound.
// A later iteration may hold another receiver family, so instance dispatch remains wide.
let value = [0, 2];
for (let i = 0; i < 2; i++) {
  const [saved] = [value];
  use(saved.at(-1), saved.includes('02'));
  value = '02';
}

const pick = () => ({ from: () => [7] });
let assigned;
[{ from: assigned } = Array] = [pick()];
export { assigned };

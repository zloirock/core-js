// Each named read owns its import while the constructor stays inside the containers.
const list = [{ P: Promise }];
const [{ P: { race } }] = list;
const box = { P: Promise };
const { P: { any } } = box;
export const viaMember = box.P.allSettled;
export { race, any };

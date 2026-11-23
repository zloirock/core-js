export function read(receiver) {
  try {
    const [{ flat }, last = flat()] = [receiver, later];
    const later = 1;
    return [flat, last, later];
  } catch (error) {
    return error.name;
  }
}

let box;
{
  const Array = Int16Array;
  box = { A: Array };
}
export const ofViaContainer = () => box.A.of(1, 2);

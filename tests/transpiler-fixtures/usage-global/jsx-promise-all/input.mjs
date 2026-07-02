async function App() {
  const data = await Promise.all([fetchA(), fetchB()]);
  return <div>{data.flat()}</div>;
}

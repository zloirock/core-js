const el = (
  <ul>
    {items.entries().map(([i, v]) => (
      <li key={i}>{v.toString().padStart(2, '0')}</li>
    ))}
  </ul>
);

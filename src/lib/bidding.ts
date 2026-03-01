export function getMinIncrement(currentPrice: number): number {
  if (currentPrice < 1) return 0.05;
  if (currentPrice < 5) return 0.25;
  if (currentPrice < 25) return 0.50;
  if (currentPrice < 100) return 1.00;
  if (currentPrice < 250) return 2.50;
  if (currentPrice < 500) return 5.00;
  if (currentPrice < 1000) return 10.00;
  if (currentPrice < 2500) return 25.00;
  if (currentPrice < 5000) return 50.00;
  return 100.00;
}

export function getMinBid(currentPrice: number): number {
  return +(currentPrice + getMinIncrement(currentPrice)).toFixed(2);
}

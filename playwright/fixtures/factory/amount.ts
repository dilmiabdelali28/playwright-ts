export interface Amount {
  value: number;
  currency: "EUR";
}

export const EUR = (value: number): Amount => ({
  value: value * 100,
  currency: "EUR",
});

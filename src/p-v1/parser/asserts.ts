export const assertNumberIsIntegerPositive = (value: number) => {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`Expected number to be positive integer, but got ${value}`);
  }
};

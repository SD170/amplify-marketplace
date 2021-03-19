export const convertDollersToCents = (price) => {
  return (price * 100).toFixed(0);
};
export const convertCentsToDollers = (price) => {
  return (price / 100).toFixed(2);
};

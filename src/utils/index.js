export const convertRupeesToPaise = (price) => {
  return (price * 100).toFixed(0);
};
export const convertPaiseToRupees = (price) => {
  return (price / 100).toFixed(2);
};

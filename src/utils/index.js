import { format } from 'date-fns'


export const convertRupeesToPaise = (price) => {
  return (price * 100).toFixed(0);
};
export const convertPaiseToRupees = (price) => {
  return (price / 100).toFixed(2);
};

export const formatProductDate = (date) => format(date, "MMM Do, YYYY");


export const formatOrderDate = (date) => format(date, "ddd h:mm A,MMM Do, YYYY");
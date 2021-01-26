export const isSuccessful = (status: number): boolean => {
  if (status >= 200 && status <= 399) return true;
  return false;
};

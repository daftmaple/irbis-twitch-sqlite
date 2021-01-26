export const commandParser = (value: string, args: string[]): string => {
  return value.replace(/\$\(1\)/, args[1]);
};

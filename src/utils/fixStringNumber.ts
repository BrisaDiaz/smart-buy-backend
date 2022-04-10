const fixStringNumber = (number: string) => {
  const units = {
    1: 10,
    2: 100,
    3: 1000,
    4: 10000,
  };
  const [integer, decimal] = number.split(",");

  if (!decimal) return parseInt(number.replace(".", ""));
  const fixedNumber =
    Math.floor(parseInt(integer.replace(".", ""))) + parseInt(decimal) / units[decimal.length];

  return fixedNumber;
};

export default fixStringNumber;

const fixStringNumber = (number: string) => {
  const units = {
    1: 10,
    2: 100,
    3: 1000,
    4: 10000,
  };
  const isEsFormat = number.indexOf(",");
  let integer, decimal;

  if (isEsFormat !== -1) {
    [integer, decimal] = number.split(",");
  } else {
    [integer, decimal] = number.split(".");
  }

  if (!decimal) return parseInt(integer);

  const fixedNumber = Math.floor(parseInt(integer)) + parseInt(decimal) / units[decimal.length];

  return fixedNumber;
};

export default fixStringNumber;

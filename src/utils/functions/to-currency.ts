export const toCurrency = (
  number: number | string = 0,
  currency: string = "INR",
  disableDecimal = true,
  decimalPlaces = 2,
  isCurrencySymbolRequired = <boolean>true
) => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: isCurrencySymbolRequired ? "currency" : undefined,
    currency: isCurrencySymbolRequired ? currency : undefined,
    minimumFractionDigits: disableDecimal ? 0 : decimalPlaces,
    maximumFractionDigits: disableDecimal ? 0 : decimalPlaces,
    useGrouping: true,
  });
  return formatter.format(+number);
};

export const formatCurrency = (amount: any) =>
  toCurrency(amount).replaceAll(",", "").replace(" ", " ");

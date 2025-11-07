import countries from "world-countries";

export const countryOptions = countries.map((country) => ({
  value: country.cca2,
  label: `${country.flag} ${country.name.common}`,
  name: country.name.common,
  flag: country.flag,
}));

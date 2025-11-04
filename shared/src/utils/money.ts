export interface MoneyAmount {
  amount: number;
  currency: string;
}

export type FxRates = Record<string, number>;

const DEFAULT_FX_RATES: FxRates = {
  USD: 1,
  EUR: 1.08,
  GBP: 1.27,
  INR: 0.012,
  SGD: 0.74,
  AUD: 0.66
};

export function convertCurrency(
  value: MoneyAmount,
  targetCurrency: string,
  fxRates: FxRates = DEFAULT_FX_RATES
): MoneyAmount {
  const upper = targetCurrency.toUpperCase();
  const source = value.currency.toUpperCase();

  if (source === upper) {
    return { ...value };
  }

  const usdAmount = value.amount / (fxRates[source] ?? 1);
  const converted = usdAmount * (fxRates[upper] ?? 1);
  return { amount: roundCurrency(converted), currency: upper };
}

export function sumAmounts(amounts: MoneyAmount[], targetCurrency: string): MoneyAmount {
  return amounts.reduce<MoneyAmount>(
    (acc, item) => {
      const converted = convertCurrency(item, targetCurrency);
      return {
        currency: acc.currency,
        amount: roundCurrency(acc.amount + converted.amount)
      };
    },
    { currency: targetCurrency.toUpperCase(), amount: 0 }
  );
}

export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function applyDiscounts(total: MoneyAmount, discounts: MoneyAmount[], targetCurrency?: string): MoneyAmount {
  const currency = targetCurrency ?? total.currency;
  const discountSum = sumAmounts(discounts, currency);
  const convertedTotal = convertCurrency(total, currency);
  const effective = roundCurrency(convertedTotal.amount - discountSum.amount);
  return { currency, amount: Math.max(effective, 0) };
}

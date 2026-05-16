/** 1 USD = 325 LKR */
export const USD_TO_LKR_RATE = 325

/** Convert a former USD amount to LKR, rounded to the nearest 100. */
export function convertUsdToLkr(usdAmount: number): number {
  return Math.round((usdAmount * USD_TO_LKR_RATE) / 100) * 100
}

export function formatCurrency(amount: number): string {
  return `LKR ${amount.toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

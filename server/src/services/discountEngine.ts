import type { DiscountDetail, FlightSearchRequest, ProviderOffer } from '@yarn/shared';
import { applyDiscounts, convertCurrency, roundCurrency } from '@yarn/shared';

export interface DiscountContext {
  request: FlightSearchRequest;
}

export class DiscountEngine {
  applyBestStack(offer: ProviderOffer, context: DiscountContext): ProviderOffer {
    const targetCurrency = context.request.currency ?? offer.fare.currency;
    const baseTotal = offer.fare.baseFare + offer.fare.taxes + offer.fare.surcharges + offer.fare.providerFees + offer.fare.convenienceFees;

    const baseNormalized = convertCurrency(
      { amount: baseTotal, currency: offer.fare.currency },
      targetCurrency
    );

    const baselineDiscounts = offer.pricing.appliedDiscounts ?? [];
    const additionalDiscounts = this.deriveAdditionalDiscounts(offer, context);
    const mergedDiscounts = [...baselineDiscounts, ...additionalDiscounts];

    const discountAmounts = mergedDiscounts.map((discount) => ({
      amount: discount.amount,
      currency: discount.currency
    }));

    const effective = applyDiscounts(baseNormalized, discountAmounts, targetCurrency);

    return {
      ...offer,
      pricing: {
        rawTotal: roundCurrency(baseNormalized.amount),
        currency: targetCurrency,
        appliedDiscounts: mergedDiscounts,
        effectiveTotal: effective.amount
      }
    };
  }

  private deriveAdditionalDiscounts(offer: ProviderOffer, context: DiscountContext): DiscountDetail[] {
    const discounts: DiscountDetail[] = [];
    const { preferredCards, couponHints } = context.request;

    if (offer.provider.supportsCardDiscounts && preferredCards?.length) {
      const topCard = preferredCards[0];
      if (topCard) {
        const estimatedSavings = roundCurrency((offer.fare.baseFare + offer.fare.taxes) * 0.03);
        if (estimatedSavings > 0) {
        discounts.push({
          id: `${offer.provider.id}-card-${topCard.network ?? 'generic'}`,
          description: `${topCard.issuer} ${topCard.network} portal bonus`,
          amount: estimatedSavings,
          currency: offer.fare.currency,
          type: 'card',
          providerId: offer.provider.id,
          stackable: true,
          source: 'yarn'
        });
        }
      }
    }

    if (offer.provider.supportsInstantCoupons && couponHints?.length) {
      const providerCoupon = couponHints.find((hint) => !hint.providerId || hint.providerId === offer.provider.id);
      if (providerCoupon) {
        discounts.push({
          id: `${offer.provider.id}-coupon-${providerCoupon.code}`,
          description: `Coupon ${providerCoupon.code}`,
          amount: Math.min(25, roundCurrency((offer.fare.providerFees + offer.fare.convenienceFees) * 0.5) || 5),
          currency: offer.fare.currency,
          type: 'coupon',
          providerId: offer.provider.id,
          stackable: false,
          source: 'yarn'
        });
      }
    }

    return discounts;
  }
}

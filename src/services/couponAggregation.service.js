export const getApplicableCouponsAggregation = (
  cartValue,
  applicableProducts,
  customerType
) => {
  const now = new Date();

  return [
    {
      $match: {
        expiryDate: { $gt: now }, // Only active coupons
        $or: [
          {
            "conditions.seasonal": false,
          },
          {
            "conditions.seasonal": true,
            "conditions.startDate": { $lte: now },
            "conditions.endDate": { $gte: now },
          },
        ],

        // Match based on minimum cart value, applicable products, or customer type
        $or: [
          { "conditions.minCartValue": { $lte: cartValue } },
          { "conditions.applicableProducts": { $in: applicableProducts } },
          { "conditions.customerType": { $in: [customerType, "all"] } },
        ],
      },
    },
    {
      // Project only required fields
      $project: {
        couponId: "$_id",
        couponCode: "$code",
        discountDetails: 1,
      },
    },
  ];
};

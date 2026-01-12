// @ts-check

/*
A straightforward example of a function that expands a single line into a bundle with add-on products.
The add-on options are stored in a line item property and metafield on the product.
*/

/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").CartTransformRunResult} CartTransformRunResult
 * @typedef {import("../generated/api").Operation} Operation
 */

/**
 * @type {CartTransformRunResult}
 */
const NO_CHANGES = {
  operations: [],
};

/**
 * @param {RunInput} input
 * @returns {CartTransformRunResult}
 */
export function cartTransformRun(input) {
  const operations = input.cart.lines.reduce(
    /** @param {Operation[]} acc */
    (acc, cartLine) => {
      const expandOperation = optionallyBuildExpandOperation(cartLine, input);

      if (expandOperation) {
        return [...acc, { lineExpand: expandOperation }];
      }

      return acc;
    },
    []
  );

  return operations.length > 0 ? { operations } : NO_CHANGES;
}

/**
 * @param {RunInput['cart']['lines'][number]} cartLine
 * @param {RunInput} input
 */
function optionallyBuildExpandOperation(
  { id: cartLineId, merchandise, assemblyServiceAdded, cost },
  { cartTransform, presentmentCurrencyRate }
) {
  // Check if merchandise is a ProductVariant
  if (merchandise.__typename !== "ProductVariant") {
    return null;
  }

  // Get assembly service configuration
  const assemblyServiceVariantID = cartTransform?.assemblyServiceVariantID?.value;
  const assemblyServiceCost = merchandise.product?.assemblyServiceCost?.jsonValue;

  // Check if product has assembly service configured
  const hasAssemblyServiceMetafields =
    !!assemblyServiceCost &&
    !!assemblyServiceVariantID;

  // Check if customer wants assembly service
  const shouldAddAssemblyService = assemblyServiceAdded?.value === "Yes";

  // Get the cost amount, default to 10.0 if not set
  const assemblyCostAmount = assemblyServiceCost?.amount || "10.0";

  // Only expand if all conditions are met
  if (hasAssemblyServiceMetafields && shouldAddAssemblyService) {
    return {
      cartLineId,
      title: `${merchandise.title} with Assembly Service`,
      expandedCartItems: [
        {
          merchandiseId: merchandise.id,
          quantity: 1,
          price: {
            adjustment: {
              fixedPricePerUnit: {
                amount: cost.amountPerQuantity.amount,
              },
            },
          },
        },
        {
          merchandiseId: assemblyServiceVariantID,
          quantity: 1,
          price: {
            adjustment: {
              fixedPricePerUnit: {
                amount: (
                  parseFloat(assemblyCostAmount) * parseFloat(presentmentCurrencyRate)
                ).toFixed(2),
              },
            },
          },
        },
      ],
    };
  }

  return null;
}
export interface RawLineItem {
  itemId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
  discount?: number;
}

export interface ComputedLineItem {
  itemId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
}

export function computeLineItems(items: RawLineItem[]): {
  lineItems: ComputedLineItem[];
  subtotal: number;
  taxAmount: number;
  discount: number;
  total: number;
} {
  let subtotal = 0;
  let totalTax = 0;
  let totalDiscount = 0;

  const lineItems = items.map((item) => {
    const lineBase = item.quantity * item.unitPrice;
    const discount = item.discount ?? 0;
    const taxable = Math.max(0, lineBase - discount);
    const taxRate = item.taxRate ?? 0;
    const taxAmount = Number(((taxable * taxRate) / 100).toFixed(2));
    const total = Number((taxable + taxAmount).toFixed(2));

    subtotal += lineBase;
    totalDiscount += discount;
    totalTax += taxAmount;

    return {
      itemId: item.itemId,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      taxRate,
      taxAmount,
      discount,
      total,
    };
  });

  const total = Number((subtotal - totalDiscount + totalTax).toFixed(2));

  return {
    lineItems,
    subtotal: Number(subtotal.toFixed(2)),
    taxAmount: Number(totalTax.toFixed(2)),
    discount: Number(totalDiscount.toFixed(2)),
    total,
  };
}

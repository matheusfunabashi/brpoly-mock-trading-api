import { Decimal } from "@prisma/client/runtime/library";

export function decimalToString(value: Decimal | number | null | undefined) {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return value.toString();
  return value.toString();
}



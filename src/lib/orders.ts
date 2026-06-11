import { packages, type PackageCode } from "../config/packages";
import { serviceById } from "../config/services";

const allowedKeys = new Set([
  "customerName",
  "phone",
  "orderSource",
  "packageCode",
  "selectedServiceIds",
  "arrivalDate",
  "arrivalTime",
  "staffPreference",
  "notes",
  "website",
]);

export type ValidOrder = {
  orderSource: "home" | "in_salon";
  customerName: string;
  phone: string;
  packageCode: PackageCode;
  selectedServiceIds: string[];
  arrivalDate: string | null;
  arrivalTime: string | null;
  staffPreference: string | null;
  notes: string | null;
};

export class OrderValidationError extends Error {
  constructor(public fields: Record<string, string>) {
    super("Invalid order");
  }
}

const cleanOptional = (value: unknown, maxLength: number) => {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") return undefined;
  const cleaned = value.trim();
  return cleaned.length <= maxLength ? cleaned || null : undefined;
};

export const validateOrder = (input: unknown): ValidOrder => {
  const errors: Record<string, string> = {};
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new OrderValidationError({ body: "Request body must be a JSON object." });
  }

  const body = input as Record<string, unknown>;
  if (body.website) throw new OrderValidationError({ body: "Order rejected." });
  const unknownKeys = Object.keys(body).filter((key) => !allowedKeys.has(key));
  if (unknownKeys.length) errors.body = "Request contains unsupported fields.";

  const customerName = typeof body.customerName === "string" ? body.customerName.trim() : "";
  if (customerName.length < 2 || customerName.length > 100) {
    errors.customerName = "Name must be between 2 and 100 characters.";
  }

  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const orderSource = body.orderSource === "in_salon" ? "in_salon" : body.orderSource === "home" ? "home" : null;
  if (!orderSource) errors.orderSource = "Order source is invalid.";
  if (phone && !/^[+\d][\d\s()-]{6,19}$/.test(phone)) {
    errors.phone = "Phone number is invalid.";
  } else if (orderSource === "home" && !phone) {
    errors.phone = "Phone number is required.";
  }

  const packageItem = packages.find((item) => item.code === body.packageCode);
  if (!packageItem) errors.packageCode = "Package code is invalid.";

  const selectedServiceIds = Array.isArray(body.selectedServiceIds)
    && body.selectedServiceIds.every((id) => typeof id === "string")
    ? body.selectedServiceIds
    : [];
  if (!Array.isArray(body.selectedServiceIds)) {
    errors.selectedServiceIds = "Selected services must be an array.";
  } else if (new Set(selectedServiceIds).size !== selectedServiceIds.length) {
    errors.selectedServiceIds = "Selected services cannot contain duplicates.";
  } else if (selectedServiceIds.some((id) => !serviceById[id])) {
    errors.selectedServiceIds = "Selected services contain an unknown service.";
  } else if (packageItem) {
    const allowed = new Set(packageItem.availableServiceIds);
    if (selectedServiceIds.some((id) => !allowed.has(id))) {
      errors.selectedServiceIds = "A selected service is unavailable for this package.";
    } else if (packageItem.fixedServiceIds) {
      const fixed = packageItem.fixedServiceIds;
      if (selectedServiceIds.length !== fixed.length || fixed.some((id) => !selectedServiceIds.includes(id))) {
        errors.selectedServiceIds = "The fixed package services cannot be changed.";
      }
    } else if (selectedServiceIds.length !== packageItem.limit) {
      errors.selectedServiceIds = `This package requires exactly ${packageItem.limit} services.`;
    } else if (
      packageItem.code === "offer_150"
      && selectedServiceIds.includes("moroccan_bath")
      && selectedServiceIds.includes("facial_session")
    ) {
      errors.selectedServiceIds = "Upgrade the package to combine Moroccan Bath and Facial Session.";
    }
  }

  const arrivalDate = typeof body.arrivalDate === "string" ? body.arrivalDate : "";
  const arrivalTime = typeof body.arrivalTime === "string" ? body.arrivalTime : "";
  if (orderSource === "home" && (!/^\d{4}-\d{2}-\d{2}$/.test(arrivalDate) || Number.isNaN(Date.parse(`${arrivalDate}T00:00:00Z`)))) {
    errors.arrivalDate = "Arrival date is invalid.";
  }
  if (orderSource === "home" && !/^([01]\d|2[0-3]):[0-5]\d$/.test(arrivalTime)) {
    errors.arrivalTime = "Arrival time is invalid.";
  }

  const staffPreference = cleanOptional(body.staffPreference, 100);
  const notes = cleanOptional(body.notes, 500);
  if (staffPreference === undefined) errors.staffPreference = "Staff preference is too long.";
  if (notes === undefined) errors.notes = "Notes must not exceed 500 characters.";

  if (Object.keys(errors).length) throw new OrderValidationError(errors);

  return {
    orderSource: orderSource!,
    customerName,
    phone,
    packageCode: packageItem!.code,
    selectedServiceIds,
    arrivalDate: orderSource === "home" ? arrivalDate : null,
    arrivalTime: orderSource === "home" ? arrivalTime : null,
    staffPreference: staffPreference ?? null,
    notes: notes ?? null,
  };
};

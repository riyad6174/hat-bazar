// Shared by the checkout form and the API routes, so keep this free of any
// server-only imports (mongoose, etc).
import { isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js';

export const CHECKOUT_FIELDS = [
  { key: 'fullName', label: 'Full Name' },
  { key: 'phoneNumber', label: 'Phone Number' },
  { key: 'district', label: 'Delivery Zone' },
  { key: 'address', label: 'Full Address' },
];

const MIN_ADDRESS_LENGTH = 5;

function isValidPhone(value) {
  try {
    return isValidPhoneNumber(value);
  } catch {
    return false;
  }
}

/** Returns the error message for a field, or null when the value is valid. */
export function validateCheckoutField(key, rawValue) {
  const value = String(rawValue ?? '').trim();
  switch (key) {
    case 'fullName':
      return value ? null : 'সম্পূর্ণ নামটি লিখুন';
    case 'phoneNumber':
      if (!value) return 'ফোন নাম্বার টি লিখুন';
      return isValidPhone(value) ? null : 'ফোন নাম্বারটি সঠিক নয়.';
    case 'district':
      return value ? null : 'জোন সিলেক্ট করুন';
    case 'address':
      if (!value) return 'ঠিকানা টি লিখুন';
      return value.length >= MIN_ADDRESS_LENGTH
        ? null
        : 'ঠিকানাটি পরিপূর্ণ নয়। দয়া করে শহর, থানা উল্লেখ করুন';
    default:
      return null;
  }
}

export function validateCheckoutForm(form) {
  const errors = {};
  for (const { key } of CHECKOUT_FIELDS) {
    const message = validateCheckoutField(key, form[key]);
    if (message) errors[key] = message;
  }
  return errors;
}

/** Percentage (0-100) of required fields that are filled in and valid. */
export function getCheckoutProgress(form) {
  const validCount = CHECKOUT_FIELDS.filter(
    ({ key }) => !validateCheckoutField(key, form[key])
  ).length;
  return Math.round((validCount / CHECKOUT_FIELDS.length) * 100);
}

/** E.164 form of a valid phone number, or null when it is not valid. */
export function normalizePhone(value) {
  const phone = String(value ?? '').trim();
  if (!isValidPhone(phone)) return null;
  return parsePhoneNumber(phone).number;
}

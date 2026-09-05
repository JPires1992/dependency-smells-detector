/** Requires a positive integer supplied by the resolved application configuration. */
export function requirePositiveInteger(value, propertyPath) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`Configuration property '${propertyPath}' must be a positive integer.`);
  }
  return value;
}

/** Requires a boolean supplied by the resolved application configuration. */
export function requireBoolean(value, propertyPath) {
  if (typeof value !== "boolean") {
    throw new Error(`Configuration property '${propertyPath}' must be a boolean.`);
  }
  return value;
}

/** Requires a non-empty string supplied by the resolved application configuration. */
export function requireNonEmptyString(value, propertyPath) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Configuration property '${propertyPath}' must be a non-empty string.`);
  }
  return value.trim();
}

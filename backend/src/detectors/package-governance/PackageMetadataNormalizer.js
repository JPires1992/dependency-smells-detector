/** Normalizes npm person metadata into stable name, email, and URL records. */
export function normalizePeople(value) {
  const people = Array.isArray(value) ? value : value ? [value] : [];
  const normalizedByIdentity = new Map();

  for (const person of people) {
    const normalized = normalizePerson(person);
    if (!normalized) {
      continue;
    }

    const identity = normalized.email?.toLowerCase()
      ?? normalized.name?.toLowerCase()
      ?? normalized.url?.toLowerCase();
    if (identity && !normalizedByIdentity.has(identity)) {
      normalizedByIdentity.set(identity, normalized);
    }
  }

  return [...normalizedByIdentity.values()];
}

/** Converts one object or npm person string into a normalized metadata record. */
function normalizePerson(person) {
  if (typeof person === "object" && person !== null) {
    const normalized = {
      name: normalizeOptionalString(person.name),
      email: normalizeOptionalString(person.email),
      url: normalizeOptionalString(person.url)
    };
    return normalized.name || normalized.email || normalized.url ? normalized : null;
  }

  if (typeof person !== "string" || !person.trim()) {
    return null;
  }

  const email = person.match(/<([^<>\s]+@[^<>\s]+)>/)?.[1] ?? null;
  const url = person.match(/\(([^()]+)\)/)?.[1] ?? null;
  const name = person
    .replace(/<[^<>]+>/g, "")
    .replace(/\([^()]+\)/g, "")
    .trim() || null;

  return { name, email, url };
}

/** Trims optional person fields without coercing unsupported metadata types. */
function normalizeOptionalString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

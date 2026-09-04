/** Maps asynchronous work while preserving input order and limiting concurrency. */
export async function mapWithConcurrency(items, concurrency, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;

  /** Claims work from the shared index until no input items remain. */
  const worker = async () => {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  };

  const workerCount = Math.min(normalizeConcurrency(concurrency), items.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return results;
}

/** Prevents invalid configuration from producing an empty or unbounded worker pool. */
function normalizeConcurrency(value) {
  return parsePositiveInteger(value, 1);
}
import { parsePositiveInteger } from "./PositiveInteger.js";

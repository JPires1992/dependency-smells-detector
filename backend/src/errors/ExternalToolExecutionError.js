/** Represents an external-tool failure with separate report and runtime diagnostic messages. */
export class ExternalToolExecutionError extends Error {
  /** Stores a concise public message and detailed output intended only for troubleshooting. */
  constructor(message, diagnostic = "") {
    super(message);
    this.name = "ExternalToolExecutionError";
    this.diagnostic = diagnostic;
  }
}

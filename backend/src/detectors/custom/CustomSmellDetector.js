import { collectManifestDependencies } from "./ManifestDependencyCollector.js";
import { NpmDependencySpecifierParser } from "./NpmDependencySpecifierParser.js";
import {
  createDefaultDependencySpecifierRules,
  NoPackageLockRule
} from "./CustomSmellRules.js";

/** Coordinates modular repository-level smell rules over normalized npm project metadata. */
export class CustomSmellDetector {
  /** Configures parser and rule collections while preserving dependency injection for extensions. */
  constructor({
    specifierParser = new NpmDependencySpecifierParser(),
    dependencyRules = createDefaultDependencySpecifierRules(),
    projectRules = [new NoPackageLockRule()],
    required = false
  } = {}) {
    this.name = "CustomSmellDetector";
    this.specifierParser = specifierParser;
    this.dependencyRules = [...dependencyRules];
    this.projectRules = [...projectRules];
    this.required = required;
  }

  /** Applies dependency and project rules independently and aggregates findings plus diagnostics. */
  async detect(context) {
    const findings = [];
    const warnings = [];
    const manifests = context.manifests ?? {};

    if (manifests.packageJsonStatus === "present") {
      for (const dependency of collectManifestDependencies(manifests.packageJson)) {
        const specifier = this.specifierParser.parse(dependency.name, dependency.constraint);
        for (const rule of this.dependencyRules) {
          evaluateRule(rule, { dependency, specifier, graph: context.graph }, findings, warnings);
        }
      }
    } else {
      warnings.push("Custom package.json rules were skipped because the remote manifest was unavailable.");
    }

    for (const rule of this.projectRules) {
      evaluateRule(rule, {
        project: context.project,
        manifests,
        graph: context.graph
      }, findings, warnings);
    }

    return { findings, warnings };
  }
}

/** Executes one optional rule without allowing a malformed declaration to stop other custom checks. */
function evaluateRule(rule, input, findings, warnings) {
  try {
    const finding = rule.evaluate(input);
    if (finding) {
      findings.push(finding);
    }
  } catch (error) {
    warnings.push(`${rule.name ?? "Custom smell rule"} skipped: ${error.message}`);
  }
}

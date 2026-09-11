# Smell Severity Scoring System

The Smell Severity Scoring System (SSSS) prioritises detected software supply chain smell instances by combining the intrinsic severity of the smell type with contextual information about the affected dependency.

Each dimension is normalised to a value between 0 and 1. The final score is a weighted sum converted to a 0-100 scale.

```text
SSSS = 100 * (0.30 * S + 0.25 * P + 0.30 * V + 0.15 * R)
```

The research basis for the SSSS dimensions, baseline severity catalogue, and prioritisation rationale is documented in [Literature-Review-and-Smell-Catalogue.md](./Literature-Review-and-Smell-Catalogue.md)

### Dimensions and Weights

| Symbol | Dimension | Weight | What it captures |
| --- | --- | ---: | --- |
| S | Empirical impact and practitioner-perceived severity of the smell | 0.30 | Intrinsic severity of the smell type, derived from the baseline severity catalogue. |
| P | Production reachability and dependency depth | 0.25 | Whether the affected dependency is production-reachable and how close it is to the root project. |
| V | Vulnerability exposure and persistence | 0.30 | Whether the dependency is affected by known vulnerabilities or long-lived unresolved exposure. |
| R | Responsiveness and update strategy | 0.15 | Whether the package or dependency configuration is likely to delay remediation. |

Empirical impact and vulnerability exposure receive the highest weights because they capture intrinsic smell relevance and known vulnerability-related risk. Production reachability receives a substantial weight because production-reachable dependencies should be prioritised over development-only or unused dependencies. Responsiveness receives a lower, but still relevant, weight because it mainly captures expected remediation delay.

### Dimension Value Ranges

| Symbol | Dimension | Value range |
| --- | --- | --- |
| S | Empirical impact and practitioner-perceived severity of the smell | 0-1 |
| P | Production reachability and dependency depth | 0-1 |
| V | Vulnerability exposure and persistence | 0-1 |
| R | Responsiveness and update strategy | 0-1 |

### S - Baseline Severity Normalisation

| Baseline severity | S value |
| --- | ---: |
| Low | 0.25 |
| Medium | 0.50 |
| High | 0.75 |
| Critical | 1.00 |

The S dimension represents the intrinsic severity associated with the detected smell type. Each baseline severity category defined in the smell catalogue is normalised to a value between 0 and 1, allowing it to be combined with the contextual P, V, and R dimensions in the final SSSS calculation.


### P - Production Reachability and Dependency Depth

| Condition | P value | Interpretation |
| --- | ---: | --- |
| Direct production dependency, declared in `dependencies` or confirmed as bundled/imported in production code. | 1.00 | Highest priority because the smell affects a dependency directly used by the application at runtime. |
| Transitive production-reachable dependency at depth 2. | 0.85 | High priority because the dependency can still influence production behaviour through a short dependency path. |
| Transitive production-reachable dependency at depth 3 or higher. | 0.70 | Relevant priority, but lower because the dependency is further from the root project. |
| Direct dependency with production reachability not confirmed. | 0.50 | Moderate default when the dependency is declared by the project but production impact is uncertain. |
| Development-only, testing, or build-time dependency not expected to be shipped to production. | 0.30 | Lower priority because the smell is less likely to affect runtime behaviour directly. |
| Unused or non-reachable dependency according to available analysis. | 0.10 | Lowest priority because there is no evidence that the dependency affects execution. |

When exact production or bundle reachability is unavailable, dependency declaration type and graph depth are used as practical proxies. If a dependency is reachable through multiple paths, the highest applicable P value is used.

### V - Vulnerability Exposure and Persistence

| Condition | V value | Interpretation |
| --- | ---: | --- |
| Known critical vulnerability affecting the dependency, or a known vulnerability unresolved for more than 180 days. | 1.00 | Highest vulnerability-related priority. |
| Known high-severity vulnerability affecting the dependency, or known vulnerability unresolved between 90 and 180 days. | 0.80 | Strong vulnerability-related priority due to high severity or significant persistence. |
| Known medium-severity vulnerability affecting the dependency, or known vulnerability unresolved between 30 and 89 days. | 0.60 | Relevant vulnerability exposure, but less urgent than high or critical cases. |
| Known low-severity vulnerability affecting the dependency, or known vulnerability unresolved for less than 30 days. | 0.30 | Limited vulnerability-related priority. |
| No known vulnerability found after a successful lookup. | 0.00 | No vulnerability amplification is applied. |
| Vulnerability lookup unavailable, incomplete, or not conclusive. | 0.25 | Conservative uncertainty value because unavailable data cannot be interpreted as evidence of safety. |

When multiple vulnerabilities affect the same dependency, or when both severity and persistence conditions apply, the highest applicable V value is used.

### R - Responsiveness and Update Strategy

| Condition | R value | Interpretation |
| --- | ---: | --- |
| The installed package version is explicitly deprecated, or its source repository is archived. | 1.00 | Highest remediation concern because authoritative metadata indicates that the package version or repository is no longer supported through its normal maintenance lifecycle. |
| A direct pinned or restrictive constraint excludes an available fixed version, or complete activity metadata shows that the latest package release or repository activity occurred more than 730 days ago. | 0.75 | High remediation concern because adoption of a known fix is blocked or the available metadata indicates prolonged inactivity. |
| Pinned or restrictive update strategy is present, but there is no evidence that it currently blocks a known fix, or maintenance/update metadata is mixed or incomplete. | 0.50 | Moderate concern because the configuration may delay future remediation. |
| Latest package release or repository activity occurred within the preceding 365 days. | 0.25 | Lower concern because recent activity indicates continued maintenance. |
| Recent activity is present, and at least four package versions were published during the preceding year. | 0.10 | Lowest concern because frequent recent releases indicate stronger package responsiveness. |

### Final Score Mapping

| Final SSSS score | Final rating |
| ---------------- | ------------ |
| `< 40`           | Low          |
| `≥ 40 and < 70`  | Medium       |
| `≥ 70 and < 90`  | High         |
| `≥ 90`           | Critical     |

Dimension values and the final SSSS score are rounded to two decimal places. The baseline severity represents the intrinsic classification of the smell type, whereas the final rating represents the context-sensitive priority obtained after combining the four SSSS dimensions.


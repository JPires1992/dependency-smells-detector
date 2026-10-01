# Software Supply Chain Smell Report - satoshi-dashboard

- Analysis date: 2026-09-27 22:20:21
- Repository: Satoshi-Dashboard/main
- Package manager: npm
- Analysed ref: main
- Dependencies analysed: 749
- Smells detected: 672

## Warnings

- Too Many Contributors was not evaluated for 610 package versions because latest npm metadata did not declare contributors.
- ms@2.0.0: maintainer domain bbi.io could not be conclusively verified.
- ms@2.1.3: maintainer domain bbi.io could not be conclusively verified.

## Detected Smells

### Summary by Severity

| Severity | Total |
| --- | ---: |
| Critical | 0 |
| High | 0 |
| Medium | 98 |
| Low | 574 |

### Summary by Smell Type

| Smell Type | Total |
| --- | ---: |
| Deprecated | 6 |
| Fork | 10 |
| Inaccessible Commit SHA/Release Tag | 33 |
| Install Script Execution | 3 |
| Invalid Source Code URL | 5 |
| No Code Signature | 1 |
| No Provenance | 579 |
| No Source Code URL | 4 |
| Restrictive Constraint | 3 |
| Too Many Maintainers | 13 |
| Unused Dependency | 15 |

### Smell Details

| ID | Smell | Package | Score | Rating | Source | Evidence |
| --- | --- | --- | ---: | --- | --- | --- |
| SMELL-001 | Fork | @acemir/cssom@0.9.31 | 24.00 | Low | Dirty-Waters | Package source repository is detected as a fork. |
| SMELL-002 | No Provenance | @acemir/cssom@0.9.31 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-003 | Fork | @adobe/css-tools@4.4.4 | 26.25 | Low | Dirty-Waters | Package source repository is detected as a fork. |
| SMELL-004 | No Provenance | @adobe/css-tools@4.4.4 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-005 | No Provenance | @asamuzakjp/css-color@4.1.2 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-006 | No Provenance | @asamuzakjp/dom-selector@6.8.1 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-007 | Inaccessible Commit SHA/Release Tag | @asamuzakjp/nwsapi@2.3.9 | 37.50 | Low | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-008 | No Provenance | @asamuzakjp/nwsapi@2.3.9 | 22.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-009 | No Provenance | @babel/helper-plugin-utils@7.28.6 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-010 | No Provenance | @babel/plugin-transform-react-jsx-self@7.27.1 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-011 | No Provenance | @babel/plugin-transform-react-jsx-source@7.27.1 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-012 | No Provenance | @babel/runtime@7.29.2 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-013 | No Provenance | @csstools/color-helpers@6.0.2 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-014 | No Provenance | @csstools/css-calc@3.1.1 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-015 | No Provenance | @csstools/css-color-parser@4.0.2 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-016 | No Provenance | @csstools/css-parser-algorithms@4.0.0 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-017 | No Provenance | @csstools/css-syntax-patches-for-csstree@1.1.2 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-018 | No Provenance | @csstools/css-tokenizer@4.0.0 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-019 | Fork | @eslint-community/eslint-utils@4.9.1 | 24.00 | Low | Dirty-Waters | Package source repository is detected as a fork. |
| SMELL-020 | Fork | @eslint-community/regexpp@4.12.2 | 26.25 | Low | Dirty-Waters | Package source repository is detected as a fork. |
| SMELL-021 | No Provenance | @eslint/js@9.39.3 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-022 | No Provenance | @exodus/bytes@1.15.0 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-023 | No Provenance | @formatjs/ecma402-abstract@2.3.6 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-024 | No Provenance | @formatjs/fast-memoize@2.2.7 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-025 | No Provenance | @formatjs/icu-messageformat-parser@2.11.4 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-026 | No Provenance | @formatjs/icu-skeleton-parser@1.8.16 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-027 | No Provenance | @formatjs/intl-localematcher@0.6.2 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-028 | No Provenance | @humanfs/core@0.19.1 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-029 | No Provenance | @humanfs/node@0.16.7 | 36.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-030 | No Provenance | @humanwhocodes/module-importer@1.0.1 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-031 | No Provenance | @humanwhocodes/retry@0.4.3 | 22.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-032 | No Provenance | @isaacs/cliui@8.0.2 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-033 | No Provenance | @jridgewell/gen-mapping@0.3.13 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-034 | No Provenance | @jridgewell/remapping@2.3.5 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-035 | No Provenance | @jridgewell/resolve-uri@3.1.2 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-036 | No Provenance | @jridgewell/sourcemap-codec@1.5.5 | 28.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-037 | No Provenance | @jridgewell/trace-mapping@0.3.31 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-038 | No Provenance | @lhci/cli@0.15.1 | 50.25 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-039 | No Provenance | @lhci/utils@0.15.1 | 46.50 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-040 | Fork | @mapbox/jsonlint-lines-primitives@2.0.2 | 40.00 | Medium | Dirty-Waters | Package source repository is detected as a fork. |
| SMELL-041 | No Provenance | @mapbox/jsonlint-lines-primitives@2.0.2 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-042 | No Provenance | @mapbox/point-geometry@1.1.0 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-043 | No Provenance | @mapbox/tiny-sdf@2.2.0 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-044 | No Provenance | @mapbox/unitbezier@0.0.1 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-045 | No Provenance | @mapbox/vector-tile@2.0.4 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-046 | No Provenance | @mapbox/whoots-js@3.1.0 | 43.75 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-047 | No Provenance | @paralleldrive/cuid2@2.3.1 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-048 | No Source Code URL | @paulirish/trace_engine@0.0.53 | 31.50 | Low | Dirty-Waters | Package metadata does not expose a source code repository URL. |
| SMELL-049 | No Provenance | @paulirish/trace_engine@0.0.53 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-050 | No Provenance | @pkgjs/parseargs@0.11.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-051 | No Provenance | @react-leaflet/core@3.0.0 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-052 | No Provenance | @sentry-internal/tracing@7.120.4 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-053 | No Provenance | @sentry/core@7.120.4 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-054 | No Provenance | @sentry/integrations@7.120.4 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-055 | No Provenance | @sentry/node@7.120.4 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-056 | No Provenance | @sentry/types@7.120.4 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-057 | No Provenance | @sentry/utils@7.120.4 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-058 | Inaccessible Commit SHA/Release Tag | @standard-schema/utils@0.3.0 | 47.50 | Medium | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-059 | No Provenance | @testing-library/dom@10.4.1 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-060 | No Provenance | @testing-library/jest-dom@6.9.1 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-061 | No Provenance | @tootallnate/quickjs-emscripten@0.23.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-062 | Inaccessible Commit SHA/Release Tag | @types/aria-query@5.0.4 | 41.25 | Medium | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-063 | No Provenance | @types/aria-query@5.0.4 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-064 | Inaccessible Commit SHA/Release Tag | @types/babel__core@7.20.5 | 41.25 | Medium | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-065 | No Provenance | @types/babel__core@7.20.5 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-066 | Inaccessible Commit SHA/Release Tag | @types/babel__generator@7.27.0 | 37.50 | Low | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-067 | No Provenance | @types/babel__generator@7.27.0 | 22.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-068 | Inaccessible Commit SHA/Release Tag | @types/babel__template@7.4.4 | 41.25 | Medium | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-069 | No Provenance | @types/babel__template@7.4.4 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-070 | Inaccessible Commit SHA/Release Tag | @types/babel__traverse@7.28.0 | 37.50 | Low | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-071 | No Provenance | @types/babel__traverse@7.28.0 | 22.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-072 | Inaccessible Commit SHA/Release Tag | @types/chai@5.2.3 | 33.75 | Low | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-073 | No Provenance | @types/chai@5.2.3 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-074 | Inaccessible Commit SHA/Release Tag | @types/d3-array@3.2.2 | 47.50 | Medium | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-075 | No Provenance | @types/d3-array@3.2.2 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-076 | Inaccessible Commit SHA/Release Tag | @types/d3-color@3.1.3 | 51.25 | Medium | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-077 | No Provenance | @types/d3-color@3.1.3 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-078 | Inaccessible Commit SHA/Release Tag | @types/d3-ease@3.0.2 | 51.25 | Medium | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-079 | No Provenance | @types/d3-ease@3.0.2 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-080 | Inaccessible Commit SHA/Release Tag | @types/d3-interpolate@3.0.4 | 51.25 | Medium | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-081 | No Provenance | @types/d3-interpolate@3.0.4 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-082 | Inaccessible Commit SHA/Release Tag | @types/d3-path@3.1.1 | 47.50 | Medium | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-083 | No Provenance | @types/d3-path@3.1.1 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-084 | Inaccessible Commit SHA/Release Tag | @types/d3-scale@4.0.9 | 47.50 | Medium | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-085 | No Provenance | @types/d3-scale@4.0.9 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-086 | Inaccessible Commit SHA/Release Tag | @types/d3-shape@3.1.8 | 43.75 | Medium | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-087 | No Provenance | @types/d3-shape@3.1.8 | 28.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-088 | Inaccessible Commit SHA/Release Tag | @types/d3-time@3.0.4 | 47.50 | Medium | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-089 | No Provenance | @types/d3-time@3.0.4 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-090 | Inaccessible Commit SHA/Release Tag | @types/d3-timer@3.0.2 | 51.25 | Medium | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-091 | No Provenance | @types/d3-timer@3.0.2 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-092 | Inaccessible Commit SHA/Release Tag | @types/deep-eql@4.0.2 | 41.25 | Medium | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-093 | No Provenance | @types/deep-eql@4.0.2 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-094 | Inaccessible Commit SHA/Release Tag | @types/estree@1.0.8 | 43.75 | Medium | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-095 | No Provenance | @types/estree@1.0.8 | 28.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-096 | Inaccessible Commit SHA/Release Tag | @types/geojson@7946.0.16 | 51.25 | Medium | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-097 | No Provenance | @types/geojson@7946.0.16 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-098 | Inaccessible Commit SHA/Release Tag | @types/json-schema@7.0.15 | 41.25 | Medium | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-099 | No Provenance | @types/json-schema@7.0.15 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-100 | Inaccessible Commit SHA/Release Tag | @types/node@25.5.0 | 41.50 | Medium | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-101 | No Provenance | @types/node@25.5.0 | 26.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-102 | Inaccessible Commit SHA/Release Tag | @types/react-dom@19.2.3 | 31.50 | Low | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-103 | No Provenance | @types/react-dom@19.2.3 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-104 | Inaccessible Commit SHA/Release Tag | @types/react@19.2.14 | 41.50 | Medium | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-105 | No Provenance | @types/react@19.2.14 | 26.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-106 | Inaccessible Commit SHA/Release Tag | @types/supercluster@7.1.3 | 51.25 | Medium | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-107 | No Provenance | @types/supercluster@7.1.3 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-108 | Inaccessible Commit SHA/Release Tag | @types/use-sync-external-store@0.0.6 | 43.75 | Medium | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-109 | No Provenance | @types/use-sync-external-store@0.0.6 | 28.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-110 | Inaccessible Commit SHA/Release Tag | @types/yauzl@2.10.3 | 33.75 | Low | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-111 | No Provenance | @types/yauzl@2.10.3 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-112 | No Provenance | @vercel/analytics@1.5.0 | 34.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-113 | No Provenance | @vercel/speed-insights@1.2.0 | 34.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-114 | No Provenance | accepts@1.3.8 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-115 | No Provenance | acorn-jsx@5.3.2 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-116 | No Provenance | acorn@8.16.0 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-117 | No Provenance | agent-base@7.1.4 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-118 | No Provenance | ajv@6.14.0 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-119 | No Provenance | ansi-colors@4.1.3 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-120 | No Provenance | ansi-escapes@3.2.0 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-121 | No Provenance | ansi-regex@3.0.1 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-122 | No Provenance | ansi-regex@4.1.1 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-123 | No Provenance | ansi-regex@5.0.1 | 28.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-124 | No Provenance | ansi-regex@6.2.2 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-125 | No Provenance | ansi-styles@3.2.1 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-126 | No Provenance | ansi-styles@4.3.0 | 28.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-127 | No Provenance | ansi-styles@5.2.0 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-128 | No Provenance | ansi-styles@6.2.3 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-129 | No Provenance | argparse@1.0.10 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-130 | No Provenance | argparse@2.0.1 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-131 | No Provenance | aria-query@5.3.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-132 | No Provenance | array-flatten@1.1.1 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-133 | No Provenance | asap@2.0.6 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-134 | No Provenance | assertion-error@2.0.1 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-135 | No Provenance | ast-types@0.13.4 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-136 | No Provenance | asynckit@0.4.0 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-137 | No Provenance | b4a@1.8.0 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-138 | No Provenance | balanced-match@1.0.2 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-139 | No Provenance | bare-events@2.8.2 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-140 | No Provenance | bare-fs@4.5.5 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-141 | No Provenance | bare-os@3.7.1 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-142 | No Provenance | bare-path@3.0.0 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-143 | No Provenance | bare-stream@2.8.1 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-144 | No Provenance | bare-url@2.3.2 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-145 | No Provenance | base64-js@1.5.1 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-146 | No Provenance | basic-ftp@5.3.1 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-147 | No Provenance | bidi-js@1.0.3 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-148 | No Provenance | bignumber.js@9.3.1 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-149 | No Provenance | body-parser@1.20.6 | 48.25 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-150 | No Provenance | brace-expansion@1.1.16 | 40.50 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-151 | No Provenance | brace-expansion@2.1.2 | 40.50 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-152 | No Provenance | buffer-crc32@0.2.13 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-153 | No Provenance | buffer-equal-constant-time@1.0.1 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-154 | No Provenance | bytes@3.1.2 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-155 | No Provenance | cac@6.7.14 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-156 | No Provenance | call-bind-apply-helpers@1.0.2 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-157 | No Provenance | call-bound@1.0.4 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-158 | No Provenance | callsites@3.1.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-159 | No Provenance | camelcase@5.3.1 | 28.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-160 | No Provenance | chalk@2.4.2 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-161 | No Provenance | chalk@4.1.2 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-162 | No Provenance | chardet@0.7.0 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-163 | No Provenance | chrome-launcher@0.13.4 | 22.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-164 | No Provenance | chrome-launcher@1.2.1 | 22.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-165 | No Provenance | cli-cursor@2.1.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-166 | No Provenance | cli-width@2.2.1 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-167 | No Provenance | cliui@6.0.0 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-168 | No Provenance | cliui@8.0.1 | 22.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-169 | No Provenance | clsx@2.1.1 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-170 | No Provenance | color-convert@1.9.3 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-171 | No Provenance | color-convert@2.0.1 | 28.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-172 | No Provenance | color-name@1.1.3 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-173 | No Provenance | color-name@1.1.4 | 28.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-174 | No Provenance | combined-stream@1.0.8 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-175 | No Provenance | component-emitter@1.3.1 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-176 | No Provenance | compressible@2.0.18 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-177 | No Provenance | compression@1.8.1 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-178 | Invalid Source Code URL | concat-map@0.0.1 | 41.25 | Medium | Dirty-Waters | Package source code repository URL is unavailable or returned a not-found response. |
| SMELL-179 | No Provenance | concat-map@0.0.1 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-180 | No Provenance | configstore@5.0.1 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-181 | No Provenance | content-disposition@0.5.4 | 30.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-182 | No Provenance | content-type@1.0.5 | 30.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-183 | No Provenance | convert-source-map@2.0.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-184 | No Provenance | cookie-signature@1.0.7 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-185 | No Provenance | cookie-signature@1.2.2 | 22.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-186 | No Provenance | cookie@0.7.2 | 30.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-187 | No Provenance | cookie@1.1.1 | 26.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-188 | No Provenance | cookiejar@2.1.4 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-189 | No Provenance | cross-spawn@7.0.6 | 22.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-190 | No Provenance | crypto-random-string@2.0.0 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-191 | No Provenance | csp_evaluator@1.1.5 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-192 | No Provenance | css-tree@3.2.1 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-193 | No Provenance | css.escape@1.5.1 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-194 | No Provenance | csstype@3.2.3 | 26.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-195 | No Provenance | d3-array@3.2.4 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-196 | No Provenance | d3-color@3.1.0 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-197 | No Provenance | d3-ease@3.0.1 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-198 | No Provenance | d3-interpolate@3.0.1 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-199 | No Provenance | d3-path@3.1.0 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-200 | No Provenance | d3-scale@4.0.2 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-201 | No Provenance | d3-shape@3.2.0 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-202 | No Provenance | d3-time-format@4.1.0 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-203 | No Provenance | d3-time@3.1.0 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-204 | No Provenance | d3-timer@3.0.1 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-205 | No Provenance | data-uri-to-buffer@4.0.1 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-206 | No Provenance | data-uri-to-buffer@6.0.2 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-207 | No Provenance | debug@2.6.9 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-208 | No Provenance | debug@4.4.3 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-209 | No Provenance | decamelize@1.2.0 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-210 | No Provenance | decimal.js-light@2.5.1 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-211 | No Provenance | decimal.js@10.6.0 | 22.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-212 | No Provenance | deep-eql@5.0.2 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-213 | Fork | deep-is@0.1.4 | 33.75 | Low | Dirty-Waters | Package source repository is detected as a fork. |
| SMELL-214 | No Provenance | deep-is@0.1.4 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-215 | No Provenance | define-lazy-prop@2.0.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-216 | No Provenance | degenerator@5.0.1 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-217 | No Provenance | delayed-stream@1.0.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-218 | No Provenance | depd@2.0.0 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-219 | No Provenance | dequal@2.0.3 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-220 | No Provenance | destroy@1.2.0 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-221 | No Provenance | devtools-protocol@0.0.1467305 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-222 | No Provenance | dezalgo@1.0.4 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-223 | No Provenance | dijkstrajs@1.0.3 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-224 | No Provenance | dom-accessibility-api@0.5.16 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-225 | No Provenance | dom-accessibility-api@0.6.3 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-226 | No Provenance | dot-prop@5.3.0 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-227 | No Provenance | dunder-proto@1.0.1 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-228 | No Provenance | earcut@3.0.2 | 30.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-229 | No Provenance | eastasianwidth@0.2.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-230 | No Provenance | ecdsa-sig-formatter@1.0.11 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-231 | No Provenance | ee-first@1.1.1 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-232 | No Provenance | emoji-regex@8.0.0 | 28.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-233 | No Provenance | emoji-regex@9.2.2 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-234 | No Provenance | encodeurl@2.0.0 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-235 | No Provenance | end-of-stream@1.4.5 | 22.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-236 | No Provenance | enquirer@2.4.1 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-237 | No Provenance | entities@6.0.1 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-238 | No Provenance | es-define-property@1.0.1 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-239 | No Provenance | es-errors@1.3.0 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-240 | No Provenance | es-module-lexer@1.7.0 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-241 | No Provenance | es-object-atoms@1.1.1 | 28.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-242 | No Provenance | es-set-tostringtag@2.1.0 | 22.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-243 | No Provenance | escalade@3.2.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-244 | No Provenance | escape-html@1.0.3 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-245 | No Provenance | escape-string-regexp@1.0.5 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-246 | No Provenance | escape-string-regexp@4.0.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-247 | No Provenance | escodegen@2.1.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-248 | No Provenance | eslint-plugin-react-hooks@7.0.1 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-249 | Deprecated | eslint@9.39.3 | 45.00 | Medium | Dirty-Waters | Package version is marked as deprecated in registry metadata. |
| SMELL-250 | No Provenance | eslint@9.39.3 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-251 | No Provenance | esprima@4.0.1 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-252 | No Provenance | esquery@1.7.0 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-253 | No Provenance | esrecurse@4.3.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-254 | No Provenance | estraverse@5.3.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-255 | No Provenance | estree-walker@3.0.3 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-256 | No Provenance | esutils@2.0.3 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-257 | No Provenance | etag@1.8.1 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-258 | No Provenance | eventemitter3@5.0.4 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-259 | No Provenance | events-universal@1.0.1 | 22.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-260 | No Provenance | expect-type@1.3.0 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-261 | No Provenance | express@4.22.2 | 52.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-262 | No Provenance | extend@3.0.2 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-263 | No Provenance | external-editor@3.1.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-264 | No Provenance | extract-zip@2.0.1 | 50.25 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-265 | No Source Code URL | fancy-canvas@2.1.0 | 55.00 | Medium | Dirty-Waters | Package metadata does not expose a source code repository URL. |
| SMELL-266 | No Provenance | fancy-canvas@2.1.0 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-267 | No Provenance | fast-deep-equal@3.1.3 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-268 | No Provenance | fast-fifo@1.3.2 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-269 | Fork | fast-json-stable-stringify@2.1.0 | 33.75 | Low | Dirty-Waters | Package source repository is detected as a fork. |
| SMELL-270 | No Provenance | fast-json-stable-stringify@2.1.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-271 | No Provenance | fast-levenshtein@2.0.6 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-272 | No Provenance | fast-safe-stringify@2.1.1 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-273 | No Provenance | fd-slicer@1.1.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-274 | No Provenance | fdir@6.5.0 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-275 | No Provenance | fetch-blob@3.2.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-276 | No Provenance | figures@2.0.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-277 | Invalid Source Code URL | file-entry-cache@8.0.0 | 31.50 | Low | Dirty-Waters | Package source code repository URL is unavailable or returned a not-found response. |
| SMELL-278 | No Provenance | file-entry-cache@8.0.0 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-279 | No Provenance | finalhandler@1.3.2 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-280 | No Provenance | find-up@4.1.0 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-281 | No Provenance | find-up@5.0.0 | 22.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-282 | Invalid Source Code URL | flat-cache@4.0.1 | 31.50 | Low | Dirty-Waters | Package source code repository URL is unavailable or returned a not-found response. |
| SMELL-283 | No Provenance | flat-cache@4.0.1 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-284 | No Provenance | flatted@3.4.2 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-285 | No Provenance | foreground-child@3.3.1 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-286 | No Provenance | form-data@4.0.6 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-287 | No Provenance | formdata-polyfill@4.0.10 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-288 | No Source Code URL | formidable@3.5.4 | 37.50 | Low | Dirty-Waters | Package metadata does not expose a source code repository URL. |
| SMELL-289 | No Provenance | formidable@3.5.4 | 22.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-290 | No Provenance | forwarded@0.2.0 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-291 | No Provenance | framer-motion@12.34.5 | 30.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-292 | No Provenance | fresh@0.5.2 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-293 | No Provenance | fs.realpath@1.0.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-294 | No Provenance | fsevents@2.3.3 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-295 | No Provenance | function-bind@1.1.2 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-296 | No Provenance | gaxios@7.1.3 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-297 | No Provenance | gcp-metadata@8.1.2 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-298 | No Provenance | gensync@1.0.0-beta.2 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-299 | No Provenance | get-caller-file@2.0.5 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-300 | No Provenance | get-intrinsic@1.3.0 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-301 | No Provenance | get-proto@1.0.1 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-302 | No Provenance | get-stream@5.2.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-303 | No Provenance | get-uri@6.0.5 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-304 | No Provenance | gl-matrix@3.4.4 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-305 | No Provenance | glob-parent@6.0.2 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-306 | Deprecated | glob@10.5.0 | 45.00 | Medium | Dirty-Waters | Package version is marked as deprecated in registry metadata. |
| SMELL-307 | No Provenance | glob@10.5.0 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-308 | Deprecated | glob@7.2.3 | 45.00 | Medium | Dirty-Waters | Package version is marked as deprecated in registry metadata. |
| SMELL-309 | No Provenance | glob@7.2.3 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-310 | No Provenance | globals@14.0.0 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-311 | No Provenance | globals@16.5.0 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-312 | No Provenance | google-auth-library@10.6.1 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-313 | No Provenance | google-logging-utils@1.1.3 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-314 | No Provenance | googleapis-common@8.0.1 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-315 | No Provenance | googleapis@171.4.0 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-316 | No Provenance | gopd@1.2.0 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-317 | No Provenance | graceful-fs@4.2.11 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-318 | No Provenance | has-flag@3.0.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-319 | No Provenance | has-flag@4.0.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-320 | No Provenance | has-symbols@1.1.0 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-321 | No Provenance | has-tostringtag@1.0.2 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-322 | No Provenance | hasown@2.0.4 | 28.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-323 | Inaccessible Commit SHA/Release Tag | hermes-estree@0.25.1 | 31.50 | Low | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-324 | No Provenance | hermes-estree@0.25.1 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-325 | Inaccessible Commit SHA/Release Tag | hermes-parser@0.25.1 | 31.50 | Low | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-326 | No Provenance | hermes-parser@0.25.1 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-327 | No Provenance | http-errors@2.0.1 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-328 | Invalid Source Code URL | http-link-header@1.1.3 | 33.75 | Low | Dirty-Waters | Package source code repository URL is unavailable or returned a not-found response. |
| SMELL-329 | No Provenance | http-link-header@1.1.3 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-330 | No Provenance | http-proxy-agent@7.0.2 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-331 | No Provenance | https-proxy-agent@7.0.6 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-332 | No Provenance | iconv-lite@0.4.24 | 26.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-333 | No Provenance | ignore@5.3.2 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-334 | No Provenance | image-ssim@0.2.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-335 | No Provenance | immediate@3.0.6 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-336 | No Provenance | immer@10.2.0 | 30.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-337 | No Provenance | immer@11.1.4 | 26.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-338 | No Provenance | import-fresh@3.3.1 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-339 | No Provenance | imurmurhash@0.1.4 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-340 | No Provenance | indent-string@4.0.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-341 | Deprecated | inflight@1.0.6 | 45.00 | Medium | Dirty-Waters | Package version is marked as deprecated in registry metadata. |
| SMELL-342 | No Provenance | inflight@1.0.6 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-343 | No Provenance | inherits@2.0.4 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-344 | No Provenance | inquirer@6.5.2 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-345 | No Provenance | internmap@2.0.3 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-346 | No Provenance | intl-messageformat@10.7.18 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-347 | No Provenance | ip-address@10.2.0 | 54.25 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-348 | No Provenance | ipaddr.js@1.9.1 | 28.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-349 | No Provenance | is-docker@2.2.1 | 22.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-350 | No Provenance | is-extglob@2.1.1 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-351 | No Provenance | is-fullwidth-code-point@2.0.0 | 22.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-352 | No Provenance | is-fullwidth-code-point@3.0.0 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-353 | No Provenance | is-glob@4.0.3 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-354 | No Provenance | is-obj@2.0.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-355 | No Provenance | is-potential-custom-element-name@1.0.1 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-356 | No Provenance | is-typedarray@1.0.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-357 | No Provenance | is-wsl@2.2.0 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-358 | No Provenance | isexe@2.0.0 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-359 | No Provenance | isomorphic-fetch@3.0.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-360 | No Provenance | jackspeak@3.4.3 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-361 | No Provenance | jiti@2.7.0 | 28.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-362 | No Provenance | jpeg-js@0.4.4 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-363 | No Provenance | js-library-detector@6.7.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-364 | No Provenance | js-tokens@4.0.0 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-365 | No Provenance | js-tokens@9.0.1 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-366 | No Provenance | js-yaml@3.15.0 | 40.50 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-367 | No Provenance | js-yaml@4.3.0 | 40.50 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-368 | No Provenance | jsdom@27.4.0 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-369 | No Provenance | jsesc@3.1.0 | 22.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-370 | No Provenance | json-bigint@1.0.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-371 | No Provenance | json-buffer@3.0.1 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-372 | No Provenance | json-schema-traverse@0.4.1 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-373 | Fork | json-stable-stringify-without-jsonify@1.0.1 | 33.75 | Low | Dirty-Waters | Package source repository is detected as a fork. |
| SMELL-374 | No Provenance | json-stable-stringify-without-jsonify@1.0.1 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-375 | No Provenance | json-stringify-pretty-compact@4.0.0 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-376 | No Provenance | json5@2.2.3 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-377 | No Provenance | jwa@2.0.1 | 22.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-378 | No Provenance | jws@4.0.1 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-379 | No Provenance | kdbush@4.0.2 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-380 | Inaccessible Commit SHA/Release Tag | keyv@4.5.4 | 31.50 | Low | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-381 | No Provenance | keyv@4.5.4 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-382 | No Provenance | leaflet@1.9.4 | 43.75 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-383 | No Provenance | legacy-javascript@0.0.1 | 22.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-384 | No Provenance | levn@0.4.1 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-385 | No Provenance | lie@3.1.1 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-386 | No Provenance | lighthouse-logger@1.2.0 | 22.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-387 | Inaccessible Commit SHA/Release Tag | lighthouse-logger@2.0.2 | 37.50 | Low | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-388 | No Provenance | lighthouse-logger@2.0.2 | 22.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-389 | No Provenance | lighthouse-stack-packs@1.12.2 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-390 | No Provenance | lighthouse@12.6.1 | 40.50 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-391 | No Provenance | lightningcss-android-arm64@1.32.0 | 26.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-392 | No Provenance | lightningcss-darwin-arm64@1.32.0 | 26.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-393 | No Provenance | lightningcss-darwin-x64@1.32.0 | 26.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-394 | No Provenance | lightningcss-freebsd-x64@1.32.0 | 26.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-395 | No Provenance | lightningcss-linux-arm-gnueabihf@1.32.0 | 26.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-396 | No Provenance | lightningcss-linux-arm64-gnu@1.32.0 | 26.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-397 | No Provenance | lightningcss-linux-arm64-musl@1.32.0 | 26.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-398 | No Provenance | lightningcss-linux-x64-gnu@1.32.0 | 26.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-399 | No Provenance | lightningcss-linux-x64-musl@1.32.0 | 26.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-400 | No Provenance | lightningcss-win32-arm64-msvc@1.32.0 | 26.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-401 | No Provenance | lightningcss-win32-x64-msvc@1.32.0 | 26.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-402 | No Provenance | lightningcss@1.32.0 | 26.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-403 | No Provenance | lightweight-charts@5.1.0 | 34.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-404 | No Provenance | localforage@1.10.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-405 | No Provenance | locate-path@5.0.0 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-406 | No Provenance | locate-path@6.0.0 | 22.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-407 | No Provenance | lodash-es@4.18.1 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-408 | Inaccessible Commit SHA/Release Tag | lodash.merge@4.6.2 | 41.25 | Medium | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-409 | No Provenance | lodash.merge@4.6.2 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-410 | No Provenance | lodash@4.18.1 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-411 | No Provenance | lookup-closest-locale@6.2.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-412 | No Provenance | lru-cache@10.4.3 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-413 | No Provenance | lru-cache@11.2.7 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-414 | No Provenance | lru-cache@5.1.1 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-415 | No Provenance | lru-cache@7.18.3 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-416 | No Provenance | lz-string@1.5.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-417 | No Provenance | make-dir@3.1.0 | 22.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-418 | No Provenance | marky@1.3.0 | 22.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-419 | No Provenance | math-intrinsics@1.1.0 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-420 | No Provenance | media-typer@0.3.0 | 28.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-421 | No Provenance | merge-descriptors@1.0.3 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-422 | No Provenance | metaviewport-parser@0.3.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-423 | No Provenance | methods@1.1.2 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-424 | No Provenance | mime-db@1.52.0 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-425 | No Provenance | mime-types@2.1.35 | 28.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-426 | No Provenance | mime@1.6.0 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-427 | No Provenance | mime@2.6.0 | 22.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-428 | No Provenance | mimic-fn@1.2.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-429 | No Provenance | min-indent@1.0.1 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-430 | No Provenance | minimatch@3.1.5 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-431 | No Provenance | minimatch@9.0.9 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-432 | No Provenance | minimist@1.2.8 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-433 | No Provenance | minipass@7.1.3 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-434 | No Provenance | mitt@3.0.1 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-435 | Invalid Source Code URL | mkdirp@0.5.6 | 41.25 | Medium | Dirty-Waters | Package source code repository URL is unavailable or returned a not-found response. |
| SMELL-436 | No Provenance | mkdirp@0.5.6 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-437 | No Provenance | motion-dom@12.34.5 | 26.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-438 | No Provenance | motion-utils@12.29.2 | 26.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-439 | No Provenance | ms@2.0.0 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-440 | No Provenance | ms@2.1.3 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-441 | Fork | murmurhash-js@1.0.0 | 47.50 | Medium | Dirty-Waters | Package source repository is detected as a fork. |
| SMELL-442 | No Provenance | murmurhash-js@1.0.0 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-443 | No Provenance | mute-stream@0.0.7 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-444 | No Provenance | nanoid@3.3.12 | 50.50 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-445 | No Provenance | natural-compare@1.4.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-446 | No Provenance | negotiator@0.6.3 | 28.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-447 | No Provenance | negotiator@0.6.4 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-448 | No Provenance | netmask@2.0.2 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-449 | Deprecated | node-domexception@1.0.0 | 45.00 | Medium | Dirty-Waters | Package version is marked as deprecated in registry metadata. |
| SMELL-450 | No Provenance | node-domexception@1.0.0 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-451 | No Provenance | node-fetch@2.7.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-452 | No Provenance | node-fetch@3.3.2 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-453 | No Provenance | object-inspect@1.13.4 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-454 | No Provenance | on-finished@2.4.1 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-455 | No Provenance | on-headers@1.1.0 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-456 | No Provenance | once@1.4.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-457 | No Provenance | onetime@2.0.1 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-458 | No Provenance | open@7.4.2 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-459 | No Provenance | open@8.4.2 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-460 | No Provenance | optionator@0.9.4 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-461 | No Provenance | p-limit@2.3.0 | 26.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-462 | No Provenance | p-limit@3.1.0 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-463 | No Provenance | p-locate@4.1.0 | 28.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-464 | No Provenance | p-locate@5.0.0 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-465 | No Provenance | p-try@2.2.0 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-466 | No Provenance | pac-proxy-agent@7.2.0 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-467 | No Provenance | pac-resolver@7.0.1 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-468 | No Provenance | package-json-from-dist@1.0.1 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-469 | No Provenance | parent-module@1.0.1 | 22.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-470 | No Provenance | parse-cache-control@1.0.1 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-471 | No Provenance | parse5@8.0.0 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-472 | No Provenance | parseurl@1.3.3 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-473 | No Provenance | path-exists@4.0.0 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-474 | No Provenance | path-is-absolute@1.0.1 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-475 | No Provenance | path-key@3.1.1 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-476 | No Provenance | path-scurry@1.11.1 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-477 | No Provenance | path-to-regexp@0.1.13 | 30.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-478 | No Provenance | pathe@2.0.3 | 22.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-479 | No Provenance | pbf@4.0.1 | 30.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-480 | No Provenance | pend@1.2.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-481 | No Provenance | picocolors@1.1.1 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-482 | No Provenance | picomatch@4.0.4 | 26.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-483 | Inaccessible Commit SHA/Release Tag | pngjs@5.0.0 | 55.00 | Medium | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-484 | No Provenance | pngjs@5.0.0 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-485 | No Provenance | postcss@8.5.15 | 50.50 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-486 | No Provenance | potpack@2.1.0 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-487 | No Provenance | prelude-ls@1.2.1 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-488 | No Provenance | pretty-format@27.5.1 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-489 | No Provenance | progress@2.0.3 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-490 | No Provenance | protocol-buffers-schema@3.6.1 | 28.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-491 | No Provenance | proxy-addr@2.0.7 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-492 | No Provenance | proxy-agent@6.5.0 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-493 | No Provenance | proxy-from-env@1.1.0 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-494 | No Provenance | pump@3.0.4 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-495 | No Provenance | punycode@2.3.1 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-496 | No Provenance | qrcode@1.5.4 | 43.75 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-497 | No Provenance | qs@6.15.2 | 48.25 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-498 | No Provenance | quickselect@3.0.0 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-499 | No Provenance | range-parser@1.2.1 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-500 | No Provenance | raw-body@2.5.3 | 28.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-501 | No Provenance | react-animated-counter@1.8.4 | 34.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-502 | No Provenance | react-dom@19.2.4 | 34.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-503 | No Provenance | react-is@17.0.2 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-504 | No Provenance | react-is@19.2.4 | 30.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-505 | No Provenance | react-leaflet@5.0.0 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-506 | No Provenance | react-redux@9.2.0 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-507 | No Provenance | react-refresh@0.18.0 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-508 | No Provenance | react@19.2.4 | 34.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-509 | No Provenance | recharts@3.7.0 | 34.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-510 | No Provenance | redent@3.0.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-511 | No Provenance | redux-thunk@3.1.0 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-512 | No Provenance | require-directory@2.1.1 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-513 | No Provenance | require-from-string@2.0.2 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-514 | No Provenance | require-main-filename@2.0.0 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-515 | No Provenance | reselect@5.1.1 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-516 | No Provenance | resolve-from@4.0.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-517 | No Provenance | resolve-protobuf-schema@2.1.0 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-518 | No Provenance | restore-cursor@2.0.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-519 | Deprecated | rimraf@3.0.2 | 45.00 | Medium | Dirty-Waters | Package version is marked as deprecated in registry metadata. |
| SMELL-520 | No Provenance | rimraf@3.0.2 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-521 | No Provenance | rimraf@5.0.10 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-522 | No Provenance | robots-parser@3.0.1 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-523 | No Provenance | run-async@2.4.1 | 22.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-524 | No Provenance | rxjs@6.6.7 | 22.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-525 | No Provenance | rxjs@7.8.2 | 22.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-526 | No Provenance | safe-buffer@5.2.1 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-527 | No Provenance | safer-buffer@2.1.2 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-528 | No Source Code URL | satoshi-dashboard@0.0.0 | 38.75 | Low | Dirty-Waters | Package metadata does not expose a source code repository URL. |
| SMELL-529 | No Code Signature | satoshi-dashboard@0.0.0 | 38.75 | Low | Dirty-Waters | Package does not expose a code signature. |
| SMELL-530 | No Provenance | saxes@6.0.0 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-531 | No Provenance | scheduler@0.27.0 | 30.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-532 | No Provenance | semver@5.7.2 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-533 | No Provenance | semver@6.3.1 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-534 | No Provenance | send@0.19.2 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-535 | No Provenance | serve-static@1.16.3 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-536 | No Provenance | set-blocking@2.0.0 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-537 | No Provenance | setprototypeof@1.2.0 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-538 | No Provenance | shebang-command@2.0.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-539 | No Provenance | shebang-regex@3.0.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-540 | No Provenance | shell-quote@1.9.0 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-541 | No Provenance | side-channel-list@1.0.0 | 28.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-542 | No Provenance | side-channel-map@1.0.1 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-543 | No Provenance | side-channel-weakmap@1.0.2 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-544 | No Provenance | side-channel@1.1.0 | 28.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-545 | No Provenance | siginfo@2.0.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-546 | No Provenance | signal-exit@3.0.7 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-547 | No Provenance | signal-exit@4.1.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-548 | No Provenance | smart-buffer@4.2.0 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-549 | No Provenance | socks-proxy-agent@8.0.5 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-550 | No Provenance | socks@2.8.7 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-551 | Fork | source-map-js@1.2.1 | 43.75 | Medium | Dirty-Waters | Package source repository is detected as a fork. |
| SMELL-552 | No Provenance | source-map-js@1.2.1 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-553 | No Provenance | source-map@0.6.1 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-554 | No Provenance | speedline-core@1.4.3 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-555 | No Provenance | sprintf-js@1.0.3 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-556 | No Provenance | stackback@0.0.2 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-557 | No Provenance | statuses@2.0.2 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-558 | No Provenance | std-env@3.10.0 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-559 | No Provenance | streamx@2.23.0 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-560 | No Provenance | string-width@2.1.1 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-561 | No Provenance | string-width@4.2.3 | 26.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-562 | No Provenance | string-width@5.1.2 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-563 | No Provenance | strip-ansi@4.0.0 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-564 | No Provenance | strip-ansi@5.2.0 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-565 | No Provenance | strip-ansi@6.0.1 | 28.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-566 | No Provenance | strip-ansi@7.2.0 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-567 | No Provenance | strip-indent@3.0.0 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-568 | No Provenance | strip-json-comments@3.1.1 | 22.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-569 | No Provenance | superagent@10.3.0 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-570 | No Provenance | supercluster@8.0.1 | 28.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-571 | No Provenance | supertest@7.2.2 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-572 | No Provenance | supports-color@5.5.0 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-573 | No Provenance | supports-color@7.2.0 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-574 | No Provenance | supports-color@8.1.1 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-575 | No Provenance | symbol-tree@3.2.4 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-576 | No Provenance | tar-fs@3.1.2 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-577 | No Provenance | tar-stream@3.1.8 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-578 | No Provenance | teex@1.0.1 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-579 | No Provenance | text-decoder@1.2.7 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-580 | No Provenance | third-party-web@0.26.7 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-581 | No Provenance | through@2.3.8 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-582 | No Provenance | tiny-invariant@1.3.3 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-583 | No Provenance | tinybench@2.9.0 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-584 | No Provenance | tinypool@1.1.1 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-585 | No Provenance | tinyqueue@3.0.0 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-586 | No Provenance | tinyrainbow@2.0.0 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-587 | No Provenance | tldts-core@6.1.86 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-588 | No Provenance | tldts-icann@6.1.86 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-589 | No Provenance | tmp@0.2.7 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-590 | No Provenance | toidentifier@1.0.1 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-591 | No Provenance | tr46@0.0.3 | 22.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-592 | No Provenance | tr46@6.0.0 | 22.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-593 | No Provenance | tree-kill@1.2.2 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-594 | No Provenance | tslib@1.14.1 | 22.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-595 | No Provenance | tslib@2.8.1 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-596 | No Provenance | type-check@0.4.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-597 | No Provenance | type-is@1.6.18 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-598 | No Provenance | typedarray-to-buffer@3.1.5 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-599 | No Provenance | unique-string@2.0.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-600 | No Provenance | unpipe@1.0.0 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-601 | No Provenance | update-browserslist-db@1.2.3 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-602 | No Provenance | uri-js@4.4.1 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-603 | No Provenance | url-template@2.0.8 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-604 | No Provenance | use-sync-external-store@1.6.0 | 30.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-605 | No Provenance | utils-merge@1.0.1 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-606 | No Provenance | vary@1.1.2 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-607 | No Provenance | w3c-xmlserializer@5.0.0 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-608 | No Provenance | webdriver-bidi-protocol@0.4.1 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-609 | No Provenance | webidl-conversions@3.0.1 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-610 | No Provenance | whatwg-fetch@3.6.20 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-611 | No Provenance | whatwg-mimetype@4.0.0 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-612 | No Provenance | whatwg-url@15.1.0 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-613 | No Provenance | whatwg-url@5.0.0 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-614 | No Provenance | which-module@2.0.1 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-615 | No Provenance | which@2.0.2 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-616 | No Provenance | why-is-node-running@2.3.0 | 22.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-617 | No Provenance | word-wrap@1.2.5 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-618 | No Provenance | wrap-ansi@6.2.0 | 28.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-619 | No Provenance | wrap-ansi@7.0.0 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-620 | No Provenance | wrap-ansi@8.1.0 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-621 | No Provenance | wrappy@1.0.2 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-622 | No Provenance | write-file-atomic@3.0.3 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-623 | No Provenance | ws@7.5.13 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-624 | No Provenance | ws@8.21.0 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-625 | No Provenance | xdg-basedir@4.0.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-626 | No Provenance | xml-name-validator@5.0.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-627 | No Provenance | xmlchars@2.2.0 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-628 | No Provenance | y18n@4.0.3 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-629 | No Provenance | y18n@5.0.8 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-630 | No Provenance | yallist@3.1.1 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-631 | No Provenance | yargs-parser@13.1.2 | 22.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-632 | No Provenance | yargs-parser@18.1.3 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-633 | No Provenance | yargs-parser@21.1.1 | 22.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-634 | No Provenance | yargs@15.4.1 | 30.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-635 | No Provenance | yargs@17.7.2 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-636 | No Provenance | yauzl@2.10.0 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-637 | No Provenance | yocto-queue@0.1.0 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-638 | No Provenance | zod-validation-error@4.0.2 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-639 | Restrictive Constraint | @lhci/cli@0.15.1 | 65.25 | Medium | CustomSmellDetector | Dependency '@lhci/cli' uses restrictive constraint '^0.15.1', excluding SemVer-compatible updates. |
| SMELL-640 | Restrictive Constraint | eslint-plugin-react-refresh@0.4.26 | 37.50 | Low | CustomSmellDetector | Dependency 'eslint-plugin-react-refresh' uses restrictive constraint '^0.4.24', excluding SemVer-compatible updates. |
| SMELL-641 | Restrictive Constraint | lucide-react@0.576.0 | 55.00 | Medium | CustomSmellDetector | Dependency 'lucide-react' uses restrictive constraint '^0.576.0', excluding SemVer-compatible updates. |
| SMELL-642 | Too Many Maintainers | @adobe/css-tools@4.4.4 | 26.25 | Low | PackageGovernanceDetector | @adobe/css-tools declares 31 npm maintainers, exceeding the threshold of 20. |
| SMELL-643 | Too Many Maintainers | @mapbox/jsonlint-lines-primitives@2.0.2 | 40.00 | Medium | PackageGovernanceDetector | @mapbox/jsonlint-lines-primitives declares 28 npm maintainers, exceeding the threshold of 20. |
| SMELL-644 | Too Many Maintainers | @mapbox/point-geometry@1.1.0 | 47.50 | Medium | PackageGovernanceDetector | @mapbox/point-geometry declares 28 npm maintainers, exceeding the threshold of 20. |
| SMELL-645 | Too Many Maintainers | @mapbox/tiny-sdf@2.2.0 | 40.00 | Medium | PackageGovernanceDetector | @mapbox/tiny-sdf declares 28 npm maintainers, exceeding the threshold of 20. |
| SMELL-646 | Too Many Maintainers | @mapbox/unitbezier@0.0.1 | 40.00 | Medium | PackageGovernanceDetector | @mapbox/unitbezier declares 28 npm maintainers, exceeding the threshold of 20. |
| SMELL-647 | Too Many Maintainers | @mapbox/vector-tile@2.0.4 | 40.00 | Medium | PackageGovernanceDetector | @mapbox/vector-tile declares 28 npm maintainers, exceeding the threshold of 20. |
| SMELL-648 | Install Script Execution | @vercel/speed-insights@1.2.0 | 56.50 | Medium | PackageGovernanceDetector | @vercel/speed-insights@1.2.0 declares install lifecycle scripts: postinstall. |
| SMELL-649 | Too Many Maintainers | ms@2.0.0 | 43.75 | Medium | PackageGovernanceDetector | ms declares 55 npm maintainers, exceeding the threshold of 20. |
| SMELL-650 | Too Many Maintainers | component-emitter@1.3.1 | 33.75 | Low | PackageGovernanceDetector | component-emitter declares 32 npm maintainers, exceeding the threshold of 20. |
| SMELL-651 | Too Many Maintainers | earcut@3.0.2 | 37.75 | Low | PackageGovernanceDetector | earcut declares 29 npm maintainers, exceeding the threshold of 20. |
| SMELL-652 | Install Script Execution | esbuild@0.28.1 | 49.00 | Medium | PackageGovernanceDetector | esbuild@0.28.1 declares install lifecycle scripts: postinstall. |
| SMELL-653 | Install Script Execution | fsevents@2.3.3 | 58.75 | Medium | PackageGovernanceDetector | fsevents@2.3.3 declares install lifecycle scripts: install. |
| SMELL-654 | Too Many Maintainers | ms@2.1.3 | 43.75 | Medium | PackageGovernanceDetector | ms declares 55 npm maintainers, exceeding the threshold of 20. |
| SMELL-655 | Too Many Maintainers | pbf@4.0.1 | 37.75 | Low | PackageGovernanceDetector | pbf declares 28 npm maintainers, exceeding the threshold of 20. |
| SMELL-656 | Too Many Maintainers | source-map@0.6.1 | 26.25 | Low | PackageGovernanceDetector | source-map declares 25 npm maintainers, exceeding the threshold of 20. |
| SMELL-657 | Too Many Maintainers | supercluster@8.0.1 | 36.25 | Low | PackageGovernanceDetector | supercluster declares 29 npm maintainers, exceeding the threshold of 20. |
| SMELL-658 | Unused Dependency | @vercel/analytics@1.5.0 | 34.00 | Low | KnipAdapter | Dependency '@vercel/analytics' is declared in dependencies but Knip found no usage. |
| SMELL-659 | Unused Dependency | @vercel/speed-insights@1.2.0 | 34.00 | Low | KnipAdapter | Dependency '@vercel/speed-insights' is declared in dependencies but Knip found no usage. |
| SMELL-660 | Unused Dependency | leaflet@1.9.4 | 43.75 | Medium | KnipAdapter | Dependency 'leaflet' is declared in dependencies but Knip found no usage. |
| SMELL-661 | Unused Dependency | lightweight-charts@5.1.0 | 34.00 | Low | KnipAdapter | Dependency 'lightweight-charts' is declared in dependencies but Knip found no usage. |
| SMELL-662 | Unused Dependency | lucide-react@0.576.0 | 40.00 | Medium | KnipAdapter | Dependency 'lucide-react' is declared in dependencies but Knip found no usage. |
| SMELL-663 | Unused Dependency | maplibre-gl@5.24.0 | 64.00 | Medium | KnipAdapter | Dependency 'maplibre-gl' is declared in dependencies but Knip found no usage. |
| SMELL-664 | Unused Dependency | qrcode@1.5.4 | 43.75 | Medium | KnipAdapter | Dependency 'qrcode' is declared in dependencies but Knip found no usage. |
| SMELL-665 | Unused Dependency | react-animated-counter@1.8.4 | 34.00 | Low | KnipAdapter | Dependency 'react-animated-counter' is declared in dependencies but Knip found no usage. |
| SMELL-666 | Unused Dependency | react-leaflet@5.0.0 | 40.00 | Medium | KnipAdapter | Dependency 'react-leaflet' is declared in dependencies but Knip found no usage. |
| SMELL-667 | Unused Dependency | recharts@3.7.0 | 34.00 | Low | KnipAdapter | Dependency 'recharts' is declared in dependencies but Knip found no usage. |
| SMELL-668 | Unused Dependency | tailwind-merge@3.5.0 | 34.00 | Low | KnipAdapter | Dependency 'tailwind-merge' is declared in dependencies but Knip found no usage. |
| SMELL-669 | Unused Dependency | @lhci/cli@0.15.1 | 50.25 | Medium | KnipAdapter | Dependency '@lhci/cli' is declared in devDependencies but Knip found no usage. |
| SMELL-670 | Unused Dependency | @testing-library/jest-dom@6.9.1 | 16.50 | Low | KnipAdapter | Dependency '@testing-library/jest-dom' is declared in devDependencies but Knip found no usage. |
| SMELL-671 | Unused Dependency | concurrently@9.2.4 | 16.50 | Low | KnipAdapter | Dependency 'concurrently' is declared in devDependencies but Knip found no usage. |
| SMELL-672 | Unused Dependency | jsdom@27.4.0 | 16.50 | Low | KnipAdapter | Dependency 'jsdom' is declared in devDependencies but Knip found no usage. |


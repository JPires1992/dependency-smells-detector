# Software Supply Chain Smell Report - portfolio

- Analysis date: 2026-09-18 15:31:39
- Repository: joaopauloaramuni/joaopauloaramuni-portfolio
- Package manager: npm
- Analysed ref: main
- Dependencies analysed: 301
- Smells detected: 318

## Warnings

- Too Many Contributors was not evaluated for 268 package versions because latest npm metadata did not declare contributors.

## Detected Smells

### Summary by Severity

| Severity | Total |
| --- | ---: |
| Critical | 1 |
| High | 6 |
| Medium | 64 |
| Low | 247 |

### Summary by Smell Type

| Smell Type | Total |
| --- | ---: |
| Deprecated | 9 |
| Fork | 8 |
| Inaccessible Commit SHA/Release Tag | 14 |
| Install Script Execution | 3 |
| Invalid Source Code URL | 3 |
| No Code Signature | 1 |
| No Provenance | 274 |
| No Source Code URL | 1 |
| Permissive Constraint | 1 |
| Too Many Maintainers | 2 |
| Unused Dependency | 2 |

### Smell Details

| ID | Smell | Package | Score | Rating | Source | Evidence |
| --- | --- | --- | ---: | --- | --- | --- |
| SMELL-001 | No Provenance | @ampproject/remapping@2.3.0 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-002 | No Provenance | @babel/code-frame@7.27.1 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-003 | No Provenance | @babel/compat-data@7.28.0 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-004 | No Provenance | @babel/core@7.28.3 | 40.50 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-005 | No Provenance | @babel/generator@7.28.3 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-006 | No Provenance | @babel/helper-compilation-targets@7.27.2 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-007 | No Provenance | @babel/helper-globals@7.28.0 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-008 | No Provenance | @babel/helper-module-imports@7.27.1 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-009 | No Provenance | @babel/helper-module-transforms@7.28.3 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-010 | No Provenance | @babel/helper-plugin-utils@7.27.1 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-011 | No Provenance | @babel/helper-string-parser@7.27.1 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-012 | No Provenance | @babel/helper-validator-identifier@7.27.1 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-013 | No Provenance | @babel/helper-validator-option@7.27.1 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-014 | No Provenance | @babel/helpers@7.28.3 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-015 | No Provenance | @babel/parser@7.28.3 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-016 | No Provenance | @babel/plugin-transform-react-jsx-self@7.27.1 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-017 | No Provenance | @babel/plugin-transform-react-jsx-source@7.27.1 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-018 | No Provenance | @babel/runtime@7.28.3 | 30.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-019 | No Provenance | @babel/template@7.27.2 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-020 | No Provenance | @babel/traverse@7.28.3 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-021 | No Provenance | @babel/types@7.28.2 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-022 | No Provenance | @esbuild/aix-ppc64@0.25.9 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-023 | No Provenance | @esbuild/android-arm64@0.25.9 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-024 | No Provenance | @esbuild/android-arm@0.25.9 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-025 | No Provenance | @esbuild/android-x64@0.25.9 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-026 | No Provenance | @esbuild/darwin-arm64@0.25.9 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-027 | No Provenance | @esbuild/darwin-x64@0.25.9 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-028 | No Provenance | @esbuild/freebsd-arm64@0.25.9 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-029 | No Provenance | @esbuild/freebsd-x64@0.25.9 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-030 | No Provenance | @esbuild/linux-arm64@0.25.9 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-031 | No Provenance | @esbuild/linux-arm@0.25.9 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-032 | No Provenance | @esbuild/linux-ia32@0.25.9 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-033 | No Provenance | @esbuild/linux-loong64@0.25.9 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-034 | No Provenance | @esbuild/linux-mips64el@0.25.9 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-035 | No Provenance | @esbuild/linux-ppc64@0.25.9 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-036 | No Provenance | @esbuild/linux-riscv64@0.25.9 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-037 | No Provenance | @esbuild/linux-s390x@0.25.9 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-038 | No Provenance | @esbuild/linux-x64@0.25.9 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-039 | No Provenance | @esbuild/netbsd-arm64@0.25.9 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-040 | No Provenance | @esbuild/netbsd-x64@0.25.9 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-041 | No Provenance | @esbuild/openbsd-arm64@0.25.9 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-042 | No Provenance | @esbuild/openbsd-x64@0.25.9 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-043 | No Provenance | @esbuild/openharmony-arm64@0.25.9 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-044 | No Provenance | @esbuild/sunos-x64@0.25.9 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-045 | No Provenance | @esbuild/win32-arm64@0.25.9 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-046 | No Provenance | @esbuild/win32-ia32@0.25.9 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-047 | No Provenance | @esbuild/win32-x64@0.25.9 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-048 | Fork | @eslint-community/eslint-utils@4.7.0 | 24.00 | Low | Dirty-Waters | Package source repository is detected as a fork. |
| SMELL-049 | Fork | @eslint-community/regexpp@4.12.1 | 26.25 | Low | Dirty-Waters | Package source repository is detected as a fork. |
| SMELL-050 | No Provenance | @eslint/js@9.34.0 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-051 | No Provenance | @humanfs/core@0.19.1 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-052 | No Provenance | @humanfs/node@0.16.6 | 36.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-053 | No Provenance | @humanwhocodes/module-importer@1.0.1 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-054 | No Provenance | @humanwhocodes/retry@0.3.1 | 22.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-055 | No Provenance | @humanwhocodes/retry@0.4.3 | 22.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-056 | No Provenance | @jridgewell/gen-mapping@0.3.13 | 22.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-057 | No Provenance | @jridgewell/resolve-uri@3.1.2 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-058 | No Provenance | @jridgewell/sourcemap-codec@1.5.5 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-059 | No Provenance | @jridgewell/trace-mapping@0.3.30 | 22.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-060 | No Provenance | @mapbox/node-pre-gyp@1.0.11 | 50.50 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-061 | No Provenance | @react-pdf-viewer/attachment@3.12.0 | 67.75 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-062 | No Provenance | @react-pdf-viewer/bookmark@3.12.0 | 67.75 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-063 | No Provenance | @react-pdf-viewer/core@3.12.0 | 71.50 | High | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-064 | No Provenance | @react-pdf-viewer/default-layout@3.12.0 | 71.50 | High | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-065 | No Provenance | @react-pdf-viewer/full-screen@3.12.0 | 64.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-066 | No Provenance | @react-pdf-viewer/get-file@3.12.0 | 64.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-067 | No Provenance | @react-pdf-viewer/open@3.12.0 | 64.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-068 | No Provenance | @react-pdf-viewer/page-navigation@3.12.0 | 64.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-069 | No Provenance | @react-pdf-viewer/print@3.12.0 | 64.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-070 | No Provenance | @react-pdf-viewer/properties@3.12.0 | 64.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-071 | No Provenance | @react-pdf-viewer/rotate@3.12.0 | 64.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-072 | No Provenance | @react-pdf-viewer/scroll-mode@3.12.0 | 64.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-073 | No Provenance | @react-pdf-viewer/search@3.12.0 | 64.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-074 | No Provenance | @react-pdf-viewer/selection-mode@3.12.0 | 64.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-075 | No Provenance | @react-pdf-viewer/theme@3.12.0 | 64.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-076 | No Provenance | @react-pdf-viewer/thumbnail@3.12.0 | 67.75 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-077 | No Provenance | @react-pdf-viewer/toolbar@3.12.0 | 67.75 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-078 | No Provenance | @react-pdf-viewer/zoom@3.12.0 | 64.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-079 | No Provenance | @rollup/rollup-android-arm-eabi@4.48.1 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-080 | No Provenance | @rollup/rollup-android-arm64@4.48.1 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-081 | No Provenance | @rollup/rollup-darwin-arm64@4.48.1 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-082 | No Provenance | @rollup/rollup-darwin-x64@4.48.1 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-083 | No Provenance | @rollup/rollup-freebsd-arm64@4.48.1 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-084 | No Provenance | @rollup/rollup-freebsd-x64@4.48.1 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-085 | No Provenance | @rollup/rollup-linux-arm-gnueabihf@4.48.1 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-086 | No Provenance | @rollup/rollup-linux-arm-musleabihf@4.48.1 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-087 | No Provenance | @rollup/rollup-linux-arm64-gnu@4.48.1 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-088 | No Provenance | @rollup/rollup-linux-arm64-musl@4.48.1 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-089 | No Provenance | @rollup/rollup-linux-loongarch64-gnu@4.48.1 | 22.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-090 | No Provenance | @rollup/rollup-linux-ppc64-gnu@4.48.1 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-091 | No Provenance | @rollup/rollup-linux-riscv64-gnu@4.48.1 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-092 | No Provenance | @rollup/rollup-linux-riscv64-musl@4.48.1 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-093 | No Provenance | @rollup/rollup-linux-s390x-gnu@4.48.1 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-094 | No Provenance | @rollup/rollup-linux-x64-gnu@4.48.1 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-095 | No Provenance | @rollup/rollup-linux-x64-musl@4.48.1 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-096 | No Provenance | @rollup/rollup-win32-arm64-msvc@4.48.1 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-097 | No Provenance | @rollup/rollup-win32-ia32-msvc@4.48.1 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-098 | No Provenance | @rollup/rollup-win32-x64-msvc@4.48.1 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-099 | Inaccessible Commit SHA/Release Tag | @types/babel__core@7.20.5 | 41.25 | Medium | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-100 | No Provenance | @types/babel__core@7.20.5 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-101 | Inaccessible Commit SHA/Release Tag | @types/babel__generator@7.27.0 | 37.50 | Low | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-102 | No Provenance | @types/babel__generator@7.27.0 | 22.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-103 | Inaccessible Commit SHA/Release Tag | @types/babel__template@7.4.4 | 41.25 | Medium | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-104 | No Provenance | @types/babel__template@7.4.4 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-105 | Inaccessible Commit SHA/Release Tag | @types/babel__traverse@7.28.0 | 37.50 | Low | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-106 | No Provenance | @types/babel__traverse@7.28.0 | 22.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-107 | Inaccessible Commit SHA/Release Tag | @types/estree@1.0.8 | 33.75 | Low | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-108 | No Provenance | @types/estree@1.0.8 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-109 | Inaccessible Commit SHA/Release Tag | @types/json-schema@7.0.15 | 41.25 | Medium | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-110 | No Provenance | @types/json-schema@7.0.15 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-111 | Inaccessible Commit SHA/Release Tag | @types/node@25.3.0 | 41.50 | Medium | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-112 | No Provenance | @types/node@25.3.0 | 26.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-113 | Inaccessible Commit SHA/Release Tag | @types/phoenix@1.6.7 | 43.75 | Medium | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-114 | No Provenance | @types/phoenix@1.6.7 | 28.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-115 | Inaccessible Commit SHA/Release Tag | @types/react-dom@19.1.8 | 31.50 | Low | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-116 | No Provenance | @types/react-dom@19.1.8 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-117 | Inaccessible Commit SHA/Release Tag | @types/react@19.1.11 | 31.50 | Low | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-118 | No Provenance | @types/react@19.1.11 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-119 | Inaccessible Commit SHA/Release Tag | @types/ws@8.18.1 | 47.50 | Medium | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-120 | No Provenance | @types/ws@8.18.1 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-121 | No Provenance | abbrev@1.1.1 | 28.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-122 | No Provenance | acorn-jsx@5.3.2 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-123 | No Provenance | acorn@8.15.0 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-124 | No Provenance | agent-base@6.0.2 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-125 | No Provenance | ajv@6.12.6 | 46.50 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-126 | No Provenance | ansi-regex@5.0.1 | 28.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-127 | No Provenance | ansi-styles@4.3.0 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-128 | No Provenance | aproba@2.1.0 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-129 | Deprecated | are-we-there-yet@2.0.0 | 55.00 | Medium | Dirty-Waters | Package version is marked as deprecated in registry metadata. |
| SMELL-130 | No Provenance | are-we-there-yet@2.0.0 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-131 | No Provenance | argparse@2.0.1 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-132 | No Provenance | balanced-match@1.0.2 | 28.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-133 | No Provenance | brace-expansion@1.1.12 | 50.50 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-134 | No Provenance | browserslist@4.25.3 | 40.50 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-135 | No Provenance | callsites@3.1.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-136 | No Provenance | caniuse-lite@1.0.30001737 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-137 | No Provenance | canvas@2.11.2 | 30.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-138 | No Provenance | chalk@4.1.2 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-139 | No Provenance | chownr@2.0.0 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-140 | No Provenance | color-convert@2.0.1 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-141 | No Provenance | color-name@1.1.4 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-142 | No Provenance | color-support@1.1.3 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-143 | Invalid Source Code URL | concat-map@0.0.1 | 51.25 | Medium | Dirty-Waters | Package source code repository URL is unavailable or returned a not-found response. |
| SMELL-144 | No Provenance | concat-map@0.0.1 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-145 | No Provenance | console-control-strings@1.1.0 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-146 | No Provenance | convert-source-map@2.0.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-147 | No Provenance | cookie@1.0.2 | 26.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-148 | No Provenance | cross-spawn@7.0.6 | 22.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-149 | No Provenance | csstype@3.1.3 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-150 | No Provenance | debug@4.4.1 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-151 | No Provenance | decompress-response@4.2.1 | 28.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-152 | Fork | deep-is@0.1.4 | 33.75 | Low | Dirty-Waters | Package source repository is detected as a fork. |
| SMELL-153 | No Provenance | deep-is@0.1.4 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-154 | No Provenance | delegates@1.0.0 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-155 | No Provenance | detect-libc@2.0.4 | 28.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-156 | No Provenance | electron-to-chromium@1.5.209 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-157 | Deprecated | emailjs-com@3.2.0 | 62.50 | Medium | Dirty-Waters | Package version is marked as deprecated in registry metadata. |
| SMELL-158 | No Provenance | emailjs-com@3.2.0 | 47.50 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-159 | No Provenance | emoji-regex@8.0.0 | 28.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-160 | No Provenance | esbuild@0.25.9 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-161 | No Provenance | escalade@3.2.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-162 | No Provenance | escape-string-regexp@4.0.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-163 | No Provenance | eslint-plugin-react-hooks@5.2.0 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-164 | No Provenance | eslint-plugin-react-refresh@0.4.20 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-165 | Deprecated | eslint@9.34.0 | 45.00 | Medium | Dirty-Waters | Package version is marked as deprecated in registry metadata. |
| SMELL-166 | No Provenance | eslint@9.34.0 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-167 | No Provenance | esquery@1.6.0 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-168 | No Provenance | esrecurse@4.3.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-169 | No Provenance | estraverse@5.3.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-170 | No Provenance | esutils@2.0.3 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-171 | No Provenance | fast-deep-equal@3.1.3 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-172 | Fork | fast-json-stable-stringify@2.1.0 | 33.75 | Low | Dirty-Waters | Package source repository is detected as a fork. |
| SMELL-173 | No Provenance | fast-json-stable-stringify@2.1.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-174 | No Provenance | fast-levenshtein@2.0.6 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-175 | No Provenance | fdir@6.5.0 | 22.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-176 | Invalid Source Code URL | file-entry-cache@8.0.0 | 31.50 | Low | Dirty-Waters | Package source code repository URL is unavailable or returned a not-found response. |
| SMELL-177 | No Provenance | file-entry-cache@8.0.0 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-178 | No Provenance | find-up@5.0.0 | 22.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-179 | Invalid Source Code URL | flat-cache@4.0.1 | 31.50 | Low | Dirty-Waters | Package source code repository URL is unavailable or returned a not-found response. |
| SMELL-180 | No Provenance | flat-cache@4.0.1 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-181 | No Provenance | flatted@3.3.3 | 46.50 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-182 | No Provenance | fs-minipass@2.1.0 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-183 | No Provenance | fs.realpath@1.0.0 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-184 | No Provenance | fsevents@2.3.3 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-185 | Deprecated | gauge@3.0.2 | 55.00 | Medium | Dirty-Waters | Package version is marked as deprecated in registry metadata. |
| SMELL-186 | Fork | gauge@3.0.2 | 47.50 | Medium | Dirty-Waters | Package source repository is detected as a fork. |
| SMELL-187 | No Provenance | gauge@3.0.2 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-188 | No Provenance | gensync@1.0.0-beta.2 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-189 | No Provenance | glob-parent@6.0.2 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-190 | Deprecated | glob@7.2.3 | 55.00 | Medium | Dirty-Waters | Package version is marked as deprecated in registry metadata. |
| SMELL-191 | No Provenance | glob@7.2.3 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-192 | No Provenance | globals@14.0.0 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-193 | No Provenance | globals@16.3.0 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-194 | No Provenance | has-flag@4.0.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-195 | No Provenance | has-unicode@2.0.1 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-196 | No Provenance | html-parse-stringify@3.0.1 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-197 | No Provenance | https-proxy-agent@5.0.1 | 28.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-198 | No Provenance | i18next@25.4.2 | 34.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-199 | No Provenance | ignore@5.3.2 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-200 | No Provenance | import-fresh@3.3.1 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-201 | No Provenance | imurmurhash@0.1.4 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-202 | Deprecated | inflight@1.0.6 | 55.00 | Medium | Dirty-Waters | Package version is marked as deprecated in registry metadata. |
| SMELL-203 | No Provenance | inflight@1.0.6 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-204 | No Provenance | inherits@2.0.4 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-205 | No Provenance | is-extglob@2.1.1 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-206 | No Provenance | is-fullwidth-code-point@3.0.0 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-207 | No Provenance | is-glob@4.0.3 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-208 | No Provenance | isexe@2.0.0 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-209 | No Provenance | js-tokens@4.0.0 | 28.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-210 | No Provenance | js-yaml@4.1.0 | 46.50 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-211 | No Provenance | jsesc@3.1.0 | 22.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-212 | No Provenance | json-buffer@3.0.1 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-213 | No Provenance | json-schema-traverse@0.4.1 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-214 | Fork | json-stable-stringify-without-jsonify@1.0.1 | 33.75 | Low | Dirty-Waters | Package source repository is detected as a fork. |
| SMELL-215 | No Provenance | json-stable-stringify-without-jsonify@1.0.1 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-216 | No Provenance | json5@2.2.3 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-217 | Inaccessible Commit SHA/Release Tag | keyv@4.5.4 | 31.50 | Low | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-218 | No Provenance | keyv@4.5.4 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-219 | No Provenance | levn@0.4.1 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-220 | No Provenance | locate-path@6.0.0 | 22.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-221 | Inaccessible Commit SHA/Release Tag | lodash.merge@4.6.2 | 41.25 | Medium | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-222 | No Provenance | lodash.merge@4.6.2 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-223 | No Provenance | loose-envify@1.4.0 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-224 | No Provenance | lru-cache@5.1.1 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-225 | No Provenance | make-dir@3.1.0 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-226 | No Provenance | mimic-response@2.1.0 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-227 | No Provenance | minimatch@3.1.2 | 56.50 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-228 | No Provenance | minipass@3.3.6 | 28.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-229 | No Provenance | minipass@5.0.0 | 28.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-230 | No Provenance | minizlib@2.1.2 | 28.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-231 | Fork | mkdirp@1.0.4 | 43.75 | Medium | Dirty-Waters | Package source repository is detected as a fork. |
| SMELL-232 | No Provenance | mkdirp@1.0.4 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-233 | No Provenance | ms@2.1.3 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-234 | No Provenance | nan@2.23.0 | 26.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-235 | No Provenance | nanoid@3.3.11 | 40.50 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-236 | No Provenance | natural-compare@1.4.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-237 | No Provenance | node-fetch@2.7.0 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-238 | No Provenance | node-releases@2.0.19 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-239 | No Provenance | nopt@5.0.0 | 28.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-240 | Deprecated | npmlog@5.0.1 | 55.00 | Medium | Dirty-Waters | Package version is marked as deprecated in registry metadata. |
| SMELL-241 | No Provenance | npmlog@5.0.1 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-242 | No Provenance | object-assign@4.1.1 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-243 | No Provenance | once@1.4.0 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-244 | No Provenance | optionator@0.9.4 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-245 | No Provenance | p-limit@3.1.0 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-246 | No Provenance | p-locate@5.0.0 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-247 | No Provenance | parent-module@1.0.1 | 22.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-248 | No Provenance | path-exists@4.0.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-249 | No Provenance | path-is-absolute@1.0.1 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-250 | No Provenance | path-key@3.1.1 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-251 | No Provenance | path2d-polyfill@2.0.1 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-252 | Inaccessible Commit SHA/Release Tag | pdfjs-dist@3.11.174 | 92.50 | Critical | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-253 | No Provenance | pdfjs-dist@3.11.174 | 77.50 | High | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-254 | No Provenance | picocolors@1.1.1 | 22.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-255 | No Provenance | picomatch@4.0.3 | 40.50 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-256 | No Source Code URL | portfolio@0.0.0 | 38.75 | Low | Dirty-Waters | Package metadata does not expose a source code repository URL. |
| SMELL-257 | No Provenance | portfolio@0.0.0 | 23.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-258 | No Code Signature | portfolio@0.0.0 | 38.75 | Low | Dirty-Waters | Package does not expose a code signature. |
| SMELL-259 | No Provenance | postcss@8.5.6 | 40.50 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-260 | No Provenance | prelude-ls@1.2.1 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-261 | No Provenance | prop-types@15.8.1 | 43.75 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-262 | No Provenance | punycode@2.3.1 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-263 | No Provenance | react-dom@19.1.1 | 34.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-264 | No Provenance | react-i18next@15.7.2 | 34.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-265 | No Provenance | react-icons@5.5.0 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-266 | No Provenance | react-is@16.13.1 | 26.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-267 | No Provenance | react-refresh@0.17.0 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-268 | No Provenance | react-terminal-ui@1.4.0 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-269 | No Provenance | react-type-animation@3.2.0 | 43.75 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-270 | No Provenance | react@19.1.1 | 34.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-271 | No Provenance | readable-stream@3.6.2 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-272 | No Provenance | resolve-from@4.0.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-273 | Deprecated | rimraf@3.0.2 | 55.00 | Medium | Dirty-Waters | Package version is marked as deprecated in registry metadata. |
| SMELL-274 | No Provenance | rimraf@3.0.2 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-275 | No Provenance | rollup@4.48.1 | 46.50 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-276 | No Provenance | safe-buffer@5.2.1 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-277 | No Provenance | scheduler@0.26.0 | 30.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-278 | No Provenance | semver@6.3.1 | 26.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-279 | No Provenance | set-blocking@2.0.0 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-280 | No Provenance | shebang-command@2.0.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-281 | No Provenance | shebang-regex@3.0.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-282 | No Provenance | signal-exit@3.0.7 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-283 | No Provenance | simple-concat@1.0.1 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-284 | No Provenance | simple-get@3.1.1 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-285 | Fork | source-map-js@1.2.1 | 33.75 | Low | Dirty-Waters | Package source repository is detected as a fork. |
| SMELL-286 | No Provenance | source-map-js@1.2.1 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-287 | No Provenance | string-width@4.2.3 | 26.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-288 | No Provenance | string_decoder@1.3.0 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-289 | No Provenance | strip-ansi@6.0.1 | 28.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-290 | No Provenance | strip-json-comments@3.1.1 | 22.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-291 | No Provenance | supports-color@7.2.0 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-292 | Deprecated | tar@6.2.1 | 85.00 | High | Dirty-Waters | Package version is marked as deprecated in registry metadata. |
| SMELL-293 | No Provenance | tar@6.2.1 | 70.00 | High | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-294 | No Provenance | tr46@0.0.3 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-295 | No Provenance | tslib@2.8.1 | 32.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-296 | No Provenance | type-check@0.4.0 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-297 | No Provenance | update-browserslist-db@1.1.3 | 16.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-298 | No Provenance | uri-js@4.4.1 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-299 | No Provenance | util-deprecate@1.0.2 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-300 | No Provenance | void-elements@3.1.0 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-301 | No Provenance | webidl-conversions@3.0.1 | 28.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-302 | No Provenance | whatwg-url@5.0.0 | 26.50 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-303 | No Provenance | which@2.0.2 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-304 | No Provenance | wide-align@1.1.5 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-305 | No Provenance | word-wrap@1.2.5 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-306 | No Provenance | wrappy@1.0.2 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-307 | No Provenance | ws@8.19.0 | 50.50 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-308 | No Provenance | yallist@3.1.1 | 26.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-309 | No Provenance | yallist@4.0.0 | 36.25 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-310 | No Provenance | yocto-queue@0.1.0 | 18.75 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-311 | Permissive Constraint | eslint-plugin-react-refresh@0.4.20 | 24.00 | Low | CustomSmellDetector | Dependency 'eslint-plugin-react-refresh' uses permissive constraint '^0.4.20', allowing potentially incompatible updates. |
| SMELL-312 | Too Many Maintainers | @mapbox/node-pre-gyp@1.0.11 | 58.00 | Medium | PackageGovernanceDetector | @mapbox/node-pre-gyp declares 28 npm maintainers, exceeding the threshold of 20. |
| SMELL-313 | Install Script Execution | canvas@2.11.2 | 52.75 | Medium | PackageGovernanceDetector | canvas@2.11.2 declares install lifecycle scripts: install. |
| SMELL-314 | Install Script Execution | esbuild@0.25.9 | 39.00 | Low | PackageGovernanceDetector | esbuild@0.25.9 declares install lifecycle scripts: postinstall. |
| SMELL-315 | Install Script Execution | fsevents@2.3.3 | 48.75 | Medium | PackageGovernanceDetector | fsevents@2.3.3 declares install lifecycle scripts: install. |
| SMELL-316 | Too Many Maintainers | ms@2.1.3 | 43.75 | Medium | PackageGovernanceDetector | ms declares 55 npm maintainers, exceeding the threshold of 20. |
| SMELL-317 | Unused Dependency | pdfjs-dist@3.11.174 | 77.50 | High | KnipAdapter | Dependency 'pdfjs-dist' is declared in dependencies but Knip found no usage. |
| SMELL-318 | Unused Dependency | react-router-dom@7.8.2 | 58.00 | Medium | KnipAdapter | Dependency 'react-router-dom' is declared in dependencies but Knip found no usage. |


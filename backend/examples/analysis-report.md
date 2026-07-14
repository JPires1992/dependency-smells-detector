# Software Supply Chain Smell Report - frontend

- Repository: JPires1992/Transportation
- Package manager: npm
- Analysed ref: main
- Smells detected: 237

## Warnings

- Custom repository and package-registry detectors are not implemented yet; the module boundary is reserved for smells not covered by Dirty-Waters.

## Detected Smells

| ID | Smell | Package | Score | Rating | Source | Evidence |
| --- | --- | --- | ---: | --- | --- | --- |
| SMELL-001 | No Provenance | @alloc/quick-lru@5.2.0 | 43.75 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-002 | No Provenance | @babel/code-frame@7.27.1 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-003 | No Provenance | @babel/compat-data@7.28.5 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-004 | No Provenance | @babel/core@7.28.5 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-005 | No Provenance | @babel/generator@7.28.5 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-006 | No Provenance | @babel/helper-compilation-targets@7.27.2 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-007 | No Provenance | @babel/helper-globals@7.28.0 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-008 | No Provenance | @babel/helper-module-imports@7.27.1 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-009 | No Provenance | @babel/helper-module-transforms@7.28.3 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-010 | No Provenance | @babel/helper-plugin-utils@7.27.1 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-011 | No Provenance | @babel/helper-string-parser@7.27.1 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-012 | No Provenance | @babel/helper-validator-identifier@7.28.5 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-013 | No Provenance | @babel/helper-validator-option@7.27.1 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-014 | No Provenance | @babel/helpers@7.28.4 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-015 | No Provenance | @babel/parser@7.28.5 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-016 | No Provenance | @babel/plugin-transform-react-jsx-self@7.27.1 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-017 | No Provenance | @babel/plugin-transform-react-jsx-source@7.27.1 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-018 | No Provenance | @babel/template@7.27.2 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-019 | No Provenance | @babel/traverse@7.28.5 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-020 | No Provenance | @babel/types@7.28.5 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-021 | No Provenance | @esbuild/aix-ppc64@0.25.12 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-022 | No Provenance | @esbuild/android-arm64@0.25.12 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-023 | No Provenance | @esbuild/android-arm@0.25.12 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-024 | No Provenance | @esbuild/android-x64@0.25.12 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-025 | No Provenance | @esbuild/darwin-arm64@0.25.12 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-026 | No Provenance | @esbuild/darwin-x64@0.25.12 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-027 | No Provenance | @esbuild/freebsd-arm64@0.25.12 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-028 | No Provenance | @esbuild/freebsd-x64@0.25.12 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-029 | No Provenance | @esbuild/linux-arm64@0.25.12 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-030 | No Provenance | @esbuild/linux-arm@0.25.12 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-031 | No Provenance | @esbuild/linux-ia32@0.25.12 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-032 | No Provenance | @esbuild/linux-loong64@0.25.12 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-033 | No Provenance | @esbuild/linux-mips64el@0.25.12 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-034 | No Provenance | @esbuild/linux-ppc64@0.25.12 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-035 | No Provenance | @esbuild/linux-riscv64@0.25.12 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-036 | No Provenance | @esbuild/linux-s390x@0.25.12 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-037 | No Provenance | @esbuild/linux-x64@0.25.12 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-038 | No Provenance | @esbuild/netbsd-arm64@0.25.12 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-039 | No Provenance | @esbuild/netbsd-x64@0.25.12 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-040 | No Provenance | @esbuild/openbsd-arm64@0.25.12 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-041 | No Provenance | @esbuild/openbsd-x64@0.25.12 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-042 | No Provenance | @esbuild/openharmony-arm64@0.25.12 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-043 | No Provenance | @esbuild/sunos-x64@0.25.12 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-044 | No Provenance | @esbuild/win32-arm64@0.25.12 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-045 | No Provenance | @esbuild/win32-ia32@0.25.12 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-046 | No Provenance | @esbuild/win32-x64@0.25.12 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-047 | Fork | @eslint-community/eslint-utils@4.9.0 | 37.50 | Low | Dirty-Waters | Package source repository is detected as a fork. |
| SMELL-048 | Fork | @eslint-community/regexpp@4.12.2 | 37.50 | Low | Dirty-Waters | Package source repository is detected as a fork. |
| SMELL-049 | No Provenance | @eslint/js@9.39.1 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-050 | No Provenance | @humanfs/core@0.19.1 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-051 | No Provenance | @humanfs/node@0.16.7 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-052 | No Provenance | @humanwhocodes/module-importer@1.0.1 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-053 | No Provenance | @humanwhocodes/retry@0.4.3 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-054 | No Provenance | @jridgewell/gen-mapping@0.3.13 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-055 | No Provenance | @jridgewell/remapping@2.3.5 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-056 | No Provenance | @jridgewell/resolve-uri@3.1.2 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-057 | No Provenance | @jridgewell/sourcemap-codec@1.5.5 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-058 | No Provenance | @jridgewell/trace-mapping@0.3.31 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-059 | No Provenance | @react-leaflet/core@3.0.0 | 43.75 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-060 | Fork | @socket.io/component-emitter@3.1.2 | 51.25 | Medium | Dirty-Waters | Package source repository is detected as a fork. |
| SMELL-061 | No Provenance | @socket.io/component-emitter@3.1.2 | 43.75 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-062 | Inaccessible Commit SHA/Release Tag | @types/babel__core@7.20.5 | 45.00 | Medium | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-063 | No Provenance | @types/babel__core@7.20.5 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-064 | Inaccessible Commit SHA/Release Tag | @types/babel__generator@7.27.0 | 45.00 | Medium | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-065 | No Provenance | @types/babel__generator@7.27.0 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-066 | Inaccessible Commit SHA/Release Tag | @types/babel__template@7.4.4 | 45.00 | Medium | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-067 | No Provenance | @types/babel__template@7.4.4 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-068 | Inaccessible Commit SHA/Release Tag | @types/babel__traverse@7.28.0 | 45.00 | Medium | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-069 | No Provenance | @types/babel__traverse@7.28.0 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-070 | Inaccessible Commit SHA/Release Tag | @types/estree@1.0.8 | 45.00 | Medium | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-071 | No Provenance | @types/estree@1.0.8 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-072 | Inaccessible Commit SHA/Release Tag | @types/json-schema@7.0.15 | 45.00 | Medium | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-073 | No Provenance | @types/json-schema@7.0.15 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-074 | Inaccessible Commit SHA/Release Tag | @types/react-dom@19.2.3 | 45.00 | Medium | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-075 | No Provenance | @types/react-dom@19.2.3 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-076 | Inaccessible Commit SHA/Release Tag | @types/react@19.2.7 | 45.00 | Medium | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-077 | No Provenance | @types/react@19.2.7 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-078 | No Provenance | acorn-jsx@5.3.2 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-079 | No Provenance | acorn@8.15.0 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-080 | No Provenance | ajv@6.12.6 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-081 | No Provenance | ansi-styles@4.3.0 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-082 | No Provenance | argparse@2.0.1 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-083 | No Provenance | asynckit@0.4.0 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-084 | No Provenance | autoprefixer@10.4.22 | 47.50 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-085 | No Provenance | balanced-match@1.0.2 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-086 | No Provenance | brace-expansion@1.1.12 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-087 | No Provenance | browserslist@4.28.0 | 43.75 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-088 | No Provenance | call-bind-apply-helpers@1.0.2 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-089 | No Provenance | callsites@3.1.0 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-090 | No Provenance | chalk@4.1.2 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-091 | No Provenance | clsx@2.1.1 | 47.50 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-092 | No Provenance | color-convert@2.0.1 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-093 | No Provenance | color-name@1.1.4 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-094 | No Provenance | combined-stream@1.0.8 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-095 | Invalid Source Code URL | concat-map@0.0.1 | 45.00 | Medium | Dirty-Waters | Package source code repository URL is unavailable or returned a not-found response. |
| SMELL-096 | No Provenance | concat-map@0.0.1 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-097 | No Provenance | convert-source-map@2.0.0 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-098 | No Provenance | cookie@1.1.1 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-099 | No Provenance | cross-spawn@7.0.6 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-100 | No Provenance | csstype@3.2.3 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-101 | No Provenance | debug@4.4.3 | 43.75 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-102 | Fork | deep-is@0.1.4 | 37.50 | Low | Dirty-Waters | Package source repository is detected as a fork. |
| SMELL-103 | No Provenance | deep-is@0.1.4 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-104 | No Provenance | delayed-stream@1.0.0 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-105 | No Provenance | dunder-proto@1.0.1 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-106 | No Provenance | electron-to-chromium@1.5.262 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-107 | No Provenance | enhanced-resolve@5.18.3 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-108 | No Provenance | es-define-property@1.0.1 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-109 | No Provenance | es-errors@1.3.0 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-110 | No Provenance | es-object-atoms@1.1.1 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-111 | No Provenance | es-set-tostringtag@2.1.0 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-112 | No Provenance | esbuild@0.25.12 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-113 | No Provenance | escalade@3.2.0 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-114 | No Provenance | escape-string-regexp@4.0.0 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-115 | No Provenance | eslint-plugin-react-hooks@7.0.1 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-116 | No Provenance | eslint@9.39.1 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-117 | No Provenance | esquery@1.6.0 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-118 | No Provenance | esrecurse@4.3.0 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-119 | No Provenance | estraverse@5.3.0 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-120 | No Provenance | esutils@2.0.3 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-121 | No Provenance | fast-deep-equal@3.1.3 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-122 | Fork | fast-json-stable-stringify@2.1.0 | 37.50 | Low | Dirty-Waters | Package source repository is detected as a fork. |
| SMELL-123 | No Provenance | fast-json-stable-stringify@2.1.0 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-124 | No Provenance | fast-levenshtein@2.0.6 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-125 | No Provenance | fdir@6.5.0 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-126 | Invalid Source Code URL | file-entry-cache@8.0.0 | 45.00 | Medium | Dirty-Waters | Package source code repository URL is unavailable or returned a not-found response. |
| SMELL-127 | No Provenance | file-entry-cache@8.0.0 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-128 | No Provenance | find-up@5.0.0 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-129 | Invalid Source Code URL | flat-cache@4.0.1 | 45.00 | Medium | Dirty-Waters | Package source code repository URL is unavailable or returned a not-found response. |
| SMELL-130 | No Provenance | flat-cache@4.0.1 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-131 | No Provenance | flatted@3.3.3 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-132 | No Provenance | follow-redirects@1.15.11 | 43.75 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-133 | No Provenance | form-data@4.0.5 | 43.75 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-134 | No Provenance | fraction.js@5.3.4 | 43.75 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-135 | No Source Code URL | frontend@0.0.0 | 50.00 | Medium | Dirty-Waters | Package metadata does not expose a source code repository URL. |
| SMELL-136 | No Provenance | frontend@0.0.0 | 35.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-137 | No Code Signature | frontend@0.0.0 | 50.00 | Medium | Dirty-Waters | Package does not expose a code signature. |
| SMELL-138 | No Provenance | fsevents@2.3.3 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-139 | No Provenance | function-bind@1.1.2 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-140 | No Provenance | gensync@1.0.0-beta.2 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-141 | No Provenance | get-intrinsic@1.3.0 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-142 | No Provenance | get-proto@1.0.1 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-143 | No Provenance | glob-parent@6.0.2 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-144 | No Provenance | globals@14.0.0 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-145 | No Provenance | globals@16.5.0 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-146 | No Provenance | gopd@1.2.0 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-147 | No Provenance | graceful-fs@4.2.11 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-148 | No Provenance | has-flag@4.0.0 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-149 | No Provenance | has-symbols@1.1.0 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-150 | No Provenance | has-tostringtag@1.0.2 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-151 | No Provenance | hasown@2.0.2 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-152 | Inaccessible Commit SHA/Release Tag | hermes-estree@0.25.1 | 45.00 | Medium | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-153 | No Provenance | hermes-estree@0.25.1 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-154 | Inaccessible Commit SHA/Release Tag | hermes-parser@0.25.1 | 45.00 | Medium | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-155 | No Provenance | hermes-parser@0.25.1 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-156 | No Provenance | ignore@5.3.2 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-157 | No Provenance | import-fresh@3.3.1 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-158 | No Provenance | imurmurhash@0.1.4 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-159 | No Provenance | is-extglob@2.1.1 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-160 | No Provenance | is-glob@4.0.3 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-161 | No Provenance | isexe@2.0.0 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-162 | No Provenance | jiti@2.6.1 | 43.75 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-163 | No Provenance | js-tokens@4.0.0 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-164 | No Provenance | js-yaml@4.1.1 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-165 | No Provenance | jsesc@3.1.0 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-166 | No Provenance | json-buffer@3.0.1 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-167 | No Provenance | json-schema-traverse@0.4.1 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-168 | Fork | json-stable-stringify-without-jsonify@1.0.1 | 37.50 | Low | Dirty-Waters | Package source repository is detected as a fork. |
| SMELL-169 | No Provenance | json-stable-stringify-without-jsonify@1.0.1 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-170 | No Provenance | json5@2.2.3 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-171 | Inaccessible Commit SHA/Release Tag | keyv@4.5.4 | 45.00 | Medium | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-172 | No Provenance | keyv@4.5.4 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-173 | No Provenance | leaflet@1.9.4 | 47.50 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-174 | No Provenance | levn@0.4.1 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-175 | No Provenance | lightningcss-android-arm64@1.30.2 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-176 | No Provenance | lightningcss-darwin-arm64@1.30.2 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-177 | No Provenance | lightningcss-darwin-x64@1.30.2 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-178 | No Provenance | lightningcss-freebsd-x64@1.30.2 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-179 | No Provenance | lightningcss-linux-arm-gnueabihf@1.30.2 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-180 | No Provenance | lightningcss-linux-arm64-gnu@1.30.2 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-181 | No Provenance | lightningcss-linux-arm64-musl@1.30.2 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-182 | No Provenance | lightningcss-linux-x64-gnu@1.30.2 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-183 | No Provenance | lightningcss-linux-x64-musl@1.30.2 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-184 | No Provenance | lightningcss-win32-arm64-msvc@1.30.2 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-185 | No Provenance | lightningcss-win32-x64-msvc@1.30.2 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-186 | No Provenance | lightningcss@1.30.2 | 43.75 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-187 | No Provenance | locate-path@6.0.0 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-188 | Inaccessible Commit SHA/Release Tag | lodash.merge@4.6.2 | 45.00 | Medium | Dirty-Waters | The package release could not be traced to an accessible commit SHA or release tag. |
| SMELL-189 | No Provenance | lodash.merge@4.6.2 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-190 | No Provenance | lru-cache@5.1.1 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-191 | No Provenance | math-intrinsics@1.1.0 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-192 | No Provenance | mime-db@1.52.0 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-193 | No Provenance | mime-types@2.1.35 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-194 | No Provenance | minimatch@3.1.2 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-195 | No Provenance | ms@2.1.3 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-196 | No Provenance | nanoid@3.3.11 | 43.75 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-197 | No Provenance | natural-compare@1.4.0 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-198 | No Provenance | node-releases@2.0.27 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-199 | No Provenance | normalize-range@0.1.2 | 43.75 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-200 | No Provenance | optionator@0.9.4 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-201 | No Provenance | p-limit@3.1.0 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-202 | No Provenance | p-locate@5.0.0 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-203 | No Provenance | parent-module@1.0.1 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-204 | No Provenance | path-exists@4.0.0 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-205 | No Provenance | path-key@3.1.1 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-206 | No Provenance | picocolors@1.1.1 | 43.75 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-207 | No Provenance | picomatch@4.0.3 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-208 | No Provenance | postcss-value-parser@4.2.0 | 43.75 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-209 | No Provenance | postcss@8.5.6 | 47.50 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-210 | No Provenance | prelude-ls@1.2.1 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-211 | No Provenance | proxy-from-env@1.1.0 | 43.75 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-212 | No Provenance | punycode@2.3.1 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-213 | No Provenance | react-dom@19.2.0 | 47.50 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-214 | No Provenance | react-leaflet@5.0.0 | 47.50 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-215 | No Provenance | react-refresh@0.18.0 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-216 | No Provenance | react@19.2.0 | 47.50 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-217 | No Provenance | resolve-from@4.0.0 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-218 | No Provenance | scheduler@0.27.0 | 43.75 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-219 | No Provenance | semver@6.3.1 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-220 | No Provenance | shebang-command@2.0.0 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-221 | No Provenance | shebang-regex@3.0.0 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-222 | Fork | source-map-js@1.2.1 | 51.25 | Medium | Dirty-Waters | Package source repository is detected as a fork. |
| SMELL-223 | No Provenance | source-map-js@1.2.1 | 43.75 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-224 | No Provenance | strip-json-comments@3.1.1 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-225 | No Provenance | supports-color@7.2.0 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-226 | No Provenance | tapable@2.3.0 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-227 | No Provenance | type-check@0.4.0 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-228 | No Provenance | update-browserslist-db@1.1.4 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-229 | No Provenance | uri-js@4.4.1 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-230 | No Provenance | which@2.0.2 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-231 | No Provenance | word-wrap@1.2.5 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-232 | No Provenance | ws@8.18.3 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-233 | Fork | xmlhttprequest-ssl@2.1.2 | 47.50 | Medium | Dirty-Waters | Package source repository is detected as a fork. |
| SMELL-234 | No Provenance | xmlhttprequest-ssl@2.1.2 | 40.00 | Medium | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-235 | No Provenance | yallist@3.1.1 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-236 | No Provenance | yocto-queue@0.1.0 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |
| SMELL-237 | No Provenance | zod-validation-error@4.0.2 | 30.00 | Low | Dirty-Waters | Package version does not expose build provenance or attestation metadata. |


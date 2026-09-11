# Literature Review and Smell Catalogue Design

This file summarises the literature review and smell catalogue design for the dissertation. It documents the search queries, the reports included in the review, and the adopted smell catalogue with baseline severity and rationale.

## Literature Review

### Search Queries

The search queries were constructed around three concepts: software supply chain smells and dependency-related risks, severity/impact/risk scoring, and visualisation of dependency or quality issues.

| Concept | Search Query |
| --- | --- |
| Software supply chain smells and risks related with dependencies | `("software supply chain" OR "dependency management" OR "third-party libraries" OR "open-source libraries") AND ("smell*" OR "vulnerabilit*" OR "attack*" OR "dependenc*") AND ("React" OR "JavaScript" OR "npm" OR "component-based")` |
| Severity, impact, and risk scoring of smells and dependency issues | `("software supply chain" OR "dependency management" OR "open-source libraries") AND ("smell*" OR "vulnerabilit*" OR "dependenc*") AND ("severity" OR "impact" OR "risk scor*" OR "risk assessment" OR "prioritization" OR "prioritisation" OR "ranking") AND ("React" OR "JavaScript" OR "npm" OR "component-based")` |
| Visualisation of software dependencies and quality issues | `("software visualization" OR "software visualisation" OR "code quality" OR "code structure") AND ("dependency graph" OR "node-link diagram" OR "visual analytics" OR "graph visualization" OR "graph visualisation" OR "visually analyzing" OR "visually analysing")` |

### Studies included through the SLR and Forward Snowballing
The literature review was conducted using a systematic literature review (SLR) methodology and complemented by forward snowballing. The initial SLR included 18 reports, while the forward snowballing process identified one additional study, resulting in 19 studies considered across the complete review process. The following table lists these studies with their ID, title, and reference.

| ID | Title | Reference |
| ---: | --- | --- |
| 1 | What are Weak Links in the npm Supply Chain? | [1] |
| 2 | Dirty-Waters: Detecting Software Supply Chain Smells | [2] |
| 3 | Visually Analyzing the Structure and Code Quality of Component-based Web Applications | [3] |
| 4 | Dependency Smells in JavaScript Projects | [4] |
| 5 | A Comprehensive Study on the Impact of Vulnerable Dependencies on Open-Source Software | [5] |
| 6 | How Do Developers Follow Security-Relevant Best Practices When Using NPM Packages? | [6] |
| 7 | Supply Chain Risk Analysis Via SBOM Data Enrichment | [7] |
| 8 | Understanding and Detecting Peer Dependency Resolving Loop in npm Ecosystem | [8] |
| 9 | Demystifying the Vulnerability Propagation and Its Evolution via Dependency Trees in the NPM Ecosystem | [9] |
| 10 | Investigating the Resolution of Vulnerable Dependencies with Dependabot Security Updates | [10] |
| 11 | Characterising Contributions that Coincide with Vulnerability Mitigation in NPM Libraries | [11] |
| 12 | Pinning Is Futile: You Need More Than Local Dependency Versioning to Defend against Supply Chain Attacks | [12] |
| 13 | Dependency Practices for Vulnerability Mitigation | [13] |
| 14 | Not All Dependencies are Equal: An Empirical Study on Production Dependencies in NPM | [14] |
| 15 | What's in a URL? An Analysis of Hardcoded URLs in npm Packages | [15] |
| 16 | Dependency Management Practices for the npm Software Ecosystem | [16] |
| 17 | Jack-in-the-box: An Empirical Study of JavaScript Bundling on the Web and its Security Implications | [17] |
| 18 | Towards Visual Analytics Dashboards for Provenance-driven Static Application Security Testing | [18] |
| 19 | Software Supply Chain Smells: Lightweight Analysis for Secure Dependency Management | [19] |

## Smell Catalogue Design

This section documents the smell designations adopted by the dissertation and the baseline severity assigned to each smell type before contextual SSSS modifiers are applied.

### Adoption Rules

The catalogue consolidates terminology from the literature review and adopts final smell names according to the following rules:

- Dependency configuration smells are mainly derived from Jafari et al. [4].
- Peer dependency resolution behaviour is represented by Peer Dependency Resolving Loop (PeerSpin), derived from Wang et al. [8].
- Hardcoded URL evidence is aligned with both Jafari et al. [4] and Wyss et al. [15].
- Dirty-Waters smells initially introduced by Liu et al. [2] are refined using the more recent and fine-grained terminology proposed by Schmid et al. [19].
- Governance and maintainer-related smells are derived from Zahan et al. [1].
- Baseline severity captures the intrinsic severity of each smell type before applying context such as production reachability, dependency depth, known vulnerabilities, or package responsiveness.

### Baseline Severity Criteria

| Severity | Criteria |
| --- | --- |
| Critical | Direct potential for package takeover, account compromise, integrity compromise, or code execution during install/build. |
| High | Strongly associated with delayed remediation, loss of source or artefact integrity, weak traceability, severe dependency resolution failures, or reduced ability to verify package origin. |
| Medium | Relevant impact, but strongly dependent on project, ecosystem, dependency context, production usage, or replaceability. |
| Low | Mostly indirect, cumulative, or limited impact. These smells can reduce transparency or hygiene but do not usually imply direct exploitation or immediate integrity risk by themselves. |

### Adopted Smell Catalogue
Smells retained in the literature-derived catalogue but excluded from prototype operationalisation are identified without a baseline severity, since they do not participate in the SSSS computation.


| Smell mentioned in the review | Main source(s) | Final designation adopted | Baseline severity | Rationale |
| --- | --- | --- | --- | --- |
| Pinned Dependency | Jafari et al. [4] | Pinned Dependency | Medium | Fixed versions can delay adoption of bug fixes or security patches and require manual updates. |
| URL Dependency / Hardcoded URLs | Jafari et al. [4]; Wyss et al. [15] | Hardcoded URL | High | URL-based dependencies and hardcoded external references increase traceability, integrity, link decay, unencrypted communication, and expired-domain takeover concerns. |
| Restrictive Constraint | Jafari et al. [4] | Restrictive Constraint | High | Restrictive update strategies can delay vulnerability remediation and block adoption of available fixes. |
| Permissive Constraint | Jafari et al. [4] | Permissive Constraint | Medium | Overly permissive constraints can admit breaking changes by allowing broad or major version updates. |
| No Package-Lock | Jafari et al. [4] | No Package-Lock | Medium | Missing lockfiles reduce installation reproducibility across environments. |
| Unused/Bloated Dependency | Jafari et al. [4] | Unused Dependency | Low | Unused dependencies increase dependency footprint and maintenance burden, but usually have indirect impact. |
| Missing Dependency | Jafari et al. [4] | Missing Dependency | Medium | Omitted required dependencies can lead to code breakage or ambiguous dependency reliance. |
| Peer Dependency Resolving Loop (PeerSpin) | Wang et al. [8] | Peer Dependency Resolving Loop (PeerSpin) | High | Peer conflicts can trigger repeated node replacement, non-termination, resource exhaustion, or installation failure. |
| Inaccessible Source Code Link | Liu et al. [2]; Schmid et al. [19] | No Source Code URL | High | Absence of a source repository URL prevents inspection and weakens transparency; practitioners rated this class frequently as high or critical. |
| Inaccessible Source Code Link | Liu et al. [2]; Schmid et al. [19] | Invalid Source Code URL | High | Invalid or inaccessible source URLs prevent source-level inspection and may indicate misleading or stale package metadata. |
| Inaccessible Release Tag | Liu et al. [2]; Schmid et al. [19] | Inaccessible Commit SHA/Release Tag | High | Lack of traceability from a released package to the exact source state weakens reproducibility and incident investigation. |
| Using Deprecated Package / Unmaintained Packages | Liu et al. [2]; Schmid et al. [19]; Zahan et al. [1] | Deprecated | High | Deprecated or unmaintained packages may stop receiving fixes and increase exposure to unresolved vulnerabilities. |
| Using Forked Package | Liu et al. [2]; Schmid et al. [19] | Fork | Medium | Forks may be legitimate, but introduce uncertainty about divergence from upstream and maintenance responsibility. |
| Missing Provenance Information | Liu et al. [2]; Schmid et al. [19] | No Code Signature | High | Absence of code signing reduces assurance about package artefact authenticity and integrity. |
| Missing Provenance Information | Liu et al. [2]; Schmid et al. [19] | Invalid Code Signature | Critical | Invalid signatures make artefact authenticity or integrity unreliable and were rated with the highest criticality among practitioner-assessed smells. |
| Missing Provenance Information | Liu et al. [2]; Schmid et al. [19] | No Provenance | Low | Missing provenance limits build verification, but practitioner ratings were mostly low and depend on ecosystem adoption. |
| Aliased | Schmid et al. [19] | Aliased | Low | Aliasing can obscure dependency identity, but received lower severity and several no-rating responses in practitioner assessment. |
| Expired Maintainer Domain | Zahan et al. [1] | Expired Maintainer Domain | Critical | Expired maintainer domains can enable account hijacking or package takeover. |
| Packages with Install Scripts | Zahan et al. [1] | Install Script Execution | Critical | Install scripts can execute code during dependency installation, creating direct abuse potential. |
| Too many Maintainers | Zahan et al. [1] | Too Many Maintainers | Medium | A large maintainer set expands the attack surface for compromise or social engineering, depending on governance controls. |
| Too many Contributors | Zahan et al. [1] | Too Many Contributors | Low | Many contributors can increase review and oversight difficulty, but the signal is indirect. |
| Overloaded Maintainers | Zahan et al. [1] | Overloaded Maintainer | — | Retained in the literature-derived catalogue, but excluded from prototype operationalisation because the available evidence does not provide a sufficiently validated detection threshold. |

For the governance-related smells, the operational thresholds adopted in the prototype follow the empirical observations reported by Zahan et al. [1]. Too Many Maintainers is identified when a package has more than 20 maintainers, while Too Many Contributors is identified when the ratio reaches at least 40 contributors per maintainer.

## Bibliography

[1] N. Zahan, T. Zimmermann, P. Godefroid, B. Murphy, C. Maddila, and L. Williams, "What are weak links in the npm supply chain?", Association for Computing Machinery (ACM), May 2022, pp. 331-340. doi: 10.1145/3510457.3513044.

[2] R. Liu, S. Bobadilla, B. Baudry, and M. Monperrus, "Dirty-Waters: Detecting Software Supply Chain Smells", Association for Computing Machinery (ACM), Jun. 2025, pp. 1045-1049. doi: 10.1145/3696630.3728578.

[3] H. Tamer, D. Van Den Bongard, and F. Beck, "Visually Analyzing the Structure and Code Quality of Component-based Web Applications", in Proceedings - 2021 Working Conference on Software Visualization, VISSOFT 2021, Institute of Electrical and Electronics Engineers Inc., 2021, pp. 160-164. doi: 10.1109/VISSOFT52517.2021.00031.

[4] A. J. Jafari, D. E. Costa, R. Abdalkareem, E. Shihab, and N. Tsantalis, "Dependency Smells in JavaScript Projects", IEEE Transactions on Software Engineering, vol. 48, no. 10, pp. 3790-3807, Oct. 2022. doi: 10.1109/TSE.2021.3106247.

[5] S. H. B. I. Kumar, L. R. Sampaio, A. Martin, A. Brito, and C. Fetzer, "A Comprehensive Study on the Impact of Vulnerable Dependencies on Open-Source Software", Dec. 2025. doi: 10.1109/ISSRE62328.2024.00020.

[6] M. M. A. Kabir, Y. Wang, D. Yao, and N. Meng, "How Do Developers Follow Security-Relevant Best Practices When Using NPM Packages?", in Proceedings - 2022 IEEE Secure Development Conference, SecDev 2022, Institute of Electrical and Electronics Engineers Inc., 2022, pp. 77-83. doi: 10.1109/SecDev53368.2022.00027.

[7] A. Lemay and N. Katiyar, "Supply Chain Risk Analysis Via SBOM Data Enrichment", in SysCon 2025 - 19th Annual IEEE International Systems Conference, Proceedings, Institute of Electrical and Electronics Engineers Inc., 2025. doi: 10.1109/SysCon64521.2025.11014830.

[8] X. Wang, M. Wang, W. Shen, and R. Chang, "Understanding and Detecting Peer Dependency Resolving Loop in npm Ecosystem", in Proceedings - International Conference on Software Engineering, IEEE Computer Society, 2025, pp. 129-140. doi: 10.1109/ICSE55347.2025.00054.

[9] C. Liu, S. Chen, L. Fan, B. Chen, Y. Liu, and X. Peng, "Demystifying the Vulnerability Propagation and Its Evolution via Dependency Trees in the NPM Ecosystem", in Proceedings - International Conference on Software Engineering, IEEE Computer Society, Jul. 2022, pp. 672-684. doi: 10.1145/3510003.3510142.

[10] H. Mohayeji, A. Agaronian, E. Constantinou, N. Zannone, and A. Serebrenik, "Investigating the Resolution of Vulnerable Dependencies with Dependabot Security Updates", in Proceedings - 2023 IEEE/ACM 20th International Conference on Mining Software Repositories, MSR 2023, Institute of Electrical and Electronics Engineers Inc., 2023, pp. 234-246. doi: 10.1109/MSR59073.2023.00042.

[11] R. Rojpaisarnkit, H. Damrongsiri, C. Treude, A. Ouni, and R. G. Kula, "Characterising Contributions that Coincide with Vulnerability Mitigation in NPM Libraries", in 2024 IEEE/ACIS 22nd International Conference on Software Engineering Research, Management and Applications, SERA 2024 - Proceedings, Institute of Electrical and Electronics Engineers Inc., 2024, pp. 237-242. doi: 10.1109/SERA61261.2024.10685587.

[12] H. He, B. Vasilescu, and C. Kastner, "Pinning Is Futile: You Need More Than Local Dependency Versioning to Defend against Supply Chain Attacks", Proceedings of the ACM on Software Engineering, vol. 2, no. FSE, pp. 266-289, Jun. 2025. doi: 10.1145/3715728.

[13] A. J. Jafari, D. E. Costa, A. Abdellatif, and E. Shihab, "Dependency Practices for Vulnerability Mitigation", Oct. 2023. [Online]. Available: http://arxiv.org/abs/2310.07847

[14] J. Latendresse, S. Mujahid, D. E. Costa, and E. Shihab, "Not All Dependencies are Equal: An Empirical Study on Production Dependencies in NPM", in ACM International Conference Proceeding Series, Association for Computing Machinery, Sep. 2022. doi: 10.1145/3551349.3556896.

[15] E. Wyss, D. Davidson, and L. De Carli, "What's in a URL? An Analysis of Hardcoded URLs in npm Packages", in SCORED 2024 - Proceedings of the 2024 Workshop on Software Supply Chain Offensive Research and Ecosystem Defenses, Co-Located with: CCS 2024, Association for Computing Machinery, Inc., Nov. 2024, pp. 26-32. doi: 10.1145/3689944.3696168.

[16] A. J. Jafari, "Dependency Management Practices for the npm Software Ecosystem", 2023.

[17] J. Rack and C. A. Staicu, "Jack-in-the-box: An Empirical Study of JavaScript Bundling on the Web and its Security Implications", in CCS 2023 - Proceedings of the 2023 ACM SIGSAC Conference on Computer and Communications Security, Association for Computing Machinery, Inc., Nov. 2023, pp. 3198-3212. doi: 10.1145/3576915.3623140.

[18] A. Schreiber, T. Sonnekalb, and L. Von Kurnatowski, "Towards Visual Analytics Dashboards for Provenance-driven Static Application Security Testing", in Proceedings - 2021 IEEE Symposium on Visualization for Cyber Security, VizSec 2021, Institute of Electrical and Electronics Engineers Inc., 2021, pp. 42-46. doi: 10.1109/VizSec53666.2021.00010.

[19] L. Schmid, D. Gaspar, R. Liu, S. Bobadilla, B. Baudry, and M. Monperrus, "Software Supply Chain Smells: Lightweight Analysis for Secure Dependency Management", Mar. 2026. [Online]. Available: http://arxiv.org/abs/2603.24282

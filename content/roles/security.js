// NexIT-Africa role catalog: Cybersecurity area
export default {
  key: "security",
  title: "Cybersecurity",
  summary: "Cybersecurity roles protect an organisation’s systems, data and customers by detecting and responding to threats, testing defences under authorised scope, engineering secure platforms and managing risk and compliance. Demand is strong across Nigerian banks, fintechs, telcos and public bodies as NDPA 2023 and sector regulations raise the bar.",
  roles: [
    {
      id: "soc",
      title: "SOC Analyst",
      summary: "A SOC Analyst monitors security telemetry, triages alerts, investigates suspicious activity and drives incidents to containment. The role sits in the Security Operations Centre alongside incident responders, detection engineers and threat intelligence, often on a shift rota.",
      competencies: [
        { name: "Alert triage and investigation", weight: 25, description: "Quickly separates true from false positives by pivoting across logs, endpoints and identity data to build an evidence-based timeline." },
        { name: "SIEM querying and log analysis", weight: 20, description: "Writes and adapts queries (KQL, SPL or similar) to search, correlate and summarise large volumes of security logs." },
        { name: "Incident response execution", weight: 20, description: "Follows and improves playbooks to contain, eradicate and recover from incidents while preserving evidence." },
        { name: "Threat knowledge and ATT&CK mapping", weight: 20, description: "Understands attacker techniques and maps observed activity to MITRE ATT&CK to judge severity and scope." },
        { name: "Detection tuning and documentation", weight: 15, description: "Tunes noisy rules, writes clear case notes and escalations, and feeds lessons back into detection content." }
      ],
      levels: {
        junior: {
          minYears: 0,
          focus: "Trusted to monitor queues, triage standard alerts against playbooks and escalate well-documented cases to senior analysts.",
          responsibilities: [
            "Monitor SIEM and EDR alert queues during assigned shifts and acknowledge alerts within agreed SLAs",
            "Triage phishing reports, malware detections and suspicious sign-ins using documented playbooks",
            "Enrich alerts with threat intelligence lookups on IPs, domains and file hashes",
            "Write clear case notes and escalate confirmed or uncertain incidents with supporting evidence",
            "Perform first containment steps approved in playbooks, such as isolating a host or resetting a compromised account"
          ],
          skills: [
            "Alert triage",
            "Basic KQL or SPL",
            "Phishing email analysis",
            "Windows event logs",
            "TCP/IP fundamentals",
            "Threat intel enrichment",
            "Incident ticket documentation"
          ],
          tools: ["Microsoft Sentinel", "Splunk Enterprise Security", "Microsoft Defender for Endpoint", "VirusTotal", "Wireshark", "TheHive"],
          certifications: ["CompTIA Security+", "ISC2 Certified in Cybersecurity (CC)", "Microsoft Certified: Security Operations Analyst Associate"],
          aiTopics: [
            "Common alert types and how to tell a true positive from a false positive",
            "Reading Windows security events such as 4624, 4625 and 4688",
            "Phishing header and URL analysis",
            "Basic networking: ports, protocols, DNS and HTTP",
            "The incident response lifecycle and when to escalate"
          ],
          aiScenarios: [
            "A staff member forwards an email claiming to be from the bank’s payment provider asking them to re-verify their login. Walk me through how you would analyse it and what you would do next.",
            "The SIEM raises 40 failed logins followed by one success for a finance user at 2 a.m. Walk me through your triage.",
            "EDR flags an unknown executable launched from a user’s Downloads folder. What do you check, and when do you escalate?"
          ],
          aiExpectations: "A ready junior follows a structured triage approach, explains what evidence they would gather and knows when to escalate rather than guess. Red flags are closing alerts without evidence, taking destructive actions outside the playbook, or being unable to explain basic log fields.",
          proQuestions: [
            { q: "Describe an alert or lab case you investigated end to end. How did you decide whether it was malicious?", lookFor: "A clear sequence of evidence gathered, sources pivoted across and a reasoned verdict rather than a gut feeling." },
            { q: "How would you analyse a suspicious email without putting the organisation at risk?", lookFor: "Header review, URL and attachment analysis in a sandbox or reputation service, no clicking live links, and checking for other recipients." },
            { q: "What makes a good escalation note to a Tier 2 analyst?", lookFor: "Timeline, affected assets and users, evidence and indicators, actions already taken and a clear question or recommendation." },
            { q: "Explain the difference between an event, an alert and an incident.", lookFor: "Accurate definitions showing that not every alert is an incident and that impact and confirmation drive the incident declaration." },
            { q: "Tell me about a time you had to work through a repetitive, high-volume task without losing accuracy.", lookFor: "Practical techniques such as checklists, saved queries or batching, plus awareness of fatigue and when to ask for help." }
          ]
        },
        mid: {
          minYears: 2,
          focus: "Trusted to own investigations end to end, lead containment for common incidents and tune detections to reduce noise.",
          responsibilities: [
            "Lead investigations of escalated alerts across endpoint, identity, email, cloud and network telemetry",
            "Coordinate containment and recovery for common incidents such as business email compromise and commodity malware",
            "Tune and write detection rules to reduce false positives and close visibility gaps",
            "Run threat hunts based on new intelligence or ATT&CK techniques relevant to the organisation",
            "Mentor junior analysts on triage quality and review their case notes"
          ],
          skills: [
            "Advanced KQL or SPL",
            "Endpoint forensics triage",
            "Business email compromise response",
            "Detection rule tuning",
            "MITRE ATT&CK mapping",
            "Threat hunting hypotheses",
            "Cloud identity log analysis"
          ],
          tools: ["Microsoft Sentinel", "Splunk Enterprise Security", "CrowdStrike Falcon", "Velociraptor", "MISP", "Sigma"],
          certifications: ["CompTIA CySA+", "GIAC Certified Incident Handler (GCIH)", "Blue Team Level 2 (BTL2)"],
          aiTopics: [
            "Investigating identity attacks such as token theft, MFA fatigue and impossible travel",
            "Endpoint artefacts: process trees, persistence locations and PowerShell logging",
            "Writing and tuning detections, including Sigma rules and threshold logic",
            "Containment trade-offs and evidence preservation",
            "Hypothesis-driven threat hunting using ATT&CK"
          ],
          aiScenarios: [
            "A customer reports that a supplier’s bank details changed on an invoice email that came from a real colleague’s mailbox. Walk me through how you would investigate and contain this.",
            "A detection for suspicious PowerShell fires 300 times a day and analysts ignore it. How would you tune it without losing real attacks?",
            "Intelligence reports a ransomware group abusing remote monitoring tools in West African financial firms. How would you design a hunt for this in your environment?"
          ],
          aiExpectations: "A ready mid-level analyst builds a full incident timeline across multiple data sources, chooses proportionate containment and improves detections from what they learn. Red flags are relying on a single tool’s verdict, ignoring evidence preservation, or tuning rules by simply disabling them.",
          proQuestions: [
            { q: "Walk me through the most complex incident you have investigated. What was the root cause and how did you prove it?", lookFor: "Clear timeline, multiple corroborating data sources, root cause identified and evidence-backed rather than assumed." },
            { q: "How do you decide whether to isolate a production server that may be compromised?", lookFor: "Weighs business impact against spread risk, involves system owners, considers evidence capture first and follows escalation authority." },
            { q: "Describe a detection you wrote or tuned. How did you measure whether it improved?", lookFor: "Baseline false-positive rate, test data or replayed attacks, and a measurable change in noise or coverage." },
            { q: "How would you investigate a suspected business email compromise in Microsoft 365?", lookFor: "Sign-in logs, inbox rules, OAuth app consents, mailbox audit logs, token revocation and checking for financial fraud follow-up." },
            { q: "Give an example of feedback you gave a junior analyst about their case work.", lookFor: "Specific, constructive feedback tied to quality standards and evidence the junior improved." }
          ]
        },
        senior: {
          minYears: 5,
          focus: "Trusted to lead major incidents, set SOC detection and response strategy and mentor the analyst team.",
          responsibilities: [
            "Act as incident lead for major incidents, coordinating technical teams, management, legal and communications",
            "Own the detection engineering roadmap and measure coverage against MITRE ATT&CK and priority threats",
            "Design and maintain incident response playbooks and SOAR automations",
            "Define SOC metrics such as time to detect and time to contain, and report them to leadership",
            "Mentor analysts, run tabletop exercises and lead post-incident reviews that drive lasting fixes"
          ],
          skills: [
            "Major incident command",
            "Detection engineering strategy",
            "SOAR playbook design",
            "Memory and disk forensics",
            "Ransomware response planning",
            "SOC metrics and reporting",
            "Regulatory incident notification"
          ],
          tools: ["Microsoft Sentinel", "Splunk SOAR", "CrowdStrike Falcon", "Velociraptor", "Volatility", "OpenCTI"],
          certifications: ["GIAC Certified Forensic Analyst (GCFA)", "GIAC Certified Detection Analyst (GCDA)", "Certified Information Systems Security Professional (CISSP)"],
          aiTopics: [
            "Leading ransomware and data breach response at an organisational level",
            "Measuring and prioritising detection coverage",
            "Automation with SOAR and its risks",
            "Regulatory notification duties, including NDPA 2023 breach reporting timelines",
            "Building SOC processes, rotas and analyst development"
          ],
          aiScenarios: [
            "At 6 a.m. several branch servers show encrypted files and a ransom note, and the core banking team is asking whether to shut everything down. Walk me through your first two hours as incident lead.",
            "Leadership asks why the SOC missed an intrusion that a third party reported. How would you run the review and what would you change?",
            "You have budget to automate three response actions. How do you choose them and what safeguards do you build in?"
          ],
          aiExpectations: "A ready senior leads with structure under pressure, balances business continuity with containment and turns incidents into measurable programme improvements. Red flags are hero-style working without coordination, ignoring legal and regulatory duties, or being unable to explain how SOC performance is measured.",
          proQuestions: [
            { q: "Tell me about a major incident you led. How did you organise people and decisions?", lookFor: "Clear command structure, decision log, regular stakeholder updates and a measured approach to containment and recovery." },
            { q: "How do you decide which detections to build next?", lookFor: "Threat-informed prioritisation using ATT&CK coverage, business-critical assets, intelligence and lessons from incidents." },
            { q: "Describe a SOAR automation you designed. What could go wrong and how did you prevent it?", lookFor: "Specific workflow, approval gates for disruptive actions, testing, logging and rollback." },
            { q: "How would you handle breach notification obligations after a personal data incident in Nigeria?", lookFor: "Awareness of NDPA 2023 duty to notify the NDPC within 72 hours where required, involving the DPO and legal, and evidence-based scoping." },
            { q: "How have you developed analysts on your team?", lookFor: "Structured coaching, playbook reviews, exercises and career paths, with an example of someone who grew." }
          ]
        }
      },
      hrScenarios: [
        { q: "You are near the end of a night shift and a critical alert fires just as you are handing over. What do you do?", lookFor: "Takes ownership until a clean handover, communicates clearly and does not drop the alert because the shift is ending." },
        { q: "You made a triage mistake that let a real incident sit unnoticed for several hours. How do you handle it?", lookFor: "Owns the mistake promptly, helps contain, shares lessons openly and suggests a process fix rather than hiding it." },
        { q: "A senior executive asks you to whitelist their personal device so alerts stop bothering them. How do you respond?", lookFor: "Stays respectful but firm on policy, explains the risk and escalates through proper channels." }
      ],
      curriculum: {
        foundational: {
          title: "SOC Analyst Foundations",
          summary: "Builds the core knowledge a new analyst needs: how attacks look in logs, how to triage alerts and how to escalate cleanly. Designed for graduates and career-switchers with basic IT knowledge.",
          duration: "4 weeks",
          modules: [
            { type: "text", title: "Inside a Security Operations Centre", content: "A Security Operations Centre (SOC) watches an organisation’s systems for signs of attack and responds when something goes wrong. Most SOCs are organised in tiers. Tier 1 analysts monitor alert queues and triage. Tier 2 analysts investigate deeper and lead containment. Tier 3 and detection engineers hunt threats and build detections.\n\nKey terms:\n- Event: any recorded activity, such as a login.\n- Alert: an event or pattern a rule has flagged as suspicious.\n- Incident: a confirmed event that harms or threatens confidentiality, integrity or availability.\n\nThe SOC’s data comes from many sources: endpoint detection and response (EDR) agents, firewalls, email gateways, identity providers such as Microsoft Entra ID, and cloud platforms. A SIEM collects these logs so analysts can search and correlate them.\n\nIn Nigeria, many banks and fintechs run an in-house SOC or use a managed security service provider, and sector rules such as the CBN’s cybersecurity framework expect continuous monitoring. Whatever the setup, the analyst’s job is the same: turn noisy data into confident decisions, document them clearly and escalate when in doubt." },
            { type: "text", title: "Reading Logs and Alerts", content: "Good triage starts with knowing what normal looks like. On Windows, a few event IDs appear constantly:\n- 4624: successful logon (check the logon type: 2 is interactive, 3 is network, 10 is remote desktop).\n- 4625: failed logon.\n- 4688: new process created.\n- 4720: user account created.\n\nWhen an alert fires, ask five questions:\n1. Who? Which user or service account?\n2. What? Which process, file or action?\n3. Where? Which host, IP address or location?\n4. When? Does the timing fit normal work patterns?\n5. How? What came before and after the flagged event?\n\nWorked example: an alert shows 40 failed logons for a user followed by one success from a foreign IP at 2 a.m. You check the sign-in logs: the success used legacy authentication with no MFA, and the user is in Lagos. That pattern suggests password spraying or credential stuffing that worked. You escalate with the IP, timestamps and account name, and recommend a password reset and session revocation per the playbook." },
            { type: "text", title: "Phishing Analysis Basics", content: "Phishing remains one of the most common ways attackers get in. A structured analysis protects you and the organisation.\n\nChecklist:\n1. Never click links or open attachments on your workstation. Use a sandbox or reputation service.\n2. Review headers: compare the From, Reply-To and Return-Path addresses, and check SPF, DKIM and DMARC results.\n3. Inspect URLs: look for lookalike domains (for example a letter swapped in a bank name), URL shorteners and newly registered domains.\n4. Check attachments by hash in a service such as VirusTotal, and detonate in a sandbox only if your process allows it.\n5. Scope: search the mail platform for other recipients of the same sender, subject or URL.\n6. Act: if malicious, request removal from all mailboxes, block indicators and check whether anyone clicked or entered credentials.\n\nCommon local lures include fake bank alerts, payment-provider re-verification requests and delivery notices. Report what you find with evidence, not just a verdict, so others can verify your reasoning." },
            { type: "text", title: "Incident Response and Escalation", content: "The incident response lifecycle, as described in NIST guidance, has four broad phases: preparation; detection and analysis; containment, eradication and recovery; and post-incident activity.\n\nAs a junior analyst you mainly work in detection and analysis, with limited containment actions allowed by playbooks. Before acting, confirm you are authorised. Isolating a payment server at midday may cause more harm than the threat itself, so disruptive actions usually need approval.\n\nA strong escalation note contains:\n- A one-line summary of what you believe is happening.\n- A timeline with timestamps and time zone.\n- Affected users, hosts and data.\n- Indicators such as IPs, domains and hashes.\n- Actions already taken and their results.\n- What you need from the next tier.\n\nPreserve evidence: avoid rebooting machines or deleting files, and record every action you take. If personal data might be involved, flag it early, because organisations may have breach notification duties under the Nigeria Data Protection Act 2023." },
            { type: "quiz", title: "SOC Foundations Quiz", questions: [
              { q: "Which statement best describes the difference between an alert and an incident?", options: ["An alert is always malicious; an incident may be benign", "An alert is flagged activity that needs triage; an incident is confirmed harm or threat to security", "They mean the same thing", "Incidents are generated automatically by the SIEM"], answer: 1 },
              { q: "Windows event ID 4625 indicates what?", options: ["A new process was created", "A user account was created", "A failed logon attempt", "A successful logon"], answer: 2 },
              { q: "When analysing a suspicious email link, what is the safest first approach?", options: ["Check its reputation and behaviour in a sandbox or analysis service", "Click it quickly to see where it goes", "Forward it to all staff as a warning", "Delete the email and close the ticket"], answer: 0 },
              { q: "Many failed logins followed by one success from an unusual location most likely suggests what?", options: ["A normal password change", "A broken firewall rule", "A software update", "A successful password guessing or credential stuffing attack"], answer: 3 },
              { q: "Why should disruptive containment actions usually require approval?", options: ["They are always illegal", "They can cause business impact greater than the threat if done without context", "SIEM tools cannot perform them", "Junior analysts are not allowed to read logs"], answer: 1 },
              { q: "Which item is LEAST useful in an escalation note?", options: ["Timeline with timestamps", "Affected users and hosts", "Your personal opinion of the user’s work habits", "Indicators and actions already taken"], answer: 2 }
            ] },
            { type: "assignment", title: "Phishing Triage Report", maxScore: 100, content: "You are given a sample suspicious email (headers and body) and a SIEM export showing which staff received it and who clicked. Analyse the email safely and write a triage report.\nDeliverables: a one-page report covering header analysis (SPF, DKIM, DMARC, sender mismatches), URL and attachment assessment, list of indicators, scope of affected users, your verdict and recommended actions; plus a short escalation note to Tier 2.\nGrading: accuracy of analysis 40%, quality of evidence and indicators 25%, appropriate and safe recommendations 20%, clarity of writing 15%." }
          ]
        },
        intensive: {
          title: "SOC Analyst Intensive",
          summary: "Job-ready depth in SIEM querying, endpoint and identity investigations, detection tuning and incident handling. Ends with a level-aware incident capstone.",
          duration: "8 weeks",
          modules: [
            { type: "text", title: "Querying the SIEM Like a Pro", content: "Most SOCs use a query language such as KQL (Microsoft Sentinel and Defender) or SPL (Splunk). The skill is not memorising syntax but structuring questions.\n\nA reliable pattern:\n1. Filter: narrow by time, table and key fields first, because this is the cheapest step.\n2. Extract: parse or project only the fields you need.\n3. Aggregate: summarise counts by user, host or IP to spot outliers.\n4. Join or correlate: link identity events to endpoint or network events.\n5. Visualise: chart over time to see spikes.\n\nWorked example in KQL: to find accounts with many failed sign-ins followed by a success, filter SigninLogs to the last 24 hours, summarise failures and successes by UserPrincipalName and IPAddress, and keep rows where failures exceed 20 and successes exceed 0.\n\nSave useful queries in a shared library with a description, author and expected output. Test them against known-good and known-bad data. A query that returns 50,000 rows is not an answer; it is a sign you need another filter or aggregation." },
            { type: "text", title: "Endpoint and Identity Investigations", content: "Modern attacks blend endpoint and identity activity, so investigations must cover both.\n\nEndpoint checklist:\n- Process tree: what launched the suspicious process, and what did it launch?\n- Command lines: look for encoded PowerShell, LOLBins such as rundll32 or certutil, and unusual paths.\n- Persistence: scheduled tasks, services, Run keys and startup folders.\n- Network: outbound connections to rare destinations.\n\nIdentity checklist:\n- Sign-in logs: location, device, client app and MFA result.\n- Risky sign-ins: impossible travel, anonymising IPs, token replay.\n- Mailbox: new inbox rules that forward or hide messages.\n- OAuth: newly consented apps with mail or file permissions.\n\nWorked example: a finance user’s mailbox has a new rule moving emails containing invoice to an obscure folder, and sign-ins show a session from a hosting provider IP. This fits business email compromise. Containment includes revoking sessions, resetting credentials, removing the rule and checking for fraudulent payment instructions sent to suppliers." },
            { type: "text", title: "Detection Engineering and Tuning", content: "Detections are only useful if analysts trust them. Too many false positives cause alert fatigue; too few rules leave blind spots.\n\nTuning approach:\n1. Measure: how often does the rule fire and what share are true positives?\n2. Understand: which legitimate activity causes the noise, such as an admin script or backup job?\n3. Narrow carefully: exclude specific, verified benign patterns (exact path plus signer plus host group), never broad exclusions like an entire user group.\n4. Test: replay known attack data or use an emulation tool to confirm the rule still fires on real threats.\n5. Document: record the change, reason and owner.\n\nSigma is a vendor-neutral rule format that can be converted to KQL, SPL and other languages, which helps share detections. Map each detection to MITRE ATT&CK techniques so you can see coverage gaps.\n\nA good detection has a clear name, a description of the threat, required data sources, known false positives, severity, and a linked triage playbook so the next analyst knows what to do." },
            { type: "text", title: "Handling Real Incidents", content: "When an incident is confirmed, structure prevents chaos.\n\nFirst hour priorities:\n1. Scope: which hosts, users and data are affected? Is the attacker still active?\n2. Contain: choose proportionate actions such as isolating hosts, disabling accounts or blocking indicators, with approval where required.\n3. Preserve: capture volatile evidence such as memory and running processes before rebooting, and record every action with a timestamp.\n4. Communicate: open an incident channel, keep a decision log and give regular updates to the incident lead.\n\nRansomware specifics: protect backups first, look for the initial access point, and check for data theft, since many groups steal data before encrypting.\n\nRecovery means rebuilding or cleaning systems, resetting credentials and monitoring closely for return activity.\n\nPost-incident review: write a blameless report covering timeline, root cause, what worked, what did not and concrete actions with owners. Where personal data is involved, support legal and the data protection officer with accurate facts, since NDPA 2023 sets notification duties to the NDPC." },
            { type: "assignment", title: "Detection Tuning Exercise", maxScore: 100, content: "You receive a week of alerts from a noisy detection for suspicious PowerShell execution, with context on which hosts and scripts are legitimate.\nDeliverables: an analysis of true versus false positives; a revised rule (in KQL, SPL or Sigma) with justified exclusions; evidence that the revised rule still detects two provided malicious samples; and a short change record explaining the reason, owner and rollback plan. Note any data sources the rule depends on.\nGrading: quality of analysis 30%, correctness and precision of the revised rule 35%, testing evidence 20%, documentation 15%." },
            { type: "quiz", title: "SOC Intensive Quiz", questions: [
              { q: "When writing a SIEM query over large data, which step should usually come first?", options: ["Join every table together", "Visualise the raw data", "Filter by time range and key fields", "Export everything to a spreadsheet"], answer: 2 },
              { q: "A new mailbox rule hides emails containing the word invoice, and sign-ins come from a hosting provider IP. What is the most likely scenario?", options: ["Business email compromise", "A failing mail server", "Normal user housekeeping", "A misconfigured printer"], answer: 0 },
              { q: "What is the main risk of excluding an entire user group to stop a noisy detection?", options: ["The SIEM will crash", "Attackers using those accounts will go undetected", "It increases licence costs", "It breaks Sigma conversion"], answer: 1 },
              { q: "Why is Sigma useful to a SOC?", options: ["It encrypts logs at rest", "It replaces the need for an EDR", "It is a ransomware decryption tool", "It provides vendor-neutral rules that convert to multiple query languages"], answer: 3 },
              { q: "During ransomware response, why protect backups early?", options: ["Backups are needed for recovery and attackers often target them", "Backups contain the attacker’s identity", "Regulators require deleting backups", "Backups slow down encryption"], answer: 0 },
              { q: "What is the purpose of a blameless post-incident review?", options: ["To identify who should be disciplined", "To learn root causes and fix processes without discouraging honest reporting", "To avoid writing documentation", "To close the ticket faster"], answer: 1 }
            ] },
            { type: "assignment", title: "Capstone: Investigate and Report a Live-Fire Incident", maxScore: 100, content: "Shared brief: you are given logs and EDR data from a simulated Nigerian fintech where a phishing email led to a compromised account, suspicious PowerShell on a workstation and unusual access to a customer data file share.\nJunior: triage the alerts, build a timeline of the key events, list indicators and write a clear escalation note with recommended next steps.\nMid: lead the full investigation, determine initial access and scope, recommend containment and recovery, and write one new or tuned detection that would have caught the activity earlier.\nSenior: act as incident lead: produce the full incident report, a leadership briefing, an assessment of NDPA 2023 notification needs, and a prioritised improvement plan covering detections, playbooks and automation.\nDeliverables: investigation report, timeline, indicators list and level-specific outputs above.\nGrading: accuracy of findings 35%, quality of reasoning and evidence 25%, appropriateness of actions 20%, communication 20%." }
          ]
        }
      }
    },
    {
      id: "pentest",
      title: "Penetration Tester",
      summary: "A Penetration Tester performs authorised, scoped security assessments of applications, networks and cloud environments to find weaknesses before real attackers do, and explains how to fix them. The role sits in an internal offensive security team or a consultancy, working closely with developers, system owners and defensive teams.",
      competencies: [
        { name: "Scoping and rules of engagement", weight: 15, description: "Agrees written authorisation, scope, timing and safety limits before any testing and stays strictly within them." },
        { name: "Web and API security testing", weight: 25, description: "Assesses applications and APIs against recognised methodologies such as the OWASP Web Security Testing Guide and API Security Top 10." },
        { name: "Network and Active Directory assessment", weight: 20, description: "Identifies misconfigurations and weak controls in internal networks and directory services using a structured methodology." },
        { name: "Cloud and configuration review", weight: 15, description: "Reviews cloud identity, storage and network configuration for exposure and privilege weaknesses." },
        { name: "Reporting and remediation guidance", weight: 25, description: "Writes clear, risk-rated findings with business impact and practical fixes, and supports retesting and defensive improvements." }
      ],
      levels: {
        junior: {
          minYears: 0,
          focus: "Trusted to carry out defined test cases under supervision on authorised engagements and to document findings accurately.",
          responsibilities: [
            "Follow the agreed rules of engagement and confirm scope with the lead tester before starting any activity",
            "Perform reconnaissance and vulnerability scanning of in-scope assets using approved tools",
            "Execute checklist-based web application tests against the OWASP Top 10 under supervision",
            "Validate scanner output to remove false positives and record evidence with screenshots and timestamps",
            "Draft findings with clear descriptions, risk ratings and remediation advice for review"
          ],
          skills: [
            "OWASP Top 10",
            "HTTP and web fundamentals",
            "Vulnerability scanning",
            "Linux command line",
            "Network enumeration basics",
            "Finding write-ups",
            "Rules of engagement"
          ],
          tools: ["Burp Suite Professional", "Nmap", "Nessus", "Kali Linux", "OWASP ZAP", "Wireshark"],
          certifications: ["CompTIA PenTest+", "INE Security Junior Penetration Tester (eJPT)", "CompTIA Security+"],
          aiTopics: [
            "Why written authorisation and scope matter, and what to do if something looks out of scope",
            "How HTTP, cookies, sessions and authentication work",
            "OWASP Top 10 categories and how each affects a business",
            "Validating scanner results and avoiding false positives",
            "Writing a clear finding with risk and remediation"
          ],
          aiScenarios: [
            "During an authorised web test you notice the application connects to a third-party payment API that is not listed in scope. Walk me through what you do.",
            "A vulnerability scanner reports 120 issues on an in-scope server. How do you decide which are real and worth reporting?",
            "You find that a user can view another customer’s order by changing an ID in the URL. How would you confirm it safely and write it up?"
          ],
          aiExpectations: "A ready junior understands that testing is only legitimate with authorisation and scope, explains web fundamentals clearly and documents evidence carefully. Red flags are a casual attitude to scope or permission, over-reliance on scanners without validation, or describing findings with no business impact or fix.",
          proQuestions: [
            { q: "What must be in place before you start testing a client’s system?", lookFor: "Signed authorisation, defined scope and exclusions, testing windows, emergency contacts and agreed handling of sensitive data." },
            { q: "Describe a vulnerability you found in a lab or authorised test and how you would explain it to a developer.", lookFor: "Clear cause, impact and fix in plain language, with evidence and without sensationalism." },
            { q: "How do you confirm that a scanner finding is a true positive?", lookFor: "Manual verification, checking versions and configuration, safe proof of concept within scope and documenting evidence." },
            { q: "Explain broken access control and why it is so common.", lookFor: "Server-side authorisation failures such as IDOR, with an understanding that client-side checks are not enough." },
            { q: "Tell me how you keep learning in offensive security in an ethical way.", lookFor: "Legal labs and platforms, CTFs, courses and reading advisories, with no testing of systems without permission." }
          ]
        },
        mid: {
          minYears: 2,
          focus: "Trusted to run complete web, API and internal network engagements independently and to deliver client-ready reports.",
          responsibilities: [
            "Lead scoping calls and help draft rules of engagement, test plans and safety constraints",
            "Independently test web applications, APIs and mobile back ends using recognised methodologies",
            "Assess internal networks and Active Directory for misconfigurations and privilege weaknesses within scope",
            "Write full engagement reports with executive summaries, risk-rated findings and remediation guidance",
            "Support developers and system owners with retesting and share findings with defensive teams to improve detection"
          ],
          skills: [
            "API security testing",
            "Authentication and session testing",
            "Active Directory assessment",
            "Risk rating with CVSS",
            "Report writing",
            "Cloud configuration review",
            "Client communication"
          ],
          tools: ["Burp Suite Professional", "Nmap", "BloodHound", "Postman", "ScoutSuite", "Metasploit Framework"],
          certifications: ["OffSec Certified Professional (OSCP)", "Burp Suite Certified Practitioner", "GIAC Penetration Tester (GPEN)"],
          aiTopics: [
            "OWASP API Security Top 10, especially object and function level authorisation",
            "Authentication flows: OAuth 2.0, JWTs and session management weaknesses",
            "Common Active Directory misconfigurations and attack paths at a conceptual level",
            "Risk rating, including CVSS and business context",
            "Safe testing practices for production systems"
          ],
          aiScenarios: [
            "You are testing a mobile-money wallet API in production during agreed hours. How do you plan the test so you find real issues without moving real funds or disrupting customers?",
            "Midway through an internal test you find evidence that a real attacker may already be present. Walk me through what you do.",
            "The client’s developers dispute a high-severity finding as theoretical. How do you handle the conversation?"
          ],
          aiExpectations: "A ready mid-level tester plans engagements methodically, tests safely in sensitive environments and produces reports that drive real fixes. Red flags are treating scope as flexible, chasing impressive exploits over business risk, or producing reports that developers cannot act on.",
          proQuestions: [
            { q: "Walk me through how you plan an API penetration test from scoping to report.", lookFor: "Scoping, documentation review, authentication setup, methodology coverage, safe testing, evidence and remediation-focused reporting." },
            { q: "How do you rate the severity of a finding?", lookFor: "Uses CVSS or a similar framework but adjusts for business context, exploitability and data sensitivity, and explains the rating." },
            { q: "Describe a time you stopped or paused testing for safety or scope reasons.", lookFor: "Clear judgement, prompt communication with the client contact and documentation of the decision." },
            { q: "How do you help a defensive team get value from your test?", lookFor: "Shares timings and techniques so the SOC can check detections, and recommends detection or logging improvements." },
            { q: "How do you approach testing access control in a multi-tenant application?", lookFor: "Multiple test accounts per role and tenant, systematic checks of object and function level authorisation, and careful evidence." }
          ]
        },
        senior: {
          minYears: 5,
          focus: "Trusted to lead complex engagements and adversary simulation programmes, manage client relationships and mentor testers.",
          responsibilities: [
            "Own engagement delivery from scoping and legal authorisation through to final debrief with client leadership",
            "Design threat-led and purple-team exercises that test detection and response against realistic adversary behaviour",
            "Set methodology, quality standards and report review processes for the testing team",
            "Advise clients on remediation strategy, secure design and regulatory testing requirements",
            "Mentor junior and mid-level testers and manage testing risk, including safety controls for critical systems"
          ],
          skills: [
            "Engagement leadership",
            "Threat-led test design",
            "Purple team collaboration",
            "Cloud attack path analysis",
            "Methodology and QA ownership",
            "Executive risk communication",
            "Tester mentoring"
          ],
          tools: ["Burp Suite Professional", "BloodHound", "Cobalt Strike", "Atomic Red Team", "Nuclei", "Dradis"],
          certifications: ["OffSec Experienced Penetration Tester (OSEP)", "CREST Certified Infrastructure Tester (CCT INF)", "GIAC Exploit Researcher and Advanced Penetration Tester (GXPN)"],
          aiTopics: [
            "Designing threat-led and purple-team engagements using threat intelligence and MITRE ATT&CK",
            "Legal, contractual and safety controls for testing critical systems",
            "Cloud and identity attack paths at an architectural level",
            "Quality assurance and consistency of findings across a team",
            "Communicating risk and remediation strategy to executives and regulators"
          ],
          aiScenarios: [
            "A Nigerian bank asks for an adversary simulation to test whether its SOC can detect a realistic intrusion. How do you scope, govern and run it safely?",
            "A client wants a test of their payment switch but cannot tolerate any downtime. How do you design the engagement?",
            "Two testers on your team rated the same type of issue very differently across reports. How do you fix this?"
          ],
          aiExpectations: "A ready senior designs engagements that answer real business questions, governs risk carefully and turns findings into lasting defensive improvements. Red flags are glorifying exploitation over outcomes, weak governance of authorisation and safety, or inability to explain risk to non-technical leaders.",
          proQuestions: [
            { q: "Describe an engagement you led that changed how a client defended themselves.", lookFor: "Clear objective, sound governance, findings tied to business risk and evidence of concrete defensive improvements afterwards." },
            { q: "How do you structure authorisation and safety controls for a red team or adversary simulation?", lookFor: "Written authority from appropriate leadership, rules of engagement, deconfliction contacts, stop conditions and controlled infrastructure." },
            { q: "How do you run a purple-team exercise and measure its value?", lookFor: "Collaborative emulation of chosen techniques, checking detections in real time, and tracking detection coverage improvements." },
            { q: "How do you maintain report quality across a team?", lookFor: "Templates, rating guidance, peer review, finding libraries and calibration sessions." },
            { q: "How have you developed testers on your team, including their professional ethics?", lookFor: "Structured mentoring, shadowing, review feedback and reinforcement of scope and legal boundaries." }
          ]
        }
      },
      hrScenarios: [
        { q: "During an engagement you accidentally access sensitive customer data that was not the target of your test. What do you do?", lookFor: "Stops, does not copy or explore further, informs the engagement lead and client contact promptly and documents what happened." },
        { q: "A friend asks you to check whether their employer’s website is vulnerable, without the employer knowing. How do you respond?", lookFor: "Declines firmly because testing without authorisation is illegal and unethical, and suggests proper channels such as a disclosure programme." },
        { q: "A client pressures you to downgrade a critical finding before their board meeting. How do you handle it?", lookFor: "Stays professional and evidence-based, keeps the rating honest, and offers to help explain context and remediation plans." }
      ],
      curriculum: {
        foundational: {
          title: "Penetration Testing Foundations",
          summary: "Introduces ethical, authorised security testing: legal boundaries, web fundamentals, methodology and reporting. For graduates and career-switchers who want to start in offensive security the right way.",
          duration: "5 weeks",
          modules: [
            { type: "text", title: "Ethics, Law and Authorisation", content: "Penetration testing is a simulated attack carried out with explicit permission to find and fix weaknesses. Without written authorisation, the same activity is a crime. In Nigeria, the Cybercrimes (Prohibition, Prevention, etc.) Act 2015, as amended in 2024, makes unauthorised access to computer systems an offence, and most countries have similar laws.\n\nBefore any engagement, a professional tester confirms:\n- Written authorisation from someone with authority over the systems.\n- Scope: exact domains, IP ranges, applications and accounts in scope, and what is excluded.\n- Rules of engagement: testing windows, techniques that are not allowed (for example denial of service), and stop conditions.\n- Contacts: who to call if something breaks or a real attack is discovered.\n- Data handling: how evidence and any sensitive data will be stored and destroyed.\n\nIf you find something that looks out of scope, such as a third-party service, you stop and ask. Practise only on systems you own or on legal training platforms. A tester’s reputation for integrity is their most important asset." },
            { type: "text", title: "How the Web Works for Testers", content: "Most engagements involve web applications and APIs, so you need solid fundamentals.\n\nKey concepts:\n- HTTP requests and responses: methods (GET, POST, PUT, DELETE), headers, status codes and bodies.\n- State: HTTP is stateless, so applications use cookies, session IDs or tokens such as JWTs to remember users.\n- Authentication proves who you are; authorisation decides what you may do. Many serious flaws are authorisation failures.\n- Client versus server: anything in the browser can be changed by the user, so security checks must happen on the server.\n- Same-origin policy and CORS control how browsers share data between sites.\n\nAn intercepting proxy such as Burp Suite or OWASP ZAP sits between your browser and the application in a test environment, letting you see and modify requests. This is how testers observe whether the server properly validates input and enforces permissions.\n\nWorked example: if a hidden form field sets the price of an item and the server trusts it, the logic flaw lies in server-side validation, and the fix is to calculate prices on the server." },
            { type: "text", title: "A Structured Testing Methodology", content: "Professional testing follows a repeatable methodology so results are consistent and defensible. Recognised references include the OWASP Web Security Testing Guide, the Penetration Testing Execution Standard (PTES) and NIST SP 800-115.\n\nTypical phases:\n1. Pre-engagement: scope, authorisation and rules of engagement.\n2. Reconnaissance: map the in-scope attack surface, such as subdomains, open ports, technologies and application functions.\n3. Vulnerability analysis: combine automated scanning with manual review, then validate results.\n4. Controlled verification: safely demonstrate that a weakness is real and assess its impact, within agreed limits.\n5. Reporting: document findings, evidence, risk and remediation.\n6. Retest: confirm fixes work.\n\nThe OWASP Top 10 is a useful awareness list, covering issues such as broken access control, cryptographic failures, injection, insecure design and security misconfiguration. Use it as a starting checklist, not the whole test.\n\nKeep detailed notes with timestamps throughout. If the client’s SOC asks whether certain activity was yours, accurate notes let you answer quickly and help them tune detections." },
            { type: "text", title: "Writing Findings That Get Fixed", content: "A test is only valuable if its findings get fixed. The report is the product.\n\nEach finding should include:\n- Title: specific, for example Customer orders accessible by changing order ID.\n- Severity: a rating such as Critical, High, Medium or Low, often supported by CVSS, adjusted for business context.\n- Affected assets: URLs, hosts or endpoints.\n- Description: what the weakness is in plain language.\n- Evidence: requests, responses or screenshots, with sensitive data redacted.\n- Impact: what could happen to the business or its customers.\n- Remediation: practical, specific fixes plus longer-term improvements.\n- References: such as OWASP or vendor guidance.\n\nThe executive summary should explain overall risk and priorities in two or three paragraphs without jargon.\n\nWorked example: rather than writing IDOR found, write that any logged-in customer can view other customers’ order details, including addresses and phone numbers, because the server does not check ownership of the order ID. Recommend server-side ownership checks on every object request and automated tests to prevent regression. That is a finding developers can act on and leaders can understand." },
            { type: "quiz", title: "Pentest Foundations Quiz", questions: [
              { q: "What makes a penetration test legal and legitimate?", options: ["Using only free tools", "Written authorisation and an agreed scope from someone with authority over the systems", "Testing only at night", "Not telling anyone about the results"], answer: 1 },
              { q: "During a test you discover a connected third-party service not listed in scope. What should you do?", options: ["Test it quickly since it is connected", "Ignore the scope document", "Stop and confirm with your lead and client contact before any activity", "Report it to social media"], answer: 2 },
              { q: "Why must security checks happen on the server rather than only in the browser?", options: ["Users can modify anything on the client side", "Browsers are slower than servers", "Servers have more memory", "JavaScript cannot run validation"], answer: 0 },
              { q: "Which best describes authorisation?", options: ["Proving who a user is", "Encrypting data in transit", "Logging user activity", "Deciding what an authenticated user is allowed to do"], answer: 3 },
              { q: "What is the main purpose of validating scanner results?", options: ["To make the report longer", "To remove false positives and confirm real risk", "To slow down the engagement", "To avoid writing remediation"], answer: 1 },
              { q: "Which element is most important for getting a finding fixed?", options: ["A dramatic title", "Clear impact and specific, practical remediation", "Listing every tool used", "Hiding the evidence"], answer: 1 }
            ] },
            { type: "assignment", title: "Rules of Engagement and Finding Write-up", maxScore: 100, content: "Part A: draft a rules of engagement document for a fictional web application test for a Lagos-based e-commerce company, covering authorisation, scope and exclusions, testing windows, prohibited activities, stop conditions, contacts and data handling.\nAssume the client’s SOC will monitor your activity. Part B: using a provided lab result from an intentionally vulnerable training application, write two complete findings with severity, evidence, impact and remediation.\nGrading: completeness and realism of the rules of engagement 40%, accuracy of findings 30%, clarity and actionability of remediation 30%." }
          ]
        },
        intensive: {
          title: "Penetration Tester Intensive",
          summary: "Job-ready depth in API and application assessment, internal network and Active Directory review, cloud configuration review and professional reporting, always within authorised scope. Ends with a level-aware engagement capstone.",
          duration: "10 weeks",
          modules: [
            { type: "text", title: "API Security Assessment", content: "APIs power mobile banking, mobile money and fintech integrations, so they are a priority for testing. The OWASP API Security Top 10 (2023) highlights the most common risks, including broken object level authorisation, broken authentication, broken object property level authorisation, unrestricted resource consumption and broken function level authorisation.\n\nAssessment approach:\n1. Gather documentation such as OpenAPI specifications and Postman collections from the client.\n2. Create test accounts for each role and, for multi-tenant systems, at least two tenants.\n3. Map every endpoint, method and parameter, including those not shown in the user interface.\n4. Systematically check that each request enforces ownership and role permissions on the server.\n5. Review rate limits, error messages and data returned for over-exposure.\n6. Test only with test data and agreed limits; never trigger real transactions.\n\nWorked example: a wallet API returns full account details, including BVN-linked fields, when a user requests another account number. The fix is server-side ownership checks and returning only the fields the client needs. Report it with redacted evidence and a recommendation for automated authorisation tests in CI." },
            { type: "text", title: "Internal Networks and Active Directory", content: "Many organisations run Microsoft Active Directory (AD) to manage users and computers. Internal assessments look at how an attacker who gains a foothold could move and escalate, so the organisation can close those paths.\n\nCommon weakness areas, at a conceptual level:\n- Excessive privileges: too many members of Domain Admins or broad delegated rights.\n- Weak service account practices: old passwords and accounts with more access than needed.\n- Legacy protocols: NTLM and SMB signing not enforced, which enable relay-style attacks.\n- Credential exposure: passwords in scripts, shares or group policy files.\n- Unpatched systems and unsupported operating systems.\n\nGraph tools such as BloodHound visualise relationships between users, groups and computers so testers and defenders can see attack paths to high-value assets.\n\nDefensive value is the point: recommend tiered administration, Local Administrator Password Solution (LAPS), removal of stale privileges, enforcing SMB signing, and monitoring for directory changes. Always agree with the client which systems are fragile, such as legacy core banking servers, and avoid any activity that could lock accounts or disrupt services." },
            { type: "text", title: "Cloud Configuration Review", content: "Cloud breaches usually come from misconfiguration and weak identity controls, not exotic flaws. Cloud testing also needs care with provider policies: AWS, Azure and Google Cloud publish rules on what customers may test.\n\nReview areas:\n- Identity and access: overly broad roles, long-lived access keys, missing MFA on privileged users and risky cross-account trust.\n- Storage: publicly accessible buckets or blobs, and missing encryption.\n- Network: management ports open to the internet and flat networks without segmentation.\n- Logging: whether CloudTrail, Azure Activity Logs or equivalent are enabled and retained.\n- Secrets: keys in code repositories, environment variables or CI pipelines.\n\nTools such as ScoutSuite and Prowler collect configuration data with read-only credentials, and provider security centres highlight issues against benchmarks such as the CIS Foundations Benchmarks.\n\nWorked example: a storage bucket holding KYC documents is readable by anyone with the link. The impact is exposure of customer identity documents, a likely NDPA 2023 breach. Recommend blocking public access at account level, rotating any exposed links and alerting on policy changes." },
            { type: "text", title: "Reporting, Retesting and Purple Teaming", content: "Senior clients judge testers by the report and the debrief.\n\nReport structure:\n- Executive summary: overall risk, key themes and top priorities in plain language.\n- Scope and methodology: what was tested, when, and any limitations.\n- Findings: ordered by severity, each with evidence, impact and remediation.\n- Strategic recommendations: themes such as weak access control design across services.\n- Appendices: tested assets and detailed notes.\n\nQuality controls include a peer review of every report, a shared finding library for consistent wording and calibration of severity ratings across testers.\n\nRetesting confirms fixes. Record whether each finding is resolved, partially resolved or open, and verify the root cause was fixed, not just the specific example.\n\nPurple teaming brings testers and defenders together. The tester performs agreed techniques mapped to MITRE ATT&CK while the SOC watches whether alerts fire. Gaps become new detections or logging improvements. This turns a point-in-time test into lasting defensive capability, which is the real value of offensive security." },
            { type: "assignment", title: "API Assessment Report", maxScore: 100, content: "Using a provided intentionally vulnerable training API and test accounts in a lab, perform an authorised assessment against the OWASP API Security Top 10.\nDeliverables: a test plan; a professional report with executive summary, at least four risk-rated findings with redacted evidence, impact and remediation; and a short list of detection or logging recommendations for the defensive team. All testing stays within the lab scope provided.\nGrading: methodology and coverage 25%, accuracy of findings 30%, report quality and remediation 30%, defensive recommendations 15%." },
            { type: "quiz", title: "Pentest Intensive Quiz", questions: [
              { q: "Broken object level authorisation in an API means what?", options: ["The API uses weak encryption", "The server does not check that the user may access the specific object requested", "The API is too slow", "The API lacks documentation"], answer: 1 },
              { q: "Why create test accounts for multiple roles and tenants when testing an application?", options: ["To check authorisation boundaries between users and tenants", "To increase licence costs", "To speed up scanning", "To avoid writing a report"], answer: 0 },
              { q: "What is the main purpose of a tool like BloodHound in an authorised assessment?", options: ["Encrypting domain traffic", "Patching servers automatically", "Visualising relationships and attack paths so they can be closed", "Monitoring web traffic"], answer: 2 },
              { q: "Before testing workloads in a public cloud, what should a tester check?", options: ["Nothing, cloud is always in scope", "The provider’s penetration testing policy and the client’s written scope", "Only the price of the service", "Whether the cloud uses Linux"], answer: 1 },
              { q: "In a retest, what should you confirm?", options: ["Only that the exact example request now fails", "That the report has been printed", "That the client paid the invoice", "That the root cause is fixed, not just the specific example"], answer: 3 },
              { q: "What is the primary goal of a purple-team exercise?", options: ["Improving detection and response by testing techniques collaboratively with defenders", "Proving that defenders are incompetent", "Avoiding writing findings", "Testing without authorisation"], answer: 0 }
            ] },
            { type: "assignment", title: "Capstone: Authorised Engagement for a Fintech", maxScore: 100, content: "Shared brief: a fictional Nigerian fintech has authorised a lab-based assessment of its customer web portal, wallet API and a small simulated internal network. A scope document and rules of engagement are provided; anything outside them is off limits.\nJunior: perform the defined web test cases, validate scanner output and write three well-evidenced findings with remediation.\nMid: run the full web and API assessment plus an internal network review, produce a complete client report with executive summary and risk ratings, and give detection recommendations to the SOC.\nSenior: additionally design a purple-team plan mapped to MITRE ATT&CK, set quality review of the team’s report, and present a 10-minute executive debrief covering risk themes and a remediation roadmap.\nDeliverables: test notes, report and level-specific outputs above.\nGrading: adherence to scope and safety 20%, accuracy and depth of findings 30%, report and remediation quality 30%, defensive value and communication 20%." }
          ]
        }
      }
    },
    {
      id: "engineer",
      title: "Security Engineer",
      summary: "A Security Engineer designs, builds and operates the technical controls that protect an organisation’s infrastructure, cloud and applications, from identity and network security to secure pipelines and logging. The role sits between IT, DevOps and the security team, turning policy and risk findings into working, automated defences.",
      competencies: [
        { name: "Identity and access security", weight: 20, description: "Implements strong authentication, least privilege and privileged access controls across directory and cloud platforms." },
        { name: "Cloud and infrastructure hardening", weight: 25, description: "Secures cloud accounts, networks and servers against benchmarks and builds guardrails that prevent misconfiguration." },
        { name: "Secure DevOps and automation", weight: 20, description: "Embeds security checks into CI/CD and manages infrastructure and policies as code." },
        { name: "Vulnerability and patch management", weight: 15, description: "Runs risk-based scanning, prioritisation and remediation tracking across the estate." },
        { name: "Security monitoring enablement", weight: 20, description: "Ensures the right logs and telemetry are collected, protected and usable by detection and response teams." }
      ],
      levels: {
        junior: {
          minYears: 0,
          focus: "Trusted to implement and maintain well-defined security controls and configurations under the guidance of senior engineers.",
          responsibilities: [
            "Apply hardening baselines to servers, endpoints and cloud resources using approved standards",
            "Run vulnerability scans, verify results and track remediation tickets with system owners",
            "Manage day-to-day identity tasks such as MFA enrolment, group membership reviews and access requests",
            "Onboard log sources to the SIEM and check that data arrives correctly",
            "Maintain documentation for security configurations and runbooks"
          ],
          skills: [
            "Linux and Windows hardening",
            "Vulnerability scanning",
            "MFA and identity basics",
            "Firewall rule management",
            "Basic scripting (Python, PowerShell)",
            "Log source onboarding",
            "Cloud security fundamentals"
          ],
          tools: ["Microsoft Entra ID", "Tenable Nessus", "Microsoft Defender for Endpoint", "AWS Security Hub", "pfSense", "Git"],
          certifications: ["CompTIA Security+", "Microsoft Certified: Azure Security Engineer Associate", "AWS Certified Cloud Practitioner"],
          aiTopics: [
            "Principles of least privilege and defence in depth",
            "Hardening a Linux or Windows server against a benchmark",
            "How MFA, SSO and conditional access work",
            "Vulnerability scanning and prioritising by risk",
            "Basic firewall and network segmentation concepts"
          ],
          aiScenarios: [
            "You are asked to harden a new Ubuntu web server before it goes live. Walk me through what you would check and change.",
            "A scan shows 200 vulnerabilities across 30 servers and the team can only fix a few this week. How do you decide what goes first?",
            "A staff member cannot complete MFA because they changed phones while travelling. How do you help them securely?"
          ],
          aiExpectations: "A ready junior applies security fundamentals carefully, follows change processes and verifies their work. Red flags are making untested changes in production, weakening controls to make problems go away, or being unable to explain why a control exists.",
          proQuestions: [
            { q: "Describe a system you secured in a lab or job. What did you change and why?", lookFor: "Specific controls such as patching, SSH hardening, service minimisation and logging, each justified by risk." },
            { q: "How do you prioritise vulnerabilities when you cannot fix them all?", lookFor: "Considers exploitability, exposure, asset criticality and known exploitation such as the CISA KEV catalogue, not just CVSS score." },
            { q: "Explain least privilege with a practical example.", lookFor: "Granting only needed permissions, time-bound admin access and regular access reviews with a concrete case." },
            { q: "How would you safely verify a user’s identity before resetting their MFA?", lookFor: "Out-of-band verification through a known channel, manager confirmation or identity checks, never just a chat message." },
            { q: "Tell me about a script you wrote to automate a repetitive task.", lookFor: "A real automation with clear purpose, error handling and how it saved time or reduced mistakes." }
          ]
        },
        mid: {
          minYears: 2,
          focus: "Trusted to own security platforms and controls end to end, automate them and work with engineering teams to build security in.",
          responsibilities: [
            "Design and implement conditional access, privileged access management and identity governance controls",
            "Build cloud security guardrails using policy as code and infrastructure as code",
            "Integrate SAST, dependency, secret and container scanning into CI/CD pipelines with sensible gates",
            "Own the vulnerability management programme, including SLAs, reporting and exception handling",
            "Partner with the SOC to close logging and detection gaps found in incidents and tests"
          ],
          skills: [
            "Conditional access design",
            "Infrastructure as code security",
            "CI/CD security integration",
            "Container and Kubernetes security",
            "Secrets management",
            "Risk-based vulnerability management",
            "Cloud network segmentation"
          ],
          tools: ["Terraform", "HashiCorp Vault", "GitHub Advanced Security", "Trivy", "Microsoft Defender for Cloud", "Wiz"],
          certifications: ["AWS Certified Security – Specialty", "Certified Kubernetes Security Specialist (CKS)", "GIAC Security Essentials (GSEC)"],
          aiTopics: [
            "Designing conditional access and privileged access controls",
            "Securing infrastructure as code and preventing drift",
            "Pipeline security: SAST, SCA, secret scanning and supply chain risk",
            "Container and Kubernetes security controls",
            "Secrets management and key rotation"
          ],
          aiScenarios: [
            "A developer accidentally pushed a cloud access key to a public GitHub repository an hour ago. Walk me through your response and how you prevent it happening again.",
            "Developers complain the new pipeline security scan blocks releases with too many findings. How would you redesign it?",
            "You need to give a third-party support vendor access to production servers for two weeks. How do you design that access?"
          ],
          aiExpectations: "A ready mid-level engineer automates controls, designs them to work with engineering teams and measures their effect. Red flags are manual one-off fixes with no prevention, controls that block delivery without a path to resolution, or storing secrets insecurely.",
          proQuestions: [
            { q: "Describe a security control you automated with code. How did you test and roll it out?", lookFor: "Infrastructure or policy as code, testing in lower environments, staged rollout and monitoring for impact." },
            { q: "How do you integrate security into CI/CD without slowing developers down?", lookFor: "Fast feedback, tuned rules, gating only on high-confidence critical issues, developer-friendly guidance and metrics." },
            { q: "How would you design privileged access for administrators?", lookFor: "Just-in-time elevation, separate admin accounts, MFA, session logging and regular reviews." },
            { q: "Tell me about a time you balanced security with business or delivery pressure.", lookFor: "Understood the business need, offered risk-reduced alternatives and documented any accepted risk with an owner." },
            { q: "How do you handle a vulnerability that cannot be patched quickly?", lookFor: "Compensating controls such as isolation, WAF rules or monitoring, a formal exception with expiry and a tracked remediation plan." }
          ]
        },
        senior: {
          minYears: 5,
          focus: "Trusted to set security architecture and engineering direction across platforms, lead major programmes and mentor engineers.",
          responsibilities: [
            "Define security architecture standards and reference designs for cloud, identity, network and applications",
            "Lead programmes such as zero trust adoption, identity modernisation or cloud landing zone security",
            "Review high-risk designs and changes, and make risk-based recommendations to leadership",
            "Set engineering metrics for control coverage and effectiveness and report on them",
            "Mentor engineers and build security champions within development and infrastructure teams"
          ],
          skills: [
            "Security architecture",
            "Zero trust strategy",
            "Threat modelling",
            "Cloud landing zone design",
            "Control effectiveness metrics",
            "Stakeholder influence",
            "Engineering mentoring"
          ],
          tools: ["Terraform", "Open Policy Agent", "Microsoft Defender for Cloud", "Wiz", "CyberArk Privilege Cloud", "OWASP Threat Dragon"],
          certifications: ["Certified Information Systems Security Professional (CISSP)", "Certified Cloud Security Professional (CCSP)", "GIAC Defending Advanced Threats (GDAT)"],
          aiTopics: [
            "Zero trust architecture principles and practical rollout",
            "Threat modelling methods such as STRIDE for new systems",
            "Multi-account cloud landing zone and guardrail design",
            "Measuring control coverage and effectiveness",
            "Designing for resilience under local constraints such as unreliable power and connectivity"
          ],
          aiScenarios: [
            "A bank is launching a new mobile-money integration with three external partners. How do you lead the security design review?",
            "Leadership asks for a zero trust roadmap with a limited budget. How do you prioritise the first year?",
            "Your organisation has 40 cloud accounts created without standards over several years. How do you bring them under control?"
          ],
          aiExpectations: "A ready senior designs security that scales across teams, prioritises by risk and business value and brings others along. Red flags are tool-first thinking without architecture, designs that ignore operational reality, or inability to influence beyond their own team.",
          proQuestions: [
            { q: "Walk me through a security architecture you designed. What trade-offs did you make?", lookFor: "Clear threat model, layered controls, explicit trade-offs on cost, usability and risk, and how it was validated." },
            { q: "How do you run a threat modelling session with a product team?", lookFor: "Structured method such as STRIDE, data flow diagrams, prioritised threats and tracked mitigations owned by the team." },
            { q: "How do you measure whether security controls are actually working?", lookFor: "Coverage and effectiveness metrics, control testing, attack simulation results and trend reporting." },
            { q: "Describe a time you convinced leadership to fund or change a security initiative.", lookFor: "Business-framed case, risk evidence, options with costs and a clear outcome." },
            { q: "How do you build security capability in engineering teams?", lookFor: "Champions programme, paved-road tooling, training, reviews and feedback loops with measurable adoption." }
          ]
        }
      },
      hrScenarios: [
        { q: "A security change you deployed caused an outage for a customer-facing service. How do you respond?", lookFor: "Prioritises restoring service, communicates openly, owns the mistake and improves change testing and rollback." },
        { q: "A senior developer repeatedly bypasses pipeline security checks to ship faster. How do you handle it?", lookFor: "Raises it directly and respectfully, understands the cause, fixes friction where reasonable and escalates through proper channels if needed." },
        { q: "You are asked to support a project whose deadline makes it impossible to complete planned security controls. What do you do?", lookFor: "Clearly explains risks, proposes minimum viable controls and a follow-up plan, and ensures risk acceptance is documented by the right owner." }
      ],
      curriculum: {
        foundational: {
          title: "Security Engineering Foundations",
          summary: "Covers the core building blocks of technical security: identity, hardening, networks, vulnerabilities and logging. For IT support, sysadmin and graduate learners moving into security engineering.",
          duration: "5 weeks",
          modules: [
            { type: "text", title: "Security Principles in Practice", content: "Security engineering turns principles into working controls. Four principles guide most decisions.\n\n1. Least privilege: give people and systems only the access they need, for only as long as they need it.\n2. Defence in depth: layer controls so that if one fails, another still protects you. For example, MFA plus device compliance plus monitoring.\n3. Secure by default: new systems should start locked down, with features enabled deliberately.\n4. Assume breach: design so that a single compromised account or server cannot reach everything.\n\nThe CIA triad describes what we protect: confidentiality, integrity and availability. In many Nigerian organisations, availability needs special attention because power outages and unreliable links can interrupt services and logging; resilient design includes backup power for critical systems and local log buffering.\n\nWorked example: a payroll application is reachable from the internet with a shared admin password. Applying the principles, you place it behind SSO with MFA, give each admin a named account, restrict access to the corporate network or VPN, and send its logs to the SIEM." },
            { type: "text", title: "Identity and Access Management", content: "Identity is now the main security perimeter. Most breaches involve stolen or misused credentials.\n\nCore controls:\n- Multi-factor authentication (MFA): prefer phishing-resistant methods such as FIDO2 security keys or passkeys for admins; authenticator app number matching is better than SMS.\n- Single sign-on (SSO): one strong identity across applications, using standards such as SAML and OpenID Connect.\n- Conditional access: allow or block sign-ins based on user, device, location and risk.\n- Privileged access: separate admin accounts, just-in-time elevation and approval workflows.\n- Lifecycle: joiners, movers and leavers processes so access is added and removed on time.\n- Access reviews: managers confirm access is still needed, typically quarterly for sensitive systems.\n\nChecklist for a leaver: disable the account on the last day, revoke sessions and tokens, remove from groups, transfer data ownership, recover devices and rotate any shared secrets they knew.\n\nPoor leaver processes are a common audit finding, so automate them through the HR system where possible." },
            { type: "text", title: "Hardening and Vulnerability Management", content: "Hardening reduces the attack surface of systems. Benchmarks such as the CIS Benchmarks give tested, prescriptive settings for operating systems and cloud platforms.\n\nHardening checklist for a Linux server:\n- Apply all security updates and enable automatic security patching where safe.\n- Disable unused services and close unused ports.\n- Use SSH keys, disable root login and password authentication.\n- Enable a host firewall allowing only required traffic.\n- Configure logging and forward logs centrally.\n- Restrict file permissions on sensitive configuration.\n\nVulnerability management is a cycle: discover assets, scan, prioritise, remediate, verify and report. Prioritisation matters most. Consider:\n- Is it being exploited in the wild? The CISA Known Exploited Vulnerabilities catalogue helps.\n- Is the asset internet-facing?\n- How critical is the asset and its data?\n- What is the CVSS base score and is there an available exploit?\n\nWorked example: a medium-scored flaw in an internet-facing VPN that is actively exploited should usually be fixed before a critical-scored flaw on an isolated test server." },
            { type: "text", title: "Network Security and Logging", content: "Networks connect everything, so segmentation and visibility are essential.\n\nNetwork controls:\n- Segmentation: separate user, server, management and guest networks, and restrict traffic between them.\n- Firewalls: default deny, allow only documented business flows, review rules regularly and remove stale ones.\n- Remote access: use VPN or zero trust network access with MFA; never expose RDP directly to the internet.\n- DNS filtering: block known malicious domains.\n- Web application firewall: protect public web apps from common attacks.\n\nLogging enables detection and investigation. Priority log sources include identity provider sign-ins, endpoint EDR, firewalls and VPN, email, cloud control-plane logs and critical application logs.\n\nGood logging practice:\n- Synchronise time with NTP so timelines line up.\n- Protect logs from tampering and set retention to meet legal and investigative needs.\n- Check regularly that each source is still sending data, since a silent log source is a blind spot.\n\nWork closely with the SOC: they tell you what they need to see; you make sure it is collected reliably." },
            { type: "quiz", title: "Security Engineering Foundations Quiz", questions: [
              { q: "Which is the best example of least privilege?", options: ["Giving all IT staff Domain Admin rights", "Granting a developer temporary production read access for a specific task", "Sharing one admin account across the team", "Allowing everyone to install software"], answer: 1 },
              { q: "Which MFA method is most resistant to phishing?", options: ["SMS one-time codes", "Email codes", "Security questions", "FIDO2 security keys or passkeys"], answer: 3 },
              { q: "Which vulnerability should usually be fixed first?", options: ["An actively exploited flaw on an internet-facing VPN", "A low-risk flaw on an isolated test server", "A cosmetic issue in an internal wiki", "A flaw with no known exploit on a decommissioned host"], answer: 0 },
              { q: "Why is time synchronisation important for logging?", options: ["It reduces licence costs", "It encrypts logs", "It ensures events from different systems can be placed in an accurate timeline", "It speeds up the network"], answer: 2 },
              { q: "What does a default-deny firewall policy mean?", options: ["All traffic is allowed unless blocked", "Traffic is blocked unless explicitly allowed", "The firewall is turned off by default", "Only outbound traffic is blocked"], answer: 1 },
              { q: "Which step belongs in a secure leaver process?", options: ["Keep the account active for a month in case they return", "Revoke sessions and tokens and remove group memberships", "Share their password with their manager", "Delete all logs about the user"], answer: 1 }
            ] },
            { type: "assignment", title: "Harden and Document a Server", maxScore: 100, content: "In a provided lab virtual machine (Ubuntu Server), apply a hardening baseline based on the relevant CIS Benchmark, run a vulnerability scan before and after, and forward logs to a provided log collector.\nDeliverables: a hardening checklist showing each change and its justification; before and after scan summaries with your prioritisation of remaining issues; evidence that logs arrive centrally; and a short runbook for repeating the process.\nGrading: correctness of hardening 35%, quality of prioritisation 25%, logging evidence 15%, documentation clarity 25%." }
          ]
        },
        intensive: {
          title: "Security Engineer Intensive",
          summary: "Job-ready depth in cloud security, infrastructure as code, DevSecOps pipelines, secrets and container security, and security architecture. Ends with a level-aware build-and-defend capstone.",
          duration: "9 weeks",
          modules: [
            { type: "text", title: "Cloud Security Guardrails", content: "In cloud environments, security engineers build guardrails that prevent mistakes rather than chasing them afterwards.\n\nLayers of guardrails:\n- Organisation structure: separate accounts or subscriptions for production, non-production, security and logging.\n- Preventive policies: AWS Service Control Policies or Azure Policy deny risky actions, such as disabling logging or creating public storage.\n- Detective controls: AWS Security Hub, Microsoft Defender for Cloud or Wiz assess resources against benchmarks.\n- Identity: federated SSO, no long-lived user access keys, and roles with least privilege.\n- Central logging: control-plane logs sent to a locked-down logging account that workloads cannot alter.\n\nWorked example: a team keeps creating storage buckets that are public by mistake. Instead of emailing reminders, you enforce account-level block public access, add a policy that denies public bucket policies except through an approved exception tag, and alert on any policy change.\n\nData residency can matter for Nigerian organisations under NDPA 2023 and sector rules, so policies may also restrict which regions sensitive workloads can use." },
            { type: "text", title: "Infrastructure and Policy as Code", content: "Infrastructure as code (IaC) tools such as Terraform, Bicep and CloudFormation define infrastructure in version-controlled files. This lets security be reviewed and tested like software.\n\nSecurity practices for IaC:\n1. Store code in Git with protected branches and mandatory reviews.\n2. Scan templates with tools such as Checkov or Trivy to catch misconfigurations before deployment.\n3. Use secure, reusable modules (for example a hardened storage module) so teams get secure defaults.\n4. Protect state files, which can contain secrets, by encrypting and restricting access to them.\n5. Detect drift: alert when deployed resources differ from code.\n\nPolicy as code expresses rules in a machine-checkable form. Open Policy Agent (OPA) with the Rego language, or cloud-native policies, can block deployments that break rules such as all databases must be encrypted.\n\nWorked example: a pull request adds a security group allowing SSH from 0.0.0.0/0. The pipeline scan flags it, the policy blocks merge, and the developer receives a clear message explaining the approved alternative: access via the bastion or session manager." },
            { type: "text", title: "DevSecOps Pipelines and Supply Chain", content: "A secure pipeline gives developers fast, accurate feedback without blocking every release.\n\nCommon checks:\n- Secret scanning: catch keys and passwords before they reach the repository; enable push protection.\n- SAST: static analysis of source code for flaws such as injection.\n- SCA: software composition analysis to find vulnerable or malicious open-source dependencies.\n- Container scanning: check images for vulnerable packages and misconfigurations.\n- IaC scanning: as covered earlier.\n\nDesign principles:\n- Gate builds only on high-confidence, high-severity issues; report the rest as warnings with owners.\n- Give fix guidance inside pull requests.\n- Track metrics such as mean time to remediate.\n\nSupply chain security is now essential. Generate a software bill of materials (SBOM), pin dependency versions, sign build artefacts (for example with Sigstore cosign) and follow the SLSA framework to protect build integrity.\n\nIf a secret leaks, rotate it immediately, check logs for misuse, then fix the root cause, such as moving to a secrets manager like HashiCorp Vault or cloud key vaults." },
            { type: "text", title: "Containers, Kubernetes and Architecture", content: "Containers and Kubernetes are common in fintech and telco platforms. Key controls:\n- Images: minimal base images, regular rebuilds, scanning and signing.\n- Runtime: run as non-root, read-only file systems and drop unneeded Linux capabilities.\n- Kubernetes: role-based access control with least privilege, Pod Security Standards (restricted profile), network policies to limit pod-to-pod traffic and secrets stored encrypted or in an external manager.\n- Monitoring: audit logs and runtime detection with tools such as Falco.\n\nSecurity architecture ties controls together. Zero trust architecture, described in NIST SP 800-207, means no implicit trust based on network location: every request is authenticated, authorised and evaluated using identity, device health and context.\n\nThreat modelling helps design the right controls early. Using STRIDE (spoofing, tampering, repudiation, information disclosure, denial of service, elevation of privilege), walk through a data flow diagram and ask what could go wrong at each step.\n\nWorked example: for a USSD-to-wallet service, threat modelling might highlight spoofed partner requests, so you require mutual TLS and signed requests between partners." },
            { type: "assignment", title: "Secure Pipeline Build", maxScore: 100, content: "Using a provided sample application repository, build a CI pipeline (GitHub Actions or GitLab CI) that includes secret scanning, SAST, dependency scanning, container image scanning and IaC scanning.\nDeliverables: the pipeline configuration; a gating policy explaining what blocks a build and why; evidence of the pipeline catching seeded issues; and a one-page developer guide on resolving findings, including how to request a time-limited exception.\nGrading: pipeline completeness and correctness 35%, sensible gating policy 25%, evidence of detection 20%, developer guidance 20%." },
            { type: "quiz", title: "Security Engineer Intensive Quiz", questions: [
              { q: "What is the main advantage of preventive guardrails such as Service Control Policies?", options: ["They stop risky configurations before they happen", "They make the cloud cheaper", "They replace the need for logging", "They speed up deployments"], answer: 0 },
              { q: "Why must Terraform state files be protected?", options: ["They are very large", "They control billing", "They can contain sensitive values such as secrets", "They are required by DNS"], answer: 2 },
              { q: "A secret was pushed to a public repository. What is the first priority?", options: ["Delete the commit and do nothing else", "Rotate or revoke the secret immediately", "Make the repository private and continue", "Wait for the next audit"], answer: 1 },
              { q: "What does an SBOM provide?", options: ["A list of firewall rules", "A record of user sign-ins", "A list of cloud costs", "An inventory of components and dependencies in software"], answer: 3 },
              { q: "Which Kubernetes control limits which pods can talk to each other?", options: ["Network policies", "Horizontal pod autoscaling", "ConfigMaps", "Liveness probes"], answer: 0 },
              { q: "What is a core principle of zero trust architecture?", options: ["Trust everything inside the corporate network", "Evaluate every request using identity and context rather than network location", "Disable MFA for internal users", "Use a single firewall at the perimeter"], answer: 1 }
            ] },
            { type: "assignment", title: "Capstone: Secure a Fintech Platform", maxScore: 100, content: "Shared brief: a fictional Nigerian payments startup runs a containerised API on a public cloud with a CI/CD pipeline, an identity provider and minimal logging. It is preparing for a partner bank’s security review.\nJunior: harden the provided cloud account and server configurations against benchmarks, enable MFA and core logging, and document each change.\nMid: implement guardrails as code, secure the pipeline with appropriate scanning and gates, move secrets to a secrets manager and harden the Kubernetes workloads.\nSenior: produce a threat model and target security architecture, a prioritised 12-month roadmap with metrics, and a briefing for the partner bank explaining controls and residual risk.\nDeliverables: code or configuration, evidence of controls working and level-specific documents above.\nGrading: technical correctness 35%, risk prioritisation 25%, automation and maintainability 20%, documentation and communication 20%." }
          ]
        }
      }
    },
    {
      id: "grc",
      title: "GRC Analyst",
      summary: "A GRC (Governance, Risk and Compliance) Analyst helps an organisation manage cyber risk by maintaining policies, assessing risks and third parties, and evidencing compliance with standards and regulations. The role sits in the security or risk function, working with IT, legal, internal audit and business units.",
      competencies: [
        { name: "Risk assessment and treatment", weight: 25, description: "Identifies, rates and tracks information security risks and agrees proportionate treatment with risk owners." },
        { name: "Standards and regulatory knowledge", weight: 25, description: "Applies frameworks and laws such as ISO/IEC 27001:2022, NIST CSF 2.0, PCI DSS and NDPA 2023 to real environments." },
        { name: "Control testing and audit readiness", weight: 20, description: "Designs and performs control tests, gathers sufficient evidence and manages audit findings to closure." },
        { name: "Policy and governance", weight: 15, description: "Writes clear, enforceable policies and standards and supports governance forums and reporting." },
        { name: "Third-party risk management", weight: 15, description: "Assesses vendor and partner security, including data sharing and contractual controls." }
      ],
      levels: {
        junior: {
          minYears: 0,
          focus: "Trusted to gather evidence, maintain registers and support assessments and audits under the direction of senior GRC staff.",
          responsibilities: [
            "Collect and organise control evidence for internal and external audits",
            "Maintain the risk register, asset inventory and policy library and keep records up to date",
            "Send and track vendor security questionnaires and flag incomplete or concerning answers",
            "Support control testing by following defined test procedures and recording results",
            "Track remediation actions from audits and assessments and chase owners for updates"
          ],
          skills: [
            "Evidence collection",
            "Risk register maintenance",
            "ISO 27001 fundamentals",
            "NDPA 2023 basics",
            "Vendor questionnaire review",
            "Clear business writing",
            "Spreadsheet analysis"
          ],
          tools: ["Microsoft Excel", "ServiceNow GRC", "Microsoft Purview Compliance Manager", "SharePoint", "Jira", "Vanta"],
          certifications: ["ISC2 Certified in Cybersecurity (CC)", "CompTIA Security+", "ISO/IEC 27001 Foundation"],
          aiTopics: [
            "The difference between governance, risk and compliance",
            "Structure and purpose of ISO/IEC 27001:2022 and its Annex A controls",
            "Key principles and obligations of the Nigeria Data Protection Act 2023",
            "What makes audit evidence sufficient and reliable",
            "Basic risk concepts: threat, vulnerability, likelihood and impact"
          ],
          aiScenarios: [
            "An auditor asks for evidence that user access to the core banking system is reviewed quarterly. Walk me through how you would gather it and what good evidence looks like.",
            "A vendor returns a security questionnaire answering yes to everything with no supporting documents. What do you do next?",
            "A control owner keeps missing deadlines to close an audit finding. How would you handle it?"
          ],
          aiExpectations: "A ready junior understands core GRC concepts, is organised and accurate with evidence and communicates clearly with control owners. Red flags are treating compliance as box-ticking, accepting unsupported claims as evidence, or being unable to explain why a control matters.",
          proQuestions: [
            { q: "What is the difference between a policy, a standard and a procedure?", lookFor: "Policy sets intent, standard sets mandatory specifics and procedure gives step-by-step instructions, with an example of each." },
            { q: "Describe a time you organised a lot of information to meet a deadline.", lookFor: "Structured approach, tracking, prioritisation and accurate results delivered on time." },
            { q: "What makes evidence acceptable to an auditor?", lookFor: "Relevant, complete, dated, from a reliable source and covering the full period under review, not just a screenshot from today." },
            { q: "Explain what the NDPA 2023 requires when an organisation processes personal data.", lookFor: "Lawful basis, purpose limitation, data minimisation, security safeguards, data subject rights and breach notification duties." },
            { q: "How would you explain the value of a security control to a non-technical manager?", lookFor: "Links the control to business risk and outcomes in plain language without jargon." }
          ]
        },
        mid: {
          minYears: 2,
          focus: "Trusted to run risk assessments, control testing and compliance programmes for defined frameworks and business areas.",
          responsibilities: [
            "Lead information security risk assessments and agree treatment plans with risk owners",
            "Design and perform control tests for frameworks such as ISO/IEC 27001:2022, PCI DSS and the CBN cybersecurity framework",
            "Conduct third-party risk assessments for critical vendors and recommend contract security clauses",
            "Coordinate external audits and certification activities from planning to finding closure",
            "Support data protection compliance, including data protection impact assessments under NDPA 2023"
          ],
          skills: [
            "Risk assessment facilitation",
            "Control test design",
            "PCI DSS v4.0",
            "Third-party risk assessment",
            "Data protection impact assessments",
            "Audit coordination",
            "Framework mapping"
          ],
          tools: ["ServiceNow GRC", "Archer", "OneTrust", "Microsoft Purview Compliance Manager", "Power BI", "Drata"],
          certifications: ["ISACA Certified Information Systems Auditor (CISA)", "ISACA Certified in Risk and Information Systems Control (CRISC)", "PECB ISO/IEC 27001 Lead Implementer"],
          aiTopics: [
            "Running a risk assessment workshop and calibrating likelihood and impact",
            "Designing control tests for design and operating effectiveness",
            "Mapping controls across ISO 27001, NIST CSF 2.0 and sector regulations",
            "Third-party and cloud provider risk assessment",
            "Data protection impact assessments and cross-border data transfer rules"
          ],
          aiScenarios: [
            "A business unit wants to share customer data with a new mobile-money partner within two weeks. Walk me through the risk and data protection assessment you would run.",
            "Your control test shows that 20% of leavers kept system access for more than 30 days. How do you report and follow up on this?",
            "The organisation must comply with ISO 27001, PCI DSS and the CBN framework, and teams complain of duplicate audits. How would you reduce the burden?"
          ],
          aiExpectations: "A ready mid-level analyst runs assessments independently, tests controls with sound sampling and evidence, and gives practical, risk-based recommendations. Red flags are generic risk statements, rating everything high, or recommending controls without considering business impact and cost.",
          proQuestions: [
            { q: "Walk me through a risk assessment you led from scoping to treatment.", lookFor: "Clear scope, stakeholder involvement, consistent rating method, agreed treatments with owners and follow-up." },
            { q: "How do you test whether a control is operating effectively?", lookFor: "Defines the test, selects a justified sample over the period, inspects evidence, documents exceptions and concludes clearly." },
            { q: "How do you assess the security of a critical vendor?", lookFor: "Tiering by risk, evidence such as ISO 27001 certificates or SOC 2 reports, review of gaps, contract clauses and ongoing monitoring." },
            { q: "Describe a time you pushed back on a business request for compliance or risk reasons.", lookFor: "Understood the goal, explained risk clearly, offered alternatives and reached an agreed, documented outcome." },
            { q: "How would you approach a data protection impact assessment for a new product?", lookFor: "Describes processing, necessity and proportionality, risks to data subjects, mitigations and consultation with the DPO." }
          ]
        },
        senior: {
          minYears: 5,
          focus: "Trusted to own the cyber risk and compliance programme, advise senior leadership and the board, and lead the GRC team.",
          responsibilities: [
            "Own the information security management system and the enterprise cyber risk framework",
            "Report cyber risk posture and key risk indicators to executive committees and the board",
            "Lead regulatory engagement and examinations with bodies such as the CBN and NDPC",
            "Set the compliance strategy across multiple frameworks and drive continuous control monitoring",
            "Mentor GRC staff and build risk ownership culture across business units"
          ],
          skills: [
            "Cyber risk strategy",
            "Board-level reporting",
            "Regulatory engagement",
            "ISMS ownership",
            "Risk appetite definition",
            "Continuous control monitoring",
            "Team leadership"
          ],
          tools: ["ServiceNow GRC", "Archer", "OneTrust", "Power BI", "Microsoft Purview", "SecurityScorecard"],
          certifications: ["ISACA Certified Information Security Manager (CISM)", "ISACA Certified in Risk and Information Systems Control (CRISC)", "Certified Information Systems Security Professional (CISSP)"],
          aiTopics: [
            "Defining risk appetite and key risk indicators for cyber risk",
            "Board and executive reporting of cyber risk",
            "Managing regulatory examinations and remediation commitments",
            "Integrating cyber risk with enterprise risk management",
            "Quantifying cyber risk to support investment decisions"
          ],
          aiScenarios: [
            "The board asks whether the organisation is secure enough after a competitor’s publicised breach. How do you prepare and present your answer?",
            "A regulator’s examination finds weaknesses in third-party risk management with a deadline for remediation. How do you lead the response?",
            "You have budget for three major risk-reduction initiatives next year. How do you choose and justify them?"
          ],
          aiExpectations: "A ready senior frames cyber risk in business terms, builds programmes that improve real security rather than just audit results, and earns trust from leadership and regulators. Red flags are compliance-only thinking, unrealistic commitments to regulators, or reports that leaders cannot use to make decisions.",
          proQuestions: [
            { q: "How have you defined or used risk appetite to drive security decisions?", lookFor: "Clear appetite statements linked to measurable thresholds and examples of decisions made against them." },
            { q: "Describe a board or executive cyber risk report you produced. What decisions did it support?", lookFor: "Concise, business-framed metrics and trends, clear asks and evidence of decisions taken." },
            { q: "How do you manage a regulatory examination?", lookFor: "Preparation, single point of coordination, accurate evidence, honest engagement and realistic, tracked remediation plans." },
            { q: "How do you make sure compliance improves actual security rather than just passing audits?", lookFor: "Focus on control effectiveness, incident and threat data, continuous monitoring and outcome metrics." },
            { q: "How have you built risk ownership in business units?", lookFor: "Clear accountability, training, risk champions, regular reviews and leadership sponsorship." }
          ]
        }
      },
      hrScenarios: [
        { q: "A senior manager asks you to mark a control as effective because the audit is tomorrow, even though testing found gaps. What do you do?", lookFor: "Refuses to misrepresent results, explains the consequences, offers to document the gap with a remediation plan and escalates if pressured." },
        { q: "Teams see GRC as a blocker and avoid involving you early. How would you change that perception?", lookFor: "Builds relationships, makes processes simpler, gives practical guidance early and shows how GRC helps teams deliver safely." },
        { q: "You discover that a colleague has been storing audit evidence containing customer personal data in a personal cloud drive. How do you handle it?", lookFor: "Addresses it promptly and respectfully, ensures the data is secured and removed, reports through proper channels and suggests a better process." }
      ],
      curriculum: {
        foundational: {
          title: "GRC Foundations",
          summary: "Introduces governance, risk and compliance for cybersecurity: frameworks, risk basics, Nigerian data protection law and audit evidence. For graduates, auditors and IT staff moving into GRC.",
          duration: "4 weeks",
          modules: [
            { type: "text", title: "What GRC Means in Cybersecurity", content: "Governance, Risk and Compliance (GRC) ensures that security is directed, prioritised and evidenced.\n\n- Governance: who decides and who is accountable. It includes policies, roles such as the CISO and data protection officer, committees and reporting to leadership.\n- Risk: identifying what could go wrong, how likely it is and how bad it would be, then deciding how to treat it.\n- Compliance: showing that the organisation meets laws, regulations, contracts and standards it has committed to.\n\nCommon frameworks:\n- ISO/IEC 27001:2022: an international standard for an information security management system (ISMS), with 93 Annex A controls grouped into organisational, people, physical and technological themes.\n- NIST Cybersecurity Framework 2.0: six functions: Govern, Identify, Protect, Detect, Respond and Recover.\n- PCI DSS v4.0: requirements for organisations handling payment card data.\n\nIn Nigeria, key obligations include the Nigeria Data Protection Act 2023 and sector rules such as the CBN’s cybersecurity framework for banks and payment service providers. A good GRC analyst understands that compliance is the minimum; the goal is real, managed risk." },
            { type: "text", title: "Risk Management Basics", content: "Risk combines the likelihood of something happening with its impact. Key terms:\n- Asset: something of value, such as customer data or a payment system.\n- Threat: something that could cause harm, such as ransomware or a careless insider.\n- Vulnerability: a weakness a threat could exploit, such as missing MFA.\n- Control: a measure that reduces likelihood or impact.\n\nA simple process:\n1. Identify assets and their owners.\n2. Identify threats and vulnerabilities.\n3. Rate likelihood and impact, for example on a 1 to 5 scale, using agreed definitions.\n4. Compare with risk appetite.\n5. Treat: mitigate, transfer (for example insurance), avoid or accept.\n6. Record in the risk register and review regularly.\n\nWorked example: Risk statement: Because remote staff access the HR system without MFA, an attacker using phished credentials could access employee personal data, leading to regulatory penalties under NDPA 2023 and reputational harm. Likelihood 4, impact 4. Treatment: enforce MFA within 30 days, owner: Head of IT. A good risk statement names cause, event and consequence." },
            { type: "text", title: "Data Protection under the NDPA 2023", content: "The Nigeria Data Protection Act 2023 (NDPA) is Nigeria’s main data protection law, enforced by the Nigeria Data Protection Commission (NDPC).\n\nCore principles: personal data must be processed lawfully, fairly and transparently; collected for specified purposes; adequate and limited to what is necessary; accurate; kept no longer than needed; and protected with appropriate security.\n\nKey obligations for organisations:\n- Have a lawful basis, such as consent, contract or legal obligation.\n- Respect data subject rights, including access, correction, erasure and objection.\n- Conduct a data protection impact assessment for high-risk processing.\n- Apply appropriate technical and organisational security measures.\n- Notify the NDPC within 72 hours of becoming aware of a breach likely to risk individuals’ rights and freedoms, and inform affected individuals where the risk is high.\n- Control cross-border transfers of personal data.\n- Data controllers and processors of major importance must register with the NDPC and appoint a data protection officer.\n\nGRC analysts help by keeping records of processing, supporting impact assessments, reviewing vendor contracts and checking that security controls match the sensitivity of the data." },
            { type: "text", title: "Controls, Evidence and Audits", content: "Controls are only trusted if they can be evidenced. Auditors test two things:\n- Design: is the control capable of addressing the risk if it works as described?\n- Operating effectiveness: did it actually work consistently over the review period?\n\nGood evidence is relevant, complete, dated, from a reliable system and covers the period. For example, to prove quarterly access reviews, provide the review reports for each quarter, showing reviewer sign-off, dates and actions taken on inappropriate access, not just a policy saying reviews happen.\n\nEvidence checklist:\n- Is it system-generated or verifiable?\n- Does it show who, what and when?\n- Does it cover the full period or the selected sample?\n- Are exceptions explained and followed up?\n\nAudit findings are tracked to closure with an owner, action and due date. Chasing politely but persistently is part of the job. Keep evidence in a controlled repository with access restrictions, especially when it contains personal data, and redact information that auditors do not need." },
            { type: "quiz", title: "GRC Foundations Quiz", questions: [
              { q: "Which best describes governance in cybersecurity?", options: ["Installing firewalls", "Defining direction, accountability and oversight for security", "Running vulnerability scans", "Writing source code"], answer: 1 },
              { q: "Which NIST CSF 2.0 function was newly added in version 2.0?", options: ["Protect", "Detect", "Recover", "Govern"], answer: 3 },
              { q: "Which is a well-formed risk statement?", options: ["Because remote access lacks MFA, phished credentials could expose HR data, causing regulatory penalties", "Hackers are bad", "Security is weak", "We need more budget"], answer: 0 },
              { q: "Under NDPA 2023, what is the expected timeframe for notifying the NDPC of a qualifying personal data breach?", options: ["30 days", "7 days", "72 hours", "There is no requirement"], answer: 2 },
              { q: "What does testing operating effectiveness of a control check?", options: ["Whether the policy is well written", "Whether the control worked consistently over the review period", "Whether the control is expensive", "Whether staff like the control"], answer: 1 },
              { q: "Which is the strongest evidence of quarterly user access reviews?", options: ["A policy stating reviews happen quarterly", "A verbal confirmation from IT", "A screenshot of today’s user list", "Signed and dated review records for each quarter with actions taken"], answer: 3 }
            ] },
            { type: "assignment", title: "Mini Risk Assessment and Evidence Pack", maxScore: 100, content: "You are given a short case study of a Nigerian microfinance bank introducing a new customer onboarding app.\nDeliverables: a risk register with at least six well-formed risks, ratings and treatments with owners; a short list of NDPA 2023 obligations relevant to the app; and an evidence request list for three key controls with what good evidence looks like. Assume the bank also serves customers through agents with limited connectivity.\nGrading: quality of risk statements and ratings 35%, accuracy of regulatory points 25%, evidence requests 25%, clarity and structure 15%." }
          ]
        },
        intensive: {
          title: "GRC Analyst Intensive",
          summary: "Job-ready depth in ISMS implementation, control testing, third-party risk, multi-framework compliance and risk reporting. Ends with a level-aware compliance programme capstone.",
          duration: "8 weeks",
          modules: [
            { type: "text", title: "Building and Running an ISMS", content: "ISO/IEC 27001:2022 requires an information security management system (ISMS): a structured way to manage security risk that improves over time.\n\nKey clauses (4 to 10):\n- Context and scope: what the ISMS covers and which interested parties matter.\n- Leadership: top management commitment and an information security policy.\n- Planning: risk assessment and treatment, producing a Statement of Applicability (SoA) that lists which Annex A controls apply and why.\n- Support: resources, competence, awareness and documented information.\n- Operation: carrying out risk treatment.\n- Performance evaluation: monitoring, internal audit and management review.\n- Improvement: nonconformities and corrective action.\n\nCertification involves a Stage 1 audit (documentation and readiness) and a Stage 2 audit (implementation), followed by surveillance audits.\n\nWorked example: a fintech scopes its ISMS to its payment platform and supporting teams, rather than the whole group, to reach certification faster. The scope statement must be clear about locations, systems and processes included, and justify exclusions so that customers and auditors understand what the certificate covers." },
            { type: "text", title: "Control Testing and Sampling", content: "Control testing provides assurance that controls work. A test plan defines:\n- Control objective and description.\n- Test type: inquiry, observation, inspection or re-performance. Inquiry alone is never sufficient.\n- Population and period: for example all user terminations from January to June.\n- Sample size and selection method.\n- Pass criteria and how exceptions are handled.\n\nSampling guidance varies, but a common approach scales sample size with control frequency: a few samples for quarterly controls, more for daily or frequent controls. Select samples randomly from a complete population, and confirm that the population itself is complete.\n\nWorked example: testing leaver access removal. Obtain the HR termination list for the period, select 25 leavers at random, and check the system access logs for when each account was disabled. Policy says within 24 hours. You find five disabled late. Report the exception rate, root causes (for example HR notifications sent by email and missed) and recommend automating deprovisioning from the HR system.\n\nDocument working papers so another reviewer could reach the same conclusion." },
            { type: "text", title: "Third-Party and Cloud Risk", content: "Many incidents start at suppliers, so third-party risk management (TPRM) is a core GRC activity.\n\nLifecycle:\n1. Inventory: know every vendor and what data or access they have.\n2. Tiering: rate vendors by criticality and data sensitivity, so effort goes where risk is highest.\n3. Due diligence: questionnaires plus evidence such as ISO 27001 certificates (check the scope), SOC 2 Type II reports, penetration test summaries and data protection terms.\n4. Contracting: security and data protection clauses, breach notification timelines, audit rights, data location and exit arrangements.\n5. Ongoing monitoring: periodic reassessment, security rating services and incident notifications.\n6. Offboarding: confirm data return or deletion and access removal.\n\nCloud providers operate a shared responsibility model: the provider secures the underlying infrastructure; the customer secures identities, configuration and data.\n\nUnder NDPA 2023, transferring personal data outside Nigeria requires an adequate level of protection or another valid basis, so data location and transfer mechanisms must be confirmed for vendors processing Nigerian personal data." },
            { type: "text", title: "Multi-Framework Compliance and Reporting", content: "Most organisations face several overlapping requirements, such as ISO 27001, PCI DSS, the CBN cybersecurity framework and NDPA 2023. Testing each separately wastes effort and frustrates teams.\n\nA unified control framework solves this:\n1. Build a common control set.\n2. Map each control to every requirement it satisfies.\n3. Test once, use the evidence many times.\n4. Track gaps where a framework has unique requirements.\n\nGRC platforms help maintain mappings, schedule tests and automate evidence collection from cloud and identity systems, moving towards continuous control monitoring.\n\nReporting must suit the audience:\n- Operational teams: specific findings, owners and dates.\n- Management: trends, overdue actions and top risks.\n- Board: risk posture against appetite, key risk indicators, major incidents and decisions needed.\n\nWorked example of a key risk indicator: percentage of critical systems with MFA enforced, with a threshold of 100% and a trigger for escalation below 95%. Good indicators are measurable, linked to a risk and reviewed regularly, so they prompt action rather than just filling slides." },
            { type: "assignment", title: "Control Testing Workpaper", maxScore: 100, content: "You are given six months of joiner, mover and leaver records from HR and system access logs for a fictional Nigerian bank.\nDeliverables: a test plan for two access management controls; a sample selection with justification; completed workpapers recording results and exceptions; and a findings memo with root causes and risk-based recommendations addressed to the Head of IT, with suggested owners and due dates for each action.\nGrading: test design 25%, sampling and accuracy 30%, quality of exception analysis 25%, clarity of findings memo 20%." },
            { type: "quiz", title: "GRC Intensive Quiz", questions: [
              { q: "What does an ISO 27001 Statement of Applicability document?", options: ["The organisation’s financial results", "The list of Annex A controls, whether they apply and why", "Employee job descriptions", "The penetration test report"], answer: 1 },
              { q: "Why is inquiry alone not sufficient for control testing?", options: ["It takes too long", "Auditors do not talk to staff", "It does not provide objective evidence that the control operated", "It is prohibited by ISO 27001"], answer: 2 },
              { q: "When reviewing a vendor’s ISO 27001 certificate, what should you check?", options: ["That its scope covers the services you use", "The colour of the logo", "Only the issue date", "Nothing; any certificate is sufficient"], answer: 0 },
              { q: "In the cloud shared responsibility model, who typically secures user identities and resource configuration?", options: ["The cloud provider", "The regulator", "The internet service provider", "The customer"], answer: 3 },
              { q: "What is the main benefit of a unified control framework?", options: ["It removes the need for audits", "Testing a control once can provide evidence for multiple frameworks", "It eliminates all risks", "It replaces policies"], answer: 1 },
              { q: "Which is the best key risk indicator?", options: ["Percentage of critical systems with MFA enforced, with defined thresholds", "Number of security meetings held", "Total pages of policy written", "Number of emails sent by the CISO"], answer: 0 }
            ] },
            { type: "assignment", title: "Capstone: Compliance Programme for a Payments Company", maxScore: 100, content: "Shared brief: a fictional Nigerian payment service provider must prepare for ISO/IEC 27001:2022 certification, a PCI DSS assessment and NDPA 2023 compliance, while onboarding two new cloud vendors.\nJunior: build the evidence tracker and policy inventory, complete vendor questionnaire reviews and prepare evidence for five specified controls.\nMid: run the risk assessment, draft the Statement of Applicability, test three key controls with workpapers and complete a third-party risk assessment for one vendor.\nSenior: design the unified control framework and compliance roadmap, define risk appetite and key risk indicators, and present a board-ready cyber risk report with decisions required.\nDeliverables: level-specific documents above, plus a one-page summary of top risks and next steps.\nGrading: accuracy of framework and regulatory application 30%, risk judgement 25%, quality of evidence and testing 25%, communication 20%." }
          ]
        }
      }
    }
  ]
};

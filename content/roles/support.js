// NexIT-Africa role catalog: IT Support area
export default {
  key: "support",
  title: "IT Support",
  summary: "IT Support keeps people, devices, systems and networks working so the business can operate. Roles range from first-line help desk and desktop support to the administrators who run servers, identity and networks.",
  roles: [
    {
      id: "helpdesk",
      title: "IT Help Desk Technician",
      summary: "Help desk technicians are the first point of contact for users with IT problems, logging, triaging and resolving tickets by phone, chat, email and remote session. They sit on the service desk (Tier 1–2), escalate what they cannot fix to desktop, systems or network teams, and shape how users experience IT.",
      competencies: [
        { name: "Troubleshooting method", weight: 25, description: "Applies a structured, repeatable approach to isolate and resolve faults rather than guessing." },
        { name: "Ticketing and ITSM practice", weight: 20, description: "Logs, categorises, prioritises and documents tickets accurately against SLAs and ITIL-aligned processes." },
        { name: "Identity and account support", weight: 20, description: "Handles password resets, MFA, account unlocks and access requests securely, with identity verification." },
        { name: "End-user OS and applications", weight: 20, description: "Resolves common Windows, macOS, mobile and Microsoft 365 issues for end users." },
        { name: "Customer communication", weight: 15, description: "Explains technical issues clearly, manages expectations and keeps users updated through to closure." }
      ],
      levels: {
        junior: {
          minYears: 0,
          focus: "Trusted to log and resolve common Tier 1 requests using documented procedures and escalate cleanly when stuck.",
          responsibilities: [
            "Answer calls, chats and emails and log every contact as a ticket with clear categorisation",
            "Resolve password resets, account unlocks and MFA re-registration after verifying the caller’s identity",
            "Fix common Outlook, Teams, printer and Wi-Fi issues using the knowledge base",
            "Escalate unresolved tickets to Tier 2 with full notes, steps tried and evidence",
            "Keep users informed of ticket status and confirm resolution before closing"
          ],
          skills: [
            "Ticket logging",
            "Password reset procedures",
            "Windows 11 basics",
            "Microsoft 365 support",
            "Remote support sessions",
            "Basic network troubleshooting",
            "Customer service communication"
          ],
          tools: ["Jira Service Management", "Freshservice", "Microsoft Entra ID", "Microsoft 365 admin center", "AnyDesk", "TeamViewer"],
          certifications: ["CompTIA A+", "ITIL 4 Foundation"],
          aiTopics: [
            "Structured troubleshooting steps for a common end-user fault",
            "Identity verification before account changes",
            "Ticket prioritisation by impact and urgency",
            "Basic connectivity checks (IP, DNS, Wi-Fi)",
            "Writing clear ticket notes and escalations"
          ],
          aiScenarios: [
            "A user calls saying they cannot log in to their laptop after a password change. Walk me through how you handle it from first contact to closure.",
            "Several users in one office report Outlook will not connect but the internet works. What do you check and when do you escalate?",
            "A caller claims to be a director and urgently demands a password reset for their account. How do you respond?"
          ],
          aiExpectations: "A ready junior verifies identity, asks good questions, follows a logical sequence of checks and documents clearly. Red flags are skipping verification, guessing fixes without isolating the problem, or closing tickets without confirming with the user.",
          proQuestions: [
            { q: "Tell me about a time you resolved a user’s problem that you had never seen before. How did you work it out?", lookFor: "A clear method: gathered symptoms, reproduced, searched KB/vendor docs, tested one change at a time and documented the fix." },
            { q: "How do you decide whether a ticket is P1, P2 or P3?", lookFor: "Uses impact (how many users/business-critical) and urgency, gives examples, and knows when to inform a supervisor." },
            { q: "Walk me through how you verify a caller before resetting their password.", lookFor: "Specific verification steps (callback to known number, manager approval, MFA prompt) and refusal to bypass under pressure." },
            { q: "Describe a time you had to escalate. What did your escalation note contain?", lookFor: "Symptoms, scope, steps tried, evidence such as screenshots/error codes, and user impact so Tier 2 need not re-ask." },
            { q: "A user is angry because their issue has been open for two days. How do you handle the call?", lookFor: "Acknowledges frustration, reviews history, sets a realistic next step and time, follows up proactively." }
          ]
        },
        mid: {
          minYears: 2,
          focus: "Trusted to own Tier 2 tickets end to end, handle complex user issues and improve knowledge base content.",
          responsibilities: [
            "Resolve Tier 2 issues across Windows, macOS, mobile devices and Microsoft 365 that Tier 1 cannot close",
            "Manage user onboarding and offboarding, including licences, groups, mailboxes and device handover",
            "Write and maintain knowledge base articles based on recurring tickets",
            "Spot repeat incidents and raise problem records with evidence",
            "Coach Tier 1 colleagues on troubleshooting and ticket quality"
          ],
          skills: [
            "Tier 2 troubleshooting",
            "Microsoft Entra ID administration",
            "Exchange Online support",
            "Intune device enrolment",
            "Knowledge base authoring",
            "Joiner-mover-leaver processes",
            "SLA management"
          ],
          tools: ["ServiceNow", "Jira Service Management", "Microsoft Intune", "Microsoft Entra ID", "Exchange admin center", "Confluence"],
          certifications: ["CompTIA A+", "ITIL 4 Foundation", "Microsoft 365 Certified: Endpoint Administrator Associate"],
          aiTopics: [
            "Microsoft 365 licensing, mailbox and Teams issues",
            "Device enrolment and compliance in Intune",
            "Onboarding and offboarding security steps",
            "Identifying repeat incidents and root causes",
            "Knowledge base quality and ticket deflection"
          ],
          aiScenarios: [
            "A new hire starts Monday and nothing is ready on Friday afternoon. Walk me through what you set up and in what order.",
            "The same VPN error has generated 30 tickets this week. How do you move from fixing tickets to fixing the cause?",
            "An employee leaves on bad terms today. What do you do in the next hour to secure their accounts and data?"
          ],
          aiExpectations: "A ready mid-level technician resolves issues independently, thinks about patterns across tickets and handles access changes with security in mind. Red flags are treating every ticket in isolation, weak offboarding practice, or no habit of documenting fixes for others.",
          proQuestions: [
            { q: "Tell me about a knowledge base article you wrote that reduced tickets. How did you know it worked?", lookFor: "Identified a recurring issue, wrote clear steps, and measured reduced volume or faster resolution." },
            { q: "Describe your offboarding checklist for a leaver with access to finance systems.", lookFor: "Disable sign-in, revoke sessions and MFA, transfer mailbox/OneDrive, remove group access, recover devices, document with HR/manager." },
            { q: "Give an example of a problem you noticed across multiple tickets. What did you do about it?", lookFor: "Linked incidents, gathered evidence, raised a problem record or worked with another team to fix the root cause." },
            { q: "How have you helped a Tier 1 colleague improve?", lookFor: "Specific coaching (ticket review, shadowing, shared checklists) and an observable improvement." },
            { q: "Walk me through troubleshooting a device that shows as non-compliant in Intune.", lookFor: "Checks compliance policy, sync status, OS version, encryption/BitLocker, and Conditional Access impact in a logical order." }
          ]
        },
        senior: {
          minYears: 5,
          focus: "Trusted to lead the service desk’s day-to-day quality, handle major incidents from the user side and improve processes and metrics.",
          responsibilities: [
            "Lead a shift or team of technicians, balancing queue workload and SLA performance",
            "Coordinate user communications during major incidents and outages",
            "Own service desk metrics such as first-contact resolution, SLA compliance and CSAT, and act on trends",
            "Design and improve ticket categories, escalation paths and self-service options",
            "Mentor technicians and run onboarding and training for new service desk staff"
          ],
          skills: [
            "Service desk leadership",
            "Major incident communication",
            "ITSM process design",
            "Service desk metrics",
            "Self-service portal design",
            "Staff coaching and mentoring",
            "Stakeholder management"
          ],
          tools: ["ServiceNow", "Jira Service Management", "Freshservice", "Microsoft Power BI", "Microsoft Intune", "Statuspage"],
          certifications: ["ITIL 4 Foundation", "HDI Support Center Team Lead", "ITIL 4 Specialist: Create, Deliver and Support"],
          aiTopics: [
            "Major incident handling from the service desk perspective",
            "Designing escalation paths and ticket categories",
            "Using metrics to improve service quality",
            "Shift scheduling and workload balancing",
            "Self-service and automation to deflect tickets"
          ],
          aiScenarios: [
            "Email is down for the whole company at 9am Monday and the phones are ringing non-stop. How do you run the desk for the next two hours?",
            "First-contact resolution has dropped from a healthy level over three months. How do you find out why and fix it?",
            "Leadership wants to cut ticket volume using self-service and AI chat. How would you approach it without hurting user experience?"
          ],
          aiExpectations: "A ready senior leads calmly during incidents, uses data to drive improvements and develops their team. Red flags are measuring only ticket counts, no plan for user communication, or improving metrics in ways that hide real problems.",
          proQuestions: [
            { q: "Tell me about a major incident where you coordinated the service desk response. What did you communicate and when?", lookFor: "Fast acknowledgement, a single status channel, regular updates, a known-error script for agents and a post-incident review." },
            { q: "Which service desk metrics do you track, and give an example of one you improved.", lookFor: "FCR, SLA, CSAT, backlog age; explains the cause they found, action taken and the result without gaming the number." },
            { q: "Describe a process change you introduced that the team resisted. How did you handle it?", lookFor: "Explained the why, involved the team, piloted, adjusted on feedback and showed results." },
            { q: "How do you develop a new technician into a confident Tier 2 engineer?", lookFor: "Structured plan: shadowing, graded ticket types, reviews, KB contribution and clear milestones." },
            { q: "How would you design escalation paths between the desk, desktop, systems and network teams?", lookFor: "Clear criteria, ownership and SLAs per tier, handoff standards and a feedback loop to reduce bounced tickets." }
          ]
        }
      },
      hrScenarios: [
        { q: "Tell me about a time you had a very difficult or rude user. What did you do and what was the outcome?", lookFor: "Stayed calm and respectful, focused on solving the problem and set boundaries professionally." },
        { q: "Describe a time you made a mistake on a ticket that affected a user. How did you handle it?", lookFor: "Owned the error quickly, fixed it, informed the right people and changed their practice to prevent repeats." },
        { q: "During a power outage the queue builds up and your shift is ending. What do you do?", lookFor: "Prioritises by impact, hands over clearly to the next shift and does not abandon urgent users." }
      ],
      curriculum: {
        foundational: {
          title: "IT Help Desk Foundations",
          summary: "A starter course for career-switchers covering how a service desk works, troubleshooting basics and supporting users on Windows and Microsoft 365.",
          duration: "4 weeks",
          modules: [
            { type: "text", title: "How a Service Desk Works", content: "A service desk is the single point of contact between users and IT. Most follow ITIL-style practices.\n\nKey terms:\n- Incident: something is broken or degraded (Outlook will not open).\n- Service request: a normal ask (new laptop, access to a shared folder).\n- Problem: the underlying cause of one or more incidents.\n- SLA: the agreed time to respond and resolve, usually set by priority.\n\nPriority = impact x urgency. One user unable to print is low impact; the whole finance team unable to post payments before month-end is high impact and high urgency.\n\nTiers:\n- Tier 1 handles known, scripted fixes.\n- Tier 2 handles deeper technical issues.\n- Tier 3 or specialist teams (systems, network, vendors) handle the rest.\n\nEvery contact becomes a ticket. A good ticket records who, what, when, the impact, steps tried and the outcome. If it is not in the ticket, it did not happen. Good records let colleagues pick up your work, reveal trends and protect you when questions arise later." },
            { type: "text", title: "A Repeatable Troubleshooting Method", content: "Guessing wastes time. Use a method like CompTIA’s:\n1. Identify the problem: ask questions, gather error messages, find what changed.\n2. Establish a theory of probable cause, starting with the obvious.\n3. Test the theory. If wrong, form a new one or escalate.\n4. Plan and implement the fix.\n5. Verify full functionality and consider preventive measures.\n6. Document findings, actions and outcome.\n\nUseful questions: When did it start? Does it affect only you or others too? Did anything change (update, new password, moved desk)? Can you show me the exact error?\n\nWorked example: A user cannot reach the intranet. You check whether other sites load (yes), whether colleagues can reach it (no, several cannot). That points away from the user’s laptop towards the server or DNS. You test with the server IP (works), so DNS is the likely cause. You escalate to the systems team with that evidence instead of reinstalling the browser.\n\nChange one thing at a time, so you know what fixed it." },
            { type: "text", title: "Accounts, Passwords and MFA Securely", content: "Account requests are the most common tickets and the most abused by attackers. Social engineering often starts with a call to the help desk.\n\nBefore changing any account:\n- Verify identity using your organisation’s approved method: callback to the number on record, a manager’s confirmation, or a push to their registered MFA app.\n- Never accept urgency or seniority as proof. ‘I am the MD and I am about to board a flight’ is a classic pressure tactic.\n- Record how you verified in the ticket.\n\nCommon tasks in Microsoft Entra ID: reset password, require change at next sign-in, unlock account, revoke sessions, and reset MFA methods so the user can re-register.\n\nChecklist for MFA re-registration:\n1. Verify identity.\n2. Remove old authentication methods.\n3. Revoke sessions.\n4. Guide the user through registering Microsoft Authenticator.\n5. Confirm sign-in works and note it in the ticket.\n\nUnder the Nigeria Data Protection Act 2023, staff personal data must also be handled with care, so never share account details over insecure channels." },
            { type: "text", title: "Supporting Windows and Microsoft 365 Users", content: "Most help desk work involves Windows 11 and Microsoft 365.\n\nQuick checks for a Windows device:\n- Restart (a real restart, not just closing the lid).\n- Check free disk space and pending updates.\n- Run ipconfig to confirm an IP address; ping the gateway; nslookup a site to test DNS.\n- Check Event Viewer for errors around the time of the fault.\n\nMicrosoft 365 issues:\n- Outlook: check the service health page in the admin center first; try Outlook on the web to separate client from service issues; repair the Office install or create a new profile if only the client fails.\n- Teams: clear the cache, check sign-in and licence assignment.\n- OneDrive: check sync status, storage quota and file path length.\n\nRemote support: always ask permission before connecting, tell the user what you are doing, and disconnect when finished.\n\nIn offices with unstable power or connectivity, check the basics first: is the router or UPS on, is mobile data or the backup link active, and are other users affected?" },
            { type: "quiz", title: "Help Desk Foundations Quiz", questions: [
              { q: "A single user cannot print, but the whole finance team cannot access the payments system before a deadline. Which should get higher priority?", options: ["The single printing user, because it was logged first", "The finance team issue, because impact and urgency are higher", "Both equal, since all tickets share one SLA", "Whichever is quicker to fix"], answer: 1 },
              { q: "What is the main difference between an incident and a problem?", options: ["Incidents are hardware faults; problems are software faults", "A problem is a more urgent incident", "An incident is a disruption; a problem is the underlying cause of one or more incidents", "There is no difference in ITIL"], answer: 2 },
              { q: "A caller says they are a senior manager and need an urgent password reset but cannot complete your verification. What should you do?", options: ["Reset it because they are senior", "Reset it and email the new password to their personal address", "Ignore the request completely", "Follow the verification process and offer an approved alternative such as a callback to the number on record"], answer: 3 },
              { q: "A user can reach websites by IP address but not by name. What is the most likely cause?", options: ["DNS resolution failure", "Faulty monitor", "Expired Microsoft 365 licence", "Full hard drive"], answer: 0 },
              { q: "Why change only one thing at a time when troubleshooting?", options: ["It is faster", "So you know which change fixed the problem", "Because tools only allow one change", "To increase ticket count"], answer: 1 },
              { q: "Outlook desktop fails for a user, but Outlook on the web works. What does this suggest?", options: ["The Exchange Online service is down for everyone", "The user’s account is disabled", "The problem is likely with the local client or profile", "The internet connection is down"], answer: 2 }
            ] },
            { type: "assignment", title: "Ticket Handling Exercise", maxScore: 100, content: "You will receive five short user complaints (written as chat messages). For each one:\n1. Write the ticket as you would log it: category, priority with justification, summary and description.\n2. List the first three questions you would ask the user.\n3. Describe your troubleshooting steps and when you would escalate.\n4. Write the closure note or escalation note.\n\nDeliverables: one document with all five tickets, maximum four pages.\n\nGrading: priority and categorisation accuracy (25), quality of questions and troubleshooting logic (35), security awareness such as identity verification (15), clarity of notes that another technician could follow (25)." }
          ]
        },
        intensive: {
          title: "IT Help Desk Professional",
          summary: "A job-ready programme covering Tier 1–2 support in Microsoft 365, Intune and Entra ID, ITSM practice, and service desk leadership skills.",
          duration: "8 weeks",
          modules: [
            { type: "text", title: "ITSM in Practice: SLAs, Categories and Escalation", content: "Strong service desks run on clear process.\n\nCategorisation: use a short, consistent tree (e.g. Hardware > Laptop > Battery). Too many categories and agents pick ‘Other’; too few and you cannot spot trends.\n\nSLAs: typically separate response and resolution targets per priority. The clock pauses only for legitimate reasons, such as waiting for the user, never to hide a breach.\n\nEscalation types:\n- Functional: to a team with more expertise (desktop, systems, network).\n- Hierarchical: to a supervisor when SLA, business impact or user conflict requires it.\n\nA good escalation note includes: symptoms and exact errors, scope (who and how many), what changed, steps tried and results, evidence, and business impact.\n\nWorked example: ‘Finance (12 users) cannot open the ERP since 08:40. Other apps work. ERP URL times out from wired and Wi-Fi. Server ping OK; port 443 times out. No local changes. P2: payroll run due 14:00.’ That note lets the systems team start immediately." },
            { type: "text", title: "Identity and Access with Microsoft Entra ID", content: "Most modern support work touches identity.\n\nCore objects: users, groups (security and Microsoft 365), licences, and roles. Assign licences and access through groups wherever possible so joiners and leavers are consistent.\n\nConditional Access policies decide whether a sign-in is allowed, for example requiring MFA or a compliant device. When a user is blocked, check the sign-in logs: they show which policy applied and why.\n\nJoiner checklist: create account, set manager and department, add to role-based groups, assign licences, confirm MFA registration, prepare device.\n\nLeaver checklist: block sign-in, reset password, revoke sessions, remove MFA methods, remove from groups, convert mailbox to shared or set forwarding as approved, transfer OneDrive files to the manager, collect devices, and record everything.\n\nMover: remove old access before adding new. Accumulated access (‘privilege creep’) is a common audit finding.\n\nUse self-service password reset to cut ticket volume, but make sure users register strong methods." },
            { type: "text", title: "Device Management with Intune and Autopilot", content: "Microsoft Intune manages Windows, macOS, iOS and Android devices from the cloud.\n\nKey ideas:\n- Enrolment: Windows Autopilot lets a new laptop be shipped straight to a user and configure itself at first sign-in.\n- Configuration profiles: settings such as Wi-Fi, BitLocker, and restrictions.\n- Compliance policies: rules (OS version, encryption, PIN) that mark a device compliant or not. Conditional Access can block non-compliant devices.\n- Apps: deploy Microsoft 365 Apps and line-of-business apps as required or available.\n\nTroubleshooting a non-compliant device:\n1. Check which compliance setting failed in the device record.\n2. Trigger a sync from the Company Portal or the Intune portal.\n3. Fix the cause (install updates, enable BitLocker, set a PIN).\n4. Wait for re-evaluation, then confirm access.\n\nFor remote staff with limited bandwidth, schedule large deployments outside working hours and use Delivery Optimization so devices share updates locally." },
            { type: "text", title: "Communicating Through Incidents and Measuring Service", content: "During a major incident, users want to know three things: do you know, what is the impact, and when will you update next.\n\nService desk incident routine:\n1. Confirm the scope quickly and link incoming tickets to one parent incident.\n2. Publish a short status message (portal banner, email, Teams, or SMS if email is down).\n3. Give agents a script so every caller hears the same thing.\n4. Update at regular, promised intervals even if nothing has changed.\n5. Announce resolution and ask users to report anything still broken.\n\nMetrics that matter:\n- First-contact resolution (FCR)\n- SLA compliance for response and resolution\n- Backlog size and age\n- Customer satisfaction (CSAT)\n- Reopen rate\n\nUse metrics to find causes, not to punish. If FCR drops, look at ticket types: maybe a new application launched without a KB article. Fix the cause, then watch the metric recover." },
            { type: "assignment", title: "Onboarding and Offboarding Runbook", maxScore: 100, content: "Write a joiner-mover-leaver runbook for a 150-person company using Microsoft 365, Entra ID and Intune.\n\nInclude: trigger and approval for each event (from HR or a manager), step-by-step technical tasks, timing (before day one, on the last day), security controls, and evidence to record in the ticket. Add one page on how you would handle an urgent, hostile leaver.\n\nDeliverables: runbook document (max six pages) and a one-page checklist agents can follow.\n\nGrading: completeness of steps (35), security of access removal (25), clarity and usability for agents (25), handling of edge cases (15)." },
            { type: "quiz", title: "Help Desk Professional Quiz", questions: [
              { q: "A user is blocked at sign-in with a Conditional Access message. Where should you look first to find out why?", options: ["The user’s browser history", "The Entra ID sign-in logs for that attempt", "The printer queue", "The Exchange message trace"], answer: 1 },
              { q: "Why assign licences and access through groups rather than individually?", options: ["Groups are required by law", "It makes access consistent and easier to remove when people move or leave", "Individual assignment is impossible in Microsoft 365", "It reduces licence cost automatically"], answer: 1 },
              { q: "During a major outage, there is no new information at the promised update time. What should the service desk do?", options: ["Skip the update until there is news", "Close the parent incident", "Send the update anyway, confirming work continues and the next update time", "Tell agents to stop answering calls"], answer: 2 },
              { q: "A device is non-compliant because BitLocker is off. After enabling BitLocker, what is the next step?", options: ["Sync the device and confirm compliance is re-evaluated", "Wipe the device", "Delete the compliance policy", "Disable Conditional Access"], answer: 0 },
              { q: "Which is the best sign that a drop in first-contact resolution has a fixable cause?", options: ["Agents are working fewer hours", "CSAT is still high", "Ticket volume dropped overall", "Most new escalations relate to a recently launched app with no KB article"], answer: 3 },
              { q: "When an employee moves from Sales to Finance, what should happen to their Sales access?", options: ["Keep it in case they return", "Remove it as part of the move, then add Finance access", "Leave it until the annual audit", "Convert it to read-only permanently"], answer: 1 }
            ] },
            { type: "assignment", title: "Capstone: Run the Service Desk for a Week", maxScore: 100, content: "Shared brief: You support a Lagos-based fintech with 200 staff on Microsoft 365, Entra ID and Intune, with a hybrid workforce and occasional power and ISP outages. You receive a simulated week of 40 tickets, including a two-hour email outage.\nJunior: Resolve or escalate each ticket with correct priority, full notes and identity verification where needed, and write two KB articles.\nMid: Do the junior tasks, then identify two recurring issues, raise problem records with evidence, and produce a JML improvement proposal.\nSenior: Lead the outage response (comms plan, agent script, timeline), produce a weekly metrics report with insights, and propose escalation-path and self-service improvements.\nDeliverables: ticket log, KB articles or reports for your level, and a 5-minute recorded walkthrough.\nGrading: technical accuracy (30), process and security (25), communication quality (25), level-appropriate judgement and improvement thinking (20)." }
          ]
        }
      }
    },
    {
      id: "desktop",
      title: "Desktop Support Specialist",
      summary: "Desktop support specialists build, deploy, repair and maintain the laptops, desktops, mobile devices and peripherals staff use every day, working on-site and remotely. They take escalations from the help desk and work with systems and security teams on imaging, patching and endpoint standards.",
      competencies: [
        { name: "Hardware diagnosis and repair", weight: 20, description: "Diagnoses and fixes laptop, desktop, peripheral and component faults safely and efficiently." },
        { name: "OS deployment and imaging", weight: 25, description: "Builds and deploys standard Windows and macOS devices using modern provisioning and imaging tools." },
        { name: "Endpoint management and patching", weight: 25, description: "Keeps devices configured, updated and compliant through MDM and patch tooling." },
        { name: "Endpoint security", weight: 15, description: "Applies encryption, antivirus/EDR, local admin control and secure configuration on devices." },
        { name: "Asset and lifecycle management", weight: 15, description: "Tracks devices from procurement to secure disposal with accurate inventory records." }
      ],
      levels: {
        junior: {
          minYears: 0,
          focus: "Trusted to set up, repair and swap devices and peripherals following standard builds and procedures.",
          responsibilities: [
            "Set up new laptops and desktops using the standard build and hand them over to users",
            "Diagnose and repair common hardware faults such as failed drives, RAM, batteries and docking issues",
            "Install and configure printers, monitors, docking stations and other peripherals",
            "Resolve OS and application issues escalated from the help desk, on-site or remotely",
            "Update the asset register whenever a device is issued, moved, repaired or returned"
          ],
          skills: [
            "PC hardware troubleshooting",
            "Windows 11 configuration",
            "Device setup and handover",
            "Printer and peripheral support",
            "Basic macOS support",
            "Asset tagging and tracking",
            "Remote desktop support"
          ],
          tools: ["Microsoft Intune", "Windows Autopilot", "Dell Command | Update", "Lenovo Vantage", "Snipe-IT", "TeamViewer"],
          certifications: ["CompTIA A+", "ITIL 4 Foundation"],
          aiTopics: [
            "Hardware fault isolation (power, storage, memory, display)",
            "Standard device build and handover checks",
            "Driver and Windows Update issues",
            "Peripheral and printer troubleshooting",
            "Asset tracking and safe handling of user data"
          ],
          aiScenarios: [
            "A laptop will not power on after a power surge in the office. Walk me through how you diagnose it.",
            "A user’s laptop has become very slow over the past week. What do you check and in what order?",
            "You must set up five laptops for new starters tomorrow. How do you prepare them and verify they are ready?"
          ],
          aiExpectations: "A ready junior isolates hardware versus software faults methodically, follows the standard build and protects user data. Red flags are reimaging as the first step for every problem, no backup check before repairs, or poor record keeping.",
          proQuestions: [
            { q: "Tell me about a hardware fault you diagnosed. How did you confirm the failed component?", lookFor: "Logical isolation (swap test, diagnostics like vendor ePSA/BIOS tests), evidence before replacing parts." },
            { q: "What checks do you do before handing a new laptop to a user?", lookFor: "Updates, encryption, apps, sign-in, MFA, printers, VPN, asset record and a quick walkthrough with the user." },
            { q: "How do you protect a user’s data when a laptop goes for repair?", lookFor: "Confirms OneDrive/backup sync, encryption in place, handles drives securely and documents custody." },
            { q: "Describe a time a printer issue affected many users. What did you do?", lookFor: "Identified shared cause (driver, queue, network), fixed centrally and communicated to users." },
            { q: "How do you decide whether to repair a device or replace it?", lookFor: "Considers warranty, age, cost of parts versus replacement, downtime and company lifecycle policy." }
          ]
        },
        mid: {
          minYears: 2,
          focus: "Trusted to own device deployment and maintenance for a site or user group, including provisioning, patching and compliance.",
          responsibilities: [
            "Provision devices with Windows Autopilot and Intune, and maintain the application catalogue",
            "Manage Windows Update rings and third-party patching, investigating failed updates",
            "Troubleshoot complex device issues including boot failures, profile corruption and driver conflicts",
            "Handle device refresh projects and secure data wiping for returned equipment",
            "Write build documents and procedures, and train junior staff and help desk colleagues"
          ],
          skills: [
            "Windows Autopilot provisioning",
            "Intune configuration profiles",
            "Patch management",
            "Application packaging",
            "BitLocker management",
            "PowerShell scripting basics",
            "Device lifecycle management"
          ],
          tools: ["Microsoft Intune", "Microsoft Configuration Manager", "Windows Autopilot", "Microsoft Defender for Endpoint", "PowerShell", "Jamf Pro"],
          certifications: ["Microsoft 365 Certified: Endpoint Administrator Associate", "CompTIA Network+", "Jamf Certified Tech"],
          aiTopics: [
            "Autopilot and Intune provisioning flow",
            "Patch rings, deferrals and failed update remediation",
            "Packaging and deploying Win32 applications",
            "BitLocker recovery and encryption policy",
            "Secure device refresh and disposal"
          ],
          aiScenarios: [
            "An Autopilot deployment hangs at the ‘Device setup’ stage for several new laptops. How do you troubleshoot it?",
            "A monthly Windows update breaks a finance application for some users. Walk me through your response.",
            "Your company is refreshing 100 laptops across three offices. How do you plan and run it with minimal disruption?"
          ],
          aiExpectations: "A ready mid-level specialist manages devices at scale through tooling rather than by hand and plans changes to avoid disruption. Red flags are pushing updates to everyone at once, no rollback thinking, or manual builds with no documentation.",
          proQuestions: [
            { q: "Tell me about a deployment or provisioning process you improved. What changed?", lookFor: "Moved from manual to automated/zero-touch, measured time saved and fewer errors." },
            { q: "How do you structure Windows Update rings, and why?", lookFor: "Pilot/IT ring, broad rings with deferrals, monitoring, ability to pause; explains the risk reasoning." },
            { q: "Describe how you package and deploy an application that needs custom settings.", lookFor: "Win32 packaging, silent install switches, detection rules, testing on pilot devices, versioned updates." },
            { q: "A user needs their BitLocker recovery key urgently. Walk me through it.", lookFor: "Verifies identity, retrieves key from Entra ID/Intune, investigates why recovery was triggered, documents." },
            { q: "How have you handled secure disposal of old devices?", lookFor: "Certified wipe or physical destruction, certificate of disposal, asset register update and data protection awareness." }
          ]
        },
        senior: {
          minYears: 5,
          focus: "Trusted to set endpoint standards and strategy, lead projects and own device security and lifecycle across the organisation.",
          responsibilities: [
            "Design and own the standard device builds, configuration baselines and app catalogue for Windows and macOS",
            "Lead device refresh, OS migration and endpoint management projects across sites",
            "Work with security to implement EDR, local admin removal and hardening baselines",
            "Own endpoint lifecycle policy, vendor relationships and hardware standards",
            "Mentor desktop engineers and report endpoint health and compliance to IT leadership"
          ],
          skills: [
            "Endpoint architecture",
            "Security baseline design",
            "Co-management strategy",
            "Endpoint automation",
            "Project leadership",
            "Vendor management",
            "Endpoint analytics"
          ],
          tools: ["Microsoft Intune", "Microsoft Configuration Manager", "Microsoft Defender for Endpoint", "Jamf Pro", "PowerShell", "Microsoft Power BI"],
          certifications: ["Microsoft 365 Certified: Endpoint Administrator Associate", "Microsoft Certified: Security Operations Analyst Associate", "PRINCE2 Foundation"],
          aiTopics: [
            "Endpoint management strategy (cloud-native vs co-management)",
            "Security baselines, least privilege and EDR rollout",
            "Large-scale migration and refresh planning",
            "Measuring endpoint health and user experience",
            "Hardware standards, warranty and lifecycle economics"
          ],
          aiScenarios: [
            "Leadership wants to remove local admin rights from all users within a quarter. How do you plan and deliver it?",
            "You inherit a mix of unmanaged, domain-joined and Intune devices. Design the path to one managed estate.",
            "Endpoint analytics shows poor boot times and frequent crashes on one laptop model. How do you investigate and decide what to do?"
          ],
          aiExpectations: "A ready senior designs endpoint standards that balance security, user experience and cost, and leads change across teams. Red flags are tool-first answers with no plan for users, ignoring security or ignoring lifecycle cost.",
          proQuestions: [
            { q: "Tell me about an endpoint project you led from planning to completion.", lookFor: "Clear scope, pilot, phased rollout, communications, risks managed and measurable outcome." },
            { q: "How would you design a Windows security baseline for a regulated company?", lookFor: "Uses Microsoft security baselines/CIS, BitLocker, Defender, ASR rules, LAPS, least privilege, tested exceptions." },
            { q: "Describe a time you had to push back on a request from leadership or another team.", lookFor: "Explained risk with evidence, offered alternatives and reached an agreed outcome." },
            { q: "How do you decide hardware standards and refresh cycles?", lookFor: "Total cost of ownership, warranty, performance data, user personas, vendor support and local availability of parts." },
            { q: "How have you developed the engineers on your team?", lookFor: "Specific mentoring, delegation of projects, documentation standards and visible growth." }
          ]
        }
      },
      hrScenarios: [
        { q: "Tell me about a time you had to work in a user’s space with sensitive information visible. How did you handle it?", lookFor: "Discretion, respect for confidentiality and following data protection practice." },
        { q: "You have five urgent on-site requests across two buildings and limited time. How do you decide where to go first?", lookFor: "Prioritises by business impact, communicates with waiting users and asks for help when needed." },
        { q: "Describe a time you had to explain a technical delay to a frustrated senior manager.", lookFor: "Clear, honest explanation, a realistic plan and keeping them updated without technical jargon." }
      ],
      curriculum: {
        foundational: {
          title: "Desktop Support Foundations",
          summary: "A starter course on PC hardware, Windows setup, peripherals and safe device handling for people entering desktop support.",
          duration: "4 weeks",
          modules: [
            { type: "text", title: "PC Hardware and Fault Isolation", content: "Desktop support starts with understanding what is inside the device.\n\nMain components: motherboard, CPU, RAM, storage (SSD or HDD), power supply or battery and charger, display, and ports.\n\nFault isolation approach:\n1. Power: Does anything light up? Try a known-good charger or power cable. In offices with unstable power, check the UPS and surge protection first.\n2. POST and BIOS: Do you hear beeps or see diagnostic LEDs? Can you reach the BIOS? Many vendors (Dell, HP, Lenovo) have built-in diagnostics.\n3. Storage: Does the BIOS detect the drive? Run the vendor drive test.\n4. Memory: Run the built-in memory test, or reseat and swap modules one at a time.\n5. Display: Connect an external monitor to separate a screen fault from a graphics fault.\n\nWorked example: A laptop shows a black screen but the power light is on. An external monitor shows the desktop. The internal screen or its cable is the likely fault, not the motherboard.\n\nAlways use an anti-static strap and check warranty before opening a device." },
            { type: "text", title: "Setting Up Windows Devices", content: "A consistent build makes devices easier to support and secure.\n\nStandard build checklist:\n- Latest supported Windows 11 version and all updates installed\n- Device joined to Microsoft Entra ID (or domain) and enrolled in management\n- BitLocker encryption on\n- Microsoft Defender or the company’s security agent running\n- Standard apps installed (Microsoft 365 Apps, browser, VPN, line-of-business apps)\n- Correct device name and asset tag\n\nModern provisioning: with Windows Autopilot, the device is registered by the vendor or IT. When the user signs in, Intune applies settings and apps automatically. Your job is to make sure the device is registered, assigned to the right profile and tested.\n\nHandover checklist with the user:\n1. User signs in and sets up Windows Hello or MFA.\n2. Confirm email, Teams and OneDrive work.\n3. Connect printer and VPN.\n4. Explain how to get help.\n5. Record the handover in the asset register." },
            { type: "text", title: "Peripherals, Printers and Docking", content: "Peripheral issues are frequent and often affect several people.\n\nPrinters:\n- Check the basics: power, paper, toner, error on the printer panel.\n- Is it one user or everyone? One user suggests a driver or mapping issue; everyone suggests the printer, its network connection or the print server.\n- Check the print queue for stuck jobs and restart the spooler if needed.\n- Use the manufacturer’s universal driver where possible to reduce variety.\n\nDocking stations and monitors:\n- Update dock firmware and laptop drivers using the vendor tool.\n- Check cable type (USB-C vs Thunderbolt) and display settings.\n- Test with a known-good dock to isolate the fault.\n\nWorked example: Three users on the same floor cannot print after a weekend. You find the printer received a new IP address from DHCP. Fixing the printer’s IP with a DHCP reservation and confirming the port settings resolves it for everyone.\n\nLog shared issues once and link user tickets, so fixes are recorded." },
            { type: "text", title: "Assets, Data and Safe Device Handling", content: "Every device carries company data, so how you handle it matters.\n\nAsset lifecycle: procure, receive and tag, deploy, maintain, recover, dispose. Record each step in the asset register (for example Snipe-IT or the ITSM tool): serial number, model, user, location and status.\n\nBefore repairs:\n- Confirm the user’s files are synced to OneDrive or backed up.\n- Confirm BitLocker is on so a removed drive cannot be read.\n- Note the device’s condition and accessories.\n\nWhen devices are returned:\n- Recover accessories and record condition.\n- Wipe through Intune or a certified tool before reuse.\n- For disposal, use a certified vendor and keep a certificate of data destruction.\n\nThe Nigeria Data Protection Act 2023 requires organisations to protect personal data, including data on old laptops and phones. A lost or poorly wiped device can become a reportable breach.\n\nChecklist: tag, track, back up, encrypt, wipe, certify." },
            { type: "quiz", title: "Desktop Support Foundations Quiz", questions: [
              { q: "A laptop shows a black screen but works on an external monitor. What is the most likely fault?", options: ["Faulty RAM", "The internal display or its cable", "Corrupt Windows installation", "Failed hard drive"], answer: 1 },
              { q: "Only one user cannot print to a shared printer that everyone else uses. Where should you look first?", options: ["The user’s driver or printer mapping", "The printer’s toner", "The building’s network switch", "The print server hardware"], answer: 0 },
              { q: "Why confirm BitLocker is enabled before sending a laptop for repair?", options: ["It speeds up the repair", "It is needed for warranty claims", "It ensures data on the drive cannot be read if the drive is removed", "It resets the user password"], answer: 2 },
              { q: "What does Windows Autopilot mainly do?", options: ["Repairs hardware automatically", "Replaces antivirus", "Backs up user files", "Configures a new device automatically at first sign-in using cloud policies"], answer: 3 },
              { q: "Several printers stopped working after a weekend because their IP addresses changed. What is the best long-term fix?", options: ["Restart the printers every Monday", "Set DHCP reservations or static IPs for the printers", "Install new drivers on all laptops", "Replace the printers"], answer: 1 },
              { q: "What should happen to a returned laptop before it is given to another user?", options: ["Delete the old user’s desktop files only", "Hand it over as-is to save time", "Wipe it through Intune or a certified tool and update the asset register", "Change the wallpaper and rename it"], answer: 2 }
            ] },
            { type: "assignment", title: "Device Build and Handover Pack", maxScore: 100, content: "Create a build and handover pack for a small office of 30 staff using Windows 11 and Microsoft 365.\n\nInclude: a standard build checklist, a handover checklist used with the user, a simple hardware fault isolation flowchart, and an asset register template with example entries.\n\nDeliverables: one document (max five pages) plus the asset register as a spreadsheet.\n\nGrading: completeness and accuracy of the build (30), security and data handling (25), fault isolation logic (25), clarity and usability for a colleague (20)." }
          ]
        },
        intensive: {
          title: "Desktop Support Professional",
          summary: "A job-ready programme on modern endpoint management with Intune and Autopilot, patching, app deployment, endpoint security and lifecycle management.",
          duration: "8 weeks",
          modules: [
            { type: "text", title: "Modern Provisioning with Autopilot and Intune", content: "Modern provisioning replaces traditional imaging with cloud-driven setup.\n\nAutopilot flow:\n1. Device hardware hash is registered (by the vendor, reseller or IT).\n2. Device is assigned a deployment profile (user-driven or pre-provisioned).\n3. User signs in; the device joins Entra ID and enrols in Intune.\n4. The Enrollment Status Page holds the user until required apps and policies install.\n\nCommon issues and checks:\n- Device not getting the profile: check registration and group assignment.\n- Stuck on ESP: identify which app or policy is pending in the Intune portal or with logs (mdmdiagnosticstool, Event Viewer under DeviceManagement-Enterprise-Diagnostics-Provider).\n- Network: proxies or firewalls blocking Microsoft endpoints.\n\nTip: keep the ESP blocking list short; only truly essential apps should block sign-in. For sites with slow links, use pre-provisioning so devices are prepared in the office before shipping to remote staff." },
            { type: "text", title: "Patching and Application Deployment", content: "Unpatched devices are a leading cause of breaches, but careless patching breaks business apps.\n\nWindows Update for Business rings:\n- Ring 0: IT and pilot users, no deferral.\n- Ring 1: a representative early group, short deferral.\n- Ring 2: everyone else, longer deferral.\nMonitor each ring and pause if a problem appears.\n\nThird-party apps (browsers, PDF readers, Java) also need patching, using Intune, Configuration Manager or a third-party patch tool.\n\nApplication deployment with Intune:\n- Package Win32 apps with the content prep tool into .intunewin.\n- Use silent install and uninstall commands.\n- Define detection rules so Intune knows the app is installed.\n- Assign as Required to groups or Available in the Company Portal.\n- Test on pilot devices first.\n\nWorked example: An update breaks a finance plug-in for Ring 1. You pause Ring 2, roll back the update on affected devices, raise it with the vendor and document a known-error article before resuming." },
            { type: "text", title: "Endpoint Security Essentials", content: "Desktop support is on the front line of endpoint security.\n\nKey controls:\n- Encryption: BitLocker on Windows, FileVault on macOS, with recovery keys escrowed to Entra ID or Jamf.\n- Antivirus and EDR: Microsoft Defender for Endpoint or similar, reporting into the security team.\n- Least privilege: remove local admin rights and use Windows LAPS for unique local admin passwords.\n- Attack surface reduction rules to block common malware techniques (for example Office macros launching child processes).\n- Security baselines: Microsoft or CIS baselines applied via Intune.\n- Conditional Access requiring compliant devices.\n\nWhen a device is suspected compromised:\n1. Do not wipe it straight away; evidence may be needed.\n2. Isolate it from the network using EDR if available.\n3. Inform the security team and follow the incident procedure.\n4. Provide the user with a clean replacement.\n\nRemoving admin rights generates requests at first; prepare a self-service app catalogue so users can still install approved software." },
            { type: "text", title: "Lifecycle, Refresh Projects and macOS", content: "Device lifecycle management saves money and reduces risk.\n\nRefresh project steps:\n1. Inventory: which devices are out of warranty, underpowered or unsupported for Windows 11.\n2. Plan: user groups, schedule, logistics per site, data migration approach (OneDrive makes this easier).\n3. Pilot with a small group and gather feedback.\n4. Roll out in waves with clear communication and booking slots.\n5. Recover old devices, wipe them securely and dispose or redeploy.\n\nConsider local realities: lead times for importing hardware, foreign exchange costs, availability of vendor support and spare parts in your city.\n\nmacOS support basics:\n- Manage Macs with Jamf Pro or Intune using Automated Device Enrollment through Apple Business Manager.\n- Enforce FileVault and escrow the key.\n- Deploy apps and updates through the MDM.\n- Use Self Service portals for optional apps.\n\nMeasure success: devices delivered on time, user satisfaction, and post-refresh ticket volume." },
            { type: "assignment", title: "Patch and App Deployment Plan", maxScore: 100, content: "Design a patching and application deployment plan for 300 Windows devices across two offices and remote staff.\n\nInclude: update ring design with deferrals and group membership, third-party patching approach, a process for handling a bad update, and a worked example of packaging one application (install/uninstall commands, detection rule, assignment).\n\nDeliverables: plan document (max five pages) and a one-page rollback runbook.\n\nGrading: soundness of ring design and risk control (35), application packaging accuracy (25), rollback and communication process (25), clarity (15)." },
            { type: "quiz", title: "Desktop Support Professional Quiz", questions: [
              { q: "Several Autopilot devices are stuck on the Enrollment Status Page. What is the most useful first step?", options: ["Reimage all the devices manually", "Identify which app or policy is still pending for those devices", "Remove all devices from Intune", "Disable MFA"], answer: 1 },
              { q: "What is the purpose of a pilot update ring?", options: ["To catch problems on a small group before updates reach everyone", "To give IT staff faster computers", "To skip updates permanently", "To reduce licence costs"], answer: 0 },
              { q: "Why does a Win32 app in Intune need a detection rule?", options: ["To scan for malware in the app", "To license the application", "So Intune can confirm whether the app is installed", "To compress the installer"], answer: 2 },
              { q: "A device is suspected to be infected with malware. What should desktop support avoid doing first?", options: ["Informing the security team", "Isolating the device from the network", "Giving the user a replacement device", "Wiping the device immediately before evidence is reviewed"], answer: 3 },
              { q: "What does Windows LAPS provide?", options: ["Unique, rotated local administrator passwords per device", "Faster boot times", "Automatic driver updates", "Remote desktop access"], answer: 0 },
              { q: "In a refresh project, why run a pilot before full rollout?", options: ["To delay the project", "To use up old stock", "To find and fix issues with a small group before they affect everyone", "Because vendors require it"], answer: 2 }
            ] },
            { type: "assignment", title: "Capstone: Endpoint Estate Overhaul", maxScore: 100, content: "Shared brief: A Nigerian logistics company has 250 mixed Windows laptops (some unmanaged), 20 Macs, frequent malware tickets, and staff in Lagos, Abuja and on the road with patchy connectivity. You are asked to bring the estate under control.\nJunior: Build and document a standard Windows device in a lab tenant, complete a handover checklist, and diagnose three provided hardware/software fault scenarios.\nMid: Configure Autopilot, compliance policies, update rings and two packaged apps in a lab tenant, and write the patching runbook.\nSenior: Produce an endpoint strategy covering management model, security baseline and local admin removal, refresh plan and budget assumptions, risks and a phased roadmap.\nDeliverables: lab evidence (screenshots/exports) or strategy document for your level, plus a 5-minute recorded walkthrough.\nGrading: technical correctness (35), security and data protection (25), practicality for the context (20), level-appropriate depth and communication (20)." }
          ]
        }
      }
    },
    {
      id: "sysadmin",
      title: "Systems Administrator",
      summary: "Systems administrators build, run and secure the servers, identity services, storage, backups and core business platforms an organisation depends on, on-premises and in the cloud. They sit between the support teams and infrastructure or cloud engineering, handling escalations, changes and day-to-day operations.",
      competencies: [
        { name: "Server and OS administration", weight: 25, description: "Installs, configures, maintains and troubleshoots Windows Server and Linux systems." },
        { name: "Identity and directory services", weight: 20, description: "Manages Active Directory, Entra ID, group policy and access controls securely." },
        { name: "Backup, recovery and continuity", weight: 20, description: "Designs, runs and tests backups and restores to meet recovery objectives." },
        { name: "Automation and scripting", weight: 15, description: "Uses PowerShell and Bash to automate repeatable administration tasks reliably." },
        { name: "Monitoring and security hardening", weight: 20, description: "Monitors system health, patches and hardens servers against known threats." }
      ],
      levels: {
        junior: {
          minYears: 0,
          focus: "Trusted to carry out routine server and directory administration, monitoring and patching under documented procedures and supervision.",
          responsibilities: [
            "Create and manage user, group and computer objects in Active Directory and Entra ID",
            "Monitor server health alerts and backup jobs, and act on or escalate failures",
            "Apply scheduled patches to servers in approved maintenance windows",
            "Handle file share permissions, DNS records and DHCP scopes as requested",
            "Document changes and keep system runbooks up to date"
          ],
          skills: [
            "Windows Server administration",
            "Active Directory management",
            "Linux command line",
            "DNS and DHCP",
            "Backup job monitoring",
            "Server patching",
            "PowerShell basics"
          ],
          tools: ["Windows Server", "Active Directory Users and Computers", "Microsoft Entra ID", "Veeam Backup & Replication", "Zabbix", "VMware vSphere"],
          certifications: ["CompTIA Server+", "CompTIA Linux+", "Microsoft Certified: Azure Fundamentals"],
          aiTopics: [
            "Active Directory objects, groups and permissions",
            "DNS and DHCP fundamentals on servers",
            "Reading logs and monitoring alerts",
            "Safe patching and maintenance windows",
            "Backup job checks and basic restores"
          ],
          aiScenarios: [
            "Users report they cannot access a shared drive this morning. Walk me through how you investigate from the server side.",
            "A nightly backup job failed for a file server. What do you check and what do you do next?",
            "You are asked to patch a production server tonight. How do you prepare and confirm success afterwards?"
          ],
          aiExpectations: "A ready junior understands core server and directory concepts, reads logs before acting and follows change procedures. Red flags are making changes in production without approval or rollback, ignoring failed backups, or granting broad permissions to save time.",
          proQuestions: [
            { q: "Explain how you would give a team access to a new shared folder.", lookFor: "Uses AD security groups (AGDLP or similar), least privilege, NTFS and share permissions, and documents it." },
            { q: "Tell me about a time you diagnosed a server issue using logs.", lookFor: "Identified the right log (Event Viewer, journalctl, app logs), correlated time, found the cause." },
            { q: "What do you check after patching a server?", lookFor: "Server boots, services running, apps tested, monitoring green, reboot pending cleared, change ticket updated." },
            { q: "A backup has been failing silently for a week. How might this happen and how would you prevent it?", lookFor: "Alert routing gaps; daily backup reports, alert ownership and regular restore tests." },
            { q: "Describe the difference between DNS and DHCP problems from a user’s point of view.", lookFor: "DHCP: no or wrong IP/APIPA; DNS: has IP but names fail; describes how to test each." }
          ]
        },
        mid: {
          minYears: 2,
          focus: "Trusted to own servers and core services end to end, including changes, automation, backup and recovery, and troubleshooting complex incidents.",
          responsibilities: [
            "Build, configure and maintain Windows and Linux servers, virtual machines and core services",
            "Manage Group Policy, hybrid identity sync and privileged access controls",
            "Run and test backup and restore procedures against agreed recovery objectives",
            "Automate routine tasks such as user provisioning and reporting with PowerShell or Bash",
            "Lead technical investigation of incidents and complete root cause analysis"
          ],
          skills: [
            "Group Policy management",
            "Hybrid identity (Entra Connect)",
            "Virtualisation administration",
            "PowerShell automation",
            "Linux server administration",
            "Backup and restore testing",
            "Root cause analysis"
          ],
          tools: ["Windows Server", "Microsoft Entra Connect", "VMware vSphere", "Microsoft Hyper-V", "Veeam Backup & Replication", "Microsoft Azure"],
          certifications: ["Microsoft Certified: Windows Server Hybrid Administrator Associate", "Red Hat Certified System Administrator (RHCSA)", "Microsoft Certified: Azure Administrator Associate"],
          aiTopics: [
            "Group Policy design and troubleshooting",
            "Hybrid identity sync and authentication methods",
            "Virtualisation resources and performance",
            "Backup strategy, RPO/RTO and restore testing",
            "Scripting for automation and reporting"
          ],
          aiScenarios: [
            "After a Group Policy change, some users’ drives stop mapping. How do you find and fix the cause?",
            "A critical VM is very slow and users are complaining. Walk me through your investigation on the host and guest.",
            "Management asks whether you could restore the ERP database to yesterday afternoon if needed. How do you answer with evidence?"
          ],
          aiExpectations: "A ready mid-level administrator troubleshoots across layers, automates repeat work and can prove recoverability. Red flags are no tested restores, manual work repeated endlessly, or root cause analysis that stops at the first symptom.",
          proQuestions: [
            { q: "Tell me about a task you automated. What did the script do and how did you make it safe?", lookFor: "Clear problem, error handling, logging, testing in non-production, -WhatIf/dry runs and documentation." },
            { q: "How do you troubleshoot a Group Policy that is not applying?", lookFor: "gpresult/RSoP, scope and filtering, OU links, replication, precedence, event logs." },
            { q: "Describe your approach to backup and how you prove it works.", lookFor: "3-2-1 rule, immutable or offline copy, RPO/RTO per system, scheduled restore tests with records." },
            { q: "Tell me about an incident where you found the root cause. What was it and what changed afterwards?", lookFor: "Timeline, evidence-based analysis, permanent fix and preventive actions." },
            { q: "How do you manage privileged accounts in your environment?", lookFor: "Separate admin accounts, MFA, least privilege, tiering, LAPS, PIM or just-in-time access, logging." }
          ]
        },
        senior: {
          minYears: 5,
          focus: "Trusted to design and own the server, identity and recovery platform, lead major changes and incidents, and set operational standards.",
          responsibilities: [
            "Design server, identity and storage architecture across on-premises and cloud environments",
            "Own disaster recovery planning and lead regular DR tests with business stakeholders",
            "Lead major incident technical response and post-incident reviews",
            "Set standards for change management, hardening, monitoring and documentation",
            "Mentor administrators and plan capacity, lifecycle and budget for the platform"
          ],
          skills: [
            "Infrastructure architecture",
            "Disaster recovery planning",
            "Identity security hardening",
            "Infrastructure as code",
            "Capacity planning",
            "Major incident leadership",
            "Team mentoring"
          ],
          tools: ["Microsoft Azure", "VMware vSphere", "Veeam Backup & Replication", "Ansible", "Terraform", "Microsoft Defender for Identity"],
          certifications: ["Microsoft Certified: Azure Solutions Architect Expert", "Red Hat Certified Engineer (RHCE)", "ITIL 4 Foundation"],
          aiTopics: [
            "Active Directory and Entra ID security (tiering, attack paths)",
            "DR strategy, RPO/RTO and testing",
            "On-premises to cloud migration planning",
            "Infrastructure as code and configuration management",
            "Operational standards, monitoring and capacity"
          ],
          aiScenarios: [
            "Ransomware has encrypted several file servers and backups may be affected. Walk me through the first 24 hours from the systems side.",
            "The company wants to move its on-premises servers to Azure over the next year. How do you plan it?",
            "Audit finds 40 accounts with Domain Admin rights. How do you fix this without breaking operations?"
          ],
          aiExpectations: "A ready senior designs for resilience and security, leads under pressure and makes trade-offs clear to leadership. Red flags are no immutable backup thinking, lift-and-shift without assessment, or tolerating excessive privileged access.",
          proQuestions: [
            { q: "Tell me about a DR test you planned and ran. What did it reveal?", lookFor: "Scope, business involvement, measured RTO/RPO versus target, gaps found and fixed." },
            { q: "How would you secure Active Directory against common attacks?", lookFor: "Tiered admin model, reduce privileged groups, LAPS, disable legacy protocols, monitoring (Defender for Identity), patching DCs." },
            { q: "Describe a migration or platform change you led. How did you manage risk?", lookFor: "Assessment, dependency mapping, pilot, rollback plan, communication and measured outcomes." },
            { q: "How do you decide what to automate or manage as code?", lookFor: "Frequency, risk, consistency needs; version control, review and testing practices." },
            { q: "How have you developed administrators on your team?", lookFor: "Mentoring, runbook ownership, on-call coaching, gradual responsibility and clear feedback." }
          ]
        }
      },
      hrScenarios: [
        { q: "Tell me about a time you were on call and an incident happened at night. How did you handle it and communicate?", lookFor: "Calm response, clear updates, appropriate escalation and a proper handover the next day." },
        { q: "Describe a change you made that caused a problem. What did you do?", lookFor: "Admitted it quickly, rolled back or fixed, informed stakeholders and improved the change process." },
        { q: "A senior manager asks you for access to a colleague’s mailbox without approval. How do you respond?", lookFor: "Politely refuses without proper authorisation, explains the policy and directs them to the correct process." }
      ],
      curriculum: {
        foundational: {
          title: "Systems Administration Foundations",
          summary: "A starter course on servers, Active Directory, DNS and DHCP, Linux basics and backups for people moving into systems administration.",
          duration: "5 weeks",
          modules: [
            { type: "text", title: "Servers, Roles and Virtualisation", content: "A server provides services to other computers: file sharing, directory, email, databases, applications.\n\nMost organisations run servers as virtual machines (VMs) on a hypervisor such as VMware vSphere or Microsoft Hyper-V, or in the cloud (Azure, AWS). Virtualisation lets one physical host run many isolated VMs, making it easier to back up, move and scale them.\n\nCommon Windows Server roles: Active Directory Domain Services, DNS, DHCP, File and Storage Services, Remote Desktop Services.\n\nCommon Linux workloads: web servers (Nginx, Apache), databases (PostgreSQL, MySQL), containers.\n\nWhat a sysadmin watches:\n- CPU, memory, disk space and disk latency\n- Service status and event logs\n- Backup success\n- Patch level\n\nWorked example: An application is slow. On the VM, CPU is fine but disk latency is very high. On the host, the shared datastore is nearly full and another VM is running a heavy backup. The fix is on the storage side, not inside the slow VM." },
            { type: "text", title: "Active Directory and Identity Basics", content: "Active Directory Domain Services (AD DS) stores users, groups and computers and controls who can log in and access what.\n\nKey concepts:\n- Domain and domain controllers (DCs) that hold the directory.\n- Organizational Units (OUs) to organise objects and apply Group Policy.\n- Security groups to grant access. Assign permissions to groups, not individuals.\n- Group Policy Objects (GPOs) to apply settings such as drive maps and security options.\n\nMany organisations sync AD to Microsoft Entra ID so users have one identity for on-premises and Microsoft 365.\n\nGranting folder access, the right way:\n1. Create or use a group such as ‘FS-Finance-Read’.\n2. Grant that group NTFS read permission on the folder.\n3. Add users to the group after approval.\n4. Record the change.\n\nSecurity basics: use separate admin accounts, never share passwords, require MFA for admins, and review membership of privileged groups like Domain Admins regularly." },
            { type: "text", title: "DNS, DHCP and Linux Essentials", content: "DNS turns names into IP addresses. DHCP gives devices an IP address, gateway and DNS server automatically.\n\nSymptoms:\n- DHCP issue: device has no IP or a 169.254.x.x address.\n- DNS issue: device has an IP and can ping by IP, but names fail.\n\nUseful commands: ipconfig /all, nslookup, Resolve-DnsName, ping, Test-NetConnection.\n\nLinux essentials for sysadmins:\n- Navigation and files: ls, cd, cp, mv, less, nano or vim.\n- Users and permissions: useradd, chmod, chown, sudo.\n- Services: systemctl status nginx, systemctl restart nginx.\n- Logs: journalctl -u nginx, /var/log.\n- Disk: df -h, du -sh.\n- Packages: apt (Ubuntu/Debian) or dnf (RHEL family).\n\nWorked example: A web server returns errors. systemctl status shows Nginx failed; journalctl reveals ‘no space left on device’. df -h confirms /var is full of old logs. You clear safely, configure logrotate and add a disk space alert." },
            { type: "text", title: "Backups, Patching and Change Control", content: "Backups protect the business; untested backups are just hope.\n\nThe 3-2-1 rule: three copies of data, on two different media, with one offsite. Today add at least one immutable or offline copy, because ransomware targets backups.\n\nTwo key targets:\n- RPO (Recovery Point Objective): how much data loss is acceptable, e.g. 4 hours.\n- RTO (Recovery Time Objective): how quickly the system must be back, e.g. 8 hours.\n\nDaily routine: review backup reports, investigate every failure, and run regular test restores.\n\nPatching servers:\n1. Check vendor notes and known issues.\n2. Confirm a recent backup or snapshot.\n3. Patch in the approved window.\n4. Reboot, check services and test the application.\n5. Update the change record.\n\nChange control means every production change has a description, risk, approval, rollback plan and a record. It protects users and protects you. In environments with unreliable power, also confirm UPS and generator cover before risky maintenance." },
            { type: "quiz", title: "Systems Administration Foundations Quiz", questions: [
              { q: "A device has a 169.254.x.x address. What does this most likely indicate?", options: ["DNS is failing", "The device could not get an address from DHCP", "The firewall is blocking the internet", "The user account is locked"], answer: 1 },
              { q: "What is the recommended way to give a team access to a shared folder?", options: ["Add each user individually to the folder permissions", "Give everyone full control", "Grant access to a security group and add the team members to that group", "Share the admin password"], answer: 2 },
              { q: "Which statement best describes RPO?", options: ["The maximum acceptable amount of data loss measured in time", "The time it takes to restore a system", "The number of backup copies", "The cost of a backup solution"], answer: 0 },
              { q: "Why keep an immutable or offline backup copy?", options: ["It is faster to restore", "It uses less storage", "It is required for Linux servers", "Ransomware and attackers cannot easily alter or delete it"], answer: 3 },
              { q: "On a Linux server, which command shows recent logs for the nginx service?", options: ["df -h", "chmod nginx", "journalctl -u nginx", "useradd nginx"], answer: 2 },
              { q: "What must a production change record include before work starts?", options: ["Only the engineer’s name", "Description, risk, approval and a rollback plan", "A screenshot of the server desktop", "The vendor’s marketing material"], answer: 1 }
            ] },
            { type: "assignment", title: "Small Office Server Lab", maxScore: 100, content: "Build a lab with one Windows Server domain controller (with DNS and DHCP), one Windows client and one Ubuntu Server VM using Hyper-V, VirtualBox or Azure free credits.\n\nTasks: create OUs, users and security groups; share a folder with group-based permissions; apply one GPO; install Nginx on Ubuntu; configure a backup of the file share and perform a test restore.\n\nDeliverables: a lab report (max six pages) with screenshots and a short runbook for one task.\n\nGrading: working configuration (40), correct security and permissions (20), backup and restore evidence (20), documentation quality (20)." }
          ]
        },
        intensive: {
          title: "Systems Administration Professional",
          summary: "A job-ready programme in hybrid Windows and Linux administration, identity security, automation, backup and disaster recovery.",
          duration: "10 weeks",
          modules: [
            { type: "text", title: "Hybrid Identity and Privileged Access", content: "Most organisations now run hybrid identity: on-premises AD synced to Microsoft Entra ID with Entra Connect (or Cloud Sync).\n\nAuthentication options: password hash sync (simplest and most resilient), pass-through authentication, or federation. Password hash sync also enables leaked-credential detection.\n\nPrivileged access is the main target for attackers. Good practice:\n- Separate admin accounts from daily accounts.\n- Tiered model: Tier 0 (DCs, identity), Tier 1 (servers), Tier 2 (workstations). Never log on to lower tiers with Tier 0 credentials.\n- Windows LAPS for local admin passwords.\n- MFA and Conditional Access for all admins.\n- Privileged Identity Management for just-in-time Entra roles.\n- Remove stale accounts and shrink groups such as Domain Admins.\n\nWorked example: A review finds a service account in Domain Admins with a password unchanged for years. You identify what it actually needs, grant only those rights, move it to a group managed service account (gMSA) where possible, and monitor its use." },
            { type: "text", title: "Automation with PowerShell and Bash", content: "If you do something more than twice, consider scripting it.\n\nPowerShell principles:\n- Use cmdlets and objects: Get-ADUser -Filter * -Properties LastLogonDate | Where-Object {...}.\n- Support -WhatIf and confirmation for destructive actions.\n- Use try/catch and write logs.\n- Store secrets securely (SecretManagement module, Azure Key Vault), never in plain text.\n\nBash principles:\n- Start scripts with set -euo pipefail to fail safely.\n- Quote variables and check exit codes.\n- Schedule with cron or systemd timers.\n\nKeep scripts in Git with clear names and comments, and review changes.\n\nWorked example: Every week you manually find users inactive for 90 days. A script now exports inactive accounts to CSV, emails the report to managers, and after approval disables them, logging each action. Time saved is significant and the process is auditable.\n\nFor configuration at scale, tools like Ansible apply the same desired state to many Linux or Windows servers." },
            { type: "text", title: "Monitoring, Performance and Hardening", content: "Good monitoring tells you about problems before users do.\n\nWhat to monitor: availability, CPU, memory, disk space and latency, key services, certificate expiry, backup status and security events. Tools include Zabbix, Prometheus with Grafana, PRTG and Azure Monitor.\n\nAlert design:\n- Every alert should be actionable and have an owner.\n- Use thresholds and durations to avoid noise.\n- Route critical alerts to on-call; send the rest to a daily report.\n\nPerformance troubleshooting: work layer by layer: application, OS, VM, host, storage, network. Compare with a baseline.\n\nHardening checklist:\n- Apply CIS Benchmarks or Microsoft security baselines.\n- Remove unused roles and services.\n- Patch regularly and track exceptions.\n- Restrict remote access (RDP, SSH) to admin networks or a bastion; use SSH keys.\n- Enable logging and send logs to a central system or SIEM.\n\nExpired TLS certificates are a common, avoidable outage; monitor expiry dates." },
            { type: "text", title: "Backup, Disaster Recovery and Cloud Migration", content: "Backup protects data; disaster recovery (DR) restores the whole service.\n\nDR planning:\n1. Business impact analysis: list systems, owners, RPO and RTO.\n2. Choose the approach per system: restore from backup, replicate to a second site, or fail over to the cloud.\n3. Document runbooks with order of recovery (identity and DNS first, then databases, then applications).\n4. Test at least yearly, measuring actual recovery times.\n\nRansomware readiness: immutable backups, separate backup credentials, offline copy, and a clean recovery environment.\n\nCloud migration approach:\n- Assess: inventory servers, dependencies, licensing and performance.\n- Decide per workload: rehost, replatform, refactor, replace with SaaS, or retire.\n- Pilot with low-risk systems.\n- Consider connectivity (redundant links or ExpressRoute), data residency obligations under NDPA 2023 and sector regulators, and foreign exchange impact on cloud costs.\n\nAfter migration, right-size resources and set budgets and alerts to control spend." },
            { type: "assignment", title: "Automation and Monitoring Pack", maxScore: 100, content: "Produce two scripts and a monitoring design for a mixed Windows and Linux environment.\n\nScript 1 (PowerShell): report and, with a confirmation switch, disable AD accounts inactive for 90 days, with logging.\nScript 2 (Bash): check disk usage and service status on Linux servers and alert when thresholds are exceeded.\nMonitoring design: list of checks, thresholds, alert routing and a sample dashboard.\n\nDeliverables: scripts in a Git repository with a README, and a design document (max four pages).\n\nGrading: script correctness and safety (40), code quality and documentation (20), monitoring design (30), clarity (10)." },
            { type: "quiz", title: "Systems Administration Professional Quiz", questions: [
              { q: "In a tiered admin model, why should Tier 0 accounts never sign in to user workstations?", options: ["Workstations are too slow", "It would expose highly privileged credentials to theft on less secure machines", "Licensing does not allow it", "Workstations cannot reach domain controllers"], answer: 1 },
              { q: "What is the main benefit of supporting -WhatIf in an administrative PowerShell script?", options: ["It makes the script run faster", "It encrypts the output", "It lets you see what would change without making changes", "It schedules the script automatically"], answer: 2 },
              { q: "Which alerting practice reduces alert fatigue most effectively?", options: ["Making every alert actionable with an owner and sensible thresholds", "Sending all alerts to everyone", "Disabling alerts at night", "Alerting on every log line"], answer: 0 },
              { q: "In a DR runbook, what should usually be recovered first?", options: ["Reporting dashboards", "User file shares", "Line-of-business web front ends", "Identity and DNS services that other systems depend on"], answer: 3 },
              { q: "Why keep backup system credentials separate from the main domain admin accounts?", options: ["To simplify licensing", "So a compromised domain cannot easily be used to delete backups", "Because backup software requires local accounts", "To speed up backups"], answer: 1 },
              { q: "A workload will be moved to the cloud with no code changes. Which migration approach is this?", options: ["Refactor", "Retire", "Rehost", "Replace with SaaS"], answer: 2 }
            ] },
            { type: "assignment", title: "Capstone: Recover and Harden the Platform", maxScore: 100, content: "Shared brief: A mid-sized Nigerian insurer runs AD, file servers, an ERP on Windows Server with SQL Server, and a Linux web portal, partly on-premises and partly in Azure. A recent incident exposed weak backups, excessive admin rights and poor monitoring.\nJunior: In a lab, build the core services, configure group-based access and backups, perform and document a test restore, and patch servers with a change record.\nMid: Implement a tiered admin model in the lab, automate two administrative tasks, set up monitoring with actionable alerts, and run a timed restore against stated RPO/RTO.\nSenior: Produce a DR and hardening strategy: business impact analysis, recovery order, AD security plan, migration recommendation for on-premises workloads, and a 12-month roadmap with risks.\nDeliverables: lab evidence and runbooks, or the strategy document for your level, plus a 10-minute recorded presentation.\nGrading: technical accuracy (35), security and resilience (25), evidence and testing (20), level-appropriate judgement and communication (20)." }
          ]
        }
      }
    },
    {
      id: "netadmin",
      title: "Network Administrator",
      summary: "Network administrators configure, monitor, secure and troubleshoot the LAN, WAN, wireless, VPN and internet connections an organisation relies on. They work alongside systems and security teams, handle network escalations from support and manage ISP and vendor relationships.",
      competencies: [
        { name: "Routing and switching", weight: 25, description: "Configures and troubleshoots VLANs, switching, IP addressing and routing protocols." },
        { name: "Network security", weight: 20, description: "Manages firewalls, ACLs, VPNs and segmentation to protect the network." },
        { name: "Wireless networking", weight: 15, description: "Designs, deploys and troubleshoots enterprise Wi-Fi for coverage, capacity and security." },
        { name: "Monitoring and troubleshooting", weight: 25, description: "Uses monitoring data, packet captures and a layered method to find and fix network faults." },
        { name: "WAN and internet connectivity", weight: 15, description: "Manages ISP links, redundancy, SD-WAN and site-to-site connectivity." }
      ],
      levels: {
        junior: {
          minYears: 0,
          focus: "Trusted to make routine network changes and troubleshoot common connectivity issues using standard procedures.",
          responsibilities: [
            "Patch, label and document switch ports and configure access VLANs on request",
            "Troubleshoot user and device connectivity issues escalated from the service desk",
            "Monitor network alerts for link, device and bandwidth issues and escalate as needed",
            "Maintain DHCP reservations, IP address records and network diagrams",
            "Assist with ISP fault reporting and on-site installation of network equipment"
          ],
          skills: [
            "TCP/IP fundamentals",
            "VLAN configuration",
            "Switch port management",
            "Subnetting",
            "Wi-Fi troubleshooting",
            "Network documentation",
            "Cable and patching standards"
          ],
          tools: ["Cisco IOS", "Wireshark", "PRTG Network Monitor", "PuTTY", "Ubiquiti UniFi", "NetBox"],
          certifications: ["CompTIA Network+", "Cisco Certified Network Associate (CCNA)"],
          aiTopics: [
            "OSI/TCP-IP layers applied to troubleshooting",
            "IP addressing and subnetting",
            "VLANs and access/trunk ports",
            "Basic wireless problems (signal, interference, authentication)",
            "Using ping, traceroute and show commands"
          ],
          aiScenarios: [
            "A user moved desks and now has no network connection on the wired port. Walk me through how you troubleshoot it.",
            "Users on one floor complain the Wi-Fi keeps dropping. What do you check?",
            "The internet is down for the whole office. How do you work out whether it is our equipment or the ISP?"
          ],
          aiExpectations: "A ready junior uses a layered approach, understands IP addressing and VLANs, and documents changes. Red flags are changing configurations without saving or recording them, guessing rather than testing, or not knowing how to read basic show command output.",
          proQuestions: [
            { q: "Subnet 192.168.10.0/26: how many usable hosts and what is the broadcast address of the first subnet?", lookFor: "62 usable hosts; broadcast 192.168.10.63; explains the method, not just the answer." },
            { q: "Tell me about a connectivity problem you solved. How did you narrow it down?", lookFor: "Worked layer by layer: physical, link/VLAN, IP, DNS, application, with tests at each step." },
            { q: "What is the difference between an access port and a trunk port?", lookFor: "Access carries one untagged VLAN for an end device; trunk carries multiple tagged VLANs between switches/APs." },
            { q: "How do you document a change you made to a switch?", lookFor: "Change ticket, before/after config, port labels, diagram/IPAM updates and saved running config." },
            { q: "How would you check whether packet loss is on our network or the ISP’s?", lookFor: "Ping/traceroute to gateway, edge router and beyond, check interface errors, compare with ISP monitoring and raise a ticket with evidence." }
          ]
        },
        mid: {
          minYears: 2,
          focus: "Trusted to own day-to-day operation of the network, including routing, firewalls, VPNs and wireless, and to resolve complex faults.",
          responsibilities: [
            "Configure and maintain switches, routers, firewalls and wireless controllers across sites",
            "Manage firewall rules, site-to-site and remote access VPNs following change control",
            "Troubleshoot complex issues with packet captures, logs and monitoring data",
            "Manage ISP links, failover and bandwidth usage, holding providers to SLAs",
            "Keep configurations backed up, firmware up to date and documentation accurate"
          ],
          skills: [
            "OSPF and static routing",
            "Firewall rule management",
            "Site-to-site VPN",
            "Enterprise Wi-Fi configuration",
            "Packet capture analysis",
            "Network monitoring",
            "Firmware lifecycle management"
          ],
          tools: ["Cisco IOS XE", "Fortinet FortiGate", "Palo Alto Networks NGFW", "Aruba Central", "Wireshark", "LibreNMS"],
          certifications: ["Cisco Certified Network Associate (CCNA)", "Fortinet Certified Professional – Network Security", "Aruba Certified Mobility Professional (ACMP)"],
          aiTopics: [
            "Routing decisions, static vs dynamic routing and OSPF",
            "Firewall policy design and NAT",
            "IPsec VPN setup and troubleshooting",
            "Wireless design: channels, roaming and WPA3/802.1X",
            "Internet redundancy and failover"
          ],
          aiScenarios: [
            "A site-to-site VPN to a branch is up but users cannot reach a server across it. Walk me through your troubleshooting.",
            "The primary ISP link fails but traffic does not move to the backup link. How do you investigate and fix it?",
            "An application team asks for ‘any-any’ firewall access to make their app work. How do you handle the request?"
          ],
          aiExpectations: "A ready mid-level administrator troubleshoots across routing, firewall and VPN layers with evidence and applies changes safely. Red flags are permissive firewall rules, no config backups, or not testing failover.",
          proQuestions: [
            { q: "Explain how a router chooses a route when it has several options to the same destination.", lookFor: "Longest prefix match first, then administrative distance, then metric; gives an example." },
            { q: "Tell me about a time you used a packet capture to solve a problem.", lookFor: "Where they captured, filters used, what the capture showed (e.g. TCP resets, MTU, retransmissions) and the fix." },
            { q: "How do you design and review firewall rules?", lookFor: "Least privilege, specific sources/destinations/ports, named objects, comments, change tickets and periodic review of unused rules." },
            { q: "Describe how you troubleshoot an IPsec tunnel that will not come up.", lookFor: "Checks phase 1/phase 2 parameters, PSK/certs, peer IPs, NAT-T, interesting traffic/proxy IDs, logs on both sides." },
            { q: "How have you set up internet failover, and how did you test it?", lookFor: "Dual ISPs, SLA/health monitoring, failover routing or SD-WAN, scheduled failover test with results." }
          ]
        },
        senior: {
          minYears: 5,
          focus: "Trusted to design and own the network architecture, security segmentation and resilience, and lead major network projects and incidents.",
          responsibilities: [
            "Design LAN, WAN, wireless and data centre or cloud network architecture for performance and resilience",
            "Own network security architecture including segmentation, NAC and secure remote access",
            "Lead network refresh, SD-WAN and cloud connectivity projects with vendors and ISPs",
            "Lead major network incidents and post-incident reviews",
            "Set network standards, mentor administrators and plan capacity and budget"
          ],
          skills: [
            "Network architecture design",
            "BGP routing",
            "SD-WAN design",
            "Network segmentation",
            "Network access control",
            "Cloud networking",
            "Network automation"
          ],
          tools: ["Cisco Catalyst Center", "Fortinet FortiGate", "Palo Alto Networks Panorama", "Cisco Identity Services Engine (ISE)", "Ansible", "NetBox"],
          certifications: ["Cisco Certified Network Professional (CCNP) Enterprise", "Palo Alto Networks Certified Network Security Engineer (PCNSE)", "Fortinet Certified Solution Specialist – Network Security"],
          aiTopics: [
            "Resilient WAN and multi-ISP design including BGP",
            "Segmentation and zero trust network access",
            "SD-WAN and cloud connectivity",
            "Network automation and source of truth",
            "Capacity planning and lifecycle"
          ],
          aiScenarios: [
            "The company is opening ten branches across Nigeria with unreliable connectivity. Design the WAN and explain your trade-offs.",
            "A malware outbreak spread quickly across a flat network. How would you redesign segmentation without stopping the business?",
            "Leadership asks why the network costs so much and whether SD-WAN could save money. How do you build the case?"
          ],
          aiExpectations: "A ready senior designs resilient, secure networks that fit business needs and budget, and leads change across teams and vendors. Red flags are designs with single points of failure, flat networks, or recommending products before understanding requirements.",
          proQuestions: [
            { q: "Walk me through a network design you owned. What requirements drove it and what would you change now?", lookFor: "Clear requirements, redundancy, security zones, capacity, trade-offs explained and honest reflection." },
            { q: "How would you implement network segmentation in an existing flat network?", lookFor: "Asset/traffic discovery, define zones, phased VLAN/VRF and firewall policies, monitor mode first, change control." },
            { q: "Tell me about a major network outage you led. How did you run it?", lookFor: "Clear roles, evidence-led troubleshooting, communication cadence, vendor/ISP escalation and post-incident actions." },
            { q: "How do you approach network automation in a team new to it?", lookFor: "Start with source of truth and config backups, read-only automation, version control, review and gradual change automation." },
            { q: "How do you hold ISPs and vendors accountable?", lookFor: "Defined SLAs, monitoring evidence, escalation paths, regular reviews and diverse providers/paths." }
          ]
        }
      },
      hrScenarios: [
        { q: "Tell me about a time you had to schedule disruptive network work. How did you agree it with the business?", lookFor: "Consulted stakeholders, chose a low-impact window, communicated clearly and had a rollback plan." },
        { q: "Describe a time you disagreed with a vendor or ISP about the cause of a fault.", lookFor: "Stayed professional, gathered evidence, escalated properly and reached a resolution." },
        { q: "You notice a colleague has been making undocumented firewall changes. What do you do?", lookFor: "Raises it directly and respectfully, explains the risk and involves the manager if it continues." }
      ],
      curriculum: {
        foundational: {
          title: "Networking Foundations",
          summary: "A starter course on TCP/IP, subnetting, switching, VLANs, Wi-Fi and layered troubleshooting for people entering network support.",
          duration: "5 weeks",
          modules: [
            { type: "text", title: "How Networks Move Data", content: "Networks are explained with layered models. The TCP/IP model is practical:\n- Link (Ethernet, Wi-Fi): frames between devices on the same network using MAC addresses.\n- Internet (IP): packets between networks using IP addresses; routers forward them.\n- Transport (TCP, UDP): ports identify applications; TCP is reliable, UDP is lightweight.\n- Application (HTTP, DNS, SMTP).\n\nThe OSI model adds detail (seven layers) and is useful for troubleshooting language: ‘it is a Layer 1 problem’ means physical.\n\nWhat happens when you open a website:\n1. DNS resolves the name to an IP.\n2. Your device checks if the IP is local; if not, it sends to the default gateway.\n3. ARP finds the gateway’s MAC address.\n4. The router forwards packets across networks.\n5. TCP connects to port 443 and TLS secures the session.\n\nEach step is a place where something can fail, which is why a layered approach to troubleshooting works." },
            { type: "text", title: "IP Addressing and Subnetting", content: "An IPv4 address has 32 bits written as four octets, e.g. 192.168.10.25. The prefix (/24) says how many bits are the network part.\n\nQuick method for usable hosts: 2^(32 − prefix) − 2.\n- /24: 256 addresses, 254 usable.\n- /26: 64 addresses, 62 usable.\n- /30: 4 addresses, 2 usable (point-to-point links).\n\nWorked example: 192.168.10.0/26 gives four subnets of 64:\n- 192.168.10.0–63 (usable .1–.62, broadcast .63)\n- 192.168.10.64–127\n- 192.168.10.128–191\n- 192.168.10.192–255\n\nPrivate ranges (RFC 1918): 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16. NAT translates them to public addresses at the internet edge.\n\nIPv6 uses 128-bit addresses written in hex, like 2001:db8::1. Many ISPs now offer it, so learn the basics: /64 subnets, link-local addresses (fe80::), and that NAT is usually not used.\n\nPlan addressing so each VLAN has room to grow, and record it in IPAM." },
            { type: "text", title: "Switching, VLANs and Wi-Fi", content: "Switches forward frames using a MAC address table. VLANs split one physical switch into separate logical networks, for example Staff, Voice, Guest and Printers.\n\n- Access port: carries one VLAN to an end device.\n- Trunk port: carries many tagged VLANs between switches, routers and access points (802.1Q).\n- Inter-VLAN routing happens on a Layer 3 switch or firewall, where you can control traffic.\n- Spanning Tree Protocol prevents loops when there are redundant links.\n\nCisco example:\ninterface Gi1/0/10\n switchport mode access\n switchport access vlan 20\n\nWi-Fi basics:\n- 2.4 GHz has longer range but few non-overlapping channels (1, 6, 11) and more interference; 5 GHz and 6 GHz offer more capacity.\n- Plan coverage and capacity, not just signal.\n- Use WPA3 or WPA2-Enterprise (802.1X) for staff, and an isolated guest network.\n\nCommon Wi-Fi issues: co-channel interference, too many clients per AP, weak signal at the edge, and authentication failures." },
            { type: "text", title: "Layered Troubleshooting and Tools", content: "Work bottom-up (or top-down), but always methodically.\n\n1. Physical: link light, cable, port status (show interfaces status), errors on the interface.\n2. Data link: correct VLAN? MAC learned on the port (show mac address-table)?\n3. Network: correct IP, mask, gateway? Can you ping the gateway? traceroute to the destination?\n4. Name resolution: does nslookup work?\n5. Application: is the service listening? Is a firewall blocking the port (Test-NetConnection host -Port 443)?\n\nTools: ping, traceroute/tracert, show commands, Wireshark for packet captures, monitoring systems (PRTG, LibreNMS, Zabbix) for history.\n\nWorked example: A user’s wired port is dead after a desk move. Link light is on. show interfaces status shows the port in VLAN 1 instead of VLAN 20. You correct the VLAN, confirm DHCP address and connectivity, save the config and update the port record.\n\nFor internet outages, check your edge device, power to the ISP router or microwave/fibre equipment, and the ISP’s status before calling them." },
            { type: "quiz", title: "Networking Foundations Quiz", questions: [
              { q: "How many usable host addresses are in a /26 subnet?", options: ["64", "30", "62", "126"], answer: 2 },
              { q: "A device can reach other devices on its own subnet but not other networks. What is the most likely misconfiguration?", options: ["Wrong or missing default gateway", "Wrong DNS server", "Faulty monitor", "Expired Wi-Fi password"], answer: 0 },
              { q: "What is the main purpose of a trunk port?", options: ["To connect a single PC", "To carry multiple tagged VLANs between network devices", "To block all traffic", "To provide power to phones"], answer: 1 },
              { q: "Why is 2.4 GHz Wi-Fi more prone to interference in busy offices?", options: ["It uses encryption", "It has shorter range", "It only supports old devices", "It has only three non-overlapping channels"], answer: 3 },
              { q: "What does Spanning Tree Protocol prevent?", options: ["IP address conflicts", "Layer 2 loops when redundant links exist", "DNS failures", "Weak Wi-Fi signals"], answer: 1 },
              { q: "Which address is in an RFC 1918 private range?", options: ["8.8.8.8", "41.58.10.1", "172.20.5.10", "197.210.1.1"], answer: 2 }
            ] },
            { type: "assignment", title: "Small Office Network Design and Lab", maxScore: 100, content: "Design and build (in Cisco Packet Tracer or GNS3) a network for a 60-person office with staff, voice, guest and printer VLANs, a Layer 3 switch or router for inter-VLAN routing, DHCP, and an internet edge with NAT.\n\nDeliverables: IP addressing plan, network diagram, exported lab file and a one-page troubleshooting guide for a common fault. Include a short note explaining how you would extend the design if the office doubled in size.\n\nGrading: correct addressing and VLAN design (30), working configuration (35), security of the guest network (15), documentation quality (20)." }
          ]
        },
        intensive: {
          title: "Network Administration Professional",
          summary: "A job-ready programme on routing, firewalls, VPNs, enterprise Wi-Fi, WAN resilience, monitoring and network automation.",
          duration: "10 weeks",
          modules: [
            { type: "text", title: "Routing and Internet Edge", content: "Routers choose paths using the routing table.\n\nRoute selection order:\n1. Longest prefix match (a /24 beats a /16).\n2. Administrative distance between sources (connected 0, static 1, OSPF 110 on Cisco).\n3. Metric within a protocol.\n\nStatic routes suit small, stable networks. OSPF suits larger internal networks: it learns topology and reroutes around failures. BGP is used with ISPs and between large networks.\n\nInternet edge design:\n- Dual ISPs, ideally using different physical paths (e.g. fibre plus microwave or a different provider).\n- Health checks (IP SLA, SD-WAN probes) so failover triggers on real loss, not just link down.\n- NAT and firewall policy at the edge.\n\nWorked example: Failover never happened because the primary link stayed ‘up’ while the ISP upstream was down. Adding an SLA probe to a reliable external target, tied to the default route, fixed the design. A scheduled failover test proved it worked." },
            { type: "text", title: "Firewalls, NAT and VPNs", content: "Next-generation firewalls (FortiGate, Palo Alto, Check Point) control traffic between zones using policies based on source, destination, service, application and user.\n\nRule design:\n- Least privilege: specific sources, destinations and ports.\n- Named objects and comments with the ticket number.\n- Order matters: rules are matched top-down.\n- Log denies and important allows; review unused rules regularly.\n\nNAT: source NAT lets private hosts reach the internet; destination NAT (port forwarding) publishes internal services, which needs strict policy and preferably a reverse proxy or WAF.\n\nIPsec site-to-site VPN troubleshooting:\n1. Phase 1 (IKE): peers, authentication, encryption and DH group must match.\n2. Phase 2 (IPsec): proxy IDs or traffic selectors and parameters must match.\n3. Routing: both sides must route the remote subnets into the tunnel.\n4. Firewall policy must allow the traffic.\n\nRemote access VPN or zero trust network access should require MFA and, ideally, device posture checks." },
            { type: "text", title: "Enterprise Wireless and Network Access Control", content: "Enterprise Wi-Fi needs design, not just more access points.\n\nDesign steps:\n1. Requirements: users, devices per user, applications (voice and video need low latency).\n2. Predictive survey with a tool such as Ekahau, then on-site validation.\n3. Channel plan: prefer 5 GHz and 6 GHz, use 20 or 40 MHz channels in dense areas, avoid co-channel interference.\n4. Roaming: consistent SSIDs and 802.11k/v/r where supported.\n\nSecurity:\n- Staff: WPA3-Enterprise or WPA2-Enterprise with 802.1X, authenticating against RADIUS (Cisco ISE, Aruba ClearPass, Microsoft NPS).\n- Guest: isolated VLAN, client isolation, captive portal, bandwidth limits.\n- IoT: separate SSID or VLAN with restricted access.\n\nNetwork access control (NAC) applies the same idea to wired ports: devices authenticate, then get the right VLAN or policy.\n\nTroubleshooting: check signal and noise, channel utilisation, client count per AP, and RADIUS logs for authentication failures." },
            { type: "text", title: "Monitoring, Documentation and Automation", content: "You cannot manage what you cannot see.\n\nMonitoring essentials:\n- SNMP or streaming telemetry for device health, interface usage and errors.\n- Flow data (NetFlow/sFlow) to see who uses bandwidth.\n- Syslog centralised for troubleshooting and security.\n- Alerts on link down, high errors, high utilisation, failover events and certificate or licence expiry.\n\nDocumentation: a source of truth (NetBox or similar) for IP addresses, devices, cables and circuits; up-to-date diagrams; configuration backups (Oxidized, RANCID or vendor tools) with change history.\n\nAutomation:\n- Start read-only: collect show outputs and compliance checks with Python (Netmiko, NAPALM) or Ansible.\n- Then automate standard changes such as VLAN creation using templates.\n- Keep code in Git, review changes and test in a lab.\n\nWorked example: A weekly script compares every switch config against a standard; drift such as an unauthorised trunk is reported automatically, catching mistakes before they cause outages." },
            { type: "assignment", title: "Firewall and VPN Lab", maxScore: 100, content: "In a lab (FortiGate VM, pfSense or Palo Alto VM-Series trial with GNS3/EVE-NG), connect a head office and a branch.\n\nTasks: create zones and least-privilege policies, configure source NAT and one published service, build a site-to-site IPsec VPN, and set up remote access VPN with MFA if available. Then break and fix the VPN once, documenting the troubleshooting.\n\nDeliverables: configuration exports, a diagram and a report (max five pages).\n\nGrading: working VPN and NAT (35), policy quality and security (30), troubleshooting evidence (20), documentation (15)." },
            { type: "quiz", title: "Network Administration Professional Quiz", questions: [
              { q: "A router has routes to 10.1.0.0/16 and 10.1.5.0/24. Which route is used for traffic to 10.1.5.20?", options: ["10.1.0.0/16 because it was learned first", "10.1.5.0/24 because it is the longest prefix match", "Whichever has the lower metric", "The default route"], answer: 1 },
              { q: "Internet failover did not trigger although the ISP was not passing traffic. What is the most likely design gap?", options: ["No health probe; failover relied only on the physical link going down", "The firewall had too many rules", "DHCP leases were too short", "The Wi-Fi channel was wrong"], answer: 0 },
              { q: "An IPsec tunnel’s phase 1 is up but no traffic passes. What should you check next?", options: ["The ISP contract", "The users’ passwords", "Phase 2 traffic selectors, routing and firewall policy", "The DNS server's TTL values"], answer: 2 },
              { q: "Why are firewall rules processed in order important?", options: ["They are not; firewalls evaluate all rules equally", "Only the last rule matters", "Order affects only logging", "The first matching rule decides the action, so a broad rule above can override specific ones"], answer: 3 },
              { q: "What is the main purpose of 802.1X on a staff Wi-Fi network?", options: ["To increase signal strength", "To authenticate each user or device individually against a RADIUS server", "To provide guest internet access", "To select the best channel"], answer: 1 },
              { q: "What is the safest first step when introducing network automation?", options: ["Push configuration changes to all devices at once", "Disable configuration backups", "Start with read-only data collection and compliance checks", "Give automation scripts admin credentials stored in plain text"], answer: 2 }
            ] },
            { type: "assignment", title: "Capstone: Multi-Site Network for a Growing Business", maxScore: 100, content: "Shared brief: A Nigerian microfinance bank has a Lagos head office and six branches with unreliable ISP links and frequent power interruptions. It uses core banking in a data centre, Microsoft 365 and mobile-money integrations, and must protect customer data under NDPA 2023.\nJunior: In a lab, build a branch network with VLANs, DHCP, guest Wi-Fi isolation and internet access, then document it and solve three provided fault scenarios.\nMid: Build head office and two branches in a lab with routing, firewall zones, site-to-site VPNs, ISP failover with health checks, and monitoring with alerts.\nSenior: Produce a network architecture covering WAN/SD-WAN design, ISP diversity, segmentation and NAC, secure remote access, monitoring and automation, and a costed, phased roadmap with risks.\nDeliverables: lab files and documentation, or the architecture document for your level, plus a 10-minute recorded presentation.\nGrading: technical correctness (35), security and resilience (25), fit to the local context (20), level-appropriate judgement and communication (20)." }
          ]
        }
      }
    }
  ]
};

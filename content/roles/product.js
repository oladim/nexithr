// NexIT-Africa role catalog — Product & Design area
export default {
  key: "product",
  title: "Product & Design",
  summary: "Roles that decide what gets built and how it feels to use: designing interfaces, researching users, prioritising and shipping products, and translating business needs into clear requirements.",
  roles: [
    {
      id: "uiux",
      title: "UI/UX Designer",
      summary: "Designs the flows, screens and interactions of digital products, turning user needs and business goals into usable, accessible and visually consistent interfaces. Works inside a product squad alongside product managers, researchers and engineers, owning design from wireframe to developer handoff.",
      competencies: [
        { name: "Interaction & flow design", weight: 25, description: "Structures tasks, navigation and states so users can complete goals with minimal friction and error." },
        { name: "Visual & UI craft", weight: 20, description: "Applies layout, typography, colour, hierarchy and spacing to produce clear, consistent, on-brand interfaces." },
        { name: "Design systems & components", weight: 20, description: "Builds and uses reusable components, tokens and patterns with variants and documented usage." },
        { name: "Prototyping & usability validation", weight: 20, description: "Creates testable prototypes and uses usability evidence to iterate on designs." },
        { name: "Accessibility & handoff", weight: 15, description: "Designs to WCAG 2.2 standards and hands off specs engineers can build accurately." }
      ],
      levels: {
        junior: {
          minYears: 0,
          focus: "Delivers well-scoped screens and flows within an existing design system under the guidance of a senior designer.",
          responsibilities: [
            "Produce wireframes and high-fidelity screens for defined features using the team’s component library",
            "Build clickable prototypes in Figma for review and usability sessions",
            "Design all interface states (empty, loading, error, success) for assigned screens",
            "Prepare annotated handoff files with spacing, tokens and interaction notes for developers",
            "Take notes in usability tests and apply feedback to iterate designs"
          ],
          skills: [
            "Wireframing",
            "High-fidelity UI design",
            "Figma auto layout",
            "Clickable prototyping",
            "Typography and spacing",
            "Responsive layout grids",
            "Developer handoff annotation"
          ],
          tools: ["Figma", "FigJam", "Miro", "Maze", "Notion", "Jira"],
          certifications: ["Google UX Design Professional Certificate", "Interaction Design Foundation UX Design Course Certificate"],
          aiTopics: [
            "Visual hierarchy, typography and spacing fundamentals",
            "Designing complete interface states beyond the happy path",
            "Using components, variants and auto layout in Figma",
            "Basic accessibility: contrast, tap targets and labels",
            "Responsive design for low-end Android devices and small screens"
          ],
          aiScenarios: [
            "You are given a sign-up form with five fields and asked to design it for mobile. Walk me through how you lay it out and handle validation errors.",
            "A developer says your screen is missing what happens when the network fails. How would you design and document that state?",
            "Your lead says a screen ‘feels cluttered’. Walk me through the specific changes you would try first."
          ],
          aiExpectations: "A ready junior explains design decisions in terms of the user’s task, uses components and spacing consistently, and remembers error and empty states. Red flags are describing only aesthetics, no awareness of accessibility basics, or a portfolio of Dribbble shots with no process or problem statement.",
          proQuestions: [
            { q: "Walk me through one portfolio project from problem to final screens. What did you personally design?", lookFor: "A clear problem statement, their specific contribution, iterations with reasons, and honesty about what they would change." },
            { q: "Show me how you built a component in Figma that has multiple variants. Why did you structure it that way?", lookFor: "Practical use of variants, properties and auto layout, with awareness of how others will reuse it." },
            { q: "Tell me about a time feedback on your design was hard to hear. What did you do with it?", lookFor: "Separating ego from work, asking clarifying questions, and showing the revised outcome." },
            { q: "How do you check that a design is accessible before handing it off?", lookFor: "Concrete checks such as contrast ratios, 44–48px touch targets, labels, focus order and not relying on colour alone." },
            { q: "Describe a design you handed to a developer that came back built differently. What happened and what did you learn?", lookFor: "Ownership of unclear specs, collaboration with the developer, and a concrete improvement to their handoff practice." }
          ]
        },
        mid: {
          minYears: 2,
          focus: "Owns end-to-end design of features, from framing the problem and running light validation to shipping and measuring outcomes.",
          responsibilities: [
            "Own design for a product area end to end, from problem framing to post-launch iteration",
            "Plan and run lightweight usability tests and synthesise findings into design changes",
            "Contribute new components and patterns to the design system with documentation",
            "Partner with the product manager to define success metrics and scope trade-offs",
            "Review build quality with engineers and log design QA issues before release"
          ],
          skills: [
            "End-to-end feature design",
            "Information architecture",
            "Usability testing",
            "Design system contribution",
            "Interaction design patterns",
            "WCAG 2.2 accessibility",
            "Design QA"
          ],
          tools: ["Figma", "Maze", "Hotjar", "Mixpanel", "Storybook", "Jira"],
          certifications: ["NN/g UX Certification", "IAAP Certified Professional in Accessibility Core Competencies (CPACC)"],
          aiTopics: [
            "Information architecture and navigation design",
            "Planning and running usability tests",
            "Contributing to and governing design systems",
            "Using analytics and research to justify design decisions",
            "Accessibility beyond contrast: focus, screen readers, motion"
          ],
          aiScenarios: [
            "Checkout completion on a mobile-money payment flow dropped after a redesign. Walk me through how you would find and fix the problem.",
            "Two squads have built slightly different date pickers. How would you resolve this through the design system?",
            "The PM wants to ship a feature in two weeks that you believe needs four. Walk me through how you would scope a version that is still usable."
          ],
          aiExpectations: "A ready mid-level designer frames problems before solutions, uses evidence (tests, analytics) to make and defend decisions, and thinks in reusable patterns. Red flags are no measurable outcomes, ignoring constraints like engineering cost, or treating usability testing as optional.",
          proQuestions: [
            { q: "Tell me about a feature you owned end to end. How did you know it worked after launch?", lookFor: "Defined success metrics, evidence gathered post-launch and a specific iteration made from it." },
            { q: "Describe a usability test you planned and ran. What changed because of it?", lookFor: "Clear tasks, appropriate participants, unbiased moderation and a concrete design change traced to findings." },
            { q: "Walk me through a component you added to the design system. How did you get adoption?", lookFor: "Audit of existing patterns, documented usage and states, collaboration with engineers and a rollout approach." },
            { q: "Give an example of a trade-off you negotiated with a PM or engineer.", lookFor: "Understanding of the other side’s constraints, options offered rather than ultimatums, and a reasoned outcome." },
            { q: "How have you designed for users on low bandwidth or older devices?", lookFor: "Practical tactics such as lightweight assets, offline or retry states, progressive loading and testing on real low-end devices." }
          ]
        },
        senior: {
          minYears: 5,
          focus: "Leads design direction across a product or platform, sets quality standards, and mentors designers while shaping product strategy.",
          responsibilities: [
            "Lead design vision and strategy for a product line, aligning it with business goals",
            "Own the design system’s direction, governance and adoption across squads",
            "Mentor and review the work of junior and mid-level designers",
            "Facilitate cross-functional workshops to define problems and align stakeholders",
            "Set design quality standards, critique rituals and accessibility practices for the team"
          ],
          skills: [
            "Design strategy",
            "Design system governance",
            "Design leadership",
            "Workshop facilitation",
            "Service design",
            "Design critique",
            "Stakeholder alignment"
          ],
          tools: ["Figma", "FigJam", "Dovetail", "Amplitude", "Storybook", "Confluence"],
          certifications: ["NN/g UX Certification with Specialty (UX Management)", "IAAP Web Accessibility Specialist (WAS)"],
          aiTopics: [
            "Setting and communicating design vision",
            "Scaling design systems across multiple squads and platforms",
            "Measuring design impact on business outcomes",
            "Building design culture, critique and mentoring",
            "Balancing speed, quality and accessibility at organisational level"
          ],
          aiScenarios: [
            "Leadership wants to merge three legacy apps of a bank into one super-app. Walk me through how you would lead design for the transition.",
            "Design quality has dropped as the team grew from 3 to 10 designers. What would you change in the first 90 days?",
            "An executive insists on a design direction that research contradicts. How would you handle it?"
          ],
          aiExpectations: "A ready senior designer connects design decisions to business outcomes, scales quality through systems and people, and influences without authority. Red flags are focusing only on their own pixels, no mentoring examples, or inability to describe how they measured design impact.",
          proQuestions: [
            { q: "Describe a time you set the design direction for a product. How did you get buy-in?", lookFor: "A clear vision artefact, evidence base, stakeholder engagement and measurable results." },
            { q: "How have you governed a design system across multiple teams?", lookFor: "Contribution model, versioning, ownership, adoption metrics and handling of exceptions." },
            { q: "Tell me about a designer you mentored. What did you do and how did they grow?", lookFor: "Specific coaching actions, feedback structure and observable growth in the mentee." },
            { q: "Give an example where you pushed back on leadership using evidence.", lookFor: "Respectful challenge, data or research to support it, alternatives offered and the outcome." },
            { q: "How do you measure the impact of design on the business?", lookFor: "Linking design work to metrics such as conversion, task success, support tickets or retention, with an honest view of attribution." }
          ]
        }
      },
      hrScenarios: [
        { q: "Tell me about a time a stakeholder rejected a design you believed in. How did you respond?", lookFor: "Composure, curiosity about the objection and a constructive path forward rather than defensiveness." },
        { q: "Describe a deadline where you had to cut design scope. How did you decide what to keep?", lookFor: "Prioritising user-critical elements, transparent communication and follow-up for deferred work." },
        { q: "Tell me about a time you collaborated closely with an engineer to solve a problem.", lookFor: "Mutual respect, shared problem-solving and a better outcome than either would have reached alone." }
      ],
      curriculum: {
        foundational: {
          title: "UI/UX Design Foundations",
          summary: "A practical introduction to user-centred design, from understanding users to building and testing a clickable prototype in Figma.",
          duration: "4 weeks",
          modules: [
            { type: "text", title: "What UX and UI Design Really Are", content: "UX (user experience) design is about how a product works for the person using it: can they find what they need, complete their task and trust the result? UI (user interface) design is the visible layer: layout, typography, colour, buttons and feedback. Good products need both.\n\nMost teams follow a loop rather than a straight line: understand the problem, define who it is for, explore ideas, prototype, test and iterate. The Double Diamond model describes this as discovering and defining the right problem, then developing and delivering the right solution.\n\nWorked example: a Nigerian microfinance app sees many users abandon loan applications. A UI-only fix would restyle the buttons. A UX approach asks why: perhaps users do not have their BVN to hand, or the form asks for too much at once. The fix might be splitting the form into steps, saving progress and explaining why each item is needed.\n\nChecklist before designing anything:\n- Who is the user and what are they trying to do?\n- What is the business goal?\n- What constraints exist (devices, data costs, regulation)?\n- How will we know it worked?" },
            { type: "text", title: "Layout, Typography and Visual Hierarchy", content: "Visual hierarchy tells users what to look at first. You create it with size, weight, colour, spacing and position. The most important element on a screen should be obvious within a second.\n\nKey principles:\n- Use a spacing scale (for example 4, 8, 12, 16, 24, 32) instead of random values. Consistent spacing makes interfaces feel calm.\n- Limit type styles. A typical mobile app needs a display, a heading, a subheading, body and caption style. Keep body text at 16px or larger on mobile.\n- Group related items with proximity, and separate unrelated ones with space rather than lines.\n- Use one primary action per screen. Secondary actions should look visually quieter.\n- Align to a grid. A 4-column grid with 16px margins is common for mobile.\n\nWorked example: a transfer confirmation screen shows amount, recipient, bank, fee and a Confirm button. Make the amount the largest text, group recipient and bank together, show the fee clearly (hidden fees destroy trust), and place a single full-width Confirm button at the bottom within thumb reach, with Cancel as a text link." },
            { type: "text", title: "Working in Figma: Frames, Auto Layout and Components", content: "Figma is the industry-standard tool for interface design. Learning a few core features well will make you faster and your files easier for others to use.\n\nFrames are containers for screens or parts of screens. Auto layout makes a frame behave like a flexible stack: children are placed in a row or column with set padding and gaps, and the frame resizes as content changes. A button built with auto layout grows when its label gets longer.\n\nComponents are reusable elements. Edit the main component and every instance updates. Variants group related versions, such as a button with properties for Type (primary, secondary), Size (small, large) and State (default, pressed, disabled).\n\nStyles and variables store colours, text styles and spacing so the whole file stays consistent and can support light and dark themes.\n\nWorked checklist for a button component:\n1. Create a frame with auto layout, horizontal, 12px vertical and 16px horizontal padding.\n2. Add a text layer using your Body/Medium style.\n3. Apply a colour variable for the fill.\n4. Convert to component and add variants for state.\n5. Name layers clearly so developers can read them." },
            { type: "text", title: "Prototyping, Usability Testing and Accessibility", content: "A prototype lets people experience a design before it is built. In Figma you connect frames with interactions such as On tap, Navigate to, and add smart animate for transitions. Keep prototypes focused on the tasks you want to test.\n\nUsability testing means watching real users try to complete tasks. Five participants per round usually reveal the most serious problems. Write tasks as goals, not instructions: ‘Send ₦5,000 to a friend’ rather than ‘Tap the Send button’. Stay neutral, ask them to think aloud, and note where they hesitate or fail.\n\nAccessibility ensures people with disabilities can use your product, and it improves usability for everyone. Core checks from WCAG 2.2:\n- Text contrast of at least 4.5:1 for normal text.\n- Touch targets large enough to tap reliably (aim for 44–48px).\n- Every input has a visible label, not just placeholder text.\n- Never use colour alone to convey meaning; add icons or text.\n- Error messages explain what went wrong and how to fix it.\n\nAfter testing, list issues by severity, fix the most serious first, and test again." },
            { type: "quiz", title: "Foundations Check", questions: [
              { q: "A loan app has a high drop-off on its application form. Which response best reflects a UX approach?", options: ["Change the button colour to something brighter", "Investigate why users abandon, then restructure the flow based on findings", "Add more fields so the form collects everything at once", "Replace the form with a long terms-and-conditions page"], answer: 1 },
              { q: "What is the main benefit of using a consistent spacing scale?", options: ["It reduces file size", "It removes the need for a grid", "It makes layouts feel consistent and easier to scan", "It guarantees accessibility compliance"], answer: 2 },
              { q: "In Figma, what does auto layout primarily do?", options: ["Makes a frame stack and resize its children automatically based on padding and gaps", "Automatically generates code for developers", "Exports screens as images", "Checks colour contrast"], answer: 0 },
              { q: "Which usability test task is written best?", options: ["Tap the blue Send button on the home screen", "Do you like the Send feature?", "Find the Send button and tell us if it is big enough", "Send ₦5,000 to a friend"], answer: 3 },
              { q: "Why should form inputs have visible labels rather than placeholder text only?", options: ["Placeholders are not supported on Android", "Placeholders disappear when typing, so users lose context and screen readers may not announce them reliably", "Labels make the form look longer", "Placeholders cannot be styled"], answer: 1 },
              { q: "A status uses only red and green dots to show failed and successful payments. What is the main problem?", options: ["Red and green are not brand colours", "The dots are too small to export", "Meaning relies on colour alone, which excludes colour-blind users", "There is no problem if the contrast is high"], answer: 2 }
            ] },
            { type: "assignment", title: "Design and Test a Mobile Airtime Purchase Flow", maxScore: 100, content: "Brief: design a mobile flow that lets a user buy airtime or data for themselves or another number, choose a network, pay by card or bank transfer, and see a clear success or failure result.\n\nDeliverables:\n1. A short problem statement and one-line user profile.\n2. Low-fidelity wireframes of the full flow.\n3. High-fidelity Figma screens including empty, loading, error and success states, built with at least three components using auto layout.\n4. A clickable prototype link.\n5. Notes from testing with at least three people: tasks, issues found and changes made.\n\nGrading: problem framing 15, flow logic and completeness of states 25, visual hierarchy and consistency 25, accessibility basics 15, testing and iteration evidence 20." }
          ]
        },
        intensive: {
          title: "UI/UX Design Intensive: Job-Ready Product Design",
          summary: "Deep, portfolio-focused training in information architecture, design systems, research-led iteration and engineering handoff, ending in a level-aware capstone.",
          duration: "8 weeks",
          modules: [
            { type: "text", title: "Information Architecture and Navigation", content: "Information architecture (IA) is how content and features are organised and labelled so people can find them. Poor IA is one of the most common reasons users say an app is ‘confusing’.\n\nMethods:\n- Content inventory: list every screen and feature you have.\n- Card sorting: ask users to group items and name the groups. Open sorts reveal mental models; closed sorts test your proposed categories.\n- Tree testing: give users a text-only menu and a task to see if they can find items without visual design influencing them.\n\nNavigation patterns on mobile: bottom tab bars for 3–5 top-level destinations, stacked navigation for drilling into detail, and a home screen of shortcuts for frequent tasks. Avoid hiding core features in a hamburger menu.\n\nWorked example: a fintech app has Transfers, Airtime, Bills, Savings, Loans, Cards, Statements, Support and Settings. A card sort might show users group Airtime and Bills as ‘Pay’, see Savings and Loans as ‘Grow’, and expect Statements under the account view. The result could be four tabs: Home, Pay, Grow, Me, with shortcuts on Home for the most-used actions." },
            { type: "text", title: "Building and Governing Design Systems", content: "A design system is a shared set of foundations, components, patterns and guidance that lets teams build consistent products faster.\n\nLayers:\n- Design tokens: named values for colour, type, spacing, radius and elevation (for example color.text.primary). Tokens let you theme products and sync with code.\n- Components: buttons, inputs, cards, modals, with variants and states.\n- Patterns: combinations that solve recurring problems, such as form validation or empty states.\n- Documentation: when to use, when not to use, accessibility notes and do and don’t examples.\n\nGovernance keeps the system healthy. Decide who owns it, how teams propose new components, how changes are versioned and communicated, and how you deprecate old ones.\n\nWorked example: two squads built different date pickers. Audit both, list the use cases each solves, design one component that covers them with variants, document it, ship it in both Figma and the coded library (often Storybook), and set a migration deadline. Track adoption by counting detached instances in Figma and legacy usages in code." },
            { type: "text", title: "Research-Led Iteration and Measuring Design", content: "Mid and senior designers are expected to show that their work made a difference. That means combining qualitative and quantitative evidence.\n\nQualitative: usability tests and interviews explain why users struggle. Quantitative: analytics show how many struggle and where. Tools like Mixpanel or Amplitude show funnels; Hotjar or Microsoft Clarity show session recordings and heatmaps.\n\nA practical loop:\n1. Spot a problem in data (for example 40% drop-off on step 3).\n2. Watch recordings or run tests to understand why.\n3. Form a hypothesis: ‘If we pre-fill the bank name from the account number, more users will complete step 3.’\n4. Design and test the change.\n5. Ship, ideally as an A/B test, and compare against the metric.\n\nDefine success metrics before designing: task success rate, time on task, error rate, conversion, or support tickets. Avoid vanity metrics such as page views. Be honest about attribution: a marketing campaign at the same time can skew results, so note confounding factors." },
            { type: "text", title: "Handoff, Design QA and Working with Engineers", content: "A design is not done until it is built well. Strong handoff reduces rework and builds trust with engineers.\n\nGood handoff includes:\n- Final screens using system components and tokens, not detached copies.\n- All states: default, hover or pressed, focus, disabled, loading, empty, error and success.\n- Responsive behaviour: how layouts adapt from small Android phones to tablets and web.\n- Interaction notes: transitions, timings, validation rules and edge cases such as very long names or zero balances.\n- Accessibility notes: focus order, screen reader labels and heading levels.\n\nUse Figma Dev Mode so engineers can inspect values and see linked code components. Involve engineers early, ideally at the wireframe stage, so feasibility issues surface before polish.\n\nDesign QA happens before release. Compare the build with the design on real devices, log issues in Jira with screenshots and severity, and agree which must be fixed before launch. In markets with patchy connectivity, test slow-network and offline behaviour too, using browser throttling or a real device on a weak connection." },
            { type: "assignment", title: "Design System Audit and Component Spec", maxScore: 100, content: "Brief: pick a live African fintech, e-commerce or transport app (use only publicly visible screens). Audit its interface for consistency.\n\nDeliverables:\n1. An audit board showing inconsistencies in buttons, inputs, colours, type and spacing.\n2. A proposed token set (colour, type, spacing) in Figma variables.\n3. One fully specified component (for example a text input) with variants for size and state, accessibility notes and do and don’t usage guidance.\n4. A one-page governance proposal: ownership, contribution process and versioning.\n\nGrading: audit depth 20, token structure 20, component quality and states 30, documentation clarity 15, governance thinking 15." },
            { type: "quiz", title: "Intensive Knowledge Check", questions: [
              { q: "What is the main purpose of tree testing?", options: ["Testing visual design preferences", "Checking whether users can find items in a proposed navigation structure without visual design", "Measuring page load speed", "Generating new feature ideas"], answer: 1 },
              { q: "Why are design tokens valuable?", options: ["They store named design values that can sync with code and support theming", "They replace the need for components", "They automatically make designs accessible", "They are required by Figma to export images"], answer: 0 },
              { q: "A funnel shows a 40% drop-off on step 3. What is the best next step?", options: ["Redesign the whole app", "Remove step 3 entirely", "Ask the CEO for their opinion", "Use recordings or usability tests to understand why users drop off"], answer: 3 },
              { q: "Which is the best example of a design success metric?", options: ["Number of screens designed", "Page views on the marketing site", "Task completion rate for the new transfer flow", "Number of Figma comments resolved"], answer: 2 },
              { q: "Which item is most often missing from weak handoffs?", options: ["The company logo", "Edge cases and non-happy-path states such as error and empty", "The designer’s name", "A list of fonts installed on the designer’s computer"], answer: 1 },
              { q: "Two squads use different versions of the same component. What is the strongest design system response?", options: ["Let each squad keep its own version", "Delete both and ask engineers to decide", "Choose whichever looks better", "Audit use cases, consolidate into one documented component with variants and plan migration"], answer: 3 }
            ] },
            { type: "assignment", title: "Capstone: Redesign a Mobile-Money Wallet Experience", maxScore: 100, content: "Shared brief: a mobile-money wallet used across Nigeria has complaints about failed transfers, confusing fees and hard-to-find transaction history. Improve the experience using research, design and evidence.\nJunior: redesign the send-money flow and transaction history screens with all states, using a provided component library, and test with three users.\nMid: own the full problem: define metrics, run five usability tests, redesign send money, history and fee disclosure, contribute two new components to the system and plan an A/B test.\nSenior: produce a design strategy for the wallet: IA review, a north-star vision prototype, design system governance plan, a roadmap of design work with metrics, and a plan for leading two designers through delivery.\nDeliverables: Figma file, prototype link, research notes and a 10-minute recorded or live presentation.\nGrading: problem framing 15, research and evidence 20, design quality and accessibility 30, systems thinking 15, communication 20, assessed against the chosen level." }
          ]
        }
      }
    }
    ,
    {
      id: "research",
      title: "UX Researcher",
      summary: "Plans and runs research that helps teams understand users’ needs, behaviours and problems, then turns findings into insights that shape product decisions. Works alongside designers and product managers, either embedded in a squad or in a central research team.",
      competencies: [
        { name: "Research planning & method selection", weight: 25, description: "Frames research questions and chooses methods that fit the decision, timeline and budget." },
        { name: "Qualitative research execution", weight: 20, description: "Recruits participants and conducts interviews, usability tests and field studies without bias." },
        { name: "Quantitative & mixed methods", weight: 20, description: "Designs surveys, uses analytics and combines data sources to size and validate findings." },
        { name: "Synthesis & insight generation", weight: 20, description: "Turns raw data into clear, evidenced insights and actionable recommendations." },
        { name: "Research ethics & operations", weight: 15, description: "Handles consent, data protection under NDPA 2023, incentives and research repositories responsibly." }
      ],
      levels: {
        junior: {
          minYears: 0,
          focus: "Runs well-defined studies using established methods under the guidance of a senior researcher.",
          responsibilities: [
            "Recruit and schedule participants against a defined screener",
            "Moderate usability tests and interviews using an agreed discussion guide",
            "Take structured notes and tag observations in the research repository",
            "Support affinity mapping and draft findings for review",
            "Manage consent forms, incentives and secure storage of recordings"
          ],
          skills: [
            "Usability test moderation",
            "User interviewing",
            "Participant recruitment",
            "Note-taking and tagging",
            "Affinity mapping",
            "Screener writing",
            "Research consent handling"
          ],
          tools: ["Dovetail", "Lookback", "Maze", "Google Forms", "Zoom", "Miro"],
          certifications: ["Google UX Design Professional Certificate", "Interaction Design Foundation User Research Course Certificate"],
          aiTopics: [
            "Writing neutral, non-leading interview questions",
            "Moderating usability tests and handling silences",
            "Recruiting representative participants",
            "Basic synthesis with affinity mapping",
            "Informed consent and handling personal data"
          ],
          aiScenarios: [
            "During a usability test, the participant asks you ‘Is this the right button?’. Walk me through how you respond and why.",
            "You need to recruit eight small-business owners in Lagos and Kano for interviews within a week. How would you approach it?",
            "Your lead gives you 12 interview transcripts. Walk me through how you would start making sense of them."
          ],
          aiExpectations: "A ready junior asks open, neutral questions, follows a guide without being rigid, and keeps participant data safe. Red flags are leading questions, treating opinions as evidence of behaviour, or no awareness of consent.",
          proQuestions: [
            { q: "Walk me through a study you ran or helped run. What was the research question and what did you find?", lookFor: "A clear question, an appropriate method, their personal role and a finding that led to action." },
            { q: "Rewrite this question to be less leading: ‘Don’t you think this new menu is easier?’", lookFor: "A neutral, open, behaviour-focused alternative such as asking them to find something and describe what they expected." },
            { q: "Tell me about a session that did not go as planned. What did you do?", lookFor: "Calm adaptation, protecting data quality and participant comfort, and lessons applied later." },
            { q: "How do you handle consent and recordings of participants?", lookFor: "Informed consent, explaining use and retention, secure storage, access limits and deletion in line with NDPA 2023." },
            { q: "How did you turn raw notes into findings in a past project?", lookFor: "A structured process such as tagging and affinity mapping, distinguishing frequency from severity, and checking with a peer." }
          ]
        },
        mid: {
          minYears: 2,
          focus: "Owns research for a product area, choosing methods independently and turning evidence into decisions the team acts on.",
          responsibilities: [
            "Plan research roadmaps with product and design partners for a product area",
            "Select and run qualitative, quantitative and mixed-method studies independently",
            "Design and analyse surveys with appropriate sampling",
            "Synthesise findings into insights, journey maps and personas that teams use",
            "Present recommendations and track whether they influenced product decisions"
          ],
          skills: [
            "Research planning",
            "Mixed-methods research",
            "Survey design",
            "Journey mapping",
            "Contextual inquiry",
            "Insight synthesis",
            "Research storytelling"
          ],
          tools: ["Dovetail", "Qualtrics", "UserTesting", "Optimal Workshop", "Mixpanel", "Miro"],
          certifications: ["NN/g UX Certification", "UXQB Certified Professional for Usability and User Experience – Foundation Level (CPUX-F)"],
          aiTopics: [
            "Matching research methods to decisions and timelines",
            "Survey design, sampling and bias",
            "Combining analytics with qualitative evidence",
            "Journey mapping and persona development grounded in data",
            "Driving stakeholder action from research"
          ],
          aiScenarios: [
            "The PM asks for a survey to find out ‘what features users want’. Walk me through how you would reframe and plan the research.",
            "Interviews suggest users love a feature, but analytics show few use it. How would you investigate the contradiction?",
            "You have two weeks to understand why agents in rural areas stop using a POS app. Walk me through your study plan."
          ],
          aiExpectations: "A ready mid-level researcher reframes requests into decision-driven questions, chooses fit-for-purpose methods and gets findings acted on. Red flags are defaulting to one method for everything, reports nobody used, or confusing what users say with what they do.",
          proQuestions: [
            { q: "Tell me about research you led that changed a product decision.", lookFor: "The original assumption, the method chosen and why, the evidence and the concrete decision that followed." },
            { q: "How do you decide between interviews, a survey and a usability test?", lookFor: "Linking method to the question: exploratory why versus how many versus can they use it, plus time and sample constraints." },
            { q: "Describe a survey you designed. How did you avoid bias?", lookFor: "Clear objectives, neutral wording, balanced scales, piloting, sampling awareness and appropriate analysis." },
            { q: "Give an example of combining analytics with qualitative findings.", lookFor: "Using data to find where, and research to explain why, then triangulating to a confident insight." },
            { q: "How have you run research with low-connectivity or low-literacy users?", lookFor: "Adapted methods such as in-person sessions, local-language moderation, voice notes, offline tools and respectful incentives." }
          ]
        },
        senior: {
          minYears: 5,
          focus: "Sets research strategy across products, builds research operations and capability, and influences company-level decisions with evidence.",
          responsibilities: [
            "Define research strategy and priorities aligned with company goals",
            "Lead foundational and generative studies that shape product strategy",
            "Build research operations: repository, recruitment panels, ethics and consent standards",
            "Mentor researchers and coach designers and PMs to run quality research",
            "Influence senior leadership with evidence and measure research impact"
          ],
          skills: [
            "Research strategy",
            "Generative research",
            "Research operations",
            "Research democratisation",
            "Executive storytelling",
            "Mentoring researchers",
            "Research impact measurement"
          ],
          tools: ["Dovetail", "Qualtrics", "UserTesting", "Great Question", "Amplitude", "Confluence"],
          certifications: ["NN/g UX Certification with Specialty (UX Research)", "UXQB Certified Professional for Usability and User Experience – User Requirements Engineering (CPUX-UR)"],
          aiTopics: [
            "Building and prioritising a research strategy",
            "Generative and foundational research design",
            "Scaling research through operations and democratisation",
            "Research governance, ethics and data protection",
            "Demonstrating research impact to leadership"
          ],
          aiScenarios: [
            "A company plans to expand its savings product from Nigeria to Ghana and Kenya. Walk me through the research programme you would lead.",
            "Research requests outnumber researchers five to one. How would you scale research without losing quality?",
            "The CEO dismisses a key finding as ‘just eight interviews’. How do you respond?"
          ],
          aiExpectations: "A ready senior researcher shapes strategy rather than only answering questions, builds systems that scale research, and wins leadership trust. Red flags are only describing individual studies, no view on research operations, or inability to show impact.",
          proQuestions: [
            { q: "Describe a research strategy you set. How did you decide what not to research?", lookFor: "Prioritisation against business risk and decisions, stakeholder alignment and explicit trade-offs." },
            { q: "Tell me about generative research you led that influenced strategy.", lookFor: "Open framing, rigorous fieldwork, synthesis into opportunity areas and a traceable strategic outcome." },
            { q: "How have you set up research operations?", lookFor: "Recruitment panels, consent and data standards, repositories, templates and metrics for adoption." },
            { q: "How have you enabled non-researchers to run research safely?", lookFor: "Training, guardrails on which studies they may run, templates, review and quality checks." },
            { q: "How do you show the value of research to leadership?", lookFor: "Tracking decisions influenced, risks avoided, metrics moved and clear narratives tied to business goals." }
          ]
        }
      },
      hrScenarios: [
        { q: "Tell me about a time your findings contradicted what a senior stakeholder wanted to hear.", lookFor: "Integrity, tactful framing with evidence, and keeping the relationship constructive." },
        { q: "Describe a time you had to deliver research under a very tight deadline.", lookFor: "Smart scoping, transparent caveats and still delivering something useful and honest." },
        { q: "Tell me about a time a participant was upset or uncomfortable during a session.", lookFor: "Empathy, prioritising participant wellbeing over data, and following ethical practice." }
      ],
      curriculum: {
        foundational: {
          title: "UX Research Foundations",
          summary: "Learn to plan, run and synthesise core user research methods ethically, from interviews to usability tests.",
          duration: "4 weeks",
          modules: [
            { type: "text", title: "Why Research and How to Frame a Study", content: "User research reduces the risk of building the wrong thing or building it badly. It answers questions such as who the users are, what problems they face, and whether a design works for them.\n\nStart every study with the decision it supports. A good research question is specific and answerable. ‘What do users think of our app?’ is too broad. ‘Why do first-time users abandon wallet setup before verifying their BVN?’ is focused.\n\nA simple research plan includes:\n- Background and the decision to be made\n- Research questions (3–5)\n- Method and why it fits\n- Participants and how you will recruit them\n- Timeline and who will observe\n- How findings will be shared\n\nResearch methods can be mapped on two axes: what people say versus what they do, and why (qualitative) versus how many (quantitative). Interviews reveal attitudes and motivations; usability tests show behaviour; surveys and analytics measure scale. Picking the right method depends on the question, not on habit.\n\nWorked example: if the team must decide whether to add USSD support, interviews with users in low-connectivity areas could reveal whether data cost or network reliability is the real barrier." },
            { type: "text", title: "Conducting User Interviews", content: "Interviews explore people’s experiences, behaviours, goals and frustrations. They are best for understanding why, not for measuring how many.\n\nPrepare a discussion guide with an introduction, warm-up questions, core topics and a wrap-up. Use it as a guide, not a script.\n\nAsk about past behaviour rather than hypothetical futures. ‘Tell me about the last time you paid a supplier’ produces richer, more reliable data than ‘Would you use a feature that pays suppliers?’\n\nGood techniques:\n- Ask open questions: how, what, tell me about.\n- Follow up with ‘Why was that?’ or ‘What happened next?’\n- Use silence; people often add detail if you wait.\n- Avoid leading words such as ‘easy’ or ‘frustrating’ unless the participant uses them first.\n- Echo their words back to clarify.\n\nPractical points for Nigerian contexts: offer interviews in the participant’s preferred language where possible, schedule around network and power reliability, and consider phone calls or in-person sessions instead of video. Always explain the purpose, get consent to record, and pay incentives promptly, for example via bank transfer or airtime." },
            { type: "text", title: "Running Usability Tests", content: "Usability testing shows whether people can use a product to complete real tasks. You observe behaviour rather than asking for opinions.\n\nSteps:\n1. Define goals: which flows and what you want to learn.\n2. Write realistic tasks with a scenario, for example ‘You owe your landlord ₦150,000. Pay him using the app.’\n3. Recruit around five participants per user group for qualitative testing.\n4. Run a pilot to fix confusing tasks.\n5. Moderate: ask participants to think aloud, stay neutral, and avoid helping unless they are completely stuck.\n6. Record task success, errors, time and notable quotes.\n\nWhen a participant asks ‘Should I click this?’, turn it back: ‘What would you do if I were not here?’ This keeps the data honest.\n\nModerated tests, in person or remote, allow follow-up questions. Unmoderated tests with tools like Maze reach more people quickly but lose the ability to probe.\n\nRate each issue by severity: critical (blocks task), serious (causes major delay or error), minor (annoyance). Report the issue, evidence, how many participants hit it, and a recommendation." },
            { type: "text", title: "Synthesis and Ethical Research Practice", content: "Synthesis turns raw observations into insights the team can act on.\n\nA common approach is affinity mapping:\n1. Write each observation as a separate note, one fact per note, with a participant code.\n2. Group similar notes together without forcing categories.\n3. Name each group with a statement that captures the pattern.\n4. Ask ‘so what?’ to turn patterns into insights and recommendations.\n\nAn observation is what happened (‘P3 could not find the transaction receipt’). An insight explains why and why it matters (‘Users look for receipts in the transfer screen, not the history tab, because they need proof immediately for the recipient’).\n\nEthics are not optional. Get informed consent explaining the purpose, recording, how data is stored and for how long. Under Nigeria’s Data Protection Act (NDPA) 2023, personal data must be collected for a specific purpose, kept secure and not retained longer than necessary. Anonymise participant names in reports, restrict access to recordings, and delete them when no longer needed. Participants can stop at any time without losing their incentive." },
            { type: "quiz", title: "Research Foundations Check", questions: [
              { q: "Which research question is best framed?", options: ["What do users think of our app?", "Is our app good?", "Why do first-time users abandon wallet setup before BVN verification?", "Do users like blue or green?"], answer: 2 },
              { q: "Why ask about past behaviour rather than hypothetical future behaviour in interviews?", options: ["Past behaviour gives more reliable evidence than predictions of what people might do", "It makes interviews shorter", "Hypothetical questions are illegal under NDPA", "Participants prefer talking about the past"], answer: 0 },
              { q: "During a usability test a participant asks ‘Should I tap this?’. What is the best response?", options: ["Yes, tap it", "No, try the other button", "End the session", "What would you do if I were not here?"], answer: 3 },
              { q: "What best describes an insight compared with an observation?", options: ["An insight is a direct quote", "An insight explains why a pattern happens and why it matters", "An insight is a number from analytics", "There is no difference"], answer: 1 },
              { q: "Which method is best for measuring how many users share a preference?", options: ["A survey with an appropriate sample", "Three in-depth interviews", "A single usability test", "A stakeholder workshop"], answer: 0 },
              { q: "Under good research ethics and NDPA 2023, what should happen to session recordings?", options: ["Share them publicly to show transparency", "Keep them forever in case they are useful", "Store them securely, limit access and delete them when no longer needed", "Email them to all stakeholders"], answer: 2 }
            ] },
            { type: "assignment", title: "Plan and Run a Mini Interview Study", maxScore: 100, content: "Brief: investigate how young professionals in a Nigerian city manage monthly budgeting and savings, to inform a new savings feature.\n\nDeliverables:\n1. A one-page research plan with decision, research questions, method, participants and timeline.\n2. A discussion guide and consent script.\n3. Notes from at least four interviews (anonymised).\n4. An affinity map image and three to five insights, each with supporting evidence.\n5. Three recommendations for the product team.\n\nGrading: plan quality 20, question neutrality 20, ethics and consent 15, synthesis rigour 25, actionable recommendations 20." }
          ]
        },
        intensive: {
          title: "UX Research Intensive: Mixed Methods and Impact",
          summary: "Job-ready training in mixed-methods research, survey design, journey mapping, research operations and influencing decisions, ending with a level-aware capstone.",
          duration: "8 weeks",
          modules: [
            { type: "text", title: "Choosing Methods for the Decision", content: "Experienced researchers start with the decision, not the method. Ask: what will the team do differently depending on the answer, and how confident do they need to be?\n\nA practical method map:\n- Exploring a problem space: contextual inquiry, diary studies, generative interviews.\n- Defining requirements: interviews, card sorting, jobs-to-be-done analysis.\n- Evaluating a design: moderated or unmoderated usability tests, first-click tests, tree tests.\n- Measuring scale or change: surveys, analytics, A/B tests, benchmarking with metrics like SUS or task success.\n\nConsider constraints: time, budget, access to users and risk. A high-risk, irreversible decision (such as entering a new market) deserves deeper research than a reversible UI tweak.\n\nWorked example: a PM asks for a survey on ‘what features users want’. Reframe: the real decision is which of three roadmap bets to fund. A better plan might combine analytics on current behaviour, eight interviews to understand unmet needs, and then a survey to size the most promising needs across segments. Feature wishlists rarely predict usage." },
            { type: "text", title: "Survey Design and Quantitative Basics", content: "Surveys measure attitudes and self-reported behaviour across many people. Poorly designed surveys produce confident but wrong answers.\n\nDesign principles:\n- Start with objectives and the analysis you plan to run.\n- One idea per question; avoid double-barrelled items like ‘Is the app fast and easy?’\n- Use balanced scales with labelled points.\n- Avoid leading wording and social desirability bias.\n- Keep it short; completion drops sharply for long surveys on mobile.\n- Pilot with a few people before launching.\n\nSampling matters more than sample size. A survey shared only on Twitter will over-represent urban, connected users. Segment results by key groups and report margins of error for proportions.\n\nAnalytics complement surveys: they show what people actually do. Funnels reveal drop-off; cohorts show retention over time. Combine them: analytics show 60% of users never use bill payments, interviews reveal they do not trust that payments arrive, and a survey sizes how widespread that concern is.\n\nStandard instruments such as the System Usability Scale (SUS) give comparable benchmarks over time." },
            { type: "text", title: "Journey Maps, Personas and Making Insights Stick", content: "Research only creates value when teams use it. Artefacts help, but only if they are grounded in evidence and built with the team.\n\nJourney maps show the steps a user goes through to reach a goal, including actions, thoughts, emotions, touchpoints and pain points. They are useful for finding opportunities across channels, for example a loan journey that starts with a WhatsApp message from an agent, moves to the app, and ends with a branch visit.\n\nPersonas summarise behavioural patterns of distinct user groups. Base them on research, focus on goals and behaviours rather than demographics, and keep the number small.\n\nMaking insights stick:\n- Involve stakeholders as observers in sessions.\n- Run synthesis workshops with the team rather than presenting a finished report.\n- Lead with the top three insights and the decision they inform.\n- Use short video clips; seeing a user struggle is persuasive.\n- Store findings in a searchable repository like Dovetail with tags.\n- Follow up weeks later to see what changed, and record it." },
            { type: "text", title: "Research Operations and Scaling Research", content: "Research operations (ResearchOps) is the people, processes and tools that make research efficient, ethical and scalable.\n\nCore components:\n- Recruitment: a consented participant panel, screeners, incentive processes (bank transfer, airtime or vouchers) and tracking to avoid over-contacting people.\n- Governance: consent templates, data retention rules aligned with NDPA 2023, access controls for recordings, and guidance on research with minors or vulnerable groups.\n- Knowledge management: a repository with consistent tags so past findings can be found and reused.\n- Templates: plans, guides, reports and observer guidelines.\n\nResearch democratisation lets designers and PMs run some studies themselves. Do it with guardrails: train them, limit them to lower-risk evaluative studies, provide templates, and review plans before fieldwork. Keep complex or sensitive research with trained researchers.\n\nMeasure research impact by logging decisions influenced, features changed or stopped, and metrics that moved afterwards. This helps justify headcount and prioritise future work." },
            { type: "assignment", title: "Mixed-Methods Study Design", maxScore: 100, content: "Brief: a bill-payment app sees that only a small share of users pay electricity bills in-app. Design a mixed-methods study to understand why and size the opportunity.\n\nDeliverables:\n1. Decision statement and research questions.\n2. Method plan combining analytics, interviews and a survey, with justification.\n3. A screener, interview guide and a survey of 10–15 questions with sampling plan.\n4. A data protection and consent plan aligned with NDPA 2023.\n5. A plan for sharing insights and tracking impact.\n\nGrading: decision framing 15, method fit and triangulation 30, instrument quality 25, ethics 15, impact plan 15." },
            { type: "quiz", title: "Intensive Research Check", questions: [
              { q: "A PM asks for a survey on ‘what features users want’. What is the best first step?", options: ["Send the survey immediately", "Clarify the decision the research must support and reframe the question", "Run a usability test on the current app", "Ask engineers what they want to build"], answer: 1 },
              { q: "Which survey question is double-barrelled?", options: ["How often do you pay bills in the app?", "Which network do you use most?", "Is the app fast and easy to use?", "How satisfied are you with customer support?"], answer: 2 },
              { q: "Why might a survey shared only on social media give misleading results?", options: ["The sample over-represents certain connected groups and is not representative", "Social media surveys are always too small", "Responses cannot be analysed", "People lie more on social media"], answer: 0 },
              { q: "What is the main value of combining analytics with interviews?", options: ["It removes the need for synthesis", "It makes research cheaper", "It guarantees statistical significance", "Analytics show what and where; interviews explain why"], answer: 3 },
              { q: "Which is the safest way to democratise research?", options: ["Let anyone run any study without review", "Train non-researchers, limit them to lower-risk studies and review plans", "Ban non-researchers from talking to users", "Outsource all research"], answer: 1 },
              { q: "Which is the strongest evidence of research impact?", options: ["Number of reports written", "Number of participants recruited", "A logged product decision that changed because of a finding, with the metric that moved", "Positive feedback on slide design"], answer: 2 }
            ] },
            { type: "assignment", title: "Capstone: Research Programme for a Rural Agent Banking App", maxScore: 100, content: "Shared brief: an agent banking app used by POS agents in semi-urban and rural Nigeria has falling weekly activity. Leadership wants to know why and what to do next.\nJunior: plan and run five usability tests on the core cash-out flow, synthesise findings and present severity-rated issues with recommendations.\nMid: design and run a mixed-methods study combining analytics, at least six interviews or field visits and a short survey, then produce a journey map and prioritised insights tied to metrics.\nSenior: design a quarter-long research programme: strategic questions, studies and sequencing, field operations for low-connectivity regions, ethics and NDPA plan, democratisation guardrails and an impact framework for leadership.\nDeliverables: research plan, instruments, synthesis artefacts and a 10-minute presentation.\nGrading: framing 15, method rigour 25, ethics 15, synthesis and insight quality 25, influence and communication 20, assessed against the chosen level." }
          ]
        }
      }
    }
    ,
    {
      id: "pm",
      title: "Product Manager",
      summary: "Decides what a product team builds and why, balancing user needs, business goals and technical constraints to deliver measurable outcomes. Leads a cross-functional squad of engineers, designers and analysts without direct authority, owning the roadmap and backlog for a product or feature area.",
      competencies: [
        { name: "Problem discovery & customer insight", weight: 20, description: "Identifies and validates real user problems and opportunities using research and data." },
        { name: "Prioritisation & roadmapping", weight: 25, description: "Makes clear, reasoned trade-offs and turns strategy into a sequenced, outcome-based roadmap." },
        { name: "Delivery & execution", weight: 20, description: "Writes clear requirements, manages the backlog and works with engineering to ship reliably." },
        { name: "Metrics & experimentation", weight: 20, description: "Defines success metrics, instruments products and uses experiments and analysis to make decisions." },
        { name: "Product strategy & business acumen", weight: 15, description: "Understands market, competition, unit economics and regulation to shape product direction." }
      ],
      levels: {
        junior: {
          minYears: 0,
          focus: "Owns delivery of well-defined features within a product area under the guidance of a senior PM.",
          responsibilities: [
            "Write user stories with clear acceptance criteria and keep the backlog groomed",
            "Run sprint ceremonies with the engineering lead and track delivery progress",
            "Gather customer feedback from support tickets, sales and interviews",
            "Set up feature tracking and report on adoption after launch",
            "Coordinate release communication with support, marketing and operations"
          ],
          skills: [
            "User story writing",
            "Backlog management",
            "Acceptance criteria",
            "Agile Scrum delivery",
            "Customer feedback analysis",
            "Basic product analytics",
            "Release coordination"
          ],
          tools: ["Jira", "Confluence", "Figma", "Mixpanel", "Google Sheets", "Slack"],
          certifications: ["Professional Scrum Product Owner I (PSPO I)", "Certified Scrum Product Owner (CSPO)"],
          aiTopics: [
            "Writing user stories and acceptance criteria",
            "Agile and Scrum ceremonies and the product owner role",
            "Prioritising a small backlog with a simple framework",
            "Defining and reading basic feature metrics",
            "Collaborating with engineers and designers"
          ],
          aiScenarios: [
            "An engineer says a user story is too vague to estimate. Walk me through how you would rewrite it.",
            "Three stakeholders each want their request in the next sprint, but there is room for one. How do you decide and communicate it?",
            "A feature you shipped two weeks ago has very low usage. Walk me through how you would investigate."
          ],
          aiExpectations: "A ready junior PM writes clear, testable stories, communicates proactively and uses simple data to check outcomes. Red flags are acting as a ticket-taker with no reasoning for priorities, confusing output with outcomes, or poor collaboration with engineers.",
          proQuestions: [
            { q: "Show me a user story you wrote with its acceptance criteria. How did the team use it?", lookFor: "A clear user, need and value, testable criteria including edge cases, and evidence the team could build from it." },
            { q: "Tell me about a time you had to say no to a stakeholder request.", lookFor: "Understanding the underlying need, reasoning with priorities and offering alternatives or timing." },
            { q: "How did you know whether a feature you worked on was successful?", lookFor: "A defined metric before launch, how it was measured and what was done with the result." },
            { q: "Describe a sprint that went off track. What did you do?", lookFor: "Early detection, transparent communication, scope adjustment and a retrospective improvement." },
            { q: "How do you gather and use customer feedback?", lookFor: "Multiple sources, looking for patterns rather than loud voices, and linking feedback to backlog decisions." }
          ]
        },
        mid: {
          minYears: 2,
          focus: "Owns a product area’s outcomes end to end, from discovery and prioritisation to delivery and measured results.",
          responsibilities: [
            "Own the roadmap and outcome metrics for a product area",
            "Lead continuous discovery with design and research to validate problems and solutions",
            "Prioritise the backlog using evidence, impact and effort trade-offs",
            "Design and analyse experiments to inform product decisions",
            "Align engineering, design, compliance and commercial stakeholders on plans and trade-offs"
          ],
          skills: [
            "Outcome-based roadmapping",
            "Continuous product discovery",
            "Prioritisation frameworks",
            "A/B experimentation",
            "Product analytics",
            "Stakeholder management",
            "PRD writing"
          ],
          tools: ["Jira", "Productboard", "Amplitude", "Figma", "Notion", "Looker Studio"],
          certifications: ["Professional Scrum Product Owner II (PSPO II)", "AIPMM Certified Product Manager (CPM)"],
          aiTopics: [
            "Discovery techniques and opportunity solution trees",
            "Prioritisation with RICE, cost of delay and evidence",
            "Defining north-star and input metrics",
            "Experiment design and interpreting results",
            "Managing stakeholders and regulatory constraints"
          ],
          aiScenarios: [
            "Your fintech app’s monthly active users are flat. Walk me through how you would find the biggest opportunity to grow them.",
            "An A/B test shows a 3% lift in sign-ups but a rise in failed KYC checks. What do you do?",
            "Compliance says a planned feature needs changes to meet CBN requirements, delaying launch by a month. How do you handle it?"
          ],
          aiExpectations: "A ready mid-level PM drives outcomes rather than outputs, prioritises with evidence and handles trade-offs across many stakeholders. Red flags are roadmaps that are just feature lists, no experiment literacy, or blaming other teams for missed goals.",
          proQuestions: [
            { q: "Walk me through a product area you owned. What outcome were you accountable for and how did you move it?", lookFor: "A clear metric, the problems identified, bets made and the measurable result, including what failed." },
            { q: "How do you prioritise between a revenue feature, a reliability fix and a customer-requested improvement?", lookFor: "A structured approach weighing impact, risk, effort and strategy, with transparent communication." },
            { q: "Describe an experiment you ran. How did you design it and what did you decide?", lookFor: "A hypothesis, primary and guardrail metrics, sample considerations and a clear decision from the result." },
            { q: "Tell me about a time discovery stopped you from building something.", lookFor: "Testing assumptions cheaply, evidence that invalidated the idea and redirecting effort." },
            { q: "How have you worked with compliance, legal or regulators on a product?", lookFor: "Early engagement, understanding requirements such as CBN guidelines or NDPA, and designing compliant solutions without losing the user." }
          ]
        },
        senior: {
          minYears: 5,
          focus: "Sets product strategy for a product line or portfolio, leads other PMs and is accountable for business-level outcomes.",
          responsibilities: [
            "Define product vision and multi-quarter strategy tied to company goals",
            "Own business outcomes such as revenue, retention or unit economics for a product line",
            "Lead and mentor product managers and build product practices",
            "Make portfolio-level investment and sunset decisions",
            "Represent the product to executives, partners and regulators"
          ],
          skills: [
            "Product strategy",
            "Product vision",
            "Portfolio prioritisation",
            "Unit economics",
            "Product leadership",
            "Go-to-market planning",
            "Executive communication"
          ],
          tools: ["Productboard", "Amplitude", "Jira Product Discovery", "Looker", "Confluence", "Miro"],
          certifications: ["Professional Scrum Product Owner III (PSPO III)", "Advanced Certified Scrum Product Owner (A-CSPO)"],
          aiTopics: [
            "Crafting product vision and strategy",
            "Market, competition and business model analysis",
            "Portfolio investment and sunset decisions",
            "Building and leading product teams",
            "Aligning executives and managing strategic risk"
          ],
          aiScenarios: [
            "Your company wants to launch a buy-now-pay-later product in Nigeria. Walk me through how you would decide whether and how to do it.",
            "Two of your product lines compete for the same engineering capacity and executives disagree. How would you resolve it?",
            "A PM on your team keeps shipping on time but their metrics are not moving. How would you coach them?"
          ],
          aiExpectations: "A ready senior PM ties strategy to business outcomes, makes hard portfolio calls with clarity and grows other PMs. Red flags are describing only feature delivery, weak commercial understanding, or no examples of leading through others.",
          proQuestions: [
            { q: "Describe a product strategy you created. What did it say no to?", lookFor: "A diagnosis of the market and users, clear choices and trade-offs, and how it guided teams." },
            { q: "Tell me about a business outcome you were accountable for. How did it go?", lookFor: "Ownership of a commercial metric, the levers pulled, results and honest reflection." },
            { q: "Describe a time you decided to sunset or stop investing in a product or feature.", lookFor: "Evidence-based reasoning, stakeholder and customer handling, and the resources freed." },
            { q: "How have you developed other product managers?", lookFor: "Specific coaching, frameworks or rituals introduced and observable growth in the people they led." },
            { q: "How do you handle a market entry or expansion decision?", lookFor: "Market sizing, customer validation, regulatory and partner analysis, phased launch and clear success criteria." }
          ]
        }
      },
      hrScenarios: [
        { q: "Tell me about a time you had to influence a team you had no authority over.", lookFor: "Building trust, sharing context and evidence, and aligning people around a shared goal." },
        { q: "Describe a product decision you made that turned out to be wrong.", lookFor: "Ownership, how they noticed, how quickly they corrected course and what they learned." },
        { q: "Tell me about a time engineering and business stakeholders were in serious conflict.", lookFor: "Calm mediation, surfacing underlying interests, and reaching a decision both sides could support." }
      ],
      curriculum: {
        foundational: {
          title: "Product Management Foundations",
          summary: "An introduction to the product manager role: discovering problems, writing requirements, prioritising and measuring results in an agile team.",
          duration: "4 weeks",
          modules: [
            { type: "text", title: "The Product Manager’s Role", content: "A product manager (PM) is responsible for making sure the team builds the right thing: something users value, that the business can sustain, and that engineering can deliver. PMs rarely manage people directly; they lead through clarity, evidence and trust.\n\nA common way to describe a PM’s focus is the overlap of three risks:\n- Value: will users want it?\n- Viability: does it work for the business, including regulation and cost?\n- Feasibility and usability: can we build it and can people use it?\n\nTypical activities include talking to customers, reviewing data, writing requirements, prioritising the backlog, working daily with engineers and designers, and communicating plans to stakeholders.\n\nOutputs versus outcomes: shipping a feature is an output. Increasing the share of users who complete their first transfer is an outcome. Good PMs focus on outcomes and treat features as bets.\n\nWorked example: a logistics startup in Lagos wants ‘a tracking map’. A PM asks what problem it solves. Interviews show customers call support to ask when deliveries will arrive. The outcome to target becomes fewer ‘where is my order’ calls, which an SMS with an accurate ETA might solve faster than a map." },
            { type: "text", title: "Discovering Problems Worth Solving", content: "Discovery is how PMs reduce the risk of building the wrong thing. It means learning about users’ problems before committing to solutions.\n\nUseful sources of evidence:\n- Customer interviews about recent behaviour\n- Support tickets and call-centre logs\n- Product analytics showing where users drop off\n- Sales and operations feedback\n- Competitor and market analysis\n\nFrame problems clearly using a problem statement: ‘[User] needs a way to [goal] because [insight]. Today they [current workaround], which causes [pain].’\n\nThen list your assumptions and test the riskiest ones cheaply. Techniques include clickable prototypes, fake-door tests (a button that measures interest before the feature exists), concierge tests (doing the service manually first) and short surveys.\n\nWorked example: a team assumes market traders want a savings feature. Before building, the PM interviews ten traders and learns that most already save through informal contribution groups (ajo or esusu). The opportunity shifts from a generic savings product to supporting group contributions with transparency and reminders, which can be tested with a WhatsApp-based concierge version first." },
            { type: "text", title: "Writing User Stories and Working in Agile Teams", content: "Most product teams work in an agile way, delivering small increments and learning as they go. Scrum is a common framework, with a product owner (often the PM), a Scrum Master and developers working in sprints of one to four weeks.\n\nUser stories describe a need from the user’s point of view:\n‘As a [type of user], I want [goal] so that [benefit].’\n\nAcceptance criteria define when the story is done, often in Given / When / Then form:\nGiven I have a verified account\nWhen I enter a recipient account number\nThen the recipient name is shown before I confirm\n\nGood stories follow INVEST: Independent, Negotiable, Valuable, Estimable, Small and Testable. Include edge cases: what if the account number is invalid, the network times out, or the balance is insufficient?\n\nKey ceremonies: backlog refinement (clarifying and sizing upcoming work), sprint planning, daily stand-up, sprint review (showing what was built) and retrospective (improving how the team works). The PM’s job is to make sure the backlog is ordered by value and that the team understands the why behind every item." },
            { type: "text", title: "Prioritisation and Metrics", content: "There is always more to build than time allows, so prioritisation is a core PM skill.\n\nSimple frameworks help structure thinking:\n- Impact versus effort: plot items and favour high impact, low effort.\n- RICE: Reach × Impact × Confidence ÷ Effort, giving a comparable score.\n- MoSCoW: Must have, Should have, Could have, Won’t have this time.\n\nFrameworks support judgement; they do not replace it. Strategy, risk, dependencies and regulatory deadlines also matter.\n\nMetrics tell you whether you are succeeding. Define them before you build:\n- A north-star metric captures the core value delivered, such as successful transactions per active user.\n- Input metrics are the levers that drive it, such as activation rate or repeat usage.\n- Guardrail metrics make sure you do not cause harm, such as failed transactions or complaints.\n\nWorked example: a feature to save beneficiaries aims to raise repeat transfers. Primary metric: transfers per user per month. Guardrail: transfers sent to the wrong recipient. After launch, compare users with and without saved beneficiaries, and watch for confounding events like salary week." },
            { type: "quiz", title: "PM Foundations Check", questions: [
              { q: "Which is an outcome rather than an output?", options: ["Launching a new dashboard", "Writing 20 user stories", "Increasing first-transfer completion rate from 50% to 65%", "Releasing version 2.3"], answer: 2 },
              { q: "What is the main purpose of a fake-door test?", options: ["To measure interest in a feature before building it", "To test security vulnerabilities", "To check page load speed", "To trick users into paying"], answer: 0 },
              { q: "Which acceptance criterion is most testable?", options: ["The page should be user-friendly", "Transfers should be fast", "The design should look modern", "Given an invalid account number, when I tap Continue, then an error explains the number is invalid"], answer: 3 },
              { q: "In RICE scoring, what does Confidence represent?", options: ["How confident the CEO is", "How sure you are about the reach and impact estimates", "How many engineers agree", "The probability of a bug"], answer: 1 },
              { q: "What is the role of a guardrail metric?", options: ["To replace the north-star metric", "To measure team velocity", "To ensure a change does not cause harm elsewhere", "To track marketing spend"], answer: 2 },
              { q: "A stakeholder demands ‘a tracking map’. What should a PM do first?", options: ["Understand the underlying problem the map is meant to solve", "Add it to the next sprint immediately", "Refuse the request", "Ask design to start high-fidelity screens"], answer: 0 }
            ] },
            { type: "assignment", title: "Product Brief for a Bill Payment Feature", maxScore: 100, content: "Brief: a digital wallet wants to add recurring electricity and cable TV bill payments.\n\nDeliverables:\n1. A problem statement and target user, supported by at least three short user conversations or credible secondary evidence.\n2. Key assumptions and how you would test the riskiest one.\n3. Five user stories with acceptance criteria, including edge cases such as failed token delivery.\n4. A prioritised MVP scope using MoSCoW or RICE with reasoning.\n5. Success, input and guardrail metrics.\n\nGrading: problem framing 20, assumption testing 15, story quality 25, prioritisation reasoning 20, metrics 20." }
          ]
        },
        intensive: {
          title: "Product Management Intensive: Strategy to Shipped Outcomes",
          summary: "Job-ready training in continuous discovery, roadmapping, experimentation, stakeholder leadership and product strategy, ending in a level-aware capstone.",
          duration: "8 weeks",
          modules: [
            { type: "text", title: "Continuous Discovery and Opportunity Mapping", content: "Strong product teams discover continuously rather than in one big upfront phase. A common habit is talking to customers every week, so assumptions are always being tested.\n\nThe opportunity solution tree is a helpful structure:\n- At the top is the desired outcome (for example increase 30-day retention).\n- Below are opportunities: customer needs, pains and desires discovered through research.\n- Under each opportunity are possible solutions.\n- Under each solution are assumption tests.\n\nThis prevents jumping straight from goal to feature, and makes trade-offs visible.\n\nAssumptions fall into categories: desirability (do they want it), usability, feasibility, viability (does it work for the business and regulators) and ethics. Test the riskiest first with the cheapest method that gives enough confidence.\n\nWorked example: outcome is more merchants accepting payments weekly. Interviews reveal opportunities: settlement delays hurt cash flow, and merchants fear chargebacks. Solutions for the settlement opportunity include instant settlement for a fee or next-day guarantees. A quick test: offer instant settlement to 50 merchants manually and measure uptake and willingness to pay before building automation." },
            { type: "text", title: "Outcome-Based Roadmaps and Stakeholder Alignment", content: "A roadmap communicates direction and priorities, not a promise of dates for every feature. Outcome-based roadmaps organise work around problems and goals.\n\nA common format is Now / Next / Later:\n- Now: committed work with high confidence.\n- Next: validated problems being explored.\n- Later: strategic themes with low certainty.\n\nLink each item to an outcome metric and the strategy it supports. Revisit it regularly as evidence changes.\n\nStakeholder alignment is half the job. Map stakeholders by influence and interest. Engage high-influence stakeholders early, share the reasoning behind priorities, and make trade-offs explicit: ‘If we add this, these two items move out.’\n\nIn regulated sectors like Nigerian fintech, compliance, risk and legal are key stakeholders. CBN circulars, KYC tier limits and NDPA 2023 obligations can change scope significantly. Involve these teams during discovery, not just before launch.\n\nWorked example: sales wants a custom feature for one large client. Assess whether it serves the broader strategy, estimate cost, and propose options such as a configurable version that serves several clients." },
            { type: "text", title: "Experimentation and Product Analytics", content: "Experiments help PMs make decisions with evidence rather than opinion.\n\nAn A/B test compares a control with one or more variants, randomly assigning users. Design it carefully:\n1. Hypothesis: ‘Showing the transfer fee upfront will increase completed transfers because users will not abandon on surprise fees.’\n2. Primary metric: completed transfers per user.\n3. Guardrails: support contacts, failed transactions, revenue per transfer.\n4. Sample size and duration: estimate in advance using a calculator; run for full weekly cycles to cover salary days and weekends.\n5. Decision rule: what result means ship, iterate or stop.\n\nCommon pitfalls: stopping the test as soon as results look good (peeking), testing too many variants with small traffic, and ignoring novelty effects.\n\nNot everything needs an A/B test. Low traffic, high-risk or regulated changes may use staged rollouts, before-and-after analysis with caution, or qualitative validation.\n\nProduct analytics fundamentals: funnels show conversion between steps, cohorts show retention over time, and segmentation reveals differences between groups such as Android versus iOS or Lagos versus other states." },
            { type: "text", title: "Product Strategy and Business Fundamentals", content: "Strategy is a set of choices about where to play and how to win, given limited resources. A product strategy explains which problems and customers you will focus on, why you can win, and what you will not do.\n\nA useful structure:\n- Diagnosis: what is happening in the market, with users and competitors.\n- Guiding policy: the approach you will take.\n- Coherent actions: the initiatives that follow.\n\nBusiness fundamentals every PM should understand:\n- Unit economics: customer acquisition cost (CAC), lifetime value (LTV), contribution margin per transaction.\n- Revenue models: transaction fees, subscriptions, interest margin, commissions.\n- Market sizing: TAM, SAM and SOM, built bottom-up from realistic assumptions.\n- Competitive analysis: incumbents such as banks and telcos, fintechs and informal alternatives.\n\nWorked example: a lending product grows fast but defaults rise. Strategy must weigh growth against credit risk. Choices might include focusing on salaried users with verified income, partnering with employers, and slowing expansion until repayment rates stabilise. Each choice should be tied to metrics leadership can track." },
            { type: "assignment", title: "Opportunity Solution Tree and Roadmap", maxScore: 100, content: "Brief: choose a real African consumer or SME product category (for example ride-hailing, savings or e-commerce). Define an outcome for a hypothetical product in that space.\n\nDeliverables:\n1. An opportunity solution tree with at least three opportunities, two solutions each and assumption tests.\n2. One experiment design with hypothesis, metrics, guardrails and decision rule.\n3. A Now / Next / Later roadmap linked to outcomes.\n4. A stakeholder map and communication plan including regulatory stakeholders.\n\nGrading: outcome and opportunity quality 25, assumption testing 20, experiment design 20, roadmap coherence 20, stakeholder plan 15." },
            { type: "quiz", title: "PM Intensive Check", questions: [
              { q: "What sits directly beneath the desired outcome in an opportunity solution tree?", options: ["Features already on the roadmap", "Opportunities such as customer needs and pains", "Engineering tasks", "Marketing campaigns"], answer: 1 },
              { q: "Why is ‘peeking’ at A/B test results a problem?", options: ["It increases the chance of false positives if you stop early", "It slows down the test", "It is against GDPR", "It changes which users see the variant"], answer: 0 },
              { q: "In a Now / Next / Later roadmap, what belongs in Later?", options: ["Committed work for this sprint", "Bug fixes", "Strategic themes with low certainty", "Items already shipped"], answer: 2 },
              { q: "A lending product’s customer acquisition cost exceeds lifetime value. What does this mean?", options: ["The product is highly profitable", "Marketing should spend more", "Retention is perfect", "Each customer is likely to cost more to acquire than they generate"], answer: 3 },
              { q: "When should compliance teams ideally be involved in a fintech feature?", options: ["Only after launch if a regulator complains", "During discovery and planning", "Only at final sign-off", "Never; it is engineering’s job"], answer: 1 },
              { q: "Which best describes a good product strategy?", options: ["A list of every feature requested", "A promise of release dates", "Clear choices about where to play and how to win, including what not to do", "A copy of a competitor’s roadmap"], answer: 2 }
            ] },
            { type: "assignment", title: "Capstone: Launch an SME Invoicing and Payments Product", maxScore: 100, content: "Shared brief: a Nigerian fintech wants to help small businesses send invoices and get paid faster via bank transfer, card and USSD. You are the PM.\nJunior: write a product brief for the MVP invoicing flow, 8–10 user stories with acceptance criteria, a prioritised backlog and a launch metrics plan.\nMid: run discovery (at least five SME conversations or strong secondary research), build an opportunity solution tree, define outcome metrics, design one experiment and produce a two-quarter roadmap with compliance considerations.\nSenior: produce a product strategy covering market sizing, competition, business model and unit economics, a portfolio roadmap, go-to-market plan, team structure for three squads and an executive decision memo.\nDeliverables: written documents plus a 10-minute presentation.\nGrading: problem and customer understanding 20, prioritisation and trade-offs 20, metrics and experimentation 20, strategic and commercial thinking 20, communication 20, assessed against the chosen level." }
          ]
        }
      }
    }
    ,
    {
      id: "ba",
      title: "Business Analyst",
      summary: "Analyses how a business works, identifies problems and opportunities, and translates stakeholder needs into clear, testable requirements for technology solutions. Acts as the bridge between business units, product owners and delivery teams in banks, telcos, fintechs and consultancies.",
      competencies: [
        { name: "Requirements elicitation & stakeholder analysis", weight: 25, description: "Identifies stakeholders and draws out accurate needs through interviews, workshops and observation." },
        { name: "Requirements documentation & management", weight: 25, description: "Writes clear, testable requirements and manages traceability and change across the lifecycle." },
        { name: "Process modelling & improvement", weight: 20, description: "Maps current and future-state processes using BPMN and identifies improvement opportunities." },
        { name: "Data analysis & SQL", weight: 15, description: "Queries and analyses data to understand problems, validate requirements and support decisions." },
        { name: "Solution evaluation & UAT", weight: 15, description: "Validates that delivered solutions meet requirements and business value through testing and review." }
      ],
      levels: {
        junior: {
          minYears: 0,
          focus: "Documents requirements and processes for defined pieces of work under the guidance of a senior analyst.",
          responsibilities: [
            "Run stakeholder interviews and capture meeting notes and decisions",
            "Document as-is processes using flowcharts or BPMN diagrams",
            "Write user stories and functional requirements with acceptance criteria",
            "Maintain the requirements traceability matrix and backlog items",
            "Prepare UAT test cases and support business users during testing"
          ],
          skills: [
            "Requirements elicitation",
            "User story writing",
            "Process mapping",
            "BPMN basics",
            "SQL querying",
            "UAT test cases",
            "Stakeholder interviewing"
          ],
          tools: ["Jira", "Confluence", "Microsoft Visio", "Microsoft Excel", "Lucidchart", "Microsoft SQL Server"],
          certifications: ["IIBA Entry Certificate in Business Analysis (ECBA)", "BCS Foundation Certificate in Business Analysis"],
          aiTopics: [
            "Elicitation techniques and asking good questions",
            "Functional versus non-functional requirements",
            "Writing user stories and acceptance criteria",
            "Basic process mapping and BPMN notation",
            "Basic SQL for analysing business data"
          ],
          aiScenarios: [
            "A branch operations manager says ‘the account opening process is too slow’. Walk me through how you would find out what is really happening.",
            "You receive a requirement that says ‘the system should be fast’. How would you turn it into something testable?",
            "During UAT a business user says the new report is wrong. Walk me through how you would investigate."
          ],
          aiExpectations: "A ready junior BA asks probing questions, documents clearly and checks understanding with stakeholders. Red flags are copying stakeholder requests as requirements without analysis, vague untestable requirements, or no basic data skills.",
          proQuestions: [
            { q: "Walk me through how you documented a process or requirement in a past project.", lookFor: "A clear elicitation approach, the artefact produced and how it was validated with stakeholders." },
            { q: "Show me a requirement you wrote. How would a tester verify it?", lookFor: "Specific, measurable and unambiguous criteria with edge cases considered." },
            { q: "Tell me about a time two stakeholders gave you conflicting requirements.", lookFor: "Clarifying underlying needs, documenting both views and escalating appropriately for a decision." },
            { q: "Write or describe a SQL query to find customers with no transactions in the last 90 days.", lookFor: "Correct use of joins or NOT EXISTS, date filtering and awareness of data quality issues." },
            { q: "How have you supported user acceptance testing?", lookFor: "Test cases traced to requirements, organising testers, logging defects clearly and tracking sign-off." }
          ]
        },
        mid: {
          minYears: 2,
          focus: "Owns business analysis for a project or product area, leading elicitation, modelling and solution validation independently.",
          responsibilities: [
            "Lead requirements workshops with business, technology and compliance stakeholders",
            "Model current and future-state processes and quantify improvement opportunities",
            "Define and manage requirements, traceability and change control for a project",
            "Analyse data to build business cases and validate assumptions",
            "Lead UAT planning and evaluate delivered solutions against business objectives"
          ],
          skills: [
            "Workshop facilitation",
            "BPMN 2.0 modelling",
            "Gap analysis",
            "Business case development",
            "Requirements traceability",
            "Data analysis with SQL",
            "Change control"
          ],
          tools: ["Jira", "Confluence", "Bizagi Modeler", "Power BI", "Microsoft SQL Server", "Miro"],
          certifications: ["IIBA Certification of Capability in Business Analysis (CCBA)", "BCS International Diploma in Business Analysis", "IIBA Agile Analysis Certification (AAC)"],
          aiTopics: [
            "Facilitating workshops with diverse stakeholders",
            "BPMN 2.0 modelling of current and future state",
            "Gap analysis and root cause analysis",
            "Building business cases with data",
            "Managing scope change and traceability"
          ],
          aiScenarios: [
            "A bank wants to automate loan approvals for salaried customers. Walk me through how you would analyse the current process and define requirements.",
            "Halfway through a project, a new CBN directive changes KYC rules. How do you handle the impact on requirements?",
            "The business sponsor says a new system ‘isn’t delivering value’ three months after go-live. How would you evaluate it?"
          ],
          aiExpectations: "A ready mid-level BA moves from documenting to analysing: finding root causes, quantifying value and managing change with discipline. Red flags are no experience leading workshops, weak traceability, or inability to link requirements to business outcomes.",
          proQuestions: [
            { q: "Tell me about a requirements workshop you led. How did you prepare and what came out of it?", lookFor: "Clear objectives, the right attendees, structured techniques, managing dominant voices and agreed outputs." },
            { q: "Walk me through a process you redesigned. How did you measure the improvement?", lookFor: "As-is and to-be models, root cause analysis, quantified baseline and measured result." },
            { q: "Describe a business case you built. What data did you use?", lookFor: "Costs, benefits, assumptions, risks and options, supported by real data and sensible estimates." },
            { q: "How do you handle a change request late in a project?", lookFor: "Impact analysis on scope, cost and timeline, traceability updates and a decision by the right authority." },
            { q: "Tell me about a time data analysis changed what stakeholders believed.", lookFor: "A clear hypothesis, sound analysis and a persuasive presentation that led to a different decision." }
          ]
        },
        senior: {
          minYears: 5,
          focus: "Leads business analysis across programmes, shapes solution and business architecture decisions and builds BA capability.",
          responsibilities: [
            "Lead analysis for large transformation programmes spanning multiple systems and departments",
            "Shape solution options and business architecture with enterprise architects and leadership",
            "Set business analysis standards, templates and practices for the team",
            "Mentor and review the work of junior and mid-level analysts",
            "Advise executives on investment decisions, benefits realisation and organisational change"
          ],
          skills: [
            "Enterprise analysis",
            "Business architecture",
            "Strategy analysis",
            "Benefits realisation",
            "Change management",
            "BA practice leadership",
            "Executive advisory"
          ],
          tools: ["Confluence", "Jira Align", "ArchiMate", "Sparx Enterprise Architect", "Power BI", "Microsoft Project"],
          certifications: ["IIBA Certified Business Analysis Professional (CBAP)", "PMI Professional in Business Analysis (PMI-PBA)", "IIBA Certification in Business Data Analytics (CBDA)"],
          aiTopics: [
            "Strategy analysis and enterprise-level problem framing",
            "Business architecture and capability mapping",
            "Programme-level requirements governance",
            "Benefits realisation and value measurement",
            "Leading BA practice and organisational change"
          ],
          aiScenarios: [
            "A telco wants to replace its legacy billing system serving millions of prepaid subscribers. Walk me through how you would lead analysis for the programme.",
            "Three departments each want a different CRM. How would you guide the organisation to a decision?",
            "Your BA team produces inconsistent documentation and delivery teams complain. What would you change?"
          ],
          aiExpectations: "A ready senior BA frames problems at an enterprise level, guides investment decisions and raises the capability of others. Red flags are working only at the user-story level, no experience with benefits realisation, or no evidence of leading or mentoring analysts.",
          proQuestions: [
            { q: "Describe a large programme where you led the analysis. How did you structure the work?", lookFor: "Clear scope decomposition, governance, stakeholder management across departments and coordination of multiple analysts." },
            { q: "How have you used capability mapping or business architecture to guide a decision?", lookFor: "Mapping capabilities to strategy and systems, identifying gaps and informing investment priorities." },
            { q: "Tell me about a time you recommended not proceeding with a project.", lookFor: "Evidence-based reasoning, options analysis and courage to advise leadership honestly." },
            { q: "How do you track whether promised benefits were realised?", lookFor: "Baseline metrics, benefit owners, measurement after go-live and corrective actions." },
            { q: "How have you built or improved a BA practice?", lookFor: "Standards, templates, training, quality reviews and measurable improvement in delivery outcomes." }
          ]
        }
      },
      hrScenarios: [
        { q: "Tell me about a time a stakeholder kept changing their mind about requirements.", lookFor: "Patience, structured change control and helping the stakeholder clarify their underlying goal." },
        { q: "Describe a time you had to explain a technical constraint to a non-technical business user.", lookFor: "Plain language, empathy for the business impact and agreement on a workable option." },
        { q: "Tell me about a time you discovered a mistake in requirements you had already signed off.", lookFor: "Honesty, prompt communication, impact assessment and preventive improvement." }
      ],
      curriculum: {
        foundational: {
          title: "Business Analysis Foundations",
          summary: "Learn the core of business analysis: understanding stakeholders, eliciting and writing requirements, mapping processes and supporting testing.",
          duration: "4 weeks",
          modules: [
            { type: "text", title: "What Business Analysts Do", content: "A business analyst (BA) helps organisations change for the better by understanding needs and recommending solutions that deliver value. The IIBA’s BABOK Guide describes this as enabling change by defining needs and recommending solutions.\n\nBAs work across many settings: a bank replacing its core banking system, a telco launching a new data bundle portal, or a government agency digitising a paper process. The common thread is understanding the problem, the people affected and what a good solution looks like.\n\nThe BACCM (Business Analysis Core Concept Model) has six concepts: Change, Need, Solution, Stakeholder, Value and Context. Asking about all six prevents blind spots.\n\nWorked example: a hospital wants a new appointment system. A BA asks: What is the need (long queues, lost records)? Who are the stakeholders (patients, nurses, doctors, records staff, IT)? What context matters (unstable power, shared computers)? What value is expected (shorter waiting time)? Only then do they explore solutions, which might include SMS booking and offline-capable software rather than a complex web portal.\n\nBAs do not simply write down what people ask for; they analyse whether it solves the real problem." },
            { type: "text", title: "Stakeholders and Elicitation Techniques", content: "Stakeholders are anyone affected by or able to influence a change. Missing a key stakeholder is a common cause of failed projects.\n\nStart with a stakeholder list and a power/interest grid:\n- High power, high interest: manage closely.\n- High power, low interest: keep satisfied.\n- Low power, high interest: keep informed.\n- Low power, low interest: monitor.\n\nElicitation is drawing out information. Common techniques:\n- Interviews: one-to-one, good for depth.\n- Workshops: bring groups together to agree requirements quickly.\n- Observation (job shadowing): see how work is really done.\n- Document analysis: policies, forms, existing system manuals.\n- Surveys: gather input from many people.\n- Prototyping: show mock-ups to clarify needs.\n\nAsk open questions, then follow up with ‘why’ to reach root needs. The five whys technique helps: ask why repeatedly until you reach the underlying cause.\n\nWorked example: a branch manager asks for ‘a new report’. Asking why reveals they need to know daily which customers have incomplete KYC. The real need may be an alert or dashboard rather than another spreadsheet." },
            { type: "text", title: "Writing Good Requirements", content: "Requirements describe what a solution must do or be. Clear requirements reduce rework and disputes.\n\nTypes:\n- Business requirements: high-level goals (reduce account opening time to under 10 minutes).\n- Stakeholder requirements: needs of specific groups.\n- Functional requirements: behaviours the system must perform (the system shall validate BVN against NIBSS).\n- Non-functional requirements: qualities such as performance, security, availability and usability.\n- Transition requirements: what is needed to move from old to new, such as data migration and training.\n\nGood requirements are clear, concise, testable, feasible and traceable. Avoid vague words like fast, user-friendly or flexible. Replace them with measurable criteria: ‘The balance enquiry returns a result within 2 seconds for 95% of requests.’\n\nIn agile teams, requirements are often written as user stories with acceptance criteria, but the same quality rules apply.\n\nA traceability matrix links each requirement to its source, design, test cases and status. This shows that every requirement is tested and every feature has a reason to exist, and helps assess the impact of changes." },
            { type: "text", title: "Process Mapping and Supporting UAT", content: "Process maps show how work flows. They help teams see delays, handoffs, duplication and failure points.\n\nBPMN (Business Process Model and Notation) is the standard notation:\n- Events (circles): start, intermediate and end.\n- Activities (rounded rectangles): tasks performed.\n- Gateways (diamonds): decisions or parallel paths.\n- Sequence flows (arrows): order of work.\n- Pools and lanes: who performs each task.\n\nMap the as-is process first, from real observation, not just what the procedure manual says. Then identify problems and design the to-be process.\n\nWorked example: a loan approval as-is map shows forms passing between branch, credit and operations by email, with three separate data entries. The to-be design captures data once, routes automatically and adds a decision gateway for low-risk applications.\n\nUser Acceptance Testing (UAT) checks that the delivered solution meets business needs. BAs prepare test cases from requirements, organise business testers, explain how to log defects clearly (steps, expected versus actual result, screenshots), track progress and coordinate sign-off. UAT is the business’s confirmation that the solution is fit for use." },
            { type: "quiz", title: "BA Foundations Check", questions: [
              { q: "A manager asks for ‘a new report’. What should a BA do first?", options: ["Build the report immediately", "Explore why it is needed to find the underlying need", "Tell the manager reports are not possible", "Copy an existing report"], answer: 1 },
              { q: "Which is a non-functional requirement?", options: ["The system shall validate the customer’s BVN", "The user can download a statement", "The balance enquiry returns a result within 2 seconds for 95% of requests", "The system shall send an OTP for transfers"], answer: 2 },
              { q: "In a power/interest grid, how should high-power, high-interest stakeholders be handled?", options: ["Manage closely", "Monitor occasionally", "Keep informed only", "Ignore until UAT"], answer: 0 },
              { q: "What does a gateway (diamond) represent in BPMN?", options: ["A start event", "A data store", "A swimlane", "A decision or split in the process flow"], answer: 3 },
              { q: "What is the main purpose of a traceability matrix?", options: ["To list project team members", "To link requirements to sources, designs and tests and assess change impact", "To record meeting minutes", "To calculate project cost"], answer: 1 },
              { q: "Why should the as-is process be mapped from observation rather than only the procedure manual?", options: ["Manuals are always illegal to use", "Observation is faster", "Real work often differs from documented procedures", "BPMN cannot model manuals"], answer: 2 }
            ] },
            { type: "assignment", title: "Requirements Pack for a School Fees Payment Portal", maxScore: 100, content: "Brief: a group of private schools wants parents to pay fees online by card, bank transfer or USSD and see receipts and balances.\n\nDeliverables:\n1. A stakeholder list with a power/interest grid.\n2. An elicitation plan and notes from at least two real or role-played interviews.\n3. An as-is and to-be process map in BPMN.\n4. Ten requirements (functional and non-functional) or user stories with acceptance criteria.\n5. A traceability matrix and five UAT test cases.\n\nGrading: stakeholder analysis 15, elicitation 20, process models 20, requirement quality 30, traceability and testing 15." }
          ]
        },
        intensive: {
          title: "Business Analysis Intensive: From Analysis to Value",
          summary: "Job-ready training in workshop facilitation, advanced modelling, data analysis, business cases and solution evaluation, ending in a level-aware capstone.",
          duration: "8 weeks",
          modules: [
            { type: "text", title: "Facilitating Requirements Workshops", content: "Workshops bring stakeholders together to make decisions faster than many separate meetings. A well-run workshop builds shared understanding and commitment.\n\nPreparation:\n- Define a clear objective and expected outputs (for example agreed to-be process and top-priority requirements).\n- Invite the right people: decision makers, subject matter experts and delivery representatives.\n- Share pre-reading and an agenda in advance.\n- Choose techniques: brainstorming, process walkthroughs, MoSCoW prioritisation, user story mapping.\n\nDuring the session:\n- Set ground rules and confirm the objective.\n- Use a parking lot for off-topic items.\n- Balance voices: invite quieter participants, manage dominant ones politely.\n- Capture decisions and open questions visibly.\n\nAfter the session: circulate a summary within 24 hours with decisions, actions and owners.\n\nHybrid and remote workshops are common across Nigerian organisations with offices in several cities. Plan for connectivity issues: share materials beforehand, use simple tools like Miro or shared documents, and have a dial-in fallback. Keep sessions shorter and more focused online." },
            { type: "text", title: "Advanced Process Analysis and Root Cause", content: "Mid-level BAs move beyond mapping to diagnosing and improving processes.\n\nRoot cause techniques:\n- Five whys: ask why repeatedly to move from symptom to cause.\n- Fishbone (Ishikawa) diagram: group causes under categories such as people, process, technology, policy and environment.\n- Pareto analysis: find the few causes responsible for most problems.\n\nMeasure the process before improving it: cycle time, waiting time, error or rework rate, volume and cost per transaction. Without a baseline you cannot prove improvement.\n\nGap analysis compares the current state with the desired future state and lists what must change: processes, systems, data, skills and policies.\n\nWorked example: a bank’s account opening takes an average of four days. Mapping shows most time is spent waiting for manual address verification and resolving mismatched names between BVN and ID. A Pareto chart shows name mismatches cause most rework. The to-be process adds real-time BVN and NIN validation at capture, an exception queue for mismatches and a decision rule for low-risk tiers, reducing waiting and rework. The BA quantifies expected savings for the business case." },
            { type: "text", title: "Data Analysis for Business Analysts", content: "Data skills let BAs validate assumptions, size problems and check outcomes. SQL is the most useful single skill.\n\nCore SQL patterns:\n- Filtering and aggregation: SELECT channel, COUNT(*) FROM transactions WHERE status = 'FAILED' GROUP BY channel;\n- Joining tables: combine customers and accounts using a shared key.\n- Finding gaps: use LEFT JOIN or NOT EXISTS to find customers without recent transactions.\n- Dates: filter by periods to compare before and after a change.\n\nData quality matters. Check for duplicates, missing values, inconsistent formats (such as phone numbers with and without +234) and test records before drawing conclusions.\n\nVisualise results simply in Excel or Power BI: a trend line for volumes, a bar chart for categories. Lead with the insight, not the chart.\n\nRequirements often involve data: define each field’s meaning, format, source and validation rules in a data dictionary. Consider data protection: under NDPA 2023, only collect personal data needed for the purpose, and ensure access is controlled. Involve the Data Protection Officer when requirements touch sensitive data such as health or biometric information." },
            { type: "text", title: "Business Cases and Solution Evaluation", content: "A business case justifies an investment by comparing options against costs, benefits and risks.\n\nStructure:\n1. Problem or opportunity, with evidence.\n2. Options, always including ‘do nothing’ as a baseline.\n3. Costs: one-off and recurring, such as licences, implementation, training and support.\n4. Benefits: quantified where possible (time saved, revenue, reduced losses) and qualitative (customer experience, compliance).\n5. Risks and assumptions.\n6. Recommendation with financial measures such as payback period or net present value.\n\nBe honest about uncertainty; state assumptions clearly so decision makers can challenge them.\n\nSolution evaluation happens after delivery. Compare actual performance against the business case: did processing time fall, did errors drop, are users adopting the system? Identify limitations in the solution or the organisation (for example lack of training) and recommend actions.\n\nBenefits realisation assigns each benefit an owner, a baseline, a target and a measurement date. Without this, organisations rarely know whether investments paid off. Senior BAs often lead this tracking and report it to steering committees." },
            { type: "assignment", title: "Process Improvement and Business Case", maxScore: 100, content: "Brief: a microfinance bank’s loan disbursement process takes too long and customers are moving to digital lenders. Using a provided sample dataset or realistic assumptions, analyse and propose improvements.\n\nDeliverables:\n1. As-is BPMN model with baseline metrics.\n2. Root cause analysis using a fishbone diagram and Pareto chart.\n3. Three SQL queries with results that support your analysis.\n4. To-be process model and gap analysis.\n5. A business case comparing at least three options including do nothing.\n\nGrading: process models 20, root cause rigour 20, data analysis 20, solution design 20, business case quality 20." },
            { type: "quiz", title: "BA Intensive Check", questions: [
              { q: "What is the main purpose of a parking lot in a workshop?", options: ["To record off-topic items without derailing the session", "To list attendees who arrived late", "To store final requirements", "To schedule the next meeting"], answer: 0 },
              { q: "Why is measuring a baseline important before process improvement?", options: ["It is required by BPMN", "It makes the process faster automatically", "It removes the need for a business case", "Without it you cannot demonstrate the improvement"], answer: 3 },
              { q: "Which SQL approach best finds customers with no transactions in the last 90 days?", options: ["SELECT * FROM transactions ORDER BY date", "A LEFT JOIN or NOT EXISTS against recent transactions", "COUNT(*) on the customers table only", "DELETE FROM customers"], answer: 1 },
              { q: "Why should a business case include a ‘do nothing’ option?", options: ["Regulators require it", "It is always the cheapest", "It provides a baseline to compare other options against", "It guarantees approval"], answer: 2 },
              { q: "Pareto analysis helps a BA to:", options: ["Identify the few causes responsible for most of the problems", "Draw swimlanes", "Write user stories", "Calculate employee salaries"], answer: 0 },
              { q: "What is benefits realisation?", options: ["Celebrating go-live", "Writing the requirements document", "Testing the software", "Tracking whether expected benefits are achieved after delivery against baselines and targets"], answer: 3 }
            ] },
            { type: "assignment", title: "Capstone: Digitising SME Loan Origination for a Commercial Bank", maxScore: 100, content: "Shared brief: a Nigerian commercial bank wants to digitise SME loan applications, currently handled through paper forms, emails and branch visits, to reduce turnaround time and improve compliance.\nJunior: document the as-is process, elicit requirements from role-played stakeholders, write 12–15 user stories or requirements with acceptance criteria, and prepare a UAT test plan with traceability.\nMid: lead a requirements workshop, produce as-is and to-be BPMN models with root cause analysis, a data dictionary, SQL-backed analysis of a sample dataset and a business case with options.\nSenior: produce a programme-level analysis: capability map, solution options with architecture considerations, requirements governance and change control, NDPA and CBN compliance considerations, a benefits realisation plan and a structure for leading three analysts.\nDeliverables: analysis artefacts plus a 10-minute presentation to a mock steering committee.\nGrading: elicitation and stakeholder handling 20, modelling and analysis 25, requirement quality 20, value and business case 20, communication 15, assessed against the chosen level." }
          ]
        }
      }
    }
  ]
};

// NexIT-Africa role catalog — Software Development
export default {
  key: "software",
  title: "Software Development",
  summary: "Engineers who design, build, test and ship web, server and mobile software. Roles span user interfaces, APIs and data, end-to-end product delivery and native or cross-platform mobile apps.",
  roles: [
    {
      id: "frontend",
      title: "Frontend Developer",
      summary: "Builds the user-facing parts of web applications, turning designs into fast, accessible and maintainable interfaces that talk to backend APIs. Works closely with designers, backend engineers and product managers inside a product or platform team.",
      competencies: [
        { name: "HTML, CSS and accessibility", weight: 20, description: "Writes semantic, responsive markup and styles that meet WCAG 2.2 AA and work across browsers and screen sizes." },
        { name: "JavaScript and TypeScript", weight: 25, description: "Uses modern JavaScript and TypeScript fluently, including async code, modules, types and the DOM." },
        { name: "Framework and state management", weight: 25, description: "Builds component-based UIs in a framework such as React, manages state and data fetching, and structures code for reuse." },
        { name: "Web performance", weight: 15, description: "Measures and improves load and runtime performance using Core Web Vitals, bundling strategies and caching, including on low-end devices and slow networks." },
        { name: "Frontend testing and quality", weight: 15, description: "Writes unit, component and end-to-end tests and uses linting, types and code review to keep the UI reliable." }
      ],
      levels: {
        junior: {
          minYears: 0,
          focus: "Implements well-defined UI features and components from designs under the guidance of senior engineers.",
          responsibilities: [
            "Build responsive pages and components from Figma designs using the team’s framework and design system",
            "Connect UI components to existing REST or GraphQL endpoints and handle loading and error states",
            "Fix UI bugs reported by QA or users and verify the fix across major browsers",
            "Write basic unit and component tests for the code they ship",
            "Open small, focused pull requests and respond to code review feedback"
          ],
          skills: [
            "Semantic HTML",
            "Responsive CSS layout",
            "Modern JavaScript (ES2015+)",
            "React components and hooks",
            "Basic TypeScript",
            "Fetching API data",
            "Git branching workflow"
          ],
          tools: ["VS Code", "Git and GitHub", "Chrome DevTools", "React", "Tailwind CSS", "Figma"],
          certifications: ["Meta Front-End Developer Professional Certificate", "freeCodeCamp Responsive Web Design Certification"],
          aiTopics: [
            "Semantic HTML and basic accessibility (labels, alt text, keyboard navigation)",
            "CSS layout with Flexbox and Grid and responsive breakpoints",
            "JavaScript fundamentals: scope, closures, promises and async/await",
            "React component basics: props, state, effects and lists with keys",
            "Using browser DevTools to debug layout and network issues"
          ],
          aiScenarios: [
            "A page looks fine on your laptop but the layout breaks on a small Android phone. Walk me through how you would find and fix the problem.",
            "You call an API to show a list of products, but nothing renders and there is no visible error. How would you debug it step by step?",
            "A designer hands you a form with five fields and validation rules. Walk me through how you would build it so it is usable with a keyboard and a screen reader."
          ],
          aiExpectations: "A ready junior explains clearly how the browser renders HTML, CSS and JavaScript, uses DevTools confidently and can describe a small project they built end to end. Red flags are copying framework code without understanding state or effects, ignoring accessibility entirely, or being unable to explain how they debug.",
          proQuestions: [
            { q: "Walk me through a UI feature you built from a design. What decisions did you make about layout and component structure?", lookFor: "Concrete description of breaking the design into components, choosing layout techniques and handling responsive states, with honest reflection on what they would change." },
            { q: "Tell me about a bug you found hard to fix in a frontend project. How did you track it down?", lookFor: "A systematic approach using DevTools, console, network tab or isolating the component, rather than random changes; clear explanation of the root cause." },
            { q: "How do you make sure a form you build is accessible?", lookFor: "Mentions labels tied to inputs, error messages announced to assistive tech, keyboard focus order and colour contrast, ideally with an example of testing it." },
            { q: "Explain the difference between props and state in React and give an example from your own code.", lookFor: "Accurate explanation that props flow from parent and state is owned locally, with a real example of lifting state or passing callbacks." },
            { q: "Describe how you handled feedback on a pull request that asked for significant changes.", lookFor: "Shows openness to review, asks clarifying questions, makes the changes and learns a reusable lesson rather than becoming defensive." }
          ]
        },
        mid: {
          minYears: 2,
          focus: "Owns complete frontend features from design hand-off to production, including state, performance and tests.",
          responsibilities: [
            "Deliver end-to-end features, including data fetching, caching, error handling and analytics events",
            "Contribute reusable components to the design system and document their usage",
            "Profile and fix performance regressions using Lighthouse and Core Web Vitals data",
            "Write component and end-to-end tests and keep the CI pipeline green",
            "Review pull requests from peers and juniors with clear, actionable feedback"
          ],
          skills: [
            "TypeScript in production",
            "Next.js routing and rendering",
            "Server state with TanStack Query",
            "Core Web Vitals optimisation",
            "Component testing with Testing Library",
            "End-to-end testing with Playwright",
            "WCAG 2.2 compliance"
          ],
          tools: ["Next.js", "TypeScript", "TanStack Query", "Playwright", "Storybook", "Vite"],
          certifications: ["Meta Front-End Developer Professional Certificate", "AWS Certified Cloud Practitioner"],
          aiTopics: [
            "Rendering strategies: client-side, server-side, static generation and React Server Components",
            "State management trade-offs: local state, context, Redux Toolkit or Zustand, and server state caching",
            "Core Web Vitals (LCP, INP, CLS) and practical fixes",
            "Testing strategy across unit, component and end-to-end tests",
            "Handling authentication tokens, CORS and common frontend security issues such as XSS"
          ],
          aiScenarios: [
            "Your product listing page has an LCP of over 5 seconds on mobile data in Lagos. Walk me through how you would diagnose and improve it.",
            "Two components on the same page show different values for a user’s wallet balance after a top-up. How would you find the cause and redesign the data flow?",
            "You are asked to add a payment checkout step using a provider’s hosted widget. Walk me through how you would integrate it, handle failures and test it."
          ],
          aiExpectations: "A ready mid-level developer can justify rendering and state choices with trade-offs, measures performance before optimising and treats tests and accessibility as part of done. Red flags are reaching for global state for everything, no experience with real performance data, or no clear testing habit.",
          proQuestions: [
            { q: "Describe a feature you owned from design to production. How did you plan it, and what went wrong along the way?", lookFor: "Clear ownership of scope, API contract discussions, edge cases and rollout, plus honest reflection on a mistake and how it was handled." },
            { q: "Tell me about a time you improved the performance of a web page. How did you measure before and after?", lookFor: "Uses real metrics such as Lighthouse, field data or Web Vitals, identifies the bottleneck (images, bundle size, blocking scripts, re-renders) and quantifies the change." },
            { q: "How do you decide what belongs in global state versus local or server state?", lookFor: "Distinguishes server cache from UI state, avoids unnecessary global stores and gives an example where the choice mattered." },
            { q: "Walk me through how you test a complex component such as a multi-step form.", lookFor: "Tests user behaviour rather than implementation details, covers validation and error paths, and uses end-to-end tests for the critical flow." },
            { q: "Give an example of a reusable component you contributed to a shared library. How did you design its API?", lookFor: "Thoughtful props design, accessibility built in, documentation or Storybook stories and awareness of not over-generalising." }
          ]
        },
        senior: {
          minYears: 5,
          focus: "Sets frontend architecture and standards, leads complex initiatives and grows other engineers.",
          responsibilities: [
            "Design and own the frontend architecture, including rendering strategy, module boundaries and the design system",
            "Lead cross-team initiatives such as framework upgrades, migration to TypeScript or a performance programme",
            "Define frontend standards for testing, accessibility, security and observability and enforce them in CI",
            "Mentor junior and mid-level engineers through pairing, reviews and technical guidance",
            "Partner with product, design and backend leads to shape roadmaps and API contracts"
          ],
          skills: [
            "Frontend architecture design",
            "Design system governance",
            "Performance budgets and monitoring",
            "Micro-frontend and monorepo strategy",
            "Frontend security hardening",
            "Technical mentoring",
            "Cross-team technical leadership"
          ],
          tools: ["Next.js", "Turborepo", "Storybook", "Sentry", "GitHub Actions", "Datadog RUM"],
          certifications: ["AWS Certified Developer – Associate", "Google Cloud Professional Cloud Developer"],
          aiTopics: [
            "Architecture choices: SPA, SSR, islands, micro-frontends and monorepos",
            "Design system strategy, versioning and adoption across teams",
            "Performance budgets, real user monitoring and regression prevention",
            "Frontend security: CSP, dependency risk, auth flows and handling personal data under the NDPA 2023",
            "Leading migrations and making build-versus-buy decisions"
          ],
          aiScenarios: [
            "Three product teams each built their own button and modal components and the UI is inconsistent. Walk me through how you would introduce and drive adoption of a shared design system.",
            "Your app must work for users on low-end Android devices with unreliable connectivity. How would you shape the architecture and set performance budgets?",
            "A critical npm dependency is reported to have a supply-chain compromise. Walk me through your response and the long-term controls you would put in place."
          ],
          aiExpectations: "A ready senior explains architecture decisions in terms of business impact, team structure and long-term cost, and shows evidence of raising the level of other engineers. Red flags are framework-hype reasoning, no experience leading change across teams, or treating security and accessibility as someone else’s job.",
          proQuestions: [
            { q: "Describe a significant frontend architecture decision you made. What options did you consider and how did it play out?", lookFor: "Clear options with trade-offs, stakeholder alignment, a reasoned decision and honest assessment of outcomes including what they would change." },
            { q: "Tell me about a large migration you led, such as a framework upgrade or move to TypeScript.", lookFor: "Incremental plan, risk management, metrics for progress, keeping delivery going in parallel and bringing other engineers along." },
            { q: "How have you set and enforced performance or accessibility standards across a team?", lookFor: "Concrete mechanisms such as budgets in CI, automated audits, review checklists and education, plus how they handled pushback." },
            { q: "Give an example of how you helped a struggling engineer grow.", lookFor: "Specific support (pairing, scoped tasks, feedback), measurable improvement and respect for the person." },
            { q: "Tell me about a time you disagreed with a product or design lead on a technical approach.", lookFor: "Uses data and user impact to argue, seeks compromise, commits once decided and maintains a good working relationship." }
          ]
        }
      },
      hrScenarios: [
        { q: "Tell me about a time a designer and a product manager gave you conflicting requirements for the same screen. What did you do?", lookFor: "Raises the conflict early, brings both parties together with options and moves forward without taking sides or silently choosing." },
        { q: "Describe a time you shipped a UI bug that affected users. How did you handle it?", lookFor: "Takes ownership, communicates promptly, fixes and follows up with a prevention step such as a test or review change." },
        { q: "Tell me about a time you had to learn a new framework or tool quickly to meet a deadline.", lookFor: "Structured learning approach, asks for help appropriately and delivers while being honest about risks." }
      ],
      curriculum: {
        foundational: {
          title: "Frontend Development Foundations",
          summary: "A practical introduction to building web interfaces with HTML, CSS, JavaScript and React for beginners and career-switchers.",
          duration: "5 weeks",
          modules: [
            { type: "text", title: "How the web renders a page", content: "When a user opens a page, the browser downloads HTML, builds the DOM, downloads CSS to build the CSSOM, combines them into a render tree, then lays out and paints pixels. JavaScript can change the DOM at any time, which triggers new layout and paint work.\n\nKey ideas:\n- HTML gives structure and meaning. Use semantic elements such as header, nav, main, article, button and label instead of generic divs.\n- CSS controls presentation. Styles cascade, and more specific selectors win.\n- JavaScript adds behaviour. Scripts that block parsing slow the first render, so use defer or type=\"module\".\n\nWorked example: a sign-up form. Use a form element, each input with a matching label (for and id), a button of type submit and the required attribute for mandatory fields. This works with a keyboard, is read correctly by screen readers and gives basic validation for free.\n\nChecklist for every page: one h1, headings in order, alt text on meaningful images, visible focus styles, and a viewport meta tag so it scales on phones." },
            { type: "text", title: "Responsive layout with Flexbox and Grid", content: "Most users in Nigeria browse on phones, so design mobile-first: write styles for small screens, then add min-width media queries for larger ones.\n\nFlexbox lays out items in one direction (a row or a column). Use it for navbars, button groups and aligning items. Key properties: display:flex, flex-direction, justify-content, align-items, gap and flex-wrap.\n\nGrid lays out items in two dimensions. Use it for page layouts and card galleries. Example: grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)) creates as many columns as fit, each at least 220px wide, with no media query needed.\n\nOther essentials:\n- Use relative units (rem, %, vw) and max-width for readable text.\n- Make images fluid with max-width:100% and height:auto.\n- Test in DevTools device mode and on a real low-end phone.\n\nCommon mistake: fixed pixel widths on containers, which cause horizontal scrolling on small screens. If the page scrolls sideways, inspect elements to find the one wider than the viewport." },
            { type: "text", title: "JavaScript essentials for the browser", content: "Modern JavaScript you will use daily:\n- const and let instead of var; const by default.\n- Arrow functions, template literals, destructuring and the spread operator.\n- Array methods: map, filter, find and reduce for transforming data.\n- Modules with import and export.\n\nAsynchronous code: network requests take time, so fetch returns a Promise. Use async/await for readable code:\n\nasync function loadProducts() {\n  try {\n    const res = await fetch('/api/products');\n    if (!res.ok) throw new Error('Request failed: ' + res.status);\n    const data = await res.json();\n    render(data);\n  } catch (err) {\n    showError('Could not load products. Check your connection.');\n  }\n}\n\nNote that fetch only rejects on network failure, so you must check res.ok for HTTP errors such as 404 or 500.\n\nDOM basics: select elements with querySelector, react to events with addEventListener and update text with textContent rather than innerHTML to avoid injecting untrusted HTML (a cross-site scripting risk)." },
            { type: "text", title: "Building components with React", content: "React lets you build UIs from components: functions that return JSX describing what to show. Data flows down through props, and each component can hold its own state.\n\nCore hooks:\n- useState stores values that change, such as form input or a toggle. Calling the setter re-renders the component.\n- useEffect runs side effects after render, such as fetching data. Always provide a dependency array to control when it runs.\n\nWorked example: a product list.\n1. ProductList fetches products in useEffect and stores them in state, along with loading and error flags.\n2. It renders a spinner while loading, a message on error and otherwise maps over products to render a ProductCard for each, with key={product.id}.\n3. ProductCard receives the product as a prop and an onAdd callback for the cart button.\n\nRules of thumb: keep components small, lift state up to the nearest common parent when two components need it, and never mutate state directly; create new arrays or objects instead. In production apps, frameworks such as Next.js add routing and server rendering on top of React." },
            { type: "quiz", title: "Frontend Foundations Quiz", questions: [
              { q: "Which element is most appropriate for a clickable control that submits a form?", options: ["A div with an onclick handler", "A button element with type=\"submit\"", "A span styled to look like a button", "An anchor tag with href=\"#\""], answer: 1 },
              { q: "You need a card gallery that fills available width with as many 220px-minimum columns as fit. Which approach is best?", options: ["Float each card left with a fixed width", "Use a table with one row", "Use CSS Grid with repeat(auto-fill, minmax(220px, 1fr))", "Use absolute positioning for each card"], answer: 2 },
              { q: "A fetch call returns a 404 response. What happens by default?", options: ["The Promise resolves and res.ok is false", "The Promise rejects with a network error", "The browser reloads the page", "fetch retries the request automatically"], answer: 0 },
              { q: "Why should you prefer textContent over innerHTML when displaying user-supplied text?", options: ["textContent is the only way to change text", "innerHTML does not work in modern browsers", "textContent supports more fonts", "innerHTML can execute injected markup, creating an XSS risk"], answer: 3 },
              { q: "In React, two sibling components need to share the same piece of state. What is the usual first solution?", options: ["Store it in a global variable", "Lift the state up to their nearest common parent and pass it down as props", "Duplicate the state in both components", "Use localStorage to sync them"], answer: 1 },
              { q: "What is the main purpose of the key prop when rendering a list in React?", options: ["To help React identify which items changed, were added or removed", "To set the item’s CSS class", "To encrypt the list data", "To make the list sortable by default"], answer: 0 }
            ] },
            { type: "assignment", title: "Build a responsive product catalogue", maxScore: 100, content: "Build a small product catalogue for a fictional Lagos electronics store using React (Vite or Next.js). Load products from a provided JSON file or a public mock API, show them in a responsive grid, and include a search box that filters by name and a simple cart counter.\n\nDeliverables: a public GitHub repository with a README explaining how to run the project, a deployed link (Vercel or Netlify), and a short note on one accessibility and one performance decision you made.\n\nGrading: functionality and correctness (35), responsive layout on mobile and desktop (20), accessibility such as labels, keyboard use and alt text (20), code quality and component structure (15), README and commit history (10)." }
          ]
        },
        intensive: {
          title: "Professional Frontend Engineering",
          summary: "Job-ready depth in TypeScript, Next.js, state management, performance, testing and accessibility for production web applications.",
          duration: "8 weeks",
          modules: [
            { type: "text", title: "TypeScript for production frontends", content: "TypeScript catches errors before users do and documents how your code should be used.\n\nEssentials:\n- Type props and API responses with type or interface. Example: type Product = { id: string; name: string; priceKobo: number; inStock: boolean }.\n- Use union types for states: type Status = 'idle' | 'loading' | 'success' | 'error'. This prevents impossible combinations such as loading and error at once.\n- Prefer unknown over any for data you have not validated, then narrow it.\n- Generics let you write reusable helpers, for example a typed fetchJson<T>(url) function.\n\nAPI data is untrusted at runtime: TypeScript types disappear after compilation. Validate responses at the boundary with a schema library such as Zod, then use the inferred type inside the app.\n\nWorked example: storing money. Keep amounts as integers in the smallest unit (kobo) to avoid floating-point rounding errors, and format for display with Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).\n\nTurn on strict mode in tsconfig from day one; adding it later to a large codebase is painful." },
            { type: "text", title: "Rendering strategies and data fetching in Next.js", content: "Modern frameworks let you choose where and when HTML is produced:\n- Client-side rendering (CSR): the browser downloads JavaScript and builds the page. Simple, but slow first load on weak devices.\n- Server-side rendering (SSR): HTML is generated per request. Good for personalised pages and SEO.\n- Static generation (SSG) and incremental regeneration: HTML is built ahead of time and cached on a CDN. Fastest for content that rarely changes.\n- React Server Components (Next.js App Router): components run on the server, send HTML and minimal JavaScript, and only interactive parts become client components.\n\nData fetching: separate server state (data owned by the backend) from UI state. Libraries such as TanStack Query handle caching, deduplication, retries and background refresh for client-side fetching.\n\nDecision checklist for a page: Does it need SEO? Is it personalised? How often does data change? How heavy is the interactivity? A marketing page is usually static; a dashboard is often server-rendered shell plus client-side data; a checkout needs careful client state and error handling." },
            { type: "text", title: "Web performance for real-world networks", content: "Core Web Vitals measure user experience:\n- LCP (Largest Contentful Paint): main content visible; aim for 2.5s or less.\n- INP (Interaction to Next Paint): responsiveness; aim for 200ms or less.\n- CLS (Cumulative Layout Shift): visual stability; aim for 0.1 or less.\n\nLab tools (Lighthouse, DevTools Performance panel) help you debug; field data (Chrome UX Report, real user monitoring) shows what users actually experience. Always test with network and CPU throttling, because many users are on mid-range Android phones and variable mobile data.\n\nHigh-impact fixes:\n1. Images: modern formats (WebP or AVIF), correct sizes, lazy loading below the fold and explicit width and height to prevent layout shift.\n2. JavaScript: code-split by route, remove unused dependencies and analyse bundles.\n3. Fonts: self-host, subset and use font-display: swap.\n4. Caching: long cache headers on hashed assets and a CDN.\n5. Long tasks: break up heavy work and avoid unnecessary re-renders.\n\nSet a performance budget (for example, under 200KB of JavaScript on first load) and check it in CI." },
            { type: "text", title: "Testing, accessibility and release quality", content: "A healthy frontend test suite follows the testing trophy: static checks (TypeScript, ESLint) at the base, many component and integration tests, and a small number of end-to-end tests for critical journeys.\n\nComponent tests with Testing Library query the UI the way users do: getByRole('button', { name: /pay now/i }) rather than CSS classes. This makes tests resilient to refactoring and encourages accessible markup.\n\nEnd-to-end tests with Playwright run the real app in browsers. Cover the few flows that must never break, such as sign-in, checkout and payment confirmation. Mock third-party services at the network layer to keep tests stable.\n\nAccessibility (WCAG 2.2 AA):\n- Every interactive element is reachable and operable by keyboard with visible focus.\n- Form errors are linked to fields and announced.\n- Colour contrast is at least 4.5:1 for normal text.\n- Run automated checks (axe) in CI, and do a manual keyboard and screen-reader pass for new features.\n\nRelease checklist: tests green, no new console errors, bundle within budget, feature flag ready and error monitoring (for example Sentry) in place." },
            { type: "assignment", title: "Performance and accessibility audit", maxScore: 100, content: "You are given a deliberately slow, inaccessible Next.js storefront repository. Audit it and fix the most important issues.\n\nDeliverables: (1) an audit report with Lighthouse and axe results before your changes, run with mobile throttling; (2) a pull request fixing at least five issues across performance and accessibility; (3) after-results with a short explanation of each change and its measured impact.\n\nGrading: quality of diagnosis and prioritisation (30), correctness of fixes (30), measured improvement in LCP, CLS and accessibility score (20), clarity of the report and commit messages (20). Changes without before-and-after evidence receive partial credit only." },
            { type: "quiz", title: "Professional Frontend Quiz", questions: [
              { q: "Why should you validate API responses with a runtime schema such as Zod even when using TypeScript?", options: ["TypeScript types slow down the browser", "Zod replaces the need for tests", "TypeScript types are erased at compile time and cannot check data received at runtime", "Browsers do not support JSON without Zod"], answer: 2 },
              { q: "A marketing page changes once a month and must rank well in search. Which rendering approach fits best?", options: ["Static generation served from a CDN", "Client-side rendering only", "Server-side rendering on every request with no caching", "Rendering in a Web Worker"], answer: 0 },
              { q: "Which metric best reflects how quickly a page responds to user clicks and taps?", options: ["LCP", "CLS", "TTFB", "INP"], answer: 3 },
              { q: "Images loading without width and height attributes cause content to jump. Which metric is most affected?", options: ["INP", "CLS", "LCP only", "Time to First Byte"], answer: 1 },
              { q: "Which Testing Library query best reflects how a user finds a payment button?", options: ["container.querySelector('.btn-primary')", "getByTestId('btn-1')", "getByRole('button', { name: /pay now/i })", "document.getElementsByTagName('button')[0]"], answer: 2 },
              { q: "Why are amounts often stored in kobo as integers rather than naira as decimals?", options: ["Integers avoid floating-point rounding errors in calculations", "Decimals cannot be displayed in browsers", "Payment providers forbid decimals in the UI", "Integers use less screen space"], answer: 0 }
            ] },
            { type: "assignment", title: "Capstone: Production-ready web application", maxScore: 100, content: "Shared brief: build a savings and bill-payment web app for a fictional Nigerian fintech. Users sign in, view their balance and transactions, and pay a utility bill through a mocked payment API that sometimes fails or times out. It must work well on a mid-range Android phone on a slow 3G profile.\nJunior: build the sign-in, dashboard and bill-payment flow in Next.js with TypeScript, clear loading and error states, responsive layout and component tests for the payment form.\nMid: add everything in Junior plus server-state caching, optimistic UI with rollback on failure, Playwright tests for the payment journey, Core Web Vitals within budget and an axe-clean UI.\nSenior: add everything in Mid plus a written architecture decision record, a reusable component library in Storybook, a CI pipeline enforcing performance and accessibility budgets, error monitoring and a security review covering token storage and NDPA 2023 handling of personal data.\nDeliverables: GitHub repository, deployed URL, README with setup and decisions, and a 5-minute recorded walkthrough.\nGrading: functionality (25), code quality and architecture (25), testing (15), performance and accessibility (20), documentation and communication (15), assessed against the chosen level." }
          ]
        }
      }
    },
    {
      id: "backend",
      title: "Backend Developer",
      summary: "Designs and builds the server-side services, APIs and data stores that power web and mobile products, with a focus on correctness, security and reliability. Works with frontend and mobile engineers, DevOps and data teams, usually inside a product or platform squad.",
      competencies: [
        { name: "API design and implementation", weight: 25, description: "Designs clear, versioned REST or GraphQL APIs with proper validation, error handling and documentation." },
        { name: "Data modelling and databases", weight: 25, description: "Models data, writes efficient SQL and uses indexes, transactions and migrations safely in relational and NoSQL stores." },
        { name: "Application security", weight: 20, description: "Implements authentication, authorisation and input handling that defend against the OWASP Top 10 and protect personal data." },
        { name: "Reliability and performance", weight: 15, description: "Builds services that handle load, failures and retries gracefully, using caching, queues and idempotency." },
        { name: "Testing and observability", weight: 15, description: "Writes automated tests and adds logging, metrics and tracing so issues can be detected and diagnosed in production." }
      ],
      levels: {
        junior: {
          minYears: 0,
          focus: "Implements well-scoped endpoints, queries and bug fixes within an existing service under guidance.",
          responsibilities: [
            "Implement CRUD endpoints with input validation following the team’s API conventions",
            "Write SQL queries and database migrations reviewed by a senior engineer",
            "Fix bugs reported from logs or QA and add a regression test for each",
            "Write unit and integration tests for the code they ship",
            "Keep API documentation such as OpenAPI specs up to date for endpoints they change"
          ],
          skills: [
            "Node.js or Python basics",
            "RESTful API fundamentals",
            "SQL queries and joins",
            "HTTP status codes",
            "Input validation",
            "Unit testing",
            "Git workflow"
          ],
          tools: ["Node.js", "Express", "PostgreSQL", "Postman", "Docker", "Git and GitHub"],
          certifications: ["AWS Certified Cloud Practitioner", "Microsoft Certified: Azure Fundamentals (AZ-900)"],
          aiTopics: [
            "HTTP methods, status codes and REST resource design",
            "SQL fundamentals: joins, filtering, aggregation and basic indexing",
            "Password hashing and session or token-based authentication basics",
            "Handling errors and validating request input",
            "Writing and running unit and integration tests"
          ],
          aiScenarios: [
            "An endpoint that lists a user’s orders returns other users’ orders as well. Walk me through how you would find and fix the bug.",
            "You need to add an endpoint that lets a user update their phone number. Walk me through the route, validation, database change and tests.",
            "A query that worked fine in development takes several seconds in staging. How would you investigate?"
          ],
          aiExpectations: "A ready junior explains request-response flow, writes correct SQL with joins and validates input before trusting it. Red flags are storing passwords in plain text or reversible form, building SQL by string concatenation, or no habit of testing.",
          proQuestions: [
            { q: "Walk me through an API you built. How did you structure routes, validation and error responses?", lookFor: "Consistent resource naming, correct status codes, validation at the boundary and meaningful error messages, with a real example." },
            { q: "How do you store user passwords, and why?", lookFor: "Uses a slow adaptive hash such as bcrypt or Argon2 with salts, never plain text or reversible encryption, and can explain why." },
            { q: "Tell me about a database query you had to debug or optimise.", lookFor: "Uses EXPLAIN or logs to find the problem, understands indexes or N+1 queries and verifies the improvement." },
            { q: "How do you prevent SQL injection in your code?", lookFor: "Parameterised queries or an ORM used correctly, plus input validation; can explain how injection works." },
            { q: "Describe a time you got stuck on a backend problem. What did you do?", lookFor: "Time-boxes independent investigation, reads docs and logs, then asks for help with a clear summary of what was tried." }
          ]
        },
        mid: {
          minYears: 2,
          focus: "Owns services and features end to end, including data design, integrations, testing and production support.",
          responsibilities: [
            "Design and build features spanning API, data model, background jobs and third-party integrations",
            "Integrate payment, SMS and identity providers with proper retries, webhooks and idempotency",
            "Diagnose and resolve production incidents using logs, metrics and traces",
            "Optimise slow queries and add caching where measurements justify it",
            "Participate in on-call and code reviews and write clear technical documentation"
          ],
          skills: [
            "API design with OpenAPI",
            "PostgreSQL indexing and transactions",
            "Redis caching",
            "Message queues and background jobs",
            "OAuth 2.0 and JWT",
            "Webhook and idempotency handling",
            "Containerised deployment"
          ],
          tools: ["PostgreSQL", "Redis", "Docker", "RabbitMQ", "Grafana", "GitHub Actions"],
          certifications: ["AWS Certified Developer – Associate", "Microsoft Certified: Azure Developer Associate", "Certified Kubernetes Application Developer (CKAD)"],
          aiTopics: [
            "Transactions, isolation levels and avoiding race conditions such as double spending",
            "Idempotency keys, retries and webhook verification for payment integrations",
            "Caching strategies and cache invalidation",
            "Asynchronous processing with queues and background workers",
            "Observability: structured logging, metrics and distributed tracing"
          ],
          aiScenarios: [
            "Users report being charged twice when they tap Pay during a network drop. Walk me through how you would find the cause and redesign the payment endpoint.",
            "A payment provider’s webhook sometimes arrives before your own API call returns, and sometimes twice. How would you handle this reliably?",
            "Your order service’s p95 latency has tripled since a release. Walk me through your investigation using the tools you would expect to have."
          ],
          aiExpectations: "A ready mid-level developer designs for failure, explains transactional and concurrency issues clearly and uses observability data to debug. Red flags are assuming networks and third parties are reliable, no understanding of idempotency, or optimising without measuring.",
          proQuestions: [
            { q: "Describe a third-party integration you built, such as payments or SMS. How did you handle failures?", lookFor: "Timeouts, retries with backoff, idempotency keys, webhook signature verification and reconciliation, with a real example." },
            { q: "Tell me about a production incident you helped resolve. What was your role?", lookFor: "Structured triage, use of logs and metrics, communication during the incident and a follow-up action that prevented recurrence." },
            { q: "How have you designed a database schema for a new feature? Walk me through the trade-offs.", lookFor: "Considers access patterns, normalisation versus denormalisation, constraints, indexes and safe migrations on live data." },
            { q: "When would you introduce a cache or a queue, and what problems can each create?", lookFor: "Introduces them based on measured need and explains stale data, invalidation, ordering, duplicate delivery and operational overhead." },
            { q: "Give an example of a code review comment you made that changed a design for the better.", lookFor: "Constructive, specific feedback grounded in correctness, security or maintainability, delivered respectfully." }
          ]
        },
        senior: {
          minYears: 5,
          focus: "Designs system architecture, sets backend standards and leads reliability, security and scaling efforts across teams.",
          responsibilities: [
            "Design service architecture, data ownership boundaries and integration patterns for new products",
            "Lead reliability work by defining SLOs, capacity plans and incident review practices",
            "Own backend security standards including secrets management, access control and NDPA 2023 compliance for personal data",
            "Mentor engineers and lead design reviews that raise the quality of the team’s decisions",
            "Work with product and leadership to plan technical roadmaps and manage technical debt"
          ],
          skills: [
            "Distributed systems design",
            "Event-driven architecture",
            "Database scaling and replication",
            "SLOs and reliability engineering",
            "Threat modelling",
            "Technical mentoring",
            "Architecture decision records"
          ],
          tools: ["Kubernetes", "Apache Kafka", "PostgreSQL", "Terraform", "OpenTelemetry", "AWS"],
          certifications: ["AWS Certified Solutions Architect – Professional", "Google Cloud Professional Cloud Architect", "Certified Kubernetes Administrator (CKA)"],
          aiTopics: [
            "Monolith versus microservices and defining service boundaries",
            "Consistency models, sagas and the outbox pattern for distributed transactions",
            "Scaling databases with read replicas, partitioning and connection pooling",
            "Defining SLOs and designing for graceful degradation",
            "Threat modelling, secrets management and data protection obligations"
          ],
          aiScenarios: [
            "Your company is expanding from Nigeria to Ghana and Kenya and must support new mobile-money providers. Walk me through how you would design the payments architecture.",
            "The monolith is slowing every team down and leadership wants microservices. How would you assess and plan this?",
            "A security review finds API keys committed to a repository and broad database access for every service. Walk me through your remediation plan."
          ],
          aiExpectations: "A ready senior reasons about trade-offs in consistency, cost and team structure, and has led designs from proposal to production. Red flags are defaulting to microservices or new technology without justification, no incident or reliability ownership, or no track record of developing other engineers.",
          proQuestions: [
            { q: "Describe a system you designed from scratch. What were the key decisions and how did they hold up?", lookFor: "Clear requirements, options with trade-offs, sound data and failure handling and an honest retrospective." },
            { q: "Tell me about a major incident you led or reviewed. What changed afterwards?", lookFor: "Blameless review, root-cause analysis beyond the immediate trigger and systemic fixes that were actually implemented." },
            { q: "How have you handled a large data migration or schema change on a live system?", lookFor: "Expand-and-contract approach, backfills, dual writes or feature flags, verification and a rollback plan." },
            { q: "How do you decide when to pay down technical debt versus ship features?", lookFor: "Ties debt to business risk and delivery speed, quantifies impact and negotiates a sustainable plan with product." },
            { q: "Give an example of how you raised the engineering standard of a team.", lookFor: "Concrete practices such as design reviews, coding standards or mentoring, with evidence of improved outcomes." }
          ]
        }
      },
      hrScenarios: [
        { q: "Tell me about a time you were on call and an incident happened outside working hours. How did you handle it and communicate?", lookFor: "Stays calm, follows the process, keeps stakeholders updated and raises concerns about sustainability constructively." },
        { q: "Describe a time you pushed back on a deadline because of a quality or security risk.", lookFor: "Explains risk in business terms, offers alternatives such as reduced scope and respects the final decision." },
        { q: "Tell me about a time you worked with a frontend or mobile team that disagreed with your API design.", lookFor: "Listens to consumer needs, uses evidence, finds a workable contract and keeps the relationship positive." }
      ],
      curriculum: {
        foundational: {
          title: "Backend Development Foundations",
          summary: "An introduction to building secure, tested REST APIs with Node.js and PostgreSQL for beginners and career-switchers.",
          duration: "5 weeks",
          modules: [
            { type: "text", title: "How HTTP and APIs work", content: "A backend receives HTTP requests and returns responses. Each request has a method, a path, headers and sometimes a body; each response has a status code, headers and a body, usually JSON.\n\nREST conventions:\n- Resources are nouns: /users, /orders/42.\n- Methods express intent: GET reads, POST creates, PUT or PATCH updates, DELETE removes.\n- Status codes tell the client what happened: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized (not logged in), 403 Forbidden (logged in but not allowed), 404 Not Found, 409 Conflict, 500 Internal Server Error.\n\nWorked example: creating an order.\nPOST /orders with a JSON body of items. The server validates the body, checks the user is signed in, saves the order and returns 201 with the new order and its id. If an item is out of stock, return 409 with a clear error message.\n\nGood habits: return consistent error shapes, never leak stack traces to clients, and version your API (for example /v1/) so you can change it later without breaking mobile apps that users have not updated." },
            { type: "text", title: "Relational databases and SQL", content: "Most business data lives in relational databases such as PostgreSQL or MySQL. Data is stored in tables with rows and columns, and relationships are expressed with keys.\n\nCore concepts:\n- Primary key: a unique id for each row.\n- Foreign key: a column that references another table, for example orders.user_id references users.id.\n- Constraints (NOT NULL, UNIQUE, CHECK) protect data quality at the database level.\n\nEssential SQL:\nSELECT o.id, o.total_kobo, u.email\nFROM orders o\nJOIN users u ON u.id = o.user_id\nWHERE o.created_at >= now() - interval '7 days'\nORDER BY o.created_at DESC;\n\nIndexes speed up lookups on columns you filter or join on, at the cost of slower writes and extra storage. Use EXPLAIN to see whether a query uses an index.\n\nTransactions group statements so they all succeed or all fail. Transferring money between wallets must debit one and credit the other inside a single transaction.\n\nAlways change schemas with migration files tracked in Git, never by editing the production database by hand." },
            { type: "text", title: "Building an API with Node.js and Express", content: "A typical Express service is organised in layers:\n- Routes map URLs and methods to handlers.\n- Handlers or controllers parse the request and call business logic.\n- Services hold business rules.\n- A data layer talks to the database through a query builder or ORM such as Prisma.\n\nWorked example: GET /orders/:id\n1. Authentication middleware verifies the user’s token and attaches the user to the request.\n2. The handler validates that id has the right format.\n3. The service fetches the order where id matches AND user_id equals the current user. This second condition is essential: without it any user could read any order by guessing ids.\n4. Return 404 if not found, otherwise 200 with the order.\n\nConfiguration such as database URLs and API keys comes from environment variables, never from code committed to Git. Use a .env file locally and a secrets manager in production.\n\nAdd central error-handling middleware so unexpected errors are logged with context and the client receives a generic 500 message." },
            { type: "text", title: "Security and testing basics", content: "The OWASP Top 10 lists the most common web application risks. As a junior, focus on these:\n- Broken access control: always check that the current user may access the resource, not just that they are logged in.\n- Injection: use parameterised queries or an ORM; never build SQL by joining strings with user input.\n- Cryptographic failures: hash passwords with bcrypt or Argon2; use HTTPS everywhere.\n- Security misconfiguration: disable debug output in production and keep dependencies updated.\n\nPersonal data such as names, phone numbers and BVNs must be handled carefully; in Nigeria the Nigeria Data Protection Act 2023 requires a lawful basis and appropriate security for processing personal data.\n\nTesting:\n- Unit tests check one function in isolation, such as calculating a delivery fee.\n- Integration tests call the real API against a test database, for example checking that POST /orders returns 201 and saves a row.\n- Test unhappy paths: invalid input, missing auth and another user’s resource.\n\nRun tests automatically in CI on every pull request using a tool such as GitHub Actions." },
            { type: "quiz", title: "Backend Foundations Quiz", questions: [
              { q: "A signed-in user requests another user’s private order. Which status code is most appropriate?", options: ["200 OK", "401 Unauthorized", "403 Forbidden or 404 Not Found", "500 Internal Server Error"], answer: 2 },
              { q: "Which approach best prevents SQL injection?", options: ["Parameterised queries", "Escaping quotes manually", "Hiding the database port", "Using GET instead of POST"], answer: 0 },
              { q: "Why should a wallet transfer run inside a database transaction?", options: ["Transactions make queries run faster", "So the debit and credit either both succeed or both fail", "Transactions encrypt the data", "So the query can run without an index"], answer: 1 },
              { q: "What is the main trade-off of adding an index to a column?", options: ["Reads become slower", "The column can no longer be NULL", "The table cannot be joined", "Writes become slightly slower and storage increases"], answer: 3 },
              { q: "Where should a production payment provider API key be stored?", options: ["Hard-coded in the source code", "In a secrets manager or environment variable outside version control", "In the API response for debugging", "In a public README"], answer: 1 },
              { q: "Which is the best example of an integration test?", options: ["Calling POST /orders against a test database and checking the response and saved row", "Checking a single function that adds two numbers", "Running a linter on the code", "Manually clicking through the app"], answer: 0 }
            ] },
            { type: "assignment", title: "Build a secured REST API", maxScore: 100, content: "Build a REST API for a small food-delivery business using Node.js (Express or Fastify) and PostgreSQL. Include user sign-up and login with hashed passwords, token-based authentication, and endpoints to create, list and cancel orders, where users can only see their own orders.\n\nDeliverables: GitHub repository with migrations, an OpenAPI or Postman collection, a README with setup steps, and integration tests covering at least the happy path and two failure cases per endpoint.\n\nGrading: correctness of endpoints (30), security including access control and password hashing (25), data model and migrations (15), tests (20), documentation (10)." }
          ]
        },
        intensive: {
          title: "Professional Backend Engineering",
          summary: "Job-ready depth in API design, data modelling, integrations, reliability, security and observability for production services.",
          duration: "8 weeks",
          modules: [
            { type: "text", title: "API design and contracts", content: "An API is a contract with frontend, mobile and partner teams. Breaking it breaks their apps, often for users who cannot update quickly.\n\nPrinciples:\n- Design from consumer use cases; write the OpenAPI spec before the code and review it with consumers.\n- Use consistent naming, pagination (cursor-based for large or changing lists) and filtering.\n- Return a standard error format, for example { code, message, details }, with machine-readable codes.\n- Version deliberately. Additive changes (new optional fields) are safe; removing or renaming fields needs a new version and a deprecation period.\n\nREST versus GraphQL versus gRPC: REST is simple and cache-friendly; GraphQL suits clients needing flexible queries over many entities; gRPC suits internal service-to-service calls needing performance and strict schemas.\n\nWorked example: mobile clients on poor networks. Keep payloads small, support conditional requests with ETags, allow clients to request only needed fields, and make write endpoints safe to retry by accepting an Idempotency-Key header." },
            { type: "text", title: "Data modelling, transactions and concurrency", content: "Model data around how it is read and written. Start normalised, with constraints that enforce rules in the database, then denormalise only for measured needs.\n\nConcurrency problems appear under real load:\n- Lost update: two requests read a balance of 5,000 and each subtracts 3,000, leaving 2,000 instead of rejecting one.\n- Fixes: an atomic UPDATE with a condition (UPDATE wallets SET balance = balance - 3000 WHERE id = $1 AND balance >= 3000), row locks with SELECT ... FOR UPDATE, or optimistic locking with a version column.\n\nIsolation levels (Read Committed, Repeatable Read, Serializable) trade safety for throughput; know your database default (PostgreSQL uses Read Committed).\n\nFor money, use a double-entry ledger: every movement is recorded as balanced debit and credit entries, and balances are derived. This makes reconciliation with banks and payment providers possible.\n\nSafe migrations on live systems use expand-and-contract: add new columns or tables, backfill, switch reads and writes, then remove the old structure in a later release." },
            { type: "text", title: "Reliable integrations: queues, retries and idempotency", content: "External services such as payment gateways, SMS providers and identity verification APIs will time out and fail. Design for it.\n\n- Timeouts: always set them; never wait forever.\n- Retries: retry only safe operations, with exponential backoff and jitter, and a maximum number of attempts.\n- Idempotency: store an idempotency key with the result of each write so a repeated request returns the original result instead of charging twice.\n- Webhooks: verify the signature, respond quickly with 200, process asynchronously, and handle duplicates and out-of-order delivery.\n- Reconciliation: a scheduled job compares your records with the provider’s and flags mismatches.\n\nQueues (RabbitMQ, Amazon SQS, Kafka) decouple slow work such as sending receipts from the request path. Most give at-least-once delivery, so consumers must be idempotent. Use a dead-letter queue for messages that keep failing.\n\nThe outbox pattern writes the business change and an outbox event in the same database transaction, then a relay publishes the event, avoiding lost or phantom messages." },
            { type: "text", title: "Security, observability and running in production", content: "Security essentials:\n- Authentication with OAuth 2.0 and OpenID Connect; short-lived access tokens and refresh token rotation.\n- Authorisation checks on every request, ideally centralised in policy code.\n- Secrets in a manager such as AWS Secrets Manager or HashiCorp Vault, rotated regularly.\n- Rate limiting and input validation on all public endpoints.\n- Data minimisation, encryption in transit and at rest, and access logging for personal data, in line with NDPA 2023.\n\nObservability answers why something is broken:\n- Structured logs (JSON) with request ids; never log passwords, tokens or full card numbers.\n- Metrics: request rate, error rate and latency (the RED method) per endpoint.\n- Distributed tracing with OpenTelemetry to follow a request across services.\n\nDefine SLOs, for example 99.9% of payment requests succeed within 800ms over 30 days, and alert on burn rate rather than on every spike.\n\nDeployment: containerise with Docker, deploy through CI/CD with automated tests, use health checks and roll out gradually with the ability to roll back quickly." },
            { type: "assignment", title: "Make a payment service reliable", maxScore: 100, content: "You are given a simple payment service that calls a mock payment provider. It double-charges on retries, loses webhooks and has no monitoring.\n\nDeliverables: (1) a pull request that adds idempotency keys, timeouts and retries with backoff, verified webhook handling and a reconciliation job; (2) tests that simulate timeouts, duplicate webhooks and out-of-order events; (3) structured logging and basic metrics; (4) a one-page write-up explaining each failure mode and your fix.\n\nGrading: correctness under failure (35), test coverage of failure scenarios (25), observability (15), code quality (15), write-up clarity (10)." },
            { type: "quiz", title: "Professional Backend Quiz", questions: [
              { q: "A client retries a POST /payments request after a timeout. What prevents a double charge?", options: ["Using HTTPS", "Returning 500 on the second request", "Increasing the timeout", "An idempotency key stored with the original result"], answer: 3 },
              { q: "Most message queues provide at-least-once delivery. What does this require from consumers?", options: ["Consumers must be idempotent", "Consumers must run on one server only", "Consumers must ignore errors", "Consumers must use GraphQL"], answer: 0 },
              { q: "Which change to a public API is usually safe without a new version?", options: ["Renaming a field", "Removing an endpoint", "Adding a new optional response field", "Changing a field from string to number"], answer: 2 },
              { q: "What problem does the outbox pattern solve?", options: ["Slow SQL queries", "Keeping a database change and its published event consistent", "Password hashing", "Front-end caching"], answer: 1 },
              { q: "Two requests concurrently withdraw from the same wallet. Which approach prevents a negative balance?", options: ["A conditional atomic UPDATE or a row lock", "Adding a cache in front of the database", "Logging both requests", "Retrying both requests"], answer: 0 },
              { q: "Which is the best practice for logging in a payment service?", options: ["Log full card numbers to help debugging", "Disable logs in production", "Log only to the console without structure", "Use structured logs with request ids and redact sensitive data"], answer: 3 }
            ] },
            { type: "assignment", title: "Capstone: Production backend service", maxScore: 100, content: "Shared brief: build the backend for a fictional mobile-money wallet used by small traders in Nigeria. It must support sign-up, wallet top-up through a mocked payment provider, peer-to-peer transfers and transaction history, and stay correct when networks fail and requests are retried.\nJunior: build the REST API with Node.js or Python and PostgreSQL, secure authentication, access control, validated inputs, transactional transfers and integration tests.\nMid: add everything in Junior plus idempotent payment endpoints, verified webhooks, a background job queue for notifications, Redis caching where justified, structured logs and metrics, and a Dockerised deployment through CI.\nSenior: add everything in Mid plus a double-entry ledger, the outbox pattern, defined SLOs with dashboards, a threat model, an NDPA 2023 data-handling note and an architecture decision record explaining how the design would scale to multiple countries.\nDeliverables: GitHub repository, OpenAPI spec, README with setup and design decisions, test reports and a 5-minute recorded walkthrough.\nGrading: correctness and data integrity (30), security (20), reliability and observability (20), code quality and tests (15), documentation and communication (15), assessed against the chosen level." }
          ]
        }
      }
    },
    {
      id: "fullstack",
      title: "Full-Stack Developer",
      summary: "Builds complete product features across the user interface, API and database, and often handles deployment as well. Common in startups and small product teams where one engineer carries a feature from idea to production.",
      competencies: [
        { name: "Frontend implementation", weight: 20, description: "Builds responsive, accessible UIs in a modern framework and connects them cleanly to APIs." },
        { name: "Backend and API development", weight: 25, description: "Builds secure, well-structured APIs and business logic with proper validation and error handling." },
        { name: "Data modelling and persistence", weight: 20, description: "Designs schemas, writes efficient queries and manages migrations safely." },
        { name: "Deployment and DevOps basics", weight: 15, description: "Ships code through CI/CD to cloud platforms with environment configuration, monitoring and rollback." },
        { name: "End-to-end quality and security", weight: 20, description: "Tests across layers and secures the whole flow from browser to database, including authentication and data protection." }
      ],
      levels: {
        junior: {
          minYears: 0,
          focus: "Delivers small features that touch both UI and API within an existing codebase, with guidance.",
          responsibilities: [
            "Build simple screens and the matching API endpoints for well-defined features",
            "Write database queries and migrations for small schema changes under review",
            "Fix bugs that span frontend and backend and explain the root cause",
            "Write unit and integration tests for new code",
            "Deploy changes to staging through the team’s CI/CD pipeline and verify them"
          ],
          skills: [
            "React fundamentals",
            "Node.js and Express",
            "SQL basics",
            "REST API consumption",
            "Form handling and validation",
            "Git collaboration",
            "Basic deployment"
          ],
          tools: ["VS Code", "React", "Node.js", "PostgreSQL", "Git and GitHub", "Vercel"],
          certifications: ["Meta Front-End Developer Professional Certificate", "AWS Certified Cloud Practitioner"],
          aiTopics: [
            "How a request flows from a browser form through the API to the database and back",
            "React state and data fetching basics",
            "REST endpoints, status codes and validation on both client and server",
            "SQL joins and basic schema design",
            "Environment variables, secrets and deploying a simple app"
          ],
          aiScenarios: [
            "A user submits a registration form and sees “Something went wrong”. Walk me through how you would find whether the problem is in the frontend, the API or the database.",
            "You need to add a “notes” field to customer profiles that users can edit. Walk me through every change from database to UI.",
            "Your app works locally but the deployed version cannot reach the database. How would you troubleshoot?"
          ],
          aiExpectations: "A ready junior can trace a feature through every layer and explain what each one is responsible for, with at least one deployed project to show. Red flags are validating only on the client, committing secrets to Git, or being unable to debug across the stack.",
          proQuestions: [
            { q: "Walk me through a full-stack project you built and deployed. How did the pieces connect?", lookFor: "Clear explanation of UI, API, database and hosting, with real decisions and problems solved rather than tutorial repetition." },
            { q: "Why must you validate input on the server even when the frontend already validates it?", lookFor: "Understands that clients can be bypassed or modified and that server-side validation protects data and security." },
            { q: "Tell me about a bug that crossed frontend and backend. How did you find it?", lookFor: "Uses network tab, server logs and database checks to isolate the layer methodically." },
            { q: "How do you keep API keys and database passwords safe in your projects?", lookFor: "Environment variables, .gitignore, platform secret settings and awareness of what to do if a secret leaks." },
            { q: "Describe how you organise your time when a feature needs both UI and API work.", lookFor: "Agrees the API contract first, builds in small vertical slices and tests as they go." }
          ]
        },
        mid: {
          minYears: 2,
          focus: "Owns product features across the stack from design to production and supports them in live operation.",
          responsibilities: [
            "Design and deliver complete features including schema, API, UI, tests and release",
            "Integrate third-party services such as payments, email, SMS and authentication providers",
            "Set up and maintain CI/CD pipelines, preview environments and monitoring for the product",
            "Investigate production issues across layers and implement lasting fixes",
            "Review code and collaborate with designers and product managers on scope and trade-offs"
          ],
          skills: [
            "TypeScript across the stack",
            "Next.js full-stack development",
            "ORM and schema migrations",
            "Authentication and session management",
            "Payment and webhook integration",
            "CI/CD pipelines",
            "Production debugging"
          ],
          tools: ["Next.js", "TypeScript", "Prisma", "PostgreSQL", "Docker", "GitHub Actions"],
          certifications: ["AWS Certified Developer – Associate", "Microsoft Certified: Azure Developer Associate"],
          aiTopics: [
            "Choosing rendering and data-fetching approaches in a full-stack framework",
            "Authentication flows, sessions versus tokens and secure cookie settings",
            "Schema design and safe migrations for evolving features",
            "Third-party integrations with retries, webhooks and idempotency",
            "CI/CD, environments and monitoring for a small product"
          ],
          aiScenarios: [
            "You are building a subscription feature with card and bank-transfer payments through a local payment gateway. Walk me through the data model, API, UI and failure handling.",
            "After a release, the dashboard is slow for users with many records. Walk me through how you would find whether the bottleneck is the query, the API or the UI rendering.",
            "Your startup needs to add role-based access so staff can see some customer data but not all. How would you design and roll it out?"
          ],
          aiExpectations: "A ready mid-level developer makes balanced decisions across layers, designs for failure in integrations and owns features in production. Red flags are deep knowledge of only one layer with guesswork elsewhere, no testing strategy, or never having supported a live system.",
          proQuestions: [
            { q: "Describe a feature you owned across the full stack. What trade-offs did you make between layers?", lookFor: "Thoughtful placement of logic (client, server, database), clear API contract and a real rollout story." },
            { q: "Tell me about a third-party integration that caused problems in production.", lookFor: "Diagnoses the failure, adds retries, idempotency or reconciliation, and improves monitoring." },
            { q: "How do you approach authentication and authorisation in a full-stack app?", lookFor: "Uses proven libraries or providers, secure cookies or tokens, server-side checks on every request and least privilege." },
            { q: "Walk me through the CI/CD setup on a project you worked on.", lookFor: "Automated tests, linting, preview or staging environments, safe migrations and the ability to roll back." },
            { q: "Tell me about a time you had to cut scope to meet a deadline.", lookFor: "Works with product to protect core value, communicates trade-offs and records follow-up work." }
          ]
        },
        senior: {
          minYears: 5,
          focus: "Shapes the technical direction of a product end to end, leads delivery and grows a small team of engineers.",
          responsibilities: [
            "Define the product’s architecture across frontend, backend, data and infrastructure",
            "Lead technical planning, estimation and delivery for major product initiatives",
            "Own security, privacy and reliability practices, including NDPA 2023 obligations for user data",
            "Mentor engineers across the stack and run design and code review practices",
            "Make build-versus-buy decisions and manage cloud cost and technical debt with leadership"
          ],
          skills: [
            "End-to-end system architecture",
            "Technical roadmap planning",
            "Cloud cost optimisation",
            "Security and privacy by design",
            "Scalability planning",
            "Engineering mentorship",
            "Stakeholder communication"
          ],
          tools: ["AWS", "Terraform", "Kubernetes", "Sentry", "Datadog", "Turborepo"],
          certifications: ["AWS Certified Solutions Architect – Associate", "Google Cloud Professional Cloud Architect", "Microsoft Certified: Azure Solutions Architect Expert"],
          aiTopics: [
            "Architecture evolution from MVP to scale: monolith, modular monolith and services",
            "Build versus buy for authentication, payments, search and messaging",
            "Security and privacy by design across the stack",
            "Cloud cost management and reliability trade-offs for a growing product",
            "Leading delivery, estimation and team practices"
          ],
          aiScenarios: [
            "You join a startup with a fast-built MVP that keeps breaking as users grow. Walk me through your first 90 days.",
            "The business wants to launch an offline-tolerant agent app for field sales staff in areas with unreliable connectivity. How would you design the system across client, API and data?",
            "Cloud costs have doubled in six months without matching user growth. How would you investigate and reduce them without hurting reliability?"
          ],
          aiExpectations: "A ready senior connects technical choices to business outcomes, can design and evolve a whole system pragmatically and has led and grown engineers. Red flags are rewriting everything as a first instinct, ignoring cost or security, or no evidence of leadership beyond their own code.",
          proQuestions: [
            { q: "Describe how you evolved a product’s architecture as it grew. What did you change and why?", lookFor: "Incremental, evidence-driven changes with clear triggers, avoiding premature complexity, and reflection on results." },
            { q: "Tell me about a build-versus-buy decision you led.", lookFor: "Considers cost, time to market, lock-in, compliance and team capacity, and revisits the decision when circumstances change." },
            { q: "How have you embedded security and privacy into a team’s development process?", lookFor: "Threat modelling, secure defaults, dependency scanning, access reviews and data-protection practices that teams actually follow." },
            { q: "Tell me about a project that went off track that you were leading. What did you do?", lookFor: "Early detection, transparent communication, re-planning with stakeholders and lessons applied afterwards." },
            { q: "How do you help an engineer who is strong in one layer become effective across the stack?", lookFor: "Structured pairing, stretch tasks with support, feedback loops and visible progress." }
          ]
        }
      },
      hrScenarios: [
        { q: "In a small team you are often pulled between building new features and fixing urgent issues. Tell me about a time this happened and how you handled it.", lookFor: "Prioritises transparently with the team or manager, communicates impact and avoids silently dropping commitments." },
        { q: "Tell me about a time you had to explain a technical trade-off to a non-technical founder or manager.", lookFor: "Uses plain language and business impact, offers options and helps them make an informed decision." },
        { q: "Describe a time you made a mistake that reached production. What did you do?", lookFor: "Owns it quickly, fixes and communicates, then puts a safeguard in place without blaming others." }
      ],
      curriculum: {
        foundational: {
          title: "Full-Stack Development Foundations",
          summary: "A beginner-friendly path to building and deploying a complete web application with React, Node.js and PostgreSQL.",
          duration: "5 weeks",
          modules: [
            { type: "text", title: "Anatomy of a full-stack application", content: "A full-stack web application has three main layers:\n1. Client: the browser UI built with HTML, CSS and JavaScript, often using React.\n2. Server: an API, for example Node.js with Express, that applies business rules and security.\n3. Database: persistent storage such as PostgreSQL.\n\nFollow one request: a user submits a “Book appointment” form. The React component validates fields and sends POST /appointments with JSON. The server checks the user is signed in, validates the data again, checks the slot is free and inserts a row inside a transaction. It returns 201 with the booking, and the UI shows a confirmation.\n\nWhy validate twice? Client validation gives quick feedback; server validation is the real protection because anyone can send requests directly to your API.\n\nWhere should logic live? Display logic on the client; business rules and permissions on the server; data integrity rules (unique, not null, foreign keys) in the database.\n\nWhen debugging, find the layer first: check the browser network tab, then server logs, then the database." },
            { type: "text", title: "Frontend essentials with React", content: "React builds UIs from components that receive props and manage state.\n\nKey skills for full-stack work:\n- Forms: controlled inputs with useState, client-side validation and disabling the submit button while a request is in progress to prevent double submissions.\n- Data fetching: load data in an effect or with a library such as TanStack Query, and always handle three states: loading, error and success.\n- Routing: frameworks such as Next.js map files to routes and can render pages on the server.\n\nWorked example: an appointments list.\nconst [items, setItems] = useState([]);\nconst [status, setStatus] = useState('loading');\nOn mount, fetch /api/appointments; on success store items and set status to 'success'; on failure set 'error' and show a retry button.\n\nUsability matters: mobile-first layout, labelled inputs, clear error messages and keyboard support. Many users will be on phones with intermittent data, so show progress, avoid giant bundles and let users retry failed actions." },
            { type: "text", title: "Backend essentials: APIs and databases", content: "An Express API exposes routes such as GET /appointments and POST /appointments. Organise code into routes, services (business rules) and a data layer.\n\nDatabase design for a booking app:\n- users (id, name, email UNIQUE, password_hash)\n- appointments (id, user_id REFERENCES users, starts_at, status)\nAdd a unique constraint on the slot so two users cannot book the same time even if requests arrive simultaneously.\n\nUse an ORM or query builder such as Prisma to write queries safely and manage migrations. Parameterised queries prevent SQL injection.\n\nAuthentication basics: hash passwords with bcrypt; after login issue a session cookie (HttpOnly, Secure, SameSite) or a short-lived token. On every request, check both who the user is and whether they are allowed to access the specific record.\n\nReturn clear status codes: 201 for created, 400 for invalid input, 401 when not signed in, 403 when not allowed, 404 when not found and 409 when a slot is already taken." },
            { type: "text", title: "Shipping it: Git, environments and deployment", content: "Professional teams ship small changes often and safely.\n\nGit workflow: create a branch per feature, commit small logical changes with clear messages, open a pull request and merge after review and passing checks.\n\nEnvironments: local (your machine), staging (a production-like test environment) and production. Each has its own configuration supplied through environment variables, for example DATABASE_URL and PAYMENT_SECRET_KEY. Never commit secrets; add .env to .gitignore. If a secret is ever committed, rotate it immediately because Git history keeps it.\n\nDeployment options for beginners: Vercel or Netlify for frontends and Next.js apps; Render, Railway or a cloud provider for APIs; managed PostgreSQL such as Neon, Supabase or Amazon RDS.\n\nCI/CD: a GitHub Actions workflow runs install, lint, tests and build on every pull request, and deploys main automatically.\n\nAfter deploying, verify: open the live site, test the main flow, check logs for errors and confirm database migrations ran." },
            { type: "quiz", title: "Full-Stack Foundations Quiz", questions: [
              { q: "Why must the server validate input even if the React form already validates it?", options: ["Server validation is faster than client validation", "Anyone can bypass the client and send requests directly to the API", "React validation only works on desktop browsers", "Databases reject all unvalidated input automatically"], answer: 1 },
              { q: "Two users try to book the same slot at the same moment. What most reliably prevents a double booking?", options: ["Disabling the button after one click", "Checking availability in the frontend", "A unique constraint on the slot in the database", "Showing a warning message"], answer: 2 },
              { q: "Which cookie settings help protect a session cookie?", options: ["HttpOnly, Secure and SameSite", "Public and Expires=never", "Domain=* and Path=/", "No settings; cookies are secure by default"], answer: 0 },
              { q: "You accidentally pushed a database password to a public GitHub repository and then deleted the file. What should you do?", options: ["Nothing, because the file is deleted", "Make the repository private", "Rename the variable", "Rotate the password immediately because it remains in Git history"], answer: 3 },
              { q: "A deployed form shows a generic error. Where is the best first place to look?", options: ["The CSS file", "The browser network tab to see the request and response", "The README", "The package.json version number"], answer: 1 },
              { q: "Which status code fits a request to book a slot that is already taken?", options: ["409 Conflict", "200 OK", "301 Moved Permanently", "401 Unauthorized"], answer: 0 }
            ] },
            { type: "assignment", title: "Build and deploy a booking app", maxScore: 100, content: "Build a simple appointment-booking web app for a fictional clinic in Abuja. Patients sign up, log in, view available slots, book and cancel appointments; staff can see all bookings for the day.\n\nUse React (or Next.js), a Node.js API and PostgreSQL. Deploy the app to a free hosting platform.\n\nDeliverables: GitHub repository, live URL, README with setup steps and an architecture diagram, and tests for at least the booking endpoint.\n\nGrading: working end-to-end features (35), data integrity and access control (20), UI usability on mobile (15), tests (15), deployment and documentation (15)." }
          ]
        },
        intensive: {
          title: "Professional Full-Stack Engineering",
          summary: "Job-ready depth in TypeScript full-stack development, authentication, integrations, testing and cloud delivery for real products.",
          duration: "9 weeks",
          modules: [
            { type: "text", title: "Type-safe full-stack architecture", content: "Using TypeScript on both client and server lets you share types and catch contract mismatches early.\n\nA practical structure for a product:\n- A Next.js app (App Router) for UI and server-rendered pages.\n- API route handlers or server actions for mutations, or a separate API service when mobile apps or partners also consume it.\n- A data layer with Prisma or Drizzle and PostgreSQL.\n- Shared validation schemas with Zod, used to validate forms on the client and requests on the server.\n\nStart with a modular monolith: one deployable app with clear modules (billing, users, bookings), each owning its data and exposing functions to others. This keeps speed high while preventing tangled code. Split into services only when a module needs independent scaling or a separate team.\n\nWorked example: a create-invoice flow. One Zod schema defines the invoice; the form uses it for client errors; the server action parses the same schema; the service writes inside a transaction; the page revalidates its data so the list updates without a manual refresh." },
            { type: "text", title: "Authentication, authorisation and data protection", content: "Do not invent your own cryptography or session handling. Use proven libraries (Auth.js, Lucia-style session patterns) or managed providers (Auth0, Clerk, Amazon Cognito, Firebase Authentication).\n\nSessions versus tokens: server-side sessions with HttpOnly cookies are simple and secure for web apps. Short-lived access tokens plus refresh tokens suit APIs consumed by mobile apps.\n\nAuthorisation models:\n- Role-based (RBAC): admin, staff, customer.\n- Attribute or ownership-based: a user can edit an invoice only if invoice.org_id matches their organisation.\nEnforce checks on the server for every request; hiding a button in the UI is not security.\n\nMulti-tenant apps must scope every query by tenant. A missing WHERE org_id = ... is one of the most common and damaging bugs.\n\nData protection: collect only what you need, encrypt in transit, restrict access to personal data, log access to sensitive records and document retention rules. Nigerian products must align with the NDPA 2023, including lawful basis, security safeguards and responding to data subject requests." },
            { type: "text", title: "Integrations, background work and real-world reliability", content: "Products depend on external services: payment gateways, email, SMS, identity verification and maps. Each can be slow or fail.\n\nPatterns:\n- Set timeouts on every outbound call.\n- Use idempotency keys for payment initiation so retries never double-charge.\n- Treat webhooks as the source of truth for payment status: verify signatures, store events, handle duplicates and process asynchronously.\n- Move slow work (emails, PDF receipts, report generation) to background jobs using a queue such as BullMQ with Redis or a managed service.\n- Reconcile daily: compare your records to the provider’s settlement report.\n\nDesign the UI for uncertainty: a payment can be pending. Show a clear pending state, poll or subscribe for updates and never ask users to pay again until the status is confirmed failed.\n\nFor low-connectivity users, make actions retry-safe, cache read data, and consider queuing writes on the client with clear sync status when offline support is required." },
            { type: "text", title: "Testing, CI/CD and operating the product", content: "Test pyramid for full-stack products:\n- Unit tests for business rules such as pricing or permissions.\n- Integration tests for API routes against a real test database (use Docker or Testcontainers).\n- A few Playwright end-to-end tests for critical journeys: sign-up, payment, core workflow.\n\nCI/CD pipeline:\n1. Lint, type-check and unit test on every push.\n2. Spin up a preview environment for each pull request.\n3. Run migrations safely: backward-compatible changes first, so old and new code can run together during deploys.\n4. Deploy main to production with health checks; use feature flags to release gradually.\n5. Roll back quickly if error rates rise.\n\nOperating the product:\n- Error tracking (Sentry) for frontend and backend.\n- Logs and metrics with dashboards for request rate, error rate and latency.\n- Uptime checks and alerts routed to the person on call.\n- Backups tested by actually restoring them.\n\nWatch cloud costs from day one: right-size databases, set budgets and alerts, and delete unused resources." },
            { type: "assignment", title: "Secure a multi-tenant feature", maxScore: 100, content: "You are given a multi-tenant invoicing app where businesses manage their own customers and invoices. Several endpoints leak data between businesses and there are no tests for authorisation.\n\nDeliverables: (1) a report listing each access-control flaw found and how it could be exploited; (2) a pull request fixing the flaws with centralised authorisation checks; (3) automated tests proving one tenant cannot read or modify another tenant’s data; (4) a short note on NDPA 2023 considerations for the customer data stored.\n\nGrading: completeness of findings (30), correctness of fixes (30), quality of tests (25), clarity of report and data-protection note (15)." },
            { type: "quiz", title: "Professional Full-Stack Quiz", questions: [
              { q: "What is the main benefit of sharing a Zod schema between client and server?", options: ["It removes the need for a database", "The same validation rules and types are used on both sides, preventing contract drift", "It makes the bundle smaller", "It encrypts form data"], answer: 1 },
              { q: "In a multi-tenant app, what is the most important rule for every data query?", options: ["Always sort by created date", "Use only GET requests", "Scope the query to the current user’s tenant on the server", "Cache all results for one hour"], answer: 2 },
              { q: "A payment shows as pending after the user returns from the gateway. What should the UI do?", options: ["Ask the user to pay again immediately", "Mark it as failed", "Show a clear pending state and wait for webhook or status confirmation", "Mark it as successful to reduce support calls"], answer: 2 },
              { q: "Why should database migrations be backward compatible during deploys?", options: ["Old and new versions of the code may run at the same time during rollout", "Databases cannot store new columns", "It makes queries faster", "It is required by Git"], answer: 0 },
              { q: "Which is a sound reason to split a module out of a modular monolith into its own service?", options: ["Microservices are always more modern", "To use a different programming language for fun", "To reduce the number of tests", "It needs independent scaling or is owned by a separate team"], answer: 3 },
              { q: "Hiding a “Delete invoice” button for non-admins in the UI is…", options: ["Sufficient security on its own", "Not security; the server must also enforce the permission", "Only needed on mobile", "A replacement for authentication"], answer: 1 }
            ] },
            { type: "assignment", title: "Capstone: Ship a full-stack SaaS product", maxScore: 100, content: "Shared brief: build a simple invoicing and payment-collection SaaS for Nigerian small businesses. Businesses register, add customers, create invoices and share a payment link; customers pay through a mocked payment gateway, and the business sees invoice status update automatically.\nJunior: build the core flows with Next.js or React plus Node.js and PostgreSQL, secure authentication, ownership checks, a responsive UI and tests for invoice creation; deploy to a hosting platform.\nMid: add everything in Junior plus multi-tenant organisations with roles, webhook-driven payment status with idempotency, email receipts as background jobs, a CI/CD pipeline with preview environments and Playwright tests for the payment journey.\nSenior: add everything in Mid plus an architecture decision record, infrastructure as code, monitoring dashboards and alerts, a threat model, an NDPA 2023 data-protection note, a cost estimate and a 6-month technical roadmap for scaling to 10 times the users.\nDeliverables: GitHub repository, live URL, README with architecture and decisions, test reports and a 5–7 minute recorded demo.\nGrading: end-to-end functionality (25), security and data integrity (20), code quality and architecture (20), testing and delivery pipeline (20), documentation and communication (15), assessed against the chosen level." }
          ]
        }
      }
    },
    {
      id: "mobile",
      title: "Mobile Developer",
      summary: "Builds native or cross-platform apps for Android and iOS that are fast, reliable and usable on a wide range of devices and network conditions. Works with designers, backend engineers and QA, and owns releases through the Google Play and App Store pipelines.",
      competencies: [
        { name: "Mobile UI and platform conventions", weight: 20, description: "Builds responsive, accessible screens that follow Android and iOS design guidelines and handle many screen sizes." },
        { name: "Language and framework proficiency", weight: 25, description: "Writes idiomatic Kotlin, Swift, Dart or TypeScript in Jetpack Compose, SwiftUI, Flutter or React Native." },
        { name: "Networking, data and offline support", weight: 20, description: "Integrates APIs, caches and persists data locally and keeps the app usable on slow or intermittent connections." },
        { name: "Performance and device constraints", weight: 15, description: "Optimises startup, memory, battery and app size for low- and mid-range devices." },
        { name: "Testing, security and release", weight: 20, description: "Tests apps, protects stored data and tokens, and manages builds, signing and store releases." }
      ],
      levels: {
        junior: {
          minYears: 0,
          focus: "Builds screens and small features in an existing app and fixes bugs under guidance.",
          responsibilities: [
            "Implement screens from designs using the team’s chosen framework and component patterns",
            "Connect screens to existing APIs and handle loading, empty and error states",
            "Fix crashes and UI bugs reported by QA or crash reporting tools",
            "Write unit tests for view models or business logic they change",
            "Test their work on physical Android and iOS devices, including low-end ones"
          ],
          skills: [
            "Kotlin or Dart basics",
            "Declarative UI basics",
            "REST API integration",
            "Local data storage",
            "Mobile app lifecycle",
            "Debugging on devices",
            "Git workflow"
          ],
          tools: ["Android Studio", "Xcode", "Flutter", "Firebase Crashlytics", "Postman", "Git and GitHub"],
          certifications: ["Associate Android Developer (Google)", "Meta React Native Specialization"],
          aiTopics: [
            "App and screen lifecycle and how it affects state",
            "Building lists and forms with a declarative UI framework",
            "Calling APIs, parsing JSON and handling errors and timeouts",
            "Storing simple data locally and keeping tokens out of plain storage",
            "Reading crash reports and debugging on a real device"
          ],
          aiScenarios: [
            "Users report the app loses everything they typed in a form when they rotate the phone or switch apps. Walk me through why this happens and how you would fix it.",
            "A list screen works on Wi-Fi but shows a blank page on slow mobile data. How would you investigate and improve it?",
            "Crashlytics shows a crash on app start affecting a few older Android devices. Walk me through your first steps."
          ],
          aiExpectations: "A ready junior has built and run at least one app on real devices, understands lifecycle and state basics and handles network errors. Red flags are only ever testing on an emulator with fast Wi-Fi, storing passwords or tokens in plain text, or no understanding of why the UI re-renders.",
          proQuestions: [
            { q: "Walk me through a mobile app you built. Which framework did you choose and why?", lookFor: "Clear reasoning, explanation of app structure and screens, and evidence they ran it on real devices." },
            { q: "How do you handle a network request failing in your app?", lookFor: "Timeouts, user-friendly error states, retry options and not crashing or freezing the UI." },
            { q: "Tell me about a crash you fixed. How did you find the cause?", lookFor: "Uses stack traces, logs or crash reporting, reproduces the issue and adds a guard or test." },
            { q: "Where would you store a user’s login token on the device and why?", lookFor: "Secure storage such as Android Keystore-backed storage or iOS Keychain, not plain shared preferences or files." },
            { q: "Describe how you test a new screen before handing it over for review.", lookFor: "Tests on multiple screen sizes, both platforms where relevant, slow network, dark mode and accessibility settings like large text." }
          ]
        },
        mid: {
          minYears: 2,
          focus: "Owns features and app modules end to end, including architecture within the module, offline behaviour, testing and releases.",
          responsibilities: [
            "Deliver complete features from design through API integration, offline handling and release",
            "Implement local persistence and synchronisation so key flows work on poor connections",
            "Integrate platform services such as push notifications, deep links, camera and biometrics",
            "Monitor crash-free rate and performance, and fix regressions after releases",
            "Prepare builds, manage staged rollouts on Google Play and App Store Connect, and review peers’ code"
          ],
          skills: [
            "MVVM or clean architecture",
            "Jetpack Compose or SwiftUI",
            "Flutter state management",
            "Offline-first data sync",
            "Push notifications and deep links",
            "Mobile CI/CD",
            "UI and integration testing"
          ],
          tools: ["Jetpack Compose", "SwiftUI", "Flutter", "Firebase", "Fastlane", "Codemagic"],
          certifications: ["Associate Android Developer (Google)", "AWS Certified Developer – Associate"],
          aiTopics: [
            "App architecture: MVVM, unidirectional data flow and dependency injection",
            "Offline-first design: local database, sync queues and conflict handling",
            "Performance: startup time, list rendering, memory leaks and app size",
            "Secure storage, certificate handling and safe authentication flows",
            "Release management: signing, staged rollouts, crash monitoring and forced updates"
          ],
          aiScenarios: [
            "A field agent app must let staff register customers in areas with no signal and upload later. Walk me through how you would design data storage and sync.",
            "After a release the crash-free user rate dropped from 99.6% to 97% on Android. Walk me through how you would respond.",
            "The app takes 6 seconds to start on a budget Android phone. How would you measure and reduce startup time?"
          ],
          aiExpectations: "A ready mid-level developer structures features so they are testable, designs for poor connectivity and owns releases and their aftermath. Red flags are business logic inside UI code, no awareness of app size or startup cost, or never having managed a production release.",
          proQuestions: [
            { q: "Describe a feature you owned that needed to work offline or on poor networks.", lookFor: "Local persistence, a sync strategy, conflict handling and clear sync status in the UI, with real trade-offs." },
            { q: "Tell me about a release that went wrong. What did you do?", lookFor: "Uses staged rollout to limit impact, halts or hotfixes quickly, communicates and improves the release process." },
            { q: "How do you structure a feature module so it is testable?", lookFor: "Separates UI, state and data layers, uses dependency injection and tests view models and repositories." },
            { q: "Walk me through how you implemented push notifications or deep links.", lookFor: "Platform setup, permission handling, routing to the right screen and handling app states (killed, background, foreground)." },
            { q: "How have you improved an app’s performance? How did you measure it?", lookFor: "Uses profilers such as Android Studio Profiler or Instruments, identifies a bottleneck and quantifies improvement." }
          ]
        },
        senior: {
          minYears: 5,
          focus: "Sets mobile architecture and technology direction, leads delivery across platforms and mentors the mobile team.",
          responsibilities: [
            "Define the mobile architecture, modularisation and technology choices, including native versus cross-platform",
            "Own app quality targets such as crash-free rate, startup time and app size, and the processes that protect them",
            "Lead mobile security practices including secure storage, certificate pinning decisions and data-protection compliance",
            "Mentor mobile engineers and lead design and code reviews",
            "Collaborate with backend and product leads on API design, feature flags and release strategy"
          ],
          skills: [
            "Mobile architecture at scale",
            "Native versus cross-platform strategy",
            "App modularisation",
            "Mobile security hardening",
            "Release and experimentation strategy",
            "Performance governance",
            "Team mentoring"
          ],
          tools: ["Android Studio", "Xcode", "Firebase Remote Config", "Fastlane", "Bitrise", "Sentry"],
          certifications: ["Associate Android Developer (Google)", "AWS Certified Solutions Architect – Associate"],
          aiTopics: [
            "Choosing between native and cross-platform for a product and team",
            "Modular architecture for large apps and multiple teams",
            "Mobile security: OWASP MASVS, secure storage, tamper resistance and protecting financial flows",
            "Designing APIs and sync protocols that suit mobile clients on unreliable networks",
            "Release strategy: feature flags, staged rollouts, minimum supported versions and experimentation"
          ],
          aiScenarios: [
            "Leadership wants to rebuild separate Android and iOS apps in a single cross-platform framework to save cost. Walk me through how you would evaluate and plan this.",
            "Your mobile banking app must pass a security assessment against OWASP MASVS before launch. Walk me through how you would prepare.",
            "Many users run Android versions several years old on low-storage phones. How would you set minimum versions, app size targets and a support policy?"
          ],
          aiExpectations: "A ready senior makes platform and architecture decisions grounded in users, team skills and long-term cost, and has led apps through scale and security scrutiny. Red flags are framework loyalty over evidence, ignoring device and network realities of the user base, or no track record of developing other engineers.",
          proQuestions: [
            { q: "Describe a major architecture or platform decision you made for a mobile app. How did it turn out?", lookFor: "Evaluates options with prototypes or data, considers team and users, plans migration and reflects honestly on results." },
            { q: "How have you set and protected quality targets such as crash-free rate or startup time?", lookFor: "Clear metrics, dashboards, release gates, ownership and examples of acting when targets slipped." },
            { q: "Tell me about securing a mobile app that handles money or sensitive data.", lookFor: "Threat modelling, secure storage, server-side validation, protection of auth flows and testing against a standard such as MASVS." },
            { q: "How have you worked with backend teams to design APIs that suit mobile clients?", lookFor: "Advocates for payload efficiency, versioning, idempotent writes and backward compatibility for old app versions." },
            { q: "Give an example of how you developed another mobile engineer.", lookFor: "Specific coaching, delegated ownership with support and visible growth in the engineer’s scope." }
          ]
        }
      },
      hrScenarios: [
        { q: "Tell me about a time an app release had to be delayed or rolled back. How did you communicate it?", lookFor: "Communicates early and honestly with stakeholders, explains impact and next steps, and takes ownership." },
        { q: "Describe a time you received negative app store reviews or user complaints about something you built.", lookFor: "Responds constructively, investigates the real issue, prioritises a fix and closes the loop with users or support." },
        { q: "Tell me about working with a designer whose design was hard to implement well on mobile.", lookFor: "Collaborates early, explains constraints, proposes alternatives and reaches a solution that serves users." }
      ],
      curriculum: {
        foundational: {
          title: "Mobile Development Foundations",
          summary: "A beginner-friendly introduction to building cross-platform mobile apps with Flutter, covering UI, state, APIs and local data.",
          duration: "5 weeks",
          modules: [
            { type: "text", title: "The mobile landscape and app fundamentals", content: "Mobile apps run on Android and iOS. In Nigeria and much of Africa, Android dominates and many users have budget devices with limited storage, older OS versions and variable mobile data. Design for these realities from the start.\n\nApproaches:\n- Native: Kotlin with Jetpack Compose for Android; Swift with SwiftUI for iOS. Best platform integration and performance.\n- Cross-platform: Flutter (Dart) or React Native (JavaScript or TypeScript). One codebase for both platforms, faster delivery for many products.\n\nThe app lifecycle: the operating system can pause, stop or kill your app at any time to save memory, for example when a user switches to answer a call. Your app must save important state and restore it gracefully.\n\nChecklist for a new app screen:\n- Works on small and large screens and in both orientations if supported.\n- Shows loading, empty, error and success states.\n- Survives being backgrounded and restored.\n- Readable with large system font sizes.\n- Tested on a real low-end Android phone, not only an emulator." },
            { type: "text", title: "Building UIs with Flutter widgets", content: "Flutter builds UIs from widgets. Everything on screen, from text to padding to whole pages, is a widget, and widgets are composed into trees.\n\n- StatelessWidget: displays data that does not change inside the widget.\n- StatefulWidget: holds state that changes, calling setState to rebuild.\n\nLayout widgets: Column and Row arrange children vertically and horizontally; Expanded shares space; Padding and SizedBox control spacing; ListView.builder efficiently renders long lists by building only visible items.\n\nWorked example: a transactions list.\nListView.builder(\n  itemCount: txns.length,\n  itemBuilder: (context, i) => ListTile(\n    title: Text(txns[i].description),\n    trailing: Text(formatNaira(txns[i].amountKobo)),\n  ),\n)\n\nFollow platform conventions: Material Design on Android, and respect iOS expectations such as swipe-back navigation. Use the theme for colours and text styles instead of hard-coding them, support dark mode and add semantic labels to icon-only buttons so screen readers can describe them." },
            { type: "text", title: "Networking and state management", content: "Most apps load data from a backend API. In Flutter, use the http or dio package to call endpoints and convert JSON into Dart model classes.\n\nGood networking habits:\n- Set timeouts; mobile networks drop often.\n- Check status codes and handle errors with clear, friendly messages and a retry button.\n- Never block the UI while waiting; show progress indicators.\n- Send the user’s auth token in a header and handle 401 by refreshing or asking the user to sign in again.\n\nState management: as apps grow, passing data through many widgets with setState becomes messy. Separate UI from logic using a state management approach such as Provider, Riverpod or Bloc. A typical structure:\n- A repository calls the API and local storage.\n- A notifier or view model holds screen state (loading, data, error) and exposes actions such as refresh().\n- Widgets listen to state and rebuild when it changes.\n\nThis separation makes logic testable without a device and keeps widgets simple." },
            { type: "text", title: "Local data, security and publishing basics", content: "Store data on the device so the app is fast and still useful without a connection.\n\n- Small preferences (theme, onboarding seen): shared_preferences.\n- Structured data (cached transactions, drafts): a local database such as SQLite via drift or sqflite, or Isar or Hive.\n- Secrets (auth tokens): flutter_secure_storage, which uses the Android Keystore and the iOS Keychain. Never store tokens or passwords in plain preferences or files.\n\nA simple offline pattern: show cached data immediately, fetch fresh data in the background, update the cache and the screen, and display “last updated” time when offline.\n\nPermissions: request camera, location or contacts only when needed, explain why, and handle refusal gracefully.\n\nPublishing basics: Android apps are signed and uploaded to Google Play Console as app bundles; iOS apps are signed with Apple certificates and submitted through App Store Connect for review. Both stores require a privacy policy and accurate data-safety or privacy declarations. Use internal testing tracks or TestFlight before public release." },
            { type: "quiz", title: "Mobile Foundations Quiz", questions: [
              { q: "Why should a mobile app save important state when it goes into the background?", options: ["To reduce the app’s download size", "The operating system may kill the app to free memory", "Background apps cannot access the network at all", "App stores require it for approval"], answer: 1 },
              { q: "Which Flutter widget is most efficient for displaying a long, scrollable list of transactions?", options: ["Column with all items", "Stack", "ListView.builder", "Row inside a SingleChildScrollView"], answer: 2 },
              { q: "Where should an app store a user’s authentication token?", options: ["Secure storage backed by Android Keystore or iOS Keychain", "Shared preferences in plain text", "A text file in the downloads folder", "Hard-coded in the source code"], answer: 0 },
              { q: "An API call hangs on a weak mobile connection. What is the best practice?", options: ["Wait indefinitely so the request eventually succeeds", "Close the app automatically", "Retry endlessly without telling the user", "Set a timeout and show a friendly error with a retry option"], answer: 3 },
              { q: "What is the main benefit of separating UI widgets from a view model or notifier?", options: ["Business logic can be tested without rendering the UI", "The app no longer needs an API", "It removes the need for state", "It makes the app icon load faster"], answer: 0 },
              { q: "Before releasing an iOS app publicly, which service is commonly used for beta testing?", options: ["Google Play Console internal track", "Firebase Hosting", "TestFlight", "Xcode Playgrounds"], answer: 2 }
            ] },
            { type: "assignment", title: "Build an expense tracker app", maxScore: 100, content: "Build a cross-platform expense tracker in Flutter for small traders. Users can add, edit and delete expenses with amount in naira, category and date, view a list and a monthly total, and the app must work fully offline using a local database. Optionally load currency or category data from a public API with proper error handling.\n\nDeliverables: GitHub repository, an APK or a screen recording on a real device, a README with setup steps and screenshots, and unit tests for the totals logic.\n\nGrading: working features (35), offline storage and data handling (20), UI quality and accessibility (15), code structure and state management (15), tests and documentation (15)." }
          ]
        },
        intensive: {
          title: "Professional Mobile Engineering",
          summary: "Job-ready depth in mobile architecture, offline-first design, performance, security, testing and store releases for production apps.",
          duration: "8 weeks",
          modules: [
            { type: "text", title: "Mobile app architecture", content: "Production apps need structure so teams can change them safely.\n\nLayered architecture (used in Android’s recommended guidance and common in Flutter and iOS):\n- UI layer: screens or widgets that render state and send user events.\n- State holders: ViewModels, Blocs or notifiers that turn events into new state.\n- Domain layer (optional): use cases for complex business rules.\n- Data layer: repositories that combine remote APIs and local storage behind one interface.\n\nUnidirectional data flow: state flows down to the UI, events flow up. The UI never edits data directly, which makes behaviour predictable and testable.\n\nDependency injection (Hilt on Android, get_it or Riverpod in Flutter) supplies repositories to view models so you can swap in fakes for tests.\n\nModularisation: split large apps into feature modules (onboarding, payments, profile) and core modules (networking, design system). This speeds up builds and lets teams work in parallel.\n\nWorked example: a TransferViewModel exposes a TransferState of Idle, Submitting, Success(receipt) or Error(message). The screen renders each case and never calls the API itself." },
            { type: "text", title: "Offline-first data and synchronisation", content: "Offline-first means the local database is the source of truth for the UI, and the network keeps it in sync. This suits users with patchy connectivity, such as field agents and traders.\n\nReading: the screen observes the local database (Room on Android, Core Data or SwiftData on iOS, drift in Flutter). A sync job fetches updates and writes them locally, and the UI updates automatically.\n\nWriting:\n1. Save the change locally with a status of pending.\n2. Add it to an outbox queue.\n3. A background worker (WorkManager on Android, BGTaskScheduler on iOS) sends queued changes when a connection is available, with backoff.\n4. Each change carries a client-generated id so the server can de-duplicate retries.\n5. Mark items synced, or failed with a reason the user can act on.\n\nConflicts: decide per data type. Options include last-write-wins, server-wins with a user notice, or field-level merging. Financial operations should be confirmed by the server before being shown as final.\n\nAlways show sync status clearly so users trust what they see." },
            { type: "text", title: "Performance on real devices", content: "Many users run budget phones with 2–3GB of RAM, limited storage and older OS versions. Measure on such devices.\n\nKey metrics:\n- Cold start time: aim for under about 2 seconds on target devices.\n- Smooth scrolling: frames rendered within budget (16ms at 60Hz) without jank.\n- Memory: no leaks from retained screens or listeners.\n- App size: smaller downloads mean more installs where data is expensive.\n- Battery and data use: avoid constant polling and oversized images.\n\nTools: Android Studio Profiler and Baseline Profiles, Xcode Instruments, Flutter DevTools, and Firebase Performance Monitoring for field data.\n\nCommon fixes:\n- Defer non-essential initialisation at startup.\n- Use lazy lists and image caching with correctly sized images.\n- Avoid heavy work on the main thread; move parsing and database work to background threads or isolates.\n- Shrink size with R8 and resource shrinking, Android App Bundles and removing unused dependencies.\n- Batch network calls and use pagination." },
            { type: "text", title: "Security, testing and release engineering", content: "Security (guided by OWASP MASVS):\n- Store tokens in Keystore or Keychain-backed storage; never hard-code API secrets in the app because apps can be decompiled.\n- Use HTTPS only; consider certificate pinning for high-risk apps, with a plan for rotating certificates.\n- Protect sensitive screens from screenshots where appropriate and require biometrics or PIN for high-value actions.\n- Validate everything on the server; the client can be tampered with.\n- Collect minimal personal data and declare it accurately in store privacy forms; align with NDPA 2023.\n\nTesting:\n- Unit tests for view models and repositories.\n- UI tests with Compose testing, XCUITest or Flutter integration_test for critical flows.\n- Device coverage using a real-device farm such as Firebase Test Lab.\n\nRelease engineering:\n- Automate builds, signing and uploads with Fastlane, Codemagic or Bitrise.\n- Use staged rollouts and monitor crash-free users before expanding.\n- Use remote config and feature flags to disable broken features without a new release.\n- Support a minimum app version and prompt users to update when old versions must be retired." },
            { type: "assignment", title: "Offline sync for a field-agent app", maxScore: 100, content: "You are given a basic agent app where field staff register new customers. It currently fails whenever there is no network.\n\nDeliverables: (1) a pull request adding a local database, an outbox queue and a background sync worker with retries and client-generated ids; (2) a clear sync-status UI (pending, synced, failed with reason); (3) tests for the repository and sync logic, including duplicate and failed uploads; (4) a short design note explaining your conflict strategy.\n\nGrading: correctness of offline behaviour (35), robustness of sync and retries (25), tests (20), UI clarity (10), design note (10)." },
            { type: "quiz", title: "Professional Mobile Quiz", questions: [
              { q: "In an offline-first app, what should the UI read from?", options: ["The remote API directly on every screen", "The local database, kept in sync with the server", "Shared preferences only", "Push notification payloads"], answer: 1 },
              { q: "Why should each queued offline change include a client-generated id?", options: ["To make the app smaller", "To encrypt the change", "So the server can de-duplicate retried uploads", "To sort the list alphabetically"], answer: 2 },
              { q: "Why should you never hard-code a secret API key inside a mobile app?", options: ["Apps can be decompiled and the key extracted", "It makes the app slower to start", "App stores reject all apps with strings", "Keys expire when the app is installed"], answer: 0 },
              { q: "A new release causes crashes for some users. Which practice limits the damage most?", options: ["Releasing to 100% of users at once", "Disabling crash reporting", "Asking users to reinstall", "Staged rollout with crash monitoring and the ability to halt"], answer: 3 },
              { q: "In unidirectional data flow, how do the UI and state holder interact?", options: ["The UI edits the database directly", "State flows down to the UI and user events flow up to the state holder", "The state holder draws the UI itself", "Both write to a shared global variable"], answer: 1 },
              { q: "Which change most directly reduces cold start time?", options: ["Deferring non-essential initialisation until after the first screen", "Adding more analytics SDKs at launch", "Loading all data synchronously on the main thread", "Increasing image resolution"], answer: 0 }
            ] },
            { type: "assignment", title: "Capstone: Production mobile app", maxScore: 100, content: "Shared brief: build a mobile wallet app for market traders in Nigeria. Users sign in, view balance and transaction history, record cash sales offline, and send money through a mocked payment API that is slow and sometimes fails. It must run well on a budget Android phone and be releasable to a store testing track.\nJunior: build the app in Flutter, Kotlin or Swift with sign-in, secure token storage, transaction list with cached data, an offline sales form saved locally, clear error states and unit tests for core logic.\nMid: add everything in Junior plus layered architecture with dependency injection, an outbox-based sync worker, idempotent payment requests with pending states, push notifications for received payments, UI tests for the send-money flow and an automated build to an internal testing track.\nSenior: add everything in Mid plus a modular project structure, documented performance targets with profiling evidence, a security review against OWASP MASVS, feature flags with remote config, a release and minimum-version policy, and an architecture decision record on native versus cross-platform.\nDeliverables: GitHub repository, installable build or testing-track link, README with architecture and decisions, test reports and a 5-minute recorded demo on a real device.\nGrading: functionality and offline behaviour (25), architecture and code quality (20), security (20), performance and testing (20), documentation and communication (15), assessed against the chosen level." }
          ]
        }
      }
    }
  ]
};

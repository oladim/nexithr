// NexIT-Africa role catalog — Data & Analytics area
export default {
  key: "data",
  title: "Data & Analytics",
  summary: "Roles that turn raw operational data into trusted reporting, pipelines and predictive models. They span analysis and dashboards through data platform engineering and applied machine learning.",
  roles: [
    {
      id: "analyst",
      title: "Data Analyst",
      summary: "Data Analysts clean, explore and interpret business data to answer questions and track performance through reports and dashboards. They sit between business teams and the data platform, translating stakeholder questions into queries, metrics and clear recommendations.",
      competencies: [
        { name: "SQL querying", weight: 25, description: "Writes correct, efficient SQL with joins, aggregations, CTEs and window functions against relational warehouses." },
        { name: "Data cleaning and preparation", weight: 20, description: "Profiles, cleans and reshapes messy data in spreadsheets, SQL or Python while documenting assumptions." },
        { name: "Statistical reasoning", weight: 20, description: "Applies descriptive statistics, sampling, significance and basic experiment analysis without over-claiming." },
        { name: "Visualisation and reporting", weight: 20, description: "Builds clear charts and dashboards that match the question, audience and metric definitions." },
        { name: "Business insight and communication", weight: 15, description: "Frames analysis around decisions and communicates findings, caveats and recommendations to non-technical stakeholders." }
      ],
      levels: {
        junior: {
          minYears: 0,
          focus: "Produces accurate recurring reports and ad-hoc analyses on well-defined questions under review from senior analysts.",
          responsibilities: [
            "Write and maintain SQL queries for recurring weekly and monthly reports",
            "Clean and validate data extracts in Excel or Google Sheets before sharing",
            "Build and update simple dashboards from agreed metric definitions",
            "Investigate data discrepancies and escalate source issues with clear evidence",
            "Document query logic, filters and assumptions for each deliverable"
          ],
          skills: [
            "SQL joins and aggregations",
            "Excel pivot tables",
            "Data cleaning",
            "Descriptive statistics",
            "Basic data visualisation",
            "Power BI reports",
            "Spreadsheet formulas (XLOOKUP)"
          ],
          tools: ["Microsoft Excel", "Google Sheets", "PostgreSQL", "Power BI Desktop", "Looker Studio", "Python (pandas)"],
          certifications: [
            "Google Data Analytics Professional Certificate",
            "Microsoft Certified: Power BI Data Analyst Associate"
          ],
          aiTopics: [
            "SQL joins, GROUP BY and filtering logic",
            "Handling missing, duplicate and inconsistent values",
            "Mean, median, distribution and outliers",
            "Choosing the right chart for a question",
            "Checking and reconciling report numbers"
          ],
          aiScenarios: [
            "A sales manager says this month’s revenue on your report is lower than the finance figure. Walk me through how you would find the difference.",
            "You receive a customer export with duplicate phone numbers and blank states. Walk me through how you would clean it before analysis.",
            "Your manager asks which product category grew fastest last quarter. Talk me through the query and the chart you would produce."
          ],
          aiExpectations: "A ready junior writes correct joins and aggregations, checks totals against a known source and explains cleaning choices plainly. Red flags are silently dropping rows, confusing COUNT with COUNT DISTINCT, or presenting numbers without any sanity check.",
          proQuestions: [
            { q: "Describe a time you found an error in data you were given. How did you spot it and what did you do?", lookFor: "A concrete check (totals, row counts, ranges) that exposed the issue, and that they traced it to the source and communicated it rather than patching quietly." },
            { q: "Walk me through how you would calculate monthly active customers from a transactions table.", lookFor: "COUNT DISTINCT customer per month, a clear definition of 'active', handling of refunds or test accounts, and date truncation." },
            { q: "Show me a report or dashboard you built. Who used it and what decision did it support?", lookFor: "A real audience and decision, sensible chart choices, and awareness of what they would improve." },
            { q: "How do you decide between using the mean and the median when summarising a value like order size?", lookFor: "Recognises skewed distributions and outliers favour the median, and would show the distribution before choosing." },
            { q: "Tell me about a time a stakeholder’s request was vague. How did you clarify it?", lookFor: "Asked about the underlying decision, agreed definitions and time range, and confirmed scope before building." }
          ]
        },
        mid: {
          minYears: 2,
          focus: "Owns analysis for a business area end to end, from framing the question to recommending action, with minimal supervision.",
          responsibilities: [
            "Partner with a business unit to define KPIs and agree metric definitions",
            "Design and run analyses such as cohort, funnel and segmentation studies",
            "Build self-service dashboards with documented, reusable data models",
            "Analyse A/B tests and campaign results with appropriate statistical checks",
            "Present findings and recommendations to managers and review junior analysts’ work"
          ],
          skills: [
            "Advanced SQL window functions",
            "Cohort and funnel analysis",
            "A/B test analysis",
            "DAX measures",
            "Python pandas analysis",
            "KPI definition",
            "Data storytelling"
          ],
          tools: ["BigQuery", "Power BI", "Tableau", "Python (pandas, Jupyter)", "dbt", "Git"],
          certifications: [
            "Microsoft Certified: Power BI Data Analyst Associate",
            "Tableau Certified Data Analyst"
          ],
          aiTopics: [
            "Window functions for running totals, ranks and retention",
            "Cohort, funnel and churn analysis design",
            "Hypothesis testing, p-values and sample size",
            "Metric definitions and avoiding double counting",
            "Structuring an insight-to-recommendation narrative"
          ],
          aiScenarios: [
            "A fintech app’s product team says sign-ups rose but active users fell after a mobile-money onboarding change. Walk me through how you would analyse what happened.",
            "Marketing ran an A/B test on two SMS offers and wants to roll out the winner. Walk me through how you would check whether the result is real.",
            "Two dashboards show different churn rates for the same month. Talk me through how you would resolve it and prevent it recurring."
          ],
          aiExpectations: "A ready mid-level analyst frames the business question first, uses window functions and cohorts confidently and states statistical limits honestly. Red flags are declaring test winners without significance or sample checks, and metric definitions that change between reports.",
          proQuestions: [
            { q: "Tell me about an analysis you led that changed a business decision. What did you find and how did you convince people?", lookFor: "Clear question, sound method, quantified impact without inflation, and how they handled pushback." },
            { q: "How would you calculate 30-day retention by signup cohort in SQL?", lookFor: "Cohort assignment by first activity date, a join or window to later activity, correct denominator per cohort and handling of incomplete cohorts." },
            { q: "An A/B test shows a 3% uplift with a p-value of 0.08. The product lead wants to ship. What do you advise?", lookFor: "Explains it does not meet the usual threshold, considers power, sample size and practical significance, and offers options rather than a flat no." },
            { q: "Describe how you have agreed a KPI definition with stakeholders who disagreed.", lookFor: "Documented competing definitions, tied them to decisions, reached sign-off and published a single source of truth." },
            { q: "How do you review a junior analyst’s query before it goes to a stakeholder?", lookFor: "Checks row counts, join cardinality, filters and totals against known figures, and gives constructive feedback." }
          ]
        },
        senior: {
          minYears: 5,
          focus: "Sets analytical direction for a domain, owns metric standards and influences leadership decisions while mentoring other analysts.",
          responsibilities: [
            "Own the metric framework and data definitions for a business domain",
            "Lead high-stakes analyses such as pricing, credit risk or market entry studies",
            "Design experimentation standards and review test designs across teams",
            "Mentor analysts and set review, documentation and quality practices",
            "Advise leadership on data-informed strategy and data protection obligations under NDPA 2023"
          ],
          skills: [
            "Experiment design",
            "Metric framework design",
            "Advanced statistical inference",
            "Analytics engineering with dbt",
            "Stakeholder management",
            "Analytical team leadership",
            "Causal inference basics"
          ],
          tools: ["Snowflake", "dbt", "Power BI", "Tableau", "Python (statsmodels, pandas)", "Jira"],
          certifications: [
            "Microsoft Certified: Fabric Analytics Engineer Associate",
            "Certified Analytics Professional (CAP)",
            "Tableau Certified Data Analyst"
          ],
          aiTopics: [
            "Designing metric hierarchies and north-star metrics",
            "Experiment design, power and guardrail metrics",
            "Causal reasoning versus correlation in observational data",
            "Data governance, quality ownership and privacy",
            "Influencing executives with analysis"
          ],
          aiScenarios: [
            "Leadership at a lender wants to know whether a new loan pricing model increased defaults. There was no controlled test. Walk me through how you would approach it.",
            "Three departments each report a different 'active customer' number to the board. Walk me through how you would fix this for good.",
            "Your team is overloaded with ad-hoc requests and quality is slipping. Talk me through how you would restructure how the team works."
          ],
          aiExpectations: "A ready senior analyst designs rigorous approaches including quasi-experimental methods, owns definitions across teams and ties analysis to strategy. Red flags are overstating causal claims from correlations, no plan for governance, and inability to say no or prioritise.",
          proQuestions: [
            { q: "Tell me about a time your analysis contradicted what senior leadership believed. How did you handle it?", lookFor: "Rigorous evidence, respectful framing, pre-empting objections, and a clear outcome or lesson." },
            { q: "How would you estimate the impact of a change that was rolled out to everyone at once?", lookFor: "Mentions difference-in-differences, interrupted time series or synthetic control, plus stated assumptions and limitations." },
            { q: "Describe a metric framework you designed. How did you choose the north-star and guardrail metrics?", lookFor: "Links metrics to business outcomes, explains trade-offs and leading versus lagging indicators, and how it was adopted." },
            { q: "How have you developed analysts on your team?", lookFor: "Specific coaching, review practices, stretch assignments and evidence of growth in the people mentored." },
            { q: "What controls do you put on analyses that use customer personal data?", lookFor: "Data minimisation, anonymisation or aggregation, access controls and awareness of NDPA 2023 lawful basis and consent." }
          ]
        }
      },
      hrScenarios: [
        { q: "A manager asks you to remove a data point that makes their team’s numbers look bad before a board meeting. What do you do?", lookFor: "Integrity under pressure: refuses to misrepresent, offers context or annotation instead, and escalates appropriately." },
        { q: "You realise a report you sent last week had a calculation error that has already been shared widely. Tell me how you would handle it.", lookFor: "Owns the mistake quickly, quantifies impact, corrects and communicates, and adds a check to prevent recurrence." },
        { q: "Three stakeholders each say their request is urgent and you can only finish one today. How do you decide?", lookFor: "Clarifies business impact and deadlines, communicates trade-offs openly and involves a manager when priorities conflict." }
      ],
      curriculum: {
        foundational: {
          title: "Data Analysis Foundations",
          summary: "An entry-level course covering spreadsheets, SQL basics, data cleaning and simple dashboards for career-switchers and new analysts.",
          duration: "4 weeks",
          modules: [
            { type: "text", title: "What Data Analysts Do", content: "A data analyst turns raw records into answers that help people decide. The work follows a repeatable cycle: ask, prepare, process, analyse, share and act.\n\nAsk: clarify the decision behind the request. 'How are sales?' becomes 'Which branches missed their Q2 target and by how much?'\nPrepare: find the data sources, check who owns them and whether you are allowed to use them. Customer data in Nigeria falls under the Nigeria Data Protection Act 2023, so use only what you need.\nProcess: clean and validate.\nAnalyse: summarise, compare and look for patterns.\nShare: present results with charts and plain language.\nAct: agree next steps.\n\nKey data types you will meet: numeric (amounts, counts), categorical (region, product), dates and free text. Tables are organised as rows (one record each) and columns (one attribute each). Before any analysis always ask what one row represents. A table of orders and a table of order lines look similar but give very different totals.\n\nChecklist for every request: who is asking, what decision, what time range, what definition of each metric, and when is it needed." },
            { type: "text", title: "Spreadsheets and Data Cleaning", content: "Most analysis starts with messy data. Cleaning means making data accurate, consistent and complete enough for the question.\n\nCommon problems and fixes:\n- Duplicates: use Remove Duplicates or COUNTIFS to flag repeated IDs before deleting.\n- Inconsistent text: 'Lagos', 'lagos ' and 'LAGOS' should be one value. Use TRIM, PROPER and Find and Replace.\n- Missing values: decide whether to leave blank, fill, or exclude, and record the decision.\n- Wrong types: numbers stored as text will not sum. Convert them with VALUE or by changing the column format.\n- Dates: standardise to one format, for example YYYY-MM-DD.\n\nUseful functions: XLOOKUP to bring in values from another table, SUMIFS and COUNTIFS for conditional totals, and IF for flags.\n\nPivot tables summarise thousands of rows in seconds: drag Region to Rows, Amount to Values and Month to Columns to see revenue by region per month.\n\nWorked example: a 5,000-row customer list shows 5,000 rows but only 4,620 unique phone numbers. Before removing duplicates, check whether they are true duplicates or shared family numbers. Never clean on the original sheet: keep a raw copy and log every change." },
            { type: "text", title: "SQL Essentials", content: "SQL (Structured Query Language) lets you ask questions of databases directly. A basic query reads:\n\nSELECT region, SUM(amount) AS revenue\nFROM orders\nWHERE order_date >= '2025-01-01'\nGROUP BY region\nORDER BY revenue DESC;\n\nThe logical order of execution is FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY. That is why you cannot filter on an aggregate in WHERE: use HAVING SUM(amount) > 1000000 instead.\n\nJoins combine tables. INNER JOIN keeps only matching rows. LEFT JOIN keeps every row from the left table and fills unmatched columns with NULL, which is useful for finding customers with no orders (WHERE o.id IS NULL).\n\nWatch join cardinality. Joining customers to orders produces one row per order, so summing a customer attribute after the join will multiply it.\n\nCOUNT(*) counts rows, COUNT(column) ignores NULLs and COUNT(DISTINCT customer_id) counts unique customers.\n\nHabit to build: after every query, check the row count and compare one total against a figure you already trust." },
            { type: "text", title: "Charts and Simple Dashboards", content: "A chart should answer one question at a glance. Choose the form from the question:\n- Change over time: line chart.\n- Compare categories: bar chart, sorted.\n- Part of a whole with few parts: stacked bar, or a pie only for two or three slices.\n- Relationship between two numbers: scatter plot.\n- A single headline number: a KPI card with comparison to target or last period.\n\nGood practice: start bar axes at zero, label units (₦, %, count), remove clutter such as 3D effects and heavy gridlines, and use colour to highlight, not decorate.\n\nA simple dashboard layout: headline KPIs across the top, trend in the middle, breakdowns below, filters on the side. Every number must have an agreed definition and a 'last refreshed' date.\n\nWorked example in Power BI Desktop: load the cleaned sales file, create a measure Total Revenue = SUM(Sales[Amount]), add a card, a line chart by month and a bar chart by branch, then add a slicer for region. Before publishing, check the card total against the source spreadsheet." },
            { type: "quiz", title: "Foundations Check", questions: [
              { q: "Which SQL clause should you use to keep only regions whose total revenue exceeds ₦1m?", options: ["WHERE", "HAVING", "ORDER BY", "LIMIT"], answer: 1 },
              { q: "You want every customer listed, including those with no orders. Which join fits?", options: ["INNER JOIN from orders to customers", "CROSS JOIN", "LEFT JOIN from customers to orders", "SELF JOIN on customers"], answer: 2 },
              { q: "What does COUNT(DISTINCT customer_id) return?", options: ["The number of unique customers", "The number of rows including NULLs", "The total of customer IDs added up", "The highest customer ID"], answer: 0 },
              { q: "Which chart best shows monthly revenue over two years?", options: ["Pie chart", "Scatter plot", "Stacked area of every product", "Line chart"], answer: 3 },
              { q: "A column of amounts will not sum in Excel. What is the most likely cause?", options: ["The sheet is too large", "The values are stored as text", "The column is sorted", "The workbook is shared"], answer: 1 },
              { q: "What is the best first step before removing apparent duplicate records?", options: ["Delete them immediately to save time", "Ask IT to fix the database", "Confirm they are true duplicates and keep a raw copy", "Replace them with averages"], answer: 2 }
            ] },
            { type: "assignment", title: "Clean and Report a Sales Dataset", maxScore: 100, content: "Brief: you are given a raw sales export for a retail chain with branches in several Nigerian cities. It contains duplicates, inconsistent city names, missing values and amounts stored as text.\n\nDeliverables:\n1. A cleaned spreadsheet with a change log listing every cleaning step and why.\n2. Three SQL queries (or pivot tables) answering: revenue by branch, monthly revenue trend, and top 10 products by units.\n3. A one-page dashboard in Power BI or Looker Studio with a KPI card, trend line and branch bar chart.\n4. A 150-word summary of two findings and one data quality issue.\n\nGrading: cleaning accuracy and documentation 30, correct queries 30, chart choice and clarity 25, written summary 15." }
          ]
        },
        intensive: {
          title: "Data Analyst Job-Ready Intensive",
          summary: "Job-ready depth in advanced SQL, Python analysis, experimentation and stakeholder storytelling, ending in a level-aware capstone.",
          duration: "8 weeks",
          modules: [
            { type: "text", title: "Advanced SQL: CTEs and Window Functions", content: "Common table expressions (CTEs) break complex logic into readable steps:\n\nWITH first_order AS (\n  SELECT customer_id, MIN(order_date) AS first_date FROM orders GROUP BY customer_id\n)\nSELECT DATE_TRUNC(first_date, MONTH) AS cohort, COUNT(*) FROM first_order GROUP BY 1;\n\nWindow functions calculate across related rows without collapsing them:\n- ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date) numbers each customer’s orders, so you can pick the first or latest.\n- SUM(amount) OVER (ORDER BY order_date) gives a running total.\n- LAG(amount) OVER (PARTITION BY customer_id ORDER BY order_date) returns the previous value for period-on-period change.\n- RANK and DENSE_RANK handle ties differently.\n\nWorked example, deduplicating to the latest record per customer: number rows by updated_at descending inside a CTE, then keep WHERE rn = 1.\n\nPerformance habits in cloud warehouses such as BigQuery and Snowflake: select only needed columns, filter on partition columns such as date early, and avoid SELECT * on large tables because you pay for bytes scanned." },
            { type: "text", title: "Python for Analysis", content: "Python with pandas handles work too large or repetitive for spreadsheets. Core operations:\n\ndf = pd.read_csv('orders.csv', parse_dates=['order_date'])\ndf.info() and df.describe() give types, nulls and ranges.\ndf.drop_duplicates(subset='order_id') removes repeats.\ndf['city'] = df['city'].str.strip().str.title() standardises text.\ndf.groupby('region')['amount'].agg(['sum','mean','count']) summarises.\npd.merge(orders, customers, on='customer_id', how='left', validate='many_to_one') joins and checks cardinality.\n\nThe validate argument is a cheap guard against accidental row multiplication.\n\nUse Jupyter notebooks for exploration but keep them reproducible: run top to bottom, set paths in one cell, and avoid editing data by hand. Store final logic in scripts or dbt models when it becomes a recurring report.\n\nVisualise with matplotlib or seaborn: a histogram reveals skew and outliers before you choose mean or median.\n\nChecklist before sharing a notebook: restart and run all, row counts printed at each major step, assumptions written in markdown cells, and no customer personal data left in outputs." },
            { type: "text", title: "Statistics and Experiment Analysis", content: "Analysts must separate signal from noise.\n\nDescriptive statistics: mean, median, standard deviation and percentiles. Skewed data such as transaction values is better described by the median and percentiles.\n\nSampling: a sample represents the population only if selection is unbiased. Survey respondents who opt in are rarely representative.\n\nA/B testing: randomly split users into control and treatment and compare a pre-agreed primary metric.\n- Decide the metric, minimum detectable effect and sample size before launching.\n- The p-value is the probability of seeing a difference at least this large if there were truly no effect. It is not the probability the treatment works.\n- A 95% confidence interval that excludes zero indicates a statistically significant difference at the 5% level.\n- Do not stop the test the moment it looks significant; peeking inflates false positives.\n- Check guardrail metrics such as complaints or failed payments.\n\nWorked example: conversion 4.0% vs 4.4% with 10,000 users per arm. Run a two-proportion z-test, report the uplift with its confidence interval, and state whether the effect is practically meaningful for the business." },
            { type: "text", title: "Data Storytelling and Stakeholders", content: "Insight only matters if it leads to action. Structure findings as: context, key finding, evidence, implication and recommendation.\n\nLead with the answer. 'Repeat purchase fell 12% among Abuja customers after delivery times rose' beats a slide titled 'Analysis results'.\n\nTailor depth to the audience. Executives need the decision and confidence level; operations teams need the breakdown they can act on.\n\nState caveats honestly: data gaps, sample size, correlation versus causation. Credibility is lost when a confident claim later falls apart.\n\nMetric governance: agree definitions in writing (what counts as an active customer, which date, which currency conversion) and publish them in a data dictionary. Many disputes between dashboards are definition disputes.\n\nManaging requests: ask what decision the request supports, agree a deadline and scope, and push back politely when a request duplicates an existing report.\n\nChecklist for a findings deck: one message per slide, charts titled with the takeaway, numbers rounded sensibly, sources and refresh dates in the footer, and a clear 'what we recommend' slide." },
            { type: "assignment", title: "Cohort Retention Analysis", maxScore: 100, content: "Brief: using the provided transactions table for a mobile-money wallet, analyse customer retention by monthly signup cohort.\n\nDeliverables:\n1. SQL using CTEs and window functions to build a cohort retention table (month 0 to month 6).\n2. A heatmap or line chart of retention by cohort in Power BI, Tableau or Python.\n3. A short memo (max 300 words) explaining which cohorts retain best, possible reasons, and one recommended action, with caveats.\n\nGrading: SQL correctness and readability 40, visual clarity 25, quality of insight and caveats 25, documentation of assumptions 10." },
            { type: "quiz", title: "Intensive Check", questions: [
              { q: "Which window function returns the previous row’s value for each customer?", options: ["LEAD", "LAG", "NTILE", "FIRST_VALUE with no ORDER BY"], answer: 1 },
              { q: "An A/B test result has p = 0.03. What does this mean?", options: ["There is a 97% chance the treatment works", "The effect is large", "A difference this big would be unlikely if there were no real effect", "The test must run longer"], answer: 2 },
              { q: "Why is stopping a test as soon as it looks significant a problem?", options: ["It increases the false positive rate", "It reduces warehouse costs", "It changes the randomisation", "It makes the confidence interval wider"], answer: 0 },
              { q: "In pandas, what does merge(..., validate='many_to_one') protect against?", options: ["Missing columns", "Slow joins", "Wrong data types", "Unexpected duplicate keys in the right table"], answer: 3 },
              { q: "Two dashboards show different 'active customer' counts. What is the most likely root cause?", options: ["Different browsers", "Different metric definitions or filters", "Too many charts", "Using a line chart instead of bars"], answer: 1 },
              { q: "Which statistic best summarises typical transaction value when a few very large transfers exist?", options: ["Maximum", "Mean", "Median", "Sum"], answer: 2 }
            ] },
            { type: "assignment", title: "Capstone: Business Performance Investigation", maxScore: 100, content: "Shared brief: an e-commerce company operating across Lagos, Abuja and Port Harcourt reports falling repeat purchases. You receive orders, customers, deliveries and marketing campaign tables. Investigate the drop and recommend actions.\nJunior: clean the data, build a dashboard of repeat purchase rate by city and month, and identify where the drop is concentrated.\nMid: add cohort and funnel analysis, test whether delivery delays relate to churn, and evaluate a past SMS campaign test for significance.\nSenior: design a metric framework with north-star and guardrails, propose a controlled experiment to test a fix, and present a prioritised roadmap to leadership with risks and data governance notes.\nDeliverables: SQL or Python code, a dashboard, and a findings deck of up to 10 slides.\nGrading: analytical rigour 35, correctness 25, communication 25, level-appropriate depth 15." }
          ]
        }
      }
    },
    {
      id: "bi",
      title: "BI Developer",
      summary: "BI Developers design semantic models, reports and dashboards that give an organisation a trusted, self-service view of its performance. They sit between data engineering and business users, owning the reporting layer, its performance and its security.",
      competencies: [
        { name: "Dimensional modelling", weight: 25, description: "Designs star schemas with clear facts, dimensions, grain and slowly changing dimensions for reporting." },
        { name: "Semantic layer and DAX", weight: 25, description: "Builds performant semantic models and calculated measures, including time intelligence and filter context." },
        { name: "SQL and data transformation", weight: 20, description: "Prepares and transforms source data with SQL, Power Query or dbt into reporting-ready tables." },
        { name: "Dashboard design", weight: 15, description: "Designs usable, accessible dashboards that follow visual best practice and serve defined user needs." },
        { name: "BI administration and governance", weight: 15, description: "Manages deployment, refresh, row-level security, workspaces and certified datasets." }
      ],
      levels: {
        junior: {
          minYears: 0,
          focus: "Builds and maintains reports and simple data models on existing datasets following team standards.",
          responsibilities: [
            "Build reports and dashboards from existing certified datasets",
            "Write Power Query transformations to clean and shape source data",
            "Create basic DAX measures such as totals, ratios and year-to-date values",
            "Monitor scheduled refreshes and report failures with logs",
            "Apply the team’s naming, layout and documentation standards"
          ],
          skills: [
            "Power BI report building",
            "Power Query transformations",
            "Basic DAX measures",
            "SQL SELECT and joins",
            "Star schema basics",
            "Dashboard layout design",
            "Scheduled refresh monitoring"
          ],
          tools: ["Power BI Desktop", "Power BI Service", "SQL Server Management Studio", "Microsoft Excel", "Tableau Desktop", "Azure DevOps"],
          certifications: [
            "Microsoft Certified: Power BI Data Analyst Associate",
            "Tableau Desktop Specialist"
          ],
          aiTopics: [
            "Facts versus dimensions and table grain",
            "Power Query steps and query folding basics",
            "SUM versus calculated measures and basic CALCULATE",
            "Relationships, cardinality and filter direction",
            "Dashboard layout and visual choice"
          ],
          aiScenarios: [
            "A report’s total sales card shows double the expected figure after you added a new table. Walk me through how you would find the cause.",
            "The overnight refresh failed and a manager needs the dashboard by 9am. Walk me through what you would check.",
            "A branch manager wants a page comparing this month to the same month last year. Talk me through how you would build it."
          ],
          aiExpectations: "A ready junior understands what a fact and dimension are, builds clean reports and debugs relationship issues methodically. Red flags are using bidirectional filters everywhere to 'make it work', calculated columns for everything, and not checking totals against source.",
          proQuestions: [
            { q: "Show me a report you built. Walk me through the data model behind it.", lookFor: "Can name the fact and dimension tables, the grain and the relationships, and explain design choices." },
            { q: "What is the difference between a calculated column and a measure in Power BI, and when would you use each?", lookFor: "Columns are computed row by row at refresh and stored; measures evaluate at query time in filter context; measures preferred for aggregations." },
            { q: "Tell me about a time a number in your report was questioned. How did you verify it?", lookFor: "Traced back to source with SQL, compared filters and definitions, and communicated the outcome." },
            { q: "How would you build a year-to-date sales measure?", lookFor: "Uses a proper marked date table and TOTALYTD or CALCULATE with DATESYTD." },
            { q: "How do you decide what goes on the first page of a dashboard?", lookFor: "Starts from user goals, puts headline KPIs first, limits visuals and adds drill-through for detail." }
          ]
        },
        mid: {
          minYears: 2,
          focus: "Designs and owns semantic models and dashboard suites for a business domain, including performance and security.",
          responsibilities: [
            "Design star-schema semantic models with documented grain and conformed dimensions",
            "Write and optimise complex DAX including time intelligence and context transition",
            "Implement row-level security for branch, region or role-based access",
            "Manage deployment pipelines across development, test and production workspaces",
            "Gather requirements with stakeholders and translate them into report specifications"
          ],
          skills: [
            "Dimensional modelling",
            "Advanced DAX",
            "Row-level security",
            "Query performance tuning",
            "Deployment pipelines",
            "Requirements gathering",
            "SQL views and stored procedures"
          ],
          tools: ["Power BI", "Microsoft Fabric", "DAX Studio", "Tabular Editor", "Azure SQL Database", "Tableau"],
          certifications: [
            "Microsoft Certified: Power BI Data Analyst Associate",
            "Microsoft Certified: Fabric Analytics Engineer Associate",
            "Tableau Certified Data Analyst"
          ],
          aiTopics: [
            "Slowly changing dimensions and conformed dimensions",
            "Filter context, row context and context transition",
            "Model and DAX performance tuning",
            "Row-level and object-level security",
            "Import, DirectQuery and Direct Lake trade-offs"
          ],
          aiScenarios: [
            "A bank’s branch performance report takes 40 seconds to load. Walk me through how you would diagnose and fix it.",
            "Regional managers must see only their own branches, but head office sees all. Walk me through how you would implement and test this.",
            "Customers move between segments and the business wants history reported by the segment at the time of sale. Talk me through your model design."
          ],
          aiExpectations: "A ready mid-level BI developer designs clean star schemas, explains filter and context transition precisely and uses tools like DAX Studio to tune performance. Red flags are flat wide tables for everything, untested RLS, and no understanding of storage modes.",
          proQuestions: [
            { q: "Describe a semantic model you designed from scratch. What was the grain of your fact tables and why?", lookFor: "Clear grain statements, conformed dimensions, handling of multiple facts and justification tied to reporting needs." },
            { q: "Explain context transition and give an example where it caused unexpected results.", lookFor: "CALCULATE converts row context to filter context, e.g. in calculated columns or iterators, with a concrete bug they hit or avoided." },
            { q: "Tell me how you improved a slow report. What did you measure and what changed?", lookFor: "Used Performance Analyzer or DAX Studio, identified the bottleneck, applied model or DAX changes and measured before and after." },
            { q: "How do you implement and test row-level security?", lookFor: "Roles with DAX filters or dynamic USERPRINCIPALNAME mapping, testing with 'View as', and governance of membership." },
            { q: "How would you handle a request for 50 visuals on one page?", lookFor: "Explores the underlying need, proposes drill-through or multiple pages and explains performance and usability trade-offs." }
          ]
        },
        senior: {
          minYears: 5,
          focus: "Owns the BI platform architecture, standards and governance across the organisation and leads other BI developers.",
          responsibilities: [
            "Define BI architecture, semantic layer strategy and storage mode standards",
            "Lead governance including certified datasets, workspace structure and capacity management",
            "Design enterprise-wide conformed models shared across departments",
            "Mentor BI developers and run design and code reviews",
            "Advise leadership on BI tooling, licensing costs and self-service adoption"
          ],
          skills: [
            "BI architecture design",
            "Enterprise semantic modelling",
            "Capacity and cost management",
            "BI governance frameworks",
            "CI/CD for BI",
            "Team leadership",
            "Stakeholder management"
          ],
          tools: ["Microsoft Fabric", "Power BI Premium capacity", "Tabular Editor", "dbt", "Snowflake", "Git"],
          certifications: [
            "Microsoft Certified: Fabric Analytics Engineer Associate",
            "dbt Analytics Engineering Certification",
            "SnowPro Core Certification"
          ],
          aiTopics: [
            "Enterprise semantic layer and data mesh trade-offs",
            "Capacity planning and licensing cost control",
            "Governance, certification and lineage",
            "CI/CD and version control for BI artefacts",
            "Driving self-service adoption safely"
          ],
          aiScenarios: [
            "Your company has over 400 Power BI reports, many duplicating the same metrics with different results. Walk me through how you would bring order to this.",
            "Leadership wants to cut BI licensing costs while expanding access to more staff. Walk me through your options.",
            "Business units want to build their own reports but data quality incidents keep reaching executives. Talk me through how you would set up self-service governance."
          ],
          aiExpectations: "A ready senior BI developer designs platform-wide architecture, balances governance with self-service and reasons about cost and capacity. Red flags are tool-only thinking, no strategy for certified datasets, and inability to lead through influence.",
          proQuestions: [
            { q: "Describe a BI platform you designed or overhauled. What were the main architectural decisions?", lookFor: "Storage modes, shared semantic models, workspace strategy, governance and measurable results." },
            { q: "How do you put BI artefacts under version control and automated deployment?", lookFor: "PBIP or TMDL files in Git, Tabular Editor or Fabric Git integration, deployment pipelines and review gates." },
            { q: "Tell me about a time you had to retire reports people relied on. How did you manage it?", lookFor: "Usage analysis, communication plan, migration path to certified content and stakeholder buy-in." },
            { q: "How do you decide between a single enterprise model and domain-specific models?", lookFor: "Trade-offs of size, ownership, refresh, reuse and conformed dimensions; pragmatic hybrid approach." },
            { q: "How have you grown the skills of BI developers on your team?", lookFor: "Standards, reviews, pairing, training plans and examples of developers they helped progress." }
          ]
        }
      },
      hrScenarios: [
        { q: "An executive asks you to give their assistant access to a dashboard containing all staff salaries. What do you do?", lookFor: "Respects access policy and data protection, verifies authorisation through proper channels and offers a compliant alternative." },
        { q: "A dashboard you deployed shows wrong figures in a meeting with senior management. How do you respond in the moment and afterwards?", lookFor: "Stays calm, acknowledges, gives an honest timeline to fix, then performs root-cause analysis and adds tests." },
        { q: "A colleague keeps building duplicate reports that conflict with the certified ones. How would you address this?", lookFor: "Approaches collaboratively, understands their unmet need, guides them to certified content and escalates only if needed." }
      ],
      curriculum: {
        foundational: {
          title: "BI Development Foundations",
          summary: "An entry course covering data modelling basics, Power Query, introductory DAX and dashboard design in Power BI.",
          duration: "4 weeks",
          modules: [
            { type: "text", title: "How Business Intelligence Works", content: "Business intelligence (BI) gives an organisation a trusted, shared view of performance. A typical BI stack has four layers:\n1. Sources: core banking, ERP, CRM, mobile-money platforms, spreadsheets.\n2. Storage and transformation: a data warehouse or lakehouse where data is cleaned and integrated.\n3. Semantic model: tables, relationships and measures that define business logic once.\n4. Reports and dashboards: what users see and interact with.\n\nThe BI developer mainly owns layers 3 and 4, working closely with data engineers on layer 2.\n\nWhy a semantic model matters: if 'Net Revenue' is defined once as a measure, every report that uses it agrees. If each report calculates it separately, numbers drift and trust collapses.\n\nCommon tools: Power BI (with Microsoft Fabric), Tableau and Looker. Many Nigerian banks, telcos and FMCG firms run on Microsoft stacks, so Power BI skills are widely requested.\n\nChecklist for a new BI request: who are the users, which decisions, which metrics and definitions, how often must data refresh, and who may see which rows." },
            { type: "text", title: "Star Schemas and Relationships", content: "A star schema organises data for fast, simple reporting. At the centre is a fact table of measurable events, such as sales lines, with numeric columns (quantity, amount) and keys. Around it sit dimension tables that describe the events: Date, Product, Customer, Branch.\n\nGrain is the most important design decision: what does one row of the fact table represent? 'One row per product per receipt' is a clear grain. Mixing grains in one table causes double counting.\n\nRelationships in Power BI usually run one-to-many from dimension to fact, with single-direction filtering from dimension to fact. Bidirectional filters can create ambiguity and slow models, so use them only with a clear reason.\n\nAlways include a dedicated Date table with continuous dates and mark it as the date table; time intelligence functions depend on it.\n\nWorked example: a flat spreadsheet with columns Date, Branch, BranchCity, Product, Category, Qty, Amount becomes FactSales (DateKey, BranchKey, ProductKey, Qty, Amount) plus DimBranch, DimProduct and DimDate. The model is smaller, faster and easier to extend." },
            { type: "text", title: "Power Query Essentials", content: "Power Query is the data preparation engine in Power BI and Excel. Each transformation is recorded as an applied step written in the M language, so refreshes repeat the same logic automatically.\n\nCore transformations:\n- Remove or choose columns early to reduce size.\n- Change types explicitly: dates, whole numbers, decimals, text.\n- Trim and clean text, replace values and split columns.\n- Unpivot wide month columns into rows of Month and Value.\n- Merge queries (joins) and append queries (unions).\n- Group By for summaries.\n\nQuery folding: when connected to a database, Power Query can push steps back to the source as SQL, which is far faster. Steps like filtering and removing columns usually fold; some custom steps break folding. Right-click a step and check 'View Native Query'.\n\nGood practice: name steps meaningfully, keep raw staging queries separate from final tables, disable load on helper queries, and use parameters for server names so you can switch between test and production.\n\nCheck after shaping: row counts match expectations and there are no unexpected errors or nulls in key columns." },
            { type: "text", title: "Introduction to DAX and Dashboard Design", content: "DAX (Data Analysis Expressions) defines calculations in the semantic model.\n\nMeasures are evaluated at query time in the current filter context, meaning whatever slicers, rows and columns apply. Examples:\nTotal Sales = SUM(FactSales[Amount])\nOrders = DISTINCTCOUNT(FactSales[OrderID])\nAvg Order Value = DIVIDE([Total Sales], [Orders])\nSales YTD = TOTALYTD([Total Sales], DimDate[Date])\n\nCALCULATE changes filter context: Lagos Sales = CALCULATE([Total Sales], DimBranch[City] = \"Lagos\").\n\nUse DIVIDE instead of '/' to handle division by zero safely. Prefer measures over calculated columns for aggregations.\n\nDashboard design principles:\n- Start with the user’s top three questions.\n- KPIs top-left, trends next, detail lower or on drill-through pages.\n- Consistent colours, fonts and number formats (₦ with thousands separators).\n- Limit visuals per page for speed and focus.\n- Add titles that state what the visual shows and a refresh timestamp.\n- Check accessibility: sufficient contrast and not relying on colour alone." },
            { type: "quiz", title: "BI Foundations Check", questions: [
              { q: "In a star schema, which table typically holds sales amounts and quantities?", options: ["The fact table", "The date dimension", "The product dimension", "A bridge table"], answer: 0 },
              { q: "Why should you define the grain of a fact table before building it?", options: ["It makes charts colourful", "It prevents mixing levels of detail that cause double counting", "It is required to publish reports", "It enables bidirectional filters"], answer: 1 },
              { q: "What does query folding do in Power Query?", options: ["Compresses the PBIX file", "Hides unused columns", "Pushes transformation steps back to the source system", "Creates measures automatically"], answer: 2 },
              { q: "Which DAX function safely handles division by zero?", options: ["SUMX", "RELATED", "FILTER", "DIVIDE"], answer: 3 },
              { q: "What does CALCULATE primarily do?", options: ["Modifies the filter context in which an expression is evaluated", "Creates a new table from a CSV", "Refreshes the dataset", "Sorts a column"], answer: 0 },
              { q: "Time intelligence functions such as TOTALYTD work most reliably when:", options: ["Every table has a date column", "A continuous date table is marked as the date table", "Bidirectional filters are enabled", "The report uses DirectQuery"], answer: 1 }
            ] },
            { type: "assignment", title: "Build a Branch Sales Dashboard", maxScore: 100, content: "Brief: a supermarket chain gives you a flat sales spreadsheet covering 12 months across branches in Lagos, Ibadan and Kano.\n\nDeliverables:\n1. A Power BI model converting the flat file into a star schema with a marked date table.\n2. At least five DAX measures: total sales, orders, average order value, YTD sales and month-on-month growth.\n3. A two-page dashboard: an overview page with KPIs and trends, and a branch detail page with drill-through.\n4. A short design note (100–150 words) explaining your grain, relationships and layout choices.\n\nGrading: model design 35, DAX correctness 30, dashboard usability 25, design note 10." }
          ]
        },
        intensive: {
          title: "BI Developer Job-Ready Intensive",
          summary: "Job-ready depth in dimensional modelling, advanced DAX, performance, security and BI deployment, ending in a level-aware capstone.",
          duration: "8 weeks",
          modules: [
            { type: "text", title: "Advanced Dimensional Modelling", content: "Real organisations need more than a single star.\n\nConformed dimensions: one shared Customer or Date dimension used by several fact tables (sales, payments, complaints) so reports can compare them consistently.\n\nSlowly changing dimensions (SCD):\n- Type 1 overwrites the old value; history is lost.\n- Type 2 adds a new row with valid-from and valid-to dates and a surrogate key, so a sale is reported against the customer’s segment at the time of sale.\nChoose per attribute: a corrected spelling is Type 1, a change of segment or branch is often Type 2.\n\nFact table types: transaction facts (one row per event), periodic snapshots (account balance at month end) and accumulating snapshots (loan application stages with dates per milestone).\n\nMany-to-many relationships, such as accounts with multiple holders, are handled with a bridge table rather than bidirectional filters across the whole model.\n\nRole-playing dimensions: a loan has application date, approval date and disbursement date. Use one Date table with inactive relationships activated by USERELATIONSHIP in measures.\n\nDocument every model with grain, keys, SCD types and owners." },
            { type: "text", title: "Advanced DAX and Evaluation Context", content: "Mastering DAX means mastering context.\n\nRow context exists when iterating rows, in calculated columns or iterators such as SUMX. Filter context is the set of filters applied from visuals, slicers and CALCULATE.\n\nContext transition: when CALCULATE runs inside a row context, the current row becomes a filter. This is why a measure referenced inside SUMX over Customer returns per-customer values.\n\nUseful patterns:\n- Variables (VAR ... RETURN) improve readability and avoid repeated evaluation.\n- ALL, REMOVEFILTERS and ALLEXCEPT clear filters for percent-of-total.\n- KEEPFILTERS intersects rather than overwrites filters.\n- SAMEPERIODLASTYEAR and DATEADD for comparisons.\n- TREATAS to apply virtual relationships.\n\nWorked example, share of region:\nRegion Share = VAR Cur = [Total Sales] VAR Tot = CALCULATE([Total Sales], REMOVEFILTERS(DimBranch)) RETURN DIVIDE(Cur, Tot)\n\nCalculation groups, created in Tabular Editor or Power BI Desktop, apply time intelligence such as YTD or prior year to any measure without duplicating dozens of measures." },
            { type: "text", title: "Performance and Storage Modes", content: "Slow reports lose users. Diagnose before you change anything.\n\nTools: Performance Analyzer in Power BI Desktop shows time per visual split into DAX query, visual display and other. DAX Studio captures queries, server timings and storage engine versus formula engine time. VertiPaq Analyzer shows which columns consume memory.\n\nCommon fixes:\n- Remove unused columns and reduce high-cardinality columns such as timestamps or GUIDs.\n- Use integer surrogate keys for relationships.\n- Replace calculated columns with upstream transformations.\n- Simplify DAX that forces the formula engine to iterate large tables.\n- Reduce visuals per page.\n\nStorage modes:\n- Import: data cached in memory; fastest queries, requires refresh.\n- DirectQuery: queries the source live; fresh data but dependent on source speed.\n- Direct Lake (Microsoft Fabric): reads Delta tables in OneLake directly with near-import speed.\n- Composite models and aggregations combine modes.\n\nIncremental refresh partitions large fact tables by date so only recent partitions reload, which also helps where network reliability is limited." },
            { type: "text", title: "Security, Deployment and Governance", content: "Row-level security (RLS) restricts rows by user. Static RLS hard-codes filters per role, such as Region = \"North\". Dynamic RLS maps USERPRINCIPALNAME() to a security table of users and branches, so one role serves everyone. Always test with 'View as role' and with real test accounts. Object-level security hides sensitive tables or columns such as salaries.\n\nRLS is not a substitute for data minimisation: personal data covered by the NDPA 2023 should only be in a model when needed.\n\nDeployment: use separate development, test and production workspaces with deployment pipelines. Save reports as Power BI Projects (PBIP) so model definitions (TMDL) and reports can be stored in Git, reviewed and deployed through Azure DevOps or GitHub Actions.\n\nGovernance practices:\n- Endorse datasets as Promoted or Certified.\n- Monitor usage metrics to retire unused reports.\n- Assign owners and document definitions.\n- Track lineage from source to report.\n- Manage capacity to avoid throttling during peak periods such as month-end." },
            { type: "assignment", title: "Secure Multi-Fact Model", maxScore: 100, content: "Brief: build a semantic model for a microfinance bank with loans, repayments and branches.\n\nDeliverables:\n1. A star schema with two fact tables, conformed Date, Branch and Customer dimensions, and a Type 2 customer segment.\n2. Measures for portfolio at risk (PAR30), repayment rate and disbursements YTD with prior-year comparison.\n3. Dynamic row-level security so branch managers see only their branch.\n4. A test log showing RLS checks and a Performance Analyzer screenshot.\n\nGrading: model design 35, DAX correctness 30, security and testing 25, documentation 10." },
            { type: "quiz", title: "Intensive Check", questions: [
              { q: "A customer moves from 'Retail' to 'SME' segment and sales must be reported by segment at time of sale. Which approach fits?", options: ["Type 1 SCD", "Type 2 SCD", "Delete old sales", "A calculated column on the fact table"], answer: 1 },
              { q: "What is context transition?", options: ["Switching from Import to DirectQuery", "Moving a report between workspaces", "CALCULATE converting the current row context into filter context", "Changing the report theme"], answer: 2 },
              { q: "Which tool shows storage engine versus formula engine timings for a DAX query?", options: ["DAX Studio", "Power Query Editor", "Excel Power Pivot", "Azure Data Studio"], answer: 0 },
              { q: "How do you activate an inactive relationship to a role-playing date inside a measure?", options: ["RELATEDTABLE", "CROSSFILTER with None", "LOOKUPVALUE", "USERELATIONSHIP"], answer: 3 },
              { q: "What does dynamic RLS typically rely on?", options: ["A separate report per user", "USERPRINCIPALNAME mapped to a security table", "Hiding pages", "Bookmarks"], answer: 1 },
              { q: "What is the main benefit of incremental refresh?", options: ["Only recent partitions reload, reducing refresh time", "It removes the need for a date table", "It enables bidirectional filters", "It encrypts the dataset"], answer: 0 }
            ] },
            { type: "assignment", title: "Capstone: Enterprise Reporting Layer", maxScore: 100, content: "Shared brief: a Nigerian telco wants a trusted reporting layer for subscriber revenue, data bundle sales and customer complaints across regions. You receive warehouse tables and a list of conflicting existing reports.\nJunior: build a star schema for bundle sales with a date table, core measures and a two-page dashboard with drill-through.\nMid: add complaints as a second fact with conformed dimensions, implement dynamic RLS by region, tune performance and set up a dev-to-prod deployment pipeline.\nSenior: design the enterprise BI architecture including storage modes, certified datasets, workspace and Git strategy, capacity plan and a migration plan to retire conflicting reports.\nDeliverables: PBIP project or equivalent, documentation of model and measures, and a short presentation.\nGrading: modelling 30, DAX and performance 25, security and governance 25, communication and level-appropriate depth 20." }
          ]
        }
      }
    },
    {
      id: "engineer",
      title: "Data Engineer",
      summary: "Data Engineers build and run the pipelines, warehouses and lakehouses that move data reliably from source systems to analysts, BI and machine learning. They sit in the data platform team, owning ingestion, transformation, orchestration, data quality and cost.",
      competencies: [
        { name: "Data pipeline development", weight: 25, description: "Builds reliable batch and streaming ingestion and transformation pipelines that are idempotent and recoverable." },
        { name: "SQL and data modelling", weight: 20, description: "Designs warehouse and lakehouse models and writes performant SQL for large-scale transformations." },
        { name: "Programming and software practice", weight: 20, description: "Writes tested, version-controlled Python and SQL code with CI/CD and code review." },
        { name: "Orchestration and data quality", weight: 15, description: "Schedules, monitors and tests pipelines with clear dependencies, alerting and data quality checks." },
        { name: "Cloud data platforms and cost", weight: 20, description: "Uses cloud storage, compute and warehouse services securely and cost-effectively." }
      ],
      levels: {
        junior: {
          minYears: 0,
          focus: "Builds and maintains well-specified pipelines and transformations on an existing platform under guidance.",
          responsibilities: [
            "Build ingestion jobs that load files and API data into the warehouse",
            "Write and test SQL and dbt transformations following team conventions",
            "Monitor scheduled pipelines and investigate failures using logs",
            "Add data quality tests for nulls, uniqueness and accepted values",
            "Document tables, columns and pipeline dependencies"
          ],
          skills: [
            "Python scripting",
            "SQL transformations",
            "dbt models and tests",
            "Git version control",
            "REST API ingestion",
            "Linux command line",
            "Pipeline monitoring"
          ],
          tools: ["Python", "PostgreSQL", "dbt Core", "Apache Airflow", "Git", "Docker"],
          certifications: [
            "Microsoft Certified: Azure Data Fundamentals",
            "Google Cloud Certified Associate Data Practitioner",
            "AWS Certified Data Engineer – Associate"
          ],
          aiTopics: [
            "ETL versus ELT and basic pipeline stages",
            "SQL joins, deduplication and incremental loads",
            "Python for reading APIs and files",
            "Data quality checks and testing",
            "Debugging failed jobs from logs"
          ],
          aiScenarios: [
            "A daily pipeline that loads transactions from a payment API failed overnight. Walk me through how you would investigate and recover.",
            "The orders table in the warehouse has duplicate rows after a job was re-run. Walk me through how you would fix it and stop it happening again.",
            "You need to load a CSV that a partner drops on SFTP every morning. Talk me through how you would build that ingestion."
          ],
          aiExpectations: "A ready junior writes clean SQL and Python, understands why pipelines must be re-runnable and debugs methodically from logs. Red flags are manual fixes in production without tracking, no concept of idempotency, and ignoring tests.",
          proQuestions: [
            { q: "Walk me through a pipeline you built, from source to final table.", lookFor: "Clear stages, tools used, how failures are handled and how they verified the output." },
            { q: "What does it mean for a pipeline to be idempotent, and how would you make a daily load idempotent?", lookFor: "Re-running yields the same result; uses merge/upsert or delete-and-insert by partition rather than blind appends." },
            { q: "Tell me about a bug you found in a data job. How did you debug it?", lookFor: "Systematic use of logs, isolated reproduction, root cause and a test added afterwards." },
            { q: "How would you handle an API that limits you to 100 requests per minute and sometimes times out?", lookFor: "Pagination, rate limiting, retries with exponential backoff and checkpointing progress." },
            { q: "Why use Git and code review for SQL transformations?", lookFor: "History, rollback, peer review catching logic errors, and enabling CI tests." }
          ]
        },
        mid: {
          minYears: 2,
          focus: "Designs and owns production pipelines and data models for a domain, including reliability, quality and cost.",
          responsibilities: [
            "Design batch and incremental pipelines with orchestration, retries and alerting",
            "Model warehouse and lakehouse layers such as bronze, silver and gold",
            "Implement CI/CD, automated tests and data contracts for pipelines",
            "Optimise query performance and cloud cost through partitioning and clustering",
            "Handle change data capture from operational databases and review peers’ code"
          ],
          skills: [
            "Pipeline orchestration",
            "Change data capture",
            "Apache Spark",
            "Data modelling",
            "CI/CD for data",
            "Query performance tuning",
            "Cloud cost optimisation"
          ],
          tools: ["Apache Airflow", "dbt", "Apache Spark", "Snowflake", "Google BigQuery", "Apache Kafka"],
          certifications: [
            "AWS Certified Data Engineer – Associate",
            "Google Cloud Certified Professional Data Engineer",
            "Microsoft Certified: Fabric Data Engineer Associate"
          ],
          aiTopics: [
            "Incremental loads, CDC and late-arriving data",
            "Partitioning, clustering and file formats such as Parquet",
            "Orchestration design, dependencies and backfills",
            "Data contracts, testing and observability",
            "Warehouse cost and performance tuning"
          ],
          aiScenarios: [
            "A bank wants near-real-time updates from its core banking database into the warehouse without slowing the source. Walk me through your design.",
            "Your BigQuery bill doubled last month and finance wants answers. Walk me through how you would investigate and reduce it.",
            "Upstream developers renamed a column and three dashboards broke silently. Talk me through how you would prevent this in future."
          ],
          aiExpectations: "A ready mid-level engineer designs re-runnable incremental pipelines, reasons about partitioning, CDC and backfills, and treats data as code with tests and CI. Red flags are full reloads of huge tables by default, no monitoring, and no awareness of cost.",
          proQuestions: [
            { q: "Describe a production pipeline you own. How do you know when it is broken?", lookFor: "Monitoring, alerting, freshness and volume checks, on-call or escalation practice." },
            { q: "How would you backfill two years of data after fixing a transformation bug?", lookFor: "Partitioned, idempotent reprocessing, controlled parallelism, validation against old outputs and stakeholder communication." },
            { q: "Explain how you would implement change data capture from a PostgreSQL database.", lookFor: "Log-based CDC (e.g. Debezium with Kafka or managed tools), handling deletes, ordering and schema changes." },
            { q: "Tell me about a time you made a pipeline significantly faster or cheaper.", lookFor: "Measured baseline, specific changes such as partition pruning or file compaction, and quantified result." },
            { q: "How do you handle schema changes from source systems?", lookFor: "Data contracts, schema tests, alerting on drift, versioning and coordinated rollout with source owners." }
          ]
        },
        senior: {
          minYears: 5,
          focus: "Owns data platform architecture and engineering standards, leading engineers and aligning the platform with business and regulatory needs.",
          responsibilities: [
            "Design the data platform architecture across ingestion, storage, processing and serving",
            "Set engineering standards for testing, CI/CD, observability and documentation",
            "Lead data governance implementation including access control, lineage and NDPA 2023 compliance",
            "Plan platform capacity, reliability targets and cloud budget",
            "Mentor data engineers and lead technical design reviews"
          ],
          skills: [
            "Data platform architecture",
            "Lakehouse design",
            "Streaming architecture",
            "Data governance",
            "FinOps for data",
            "Technical leadership",
            "Reliability engineering"
          ],
          tools: ["Databricks", "Snowflake", "Apache Kafka", "Terraform", "Apache Airflow", "Kubernetes"],
          certifications: [
            "Google Cloud Certified Professional Data Engineer",
            "Databricks Certified Data Engineer Professional",
            "SnowPro Advanced: Data Engineer"
          ],
          aiTopics: [
            "Lakehouse versus warehouse architecture trade-offs",
            "Batch versus streaming design and exactly-once semantics",
            "Governance, access control, lineage and data residency",
            "Platform reliability, SLAs and incident response",
            "Build-versus-buy and cost strategy"
          ],
          aiScenarios: [
            "A fintech is outgrowing a single PostgreSQL reporting replica and wants a modern data platform. Walk me through the architecture you would propose and how you would migrate.",
            "Regulators require that customer data can be located and deleted on request across all systems. Walk me through how you would make the platform compliant.",
            "Data incidents keep reaching executives and trust in the platform is low. Talk me through how you would turn this around."
          ],
          aiExpectations: "A ready senior engineer designs coherent platforms with clear trade-offs, plans phased migrations and builds governance and reliability in from the start. Red flags are chasing tools without requirements, ignoring cost and compliance, and inability to lead others.",
          proQuestions: [
            { q: "Describe a data platform you architected or significantly changed. What trade-offs did you make?", lookFor: "Requirements-driven choices, alternatives considered, migration plan and measurable outcomes." },
            { q: "When would you choose streaming over micro-batch or batch?", lookFor: "Latency needs versus complexity and cost, exactly-once and ordering concerns, and operational burden." },
            { q: "How do you set and enforce data SLAs?", lookFor: "Freshness and quality SLOs agreed with consumers, monitoring, ownership, incident process and reviews." },
            { q: "Tell me about a major data incident you led. What happened and what changed afterwards?", lookFor: "Calm coordination, clear communication, blameless review and systemic fixes." },
            { q: "How have you developed engineers on your team?", lookFor: "Design reviews, pairing, ownership opportunities and examples of people they helped grow." }
          ]
        }
      },
      hrScenarios: [
        { q: "You accidentally deleted a production table late on a Friday. Nobody has noticed yet. What do you do?", lookFor: "Immediate honest disclosure, follows recovery procedure, communicates impact and contributes to prevention." },
        { q: "A business team insists on direct access to raw customer data including BVN and phone numbers for a quick analysis. How do you respond?", lookFor: "Upholds data protection and least privilege, explains why, and offers a compliant alternative such as masked or aggregated data." },
        { q: "During a power or network outage your on-call pipeline fails and the morning reports will be late. How do you handle communication?", lookFor: "Proactive status updates to stakeholders, realistic recovery time, workaround where possible and post-incident follow-up." }
      ],
      curriculum: {
        foundational: {
          title: "Data Engineering Foundations",
          summary: "An entry course in pipelines, SQL, Python, warehouses and orchestration basics for aspiring data engineers.",
          duration: "5 weeks",
          modules: [
            { type: "text", title: "The Data Engineering Landscape", content: "Data engineers make data available, reliable and usable. Data starts in source systems: core banking or ERP databases, mobile apps, payment gateways, CRM tools and partner files. It must be moved, cleaned and organised before analysts or models can use it.\n\nA modern data stack usually includes:\n- Ingestion: tools or scripts that extract data from sources (custom Python, Fivetran, Airbyte).\n- Storage: a cloud warehouse such as BigQuery or Snowflake, or a lakehouse on object storage with Databricks or Microsoft Fabric.\n- Transformation: SQL models, often managed with dbt.\n- Orchestration: a scheduler such as Apache Airflow that runs jobs in order.\n- Serving: BI tools, APIs and ML features.\n\nETL transforms data before loading; ELT loads raw data first and transforms inside the warehouse, which is now common because cloud warehouses are powerful.\n\nKey qualities of good pipelines: correct, repeatable, monitored, documented and cost-aware. In environments where power or connectivity can drop, designing jobs to resume safely is especially important.\n\nChecklist when receiving a new data source: owner, format, volume, update frequency, keys, sensitive fields and access approval." },
            { type: "text", title: "SQL and Python for Data Engineers", content: "Data engineers use SQL to transform and Python to glue systems together.\n\nSQL essentials beyond basics:\n- CTEs to structure logic.\n- ROW_NUMBER() OVER (PARTITION BY id ORDER BY updated_at DESC) to keep the latest version of each record.\n- MERGE (upsert) to update existing rows and insert new ones in one statement.\n- Data types and NULL handling, especially in joins.\n\nPython essentials:\n- requests for calling REST APIs, handling pagination and HTTP status codes.\n- pandas or polars for small to medium file processing.\n- Reading and writing CSV, JSON and Parquet.\n- Environment variables for secrets; never hard-code passwords or API keys in code.\n- Logging with the logging module rather than print.\n\nWorked example: extract daily transactions from a payment API. Loop through pages until no 'next' link, retry on 429 or 5xx responses with exponential backoff, write each day to a Parquet file named by date, then load it into a staging table.\n\nAlways write code into Git, use virtual environments, and keep functions small and testable." },
            { type: "text", title: "Warehouses, Lakes and Data Modelling", content: "A data warehouse stores structured, query-optimised data for analytics. BigQuery, Snowflake, Amazon Redshift and Azure Synapse or Fabric Warehouse are common. A data lake stores raw files cheaply in object storage such as Amazon S3, Google Cloud Storage or Azure Data Lake Storage. A lakehouse combines both using open table formats such as Delta Lake or Apache Iceberg, adding transactions and schema enforcement to files.\n\nColumnar formats like Parquet store data by column, so queries that read a few columns scan far less data and cost less.\n\nLayered design, often called medallion architecture:\n- Bronze or raw: data as received, kept for replay.\n- Silver or staging: cleaned, typed, deduplicated.\n- Gold or marts: business-ready tables such as star schemas for BI.\n\nDimensional modelling: fact tables hold events at a defined grain; dimension tables describe them.\n\nPartitioning splits a table by a column such as date so queries scan only relevant partitions. Clustering sorts data within partitions by frequently filtered columns.\n\nRule of thumb: keep raw data immutable, make every downstream table reproducible from it." },
            { type: "text", title: "Orchestration and Data Quality Basics", content: "Pipelines have many steps that depend on each other. Orchestrators like Apache Airflow define these as a DAG (directed acyclic graph) of tasks, for example: extract_transactions, then load_staging, then dbt_run, then dbt_test, then refresh_dashboard.\n\nGood orchestration practice:\n- Retries with delays for transient failures.\n- Alerts to email, Slack or Teams on failure.\n- Tasks that are idempotent: re-running for the same date produces the same result, typically by overwriting that date’s partition or using MERGE.\n- Parameterise runs by logical date so backfills are easy.\n\nData quality: test data like code. dbt provides built-in tests such as not_null, unique, accepted_values and relationships. Add freshness checks on sources and row-count comparisons between source and target.\n\nWorked example: a dbt model for customers declares customer_id as unique and not_null, and status in ('active','dormant','closed'). If a test fails, the DAG stops before bad data reaches dashboards.\n\nWhen something fails: read the task log, identify the failing step, fix the cause, then clear and re-run only the affected tasks." },
            { type: "quiz", title: "Data Engineering Foundations Check", questions: [
              { q: "What distinguishes ELT from ETL?", options: ["ELT never transforms data", "ELT loads raw data first and transforms inside the warehouse", "ELT only works with spreadsheets", "ELT requires streaming"], answer: 1 },
              { q: "Why is Parquet commonly used for analytics data?", options: ["It is human-readable", "It is required by Airflow", "Its columnar layout reduces data scanned for queries", "It stores data as images"], answer: 2 },
              { q: "A job is idempotent when:", options: ["Re-running it for the same input gives the same result", "It runs only once a year", "It never fails", "It uses no SQL"], answer: 0 },
              { q: "Which SQL pattern keeps only the latest record per customer?", options: ["SELECT DISTINCT *", "GROUP BY every column", "ORDER BY with LIMIT 1 on the whole table", "ROW_NUMBER partitioned by customer ordered by updated_at descending, keeping row 1"], answer: 3 },
              { q: "Where should API keys used by a pipeline be stored?", options: ["Hard-coded in the script", "In a secrets manager or environment variables", "In a public Git repository", "In the table comments"], answer: 1 },
              { q: "In a medallion architecture, which layer contains business-ready tables for BI?", options: ["Bronze", "Silver", "Gold", "Raw"], answer: 2 }
            ] },
            { type: "assignment", title: "Build a Daily Ingestion Pipeline", maxScore: 100, content: "Brief: build a small pipeline that ingests daily exchange rate or sample payment data from a public or provided API into PostgreSQL or BigQuery.\n\nDeliverables:\n1. A Python extract script with pagination or retry handling, logging and secrets in environment variables.\n2. A raw table and a cleaned staging table built with SQL or dbt, including at least three data tests.\n3. An Airflow DAG (or cron schedule with documentation) that runs extract, load, transform and test in order and is safe to re-run.\n4. A README explaining setup, design choices and how to backfill a date.\n\nGrading: correctness 35, idempotency and error handling 25, tests 20, code quality and documentation 20." }
          ]
        },
        intensive: {
          title: "Data Engineer Job-Ready Intensive",
          summary: "Job-ready depth in incremental pipelines, Spark, streaming, data platform operations and governance, ending in a level-aware capstone.",
          duration: "10 weeks",
          modules: [
            { type: "text", title: "Incremental Loads and Change Data Capture", content: "Full reloads become slow and expensive as data grows. Incremental strategies load only what changed.\n\nWatermark-based loads: track the maximum updated_at loaded so far and extract rows newer than it. Weaknesses: misses hard deletes and depends on reliable timestamps.\n\nChange data capture (CDC): read the database’s transaction log, such as the PostgreSQL write-ahead log or MySQL binlog, to capture inserts, updates and deletes in order with minimal load on the source. Debezium with Apache Kafka is a common open-source approach; managed options include AWS DMS, Google Datastream and Fivetran.\n\nApplying changes: land change events in a raw table, then MERGE into the target by primary key, using the latest event per key and handling delete flags.\n\nLate-arriving data: transactions may arrive days later, for example after a mobile-money provider’s reconciliation. Reprocess a rolling window of recent partitions rather than only today.\n\nSlowly changing dimensions Type 2 track history with valid_from and valid_to columns; dbt snapshots automate this.\n\nAlways reconcile: compare counts and sums between source and target per day." },
            { type: "text", title: "Distributed Processing with Spark", content: "Apache Spark processes large datasets in parallel across a cluster. Databricks, Amazon EMR, Google Dataproc and Microsoft Fabric all run Spark.\n\nKey concepts:\n- DataFrames are distributed tables; transformations such as filter, select and join are lazy and only run when an action such as write or count is called.\n- Data is split into partitions processed by executors in parallel.\n- Narrow transformations (filter, map) stay within a partition; wide transformations (groupBy, join) require a shuffle across the network, which is expensive.\n\nPerformance practices:\n- Filter and select columns early.\n- Broadcast small tables in joins to avoid shuffling the large table.\n- Watch for data skew, where one key such as a large merchant holds most rows; salting or adaptive query execution can help.\n- Avoid collecting large data to the driver.\n- Write output partitioned by date and avoid thousands of tiny files; compact with OPTIMIZE on Delta Lake.\n\nWorked example: join 500 million transactions to a 2,000-row merchant table. Broadcasting the merchant table removes the shuffle of the large table and can cut runtime dramatically. Check the Spark UI to confirm." },
            { type: "text", title: "Streaming Data Pipelines", content: "Streaming processes events continuously rather than in scheduled batches. Use it when the business genuinely needs low latency, such as fraud detection on card or transfer events, live inventory or operational alerts.\n\nApache Kafka is the most common event platform. Producers write events to topics; topics are split into partitions for parallelism; consumers in a consumer group read partitions and track offsets. Ordering is guaranteed only within a partition, so choose keys such as account_id carefully.\n\nProcessing engines include Spark Structured Streaming, Apache Flink and Kafka Streams. Important concepts:\n- Event time versus processing time.\n- Windows (tumbling, sliding, session) for aggregations.\n- Watermarks to decide how long to wait for late events.\n- Delivery guarantees: at-most-once, at-least-once and exactly-once. Many systems achieve effectively-once by combining at-least-once delivery with idempotent writes keyed by event ID.\n- Schema management with a schema registry and Avro or Protobuf.\n\nStreaming adds operational cost and complexity. Micro-batching every few minutes often satisfies needs more cheaply; agree latency requirements before choosing." },
            { type: "text", title: "Platform Operations, Governance and Cost", content: "Production data platforms need engineering discipline.\n\nCI/CD: store pipelines, dbt models and infrastructure in Git. Run linting, unit tests and dbt build on a pull request against a test environment. Deploy infrastructure with Terraform so environments are reproducible.\n\nObservability: monitor freshness, volume, schema changes and distribution shifts. Define SLAs with consumers, for example 'gold tables ready by 7am'. Maintain runbooks and an incident process.\n\nData contracts: agreements with source teams on schema, semantics and change notice, enforced by automated checks.\n\nGovernance and security: role-based access, least privilege, column masking for personal data such as BVN and phone numbers, encryption at rest and in transit, audit logs and lineage through tools such as Unity Catalog or OpenLineage. The NDPA 2023 requires lawful processing, purpose limitation and support for data subject requests, so know where personal data lives.\n\nCost (FinOps for data): partition and cluster tables, set query cost limits, auto-suspend warehouses, right-size clusters, delete unused tables and tag resources by team so spend is visible." },
            { type: "assignment", title: "CDC to Lakehouse Pipeline", maxScore: 100, content: "Brief: simulate a core banking accounts table in PostgreSQL and replicate its changes into a lakehouse or warehouse.\n\nDeliverables:\n1. A CDC or watermark-based extract capturing inserts, updates and deletes.\n2. Bronze, silver and gold layers using Spark or dbt with MERGE logic and a Type 2 history table.\n3. Orchestration with retries and alerting, plus a documented backfill procedure.\n4. A reconciliation report comparing source and target counts and balances.\n\nGrading: correctness of change handling 35, design and layering 25, reliability and tests 25, documentation 15." },
            { type: "quiz", title: "Intensive Check", questions: [
              { q: "What is a key weakness of watermark-based incremental loads compared to log-based CDC?", options: ["They cannot detect hard deletes", "They require Kafka", "They only work in Spark", "They always reload everything"], answer: 0 },
              { q: "Which Spark operation usually causes a shuffle?", options: ["filter", "select", "groupBy aggregation", "withColumn"], answer: 2 },
              { q: "Joining a huge fact table to a small lookup table in Spark is best optimised by:", options: ["Repartitioning both to one partition", "Collecting the fact table to the driver", "Disabling adaptive query execution", "Broadcasting the small table"], answer: 3 },
              { q: "In Kafka, ordering of events is guaranteed:", options: ["Across all topics", "Within a single partition", "Only for consumers in different groups", "Never"], answer: 1 },
              { q: "What is the purpose of a watermark in stream processing?", options: ["To bound how long to wait for late events before finalising windows", "To encrypt events", "To compress messages", "To rename topics"], answer: 0 },
              { q: "Which practice most directly reduces scanned-bytes cost in a cloud warehouse?", options: ["Using SELECT * everywhere", "Partitioning tables and filtering on the partition column", "Running queries more often", "Disabling caching"], answer: 1 }
            ] },
            { type: "assignment", title: "Capstone: Payments Data Platform", maxScore: 100, content: "Shared brief: a Nigerian payments company processes card, transfer and mobile-money transactions and needs a reliable platform for finance reporting, fraud analytics and regulatory requests.\nJunior: build a batch pipeline that ingests daily transaction files and an API source into a warehouse, with dbt staging and mart models, tests and an Airflow DAG.\nMid: add CDC from the transactions database, incremental MERGE models, late-arriving data handling, CI/CD and cost-aware partitioning, plus a backfill runbook.\nSenior: design the end-to-end platform architecture including streaming for fraud signals, governance and masking for personal data under NDPA 2023, SLAs, observability, Terraform environments and a phased migration and budget plan.\nDeliverables: code repository, architecture diagram, runbook and a short design document.\nGrading: correctness and reliability 35, design quality 25, governance and cost awareness 20, communication and level-appropriate depth 20." }
          ]
        }
      }
    },
    {
      id: "scientist",
      title: "Data Scientist",
      summary: "Data Scientists use statistics and machine learning to predict outcomes, detect patterns and measure the impact of decisions. They work alongside analysts, data engineers and product teams, taking problems from framing through modelling to deployment and monitoring.",
      competencies: [
        { name: "Statistics and experimentation", weight: 20, description: "Applies probability, inference and experimental design correctly to quantify uncertainty and impact." },
        { name: "Machine learning modelling", weight: 25, description: "Selects, trains, tunes and validates appropriate ML models without leakage or overfitting." },
        { name: "Data wrangling and feature engineering", weight: 20, description: "Prepares data and builds informative, leakage-free features from raw sources using Python and SQL." },
        { name: "Model evaluation and responsible AI", weight: 15, description: "Chooses metrics that reflect business costs and checks fairness, explainability and robustness." },
        { name: "MLOps and deployment", weight: 20, description: "Packages, deploys, monitors and retrains models using reproducible, version-controlled workflows." }
      ],
      levels: {
        junior: {
          minYears: 0,
          focus: "Builds and evaluates well-scoped models and analyses with guidance, producing reproducible notebooks and clear results.",
          responsibilities: [
            "Explore and clean datasets and document data quality issues",
            "Engineer features and train baseline models with scikit-learn",
            "Evaluate models with appropriate metrics and cross-validation",
            "Write reproducible notebooks and scripts under version control",
            "Present model results and limitations to the team"
          ],
          skills: [
            "Python pandas",
            "Exploratory data analysis",
            "scikit-learn modelling",
            "Regression and classification",
            "Cross-validation",
            "SQL querying",
            "Data visualisation"
          ],
          tools: ["Python", "Jupyter", "scikit-learn", "pandas", "SQL (PostgreSQL)", "Git"],
          certifications: [
            "IBM Data Science Professional Certificate",
            "Microsoft Certified: Azure AI Fundamentals"
          ],
          aiTopics: [
            "Train, validation and test splits and overfitting",
            "Regression versus classification and baseline models",
            "Classification metrics: precision, recall, ROC AUC",
            "Handling missing values and categorical features",
            "Exploratory analysis and communicating results"
          ],
          aiScenarios: [
            "You are asked to predict which customers of a telco will churn next month using 12 months of usage data. Walk me through your first steps.",
            "Your model shows 98% accuracy on a fraud dataset where only 1% of transactions are fraudulent. Walk me through whether this is good.",
            "Your test score is much worse than your training score. Talk me through what might be happening and what you would try."
          ],
          aiExpectations: "A ready junior structures a modelling problem, uses proper splits and baselines and chooses metrics suited to the data. Red flags are relying on accuracy for imbalanced classes, evaluating on training data and being unable to explain a model’s limitations.",
          proQuestions: [
            { q: "Walk me through a modelling project you completed, from data to result.", lookFor: "Problem framing, data preparation, baseline, model choice, evaluation method and honest limitations." },
            { q: "How would you detect and reduce overfitting?", lookFor: "Compare train and validation performance, cross-validation, regularisation, simpler models, more data or fewer features." },
            { q: "When would you prefer recall over precision?", lookFor: "When missing positives is costly, e.g. fraud or disease screening, with the trade-off explained." },
            { q: "How do you handle a categorical column with hundreds of values?", lookFor: "Options such as grouping rare categories, target or frequency encoding with leakage care, or models handling categories natively." },
            { q: "Tell me about a time your analysis or model did not work as expected. What did you learn?", lookFor: "Honest reflection, debugging approach and concrete change in practice." }
          ]
        },
        mid: {
          minYears: 2,
          focus: "Owns data science projects end to end, from framing with stakeholders to a deployed, monitored model with measured impact.",
          responsibilities: [
            "Frame business problems as modelling or experimentation tasks with success metrics",
            "Build and tune gradient boosting and other models with robust validation",
            "Deploy models with engineers as batch jobs or APIs and set up monitoring",
            "Design and analyse experiments to measure model impact in production",
            "Explain models to stakeholders and review junior data scientists’ work"
          ],
          skills: [
            "Gradient boosting models",
            "Feature engineering",
            "Hyperparameter tuning",
            "Model explainability (SHAP)",
            "Experiment design",
            "Model deployment",
            "Time series forecasting"
          ],
          tools: ["XGBoost", "LightGBM", "MLflow", "Docker", "FastAPI", "Databricks"],
          certifications: [
            "Microsoft Certified: Azure Data Scientist Associate",
            "Databricks Certified Machine Learning Associate",
            "AWS Certified Machine Learning Engineer – Associate"
          ],
          aiTopics: [
            "Data leakage and time-based validation",
            "Gradient boosting, tuning and calibration",
            "Cost-sensitive metrics and threshold selection",
            "Explainability and fairness checks",
            "Deployment patterns and model monitoring"
          ],
          aiScenarios: [
            "A digital lender wants a credit scoring model for first-time borrowers using mobile and transaction data. Walk me through how you would build and validate it.",
            "A demand forecasting model performed well in testing but is badly off three months after deployment. Walk me through how you would investigate.",
            "The fraud team says your model flags too many genuine customers. Talk me through how you would adjust it."
          ],
          aiExpectations: "A ready mid-level data scientist spots leakage, validates in a way that mirrors production, ties thresholds to business costs and plans for monitoring. Red flags are random splits on time-dependent data, tuning on the test set and no plan beyond the notebook.",
          proQuestions: [
            { q: "Tell me about a model you deployed. How did you measure its business impact?", lookFor: "Clear success metric, controlled comparison or experiment, quantified result and monitoring in place." },
            { q: "How do you choose a classification threshold for a fraud or credit model?", lookFor: "Uses costs of false positives and negatives, precision-recall curves, calibration and stakeholder input." },
            { q: "Give an example of data leakage you found or prevented.", lookFor: "Concrete feature or split that leaked future or target information and how it was fixed." },
            { q: "How would you explain a gradient boosting model’s decision to a loan officer?", lookFor: "SHAP or similar local explanations translated into plain reasons, with caveats." },
            { q: "How do you detect when a deployed model needs retraining?", lookFor: "Monitoring of input drift, prediction distribution and performance once labels arrive, with alert thresholds and a retraining process." }
          ]
        },
        senior: {
          minYears: 5,
          focus: "Leads the data science agenda for a domain, setting technical standards, owning high-impact models and mentoring the team.",
          responsibilities: [
            "Set the data science roadmap with product and business leaders",
            "Own high-risk models such as credit, fraud or pricing including governance and validation",
            "Define standards for experimentation, model review and responsible AI",
            "Lead MLOps practices with engineering for reproducible training and deployment",
            "Mentor data scientists and lead technical reviews"
          ],
          skills: [
            "ML system design",
            "Causal inference",
            "Model risk governance",
            "Responsible AI",
            "MLOps strategy",
            "Technical leadership",
            "Stakeholder influence"
          ],
          tools: ["Databricks", "MLflow", "Vertex AI", "Amazon SageMaker", "Kubernetes", "Evidently AI"],
          certifications: [
            "Google Cloud Certified Professional Machine Learning Engineer",
            "Databricks Certified Machine Learning Professional",
            "Microsoft Certified: Azure Data Scientist Associate"
          ],
          aiTopics: [
            "ML system design end to end",
            "Causal inference and uplift modelling",
            "Model risk management, fairness and regulation",
            "When to use LLMs and generative AI versus classical ML",
            "Prioritising a data science portfolio by value"
          ],
          aiScenarios: [
            "A bank wants to replace its rule-based fraud system with machine learning across card and transfer channels. Walk me through the system you would design and how you would roll it out safely.",
            "A credit model appears to approve applicants from some states at much lower rates. Walk me through how you would investigate and respond.",
            "Leadership wants to 'add AI everywhere' and has asked you for a plan. Talk me through how you would decide what to build."
          ],
          aiExpectations: "A ready senior data scientist designs complete ML systems, rigorously separates causation from correlation and builds governance into high-stakes models. Red flags are chasing complex models without business value, ignoring fairness and regulatory risk, and no plan for operating models over time.",
          proQuestions: [
            { q: "Describe the most impactful ML system you led. What made it succeed?", lookFor: "Problem selection, cross-team delivery, measured impact and lessons on operating the system." },
            { q: "How would you decide whether to target a retention offer using a churn model or an uplift model?", lookFor: "Churn predicts risk while uplift predicts response to treatment; needs experimental data; explains business implications." },
            { q: "How do you govern a model that makes lending decisions?", lookFor: "Documentation, independent validation, fairness testing, explainability, monitoring, human oversight and compliance with NDPA 2023 and lender regulations." },
            { q: "When would you recommend an LLM-based solution versus a classical model?", lookFor: "Unstructured text or generation tasks versus structured prediction; cost, latency, evaluation and risk trade-offs." },
            { q: "How have you raised the standard of a data science team?", lookFor: "Review practices, shared tooling, mentoring and concrete improvements in quality or delivery." }
          ]
        }
      },
      hrScenarios: [
        { q: "A product manager wants you to report the model’s best test result rather than the more realistic one before a funding pitch. What do you do?", lookFor: "Maintains integrity, explains the risk of overstating, and offers an honest framing of results and potential." },
        { q: "You discover your deployed model disadvantages a group of customers. Nobody else has noticed. How do you proceed?", lookFor: "Raises it promptly, quantifies the issue, proposes mitigation and involves the right governance owners." },
        { q: "A business team rejects your model because they trust their experience more. How would you handle it?", lookFor: "Listens to their knowledge, explains the model simply, proposes a fair side-by-side test and builds trust collaboratively." }
      ],
      curriculum: {
        foundational: {
          title: "Data Science Foundations",
          summary: "An entry course in Python, statistics, exploratory analysis and first machine learning models for aspiring data scientists.",
          duration: "5 weeks",
          modules: [
            { type: "text", title: "The Data Science Workflow", content: "Data science uses data to predict, explain or optimise. Most projects follow a cycle similar to CRISP-DM:\n1. Business understanding: what decision will the model support and how will success be measured? 'Reduce loan defaults' becomes 'rank applicants by probability of 30-day default so we can approve more good borrowers'.\n2. Data understanding: what data exists, who owns it, and is it allowed to be used? Personal data in Nigeria is governed by the NDPA 2023.\n3. Data preparation: cleaning, joining and creating features.\n4. Modelling: start with a simple baseline, then try stronger models.\n5. Evaluation: test on data the model has never seen and judge against the business goal.\n6. Deployment and monitoring: make predictions available and watch performance over time.\n\nTypes of problems: regression predicts a number (sales next week), classification predicts a category (default or not), clustering groups similar items without labels, and forecasting predicts values over time.\n\nA good data scientist spends more time on framing and data than on algorithms. Checklist: decision, target variable, prediction time, available features at that time, success metric." },
            { type: "text", title: "Python and Exploratory Data Analysis", content: "Python is the main language for data science. Core libraries: pandas for tables, NumPy for arrays, matplotlib and seaborn for charts, scikit-learn for models.\n\nExploratory data analysis (EDA) means understanding the data before modelling:\n- Shape and types: df.shape, df.info().\n- Missing values: df.isna().mean() shows the proportion missing per column.\n- Distributions: histograms for numeric columns, value_counts for categories.\n- Relationships: scatter plots, correlation matrices and grouped averages of the target by feature.\n- Target balance: in fraud or default problems the positive class is often rare.\n\nWorked example: for a telco churn dataset, compare churn rate by tenure band, plan type and number of support calls. You may see churn highest among customers with under three months’ tenure and frequent call drops, which suggests features to build.\n\nCorrelation is not causation: customers who use a feature may churn less because they were already engaged.\n\nKeep EDA reproducible: one notebook that runs top to bottom, with notes on each finding and every data issue discovered." },
            { type: "text", title: "Statistics for Data Science", content: "Statistics lets you reason about uncertainty.\n\nDistributions: many business quantities are skewed (incomes, transaction sizes). Describe them with medians and percentiles and consider log transforms.\n\nSampling and estimation: a sample mean varies from sample to sample. The standard error measures this; a 95% confidence interval gives a plausible range for the true value.\n\nHypothesis testing: start with a null hypothesis (no difference), compute a test statistic and p-value. A small p-value suggests the observed difference is unlikely under the null. It does not measure the size or importance of the effect.\n\nCommon tests: t-test for comparing means, chi-square for proportions across categories, and two-proportion z-test for conversion rates.\n\nCorrelation measures linear association between -1 and 1; it can be driven by outliers and says nothing about causation.\n\nBase rates matter: if 1% of transactions are fraud, a test that flags 5% of transactions will mostly flag genuine customers even if it catches nearly all fraud.\n\nLinear regression estimates how a target changes with features; check residuals and avoid extrapolating beyond the data range." },
            { type: "text", title: "Your First Machine Learning Models", content: "Supervised learning learns a mapping from features to a known target.\n\nSplit data first: a training set to fit the model, a validation set or cross-validation to choose settings, and a test set held back for a final, honest estimate. For time-based problems, split by time so the model never sees the future.\n\nAlways build a baseline: predicting the average for regression or the majority class for classification. A model is useful only if it beats this.\n\nCommon models in scikit-learn:\n- Linear and logistic regression: simple, interpretable.\n- Decision trees: capture non-linear rules but overfit easily.\n- Random forests and gradient boosting: strong performance on tabular data.\n\nPipelines combine preprocessing and model so the same steps apply in training and prediction, which prevents leakage:\nPipeline([('impute', SimpleImputer()), ('scale', StandardScaler()), ('model', LogisticRegression())])\n\nMetrics: MAE and RMSE for regression; for classification use a confusion matrix, precision, recall, F1 and ROC AUC. Accuracy is misleading on imbalanced data.\n\nOverfitting shows as high training but low validation performance; fix it with simpler models, regularisation or more data." },
            { type: "quiz", title: "Data Science Foundations Check", questions: [
              { q: "Predicting next month’s sales value for each branch is which type of problem?", options: ["Classification", "Regression", "Clustering", "Dimensionality reduction"], answer: 1 },
              { q: "Why is accuracy misleading on a dataset where 1% of cases are fraud?", options: ["Accuracy cannot be computed for fraud", "Accuracy only works for regression", "A model predicting 'not fraud' for everything scores 99%", "Fraud data has no labels"], answer: 2 },
              { q: "What is the main purpose of a held-out test set?", options: ["To give an unbiased final estimate of performance on unseen data", "To train the model faster", "To tune hyperparameters repeatedly", "To store missing values"], answer: 0 },
              { q: "A model scores 0.99 on training data and 0.70 on validation data. What is most likely?", options: ["Underfitting", "Perfect generalisation", "A data type error", "Overfitting"], answer: 3 },
              { q: "Which statement about a p-value is correct?", options: ["It is the probability the null hypothesis is true", "It is the probability of data at least this extreme if the null hypothesis were true", "It measures the effect size", "It must always be below 0.01"], answer: 1 },
              { q: "Why use a scikit-learn Pipeline for preprocessing and modelling?", options: ["It makes models more complex", "It removes the need for test data", "It applies identical preprocessing in training and prediction and reduces leakage", "It automatically collects more data"], answer: 2 }
            ] },
            { type: "assignment", title: "Customer Churn Prediction", maxScore: 100, content: "Brief: using the provided telco subscriber dataset, build a model that predicts which customers will churn next month.\n\nDeliverables:\n1. An EDA notebook with at least five documented findings and data quality notes.\n2. A baseline and two models (for example logistic regression and random forest) built with scikit-learn pipelines and cross-validation.\n3. Evaluation using a confusion matrix, precision, recall and ROC AUC on a held-out test set, with a justified threshold.\n4. A one-page summary for a non-technical manager with key drivers and limitations.\n\nGrading: methodology and validation 35, model performance and evaluation 25, EDA quality 20, communication 20." }
          ]
        },
        intensive: {
          title: "Data Scientist Job-Ready Intensive",
          summary: "Job-ready depth in feature engineering, gradient boosting, evaluation, experimentation and MLOps, ending in a level-aware capstone.",
          duration: "10 weeks",
          modules: [
            { type: "text", title: "Feature Engineering and Data Leakage", content: "On tabular problems, good features usually matter more than model choice.\n\nUseful feature types:\n- Aggregates over windows: number of transactions in the last 7 and 30 days, average airtime top-up, days since last login.\n- Ratios and trends: this month’s spend versus the 3-month average.\n- Categorical encodings: one-hot for few categories; target encoding for many, computed within cross-validation folds.\n- Date features: day of week, month-end flags, salary-day effects.\n- Text or behavioural signals where allowed.\n\nData leakage is when a feature contains information unavailable at prediction time. It produces excellent offline scores and poor real results. Examples: using 'days in arrears' to predict default when arrears happen after default; computing customer averages over the full history including the future; scaling data before splitting.\n\nPrevent leakage by defining a prediction timestamp for each row and building every feature only from data before it. Use time-based splits for temporal problems and fit all preprocessing inside pipelines.\n\nCheck suspicious features: if one feature alone gives near-perfect performance, investigate before celebrating." },
            { type: "text", title: "Gradient Boosting and Model Tuning", content: "Gradient boosted trees, implemented in XGBoost, LightGBM and CatBoost, are the standard for structured data. They build many shallow trees sequentially, each correcting errors of the previous ones.\n\nKey hyperparameters:\n- learning_rate and number of trees: lower rates need more trees but generalise better.\n- max_depth or num_leaves: controls complexity.\n- min_child_samples or min_child_weight: prevents tiny leaves.\n- subsample and colsample: add randomness to reduce overfitting.\n- Regularisation terms (lambda, alpha).\n\nUse early stopping on a validation set to choose the number of trees. Tune with randomised search or Bayesian optimisation such as Optuna, always using cross-validation or a time-based validation scheme and never the test set.\n\nImbalanced classes: use class weights or scale_pos_weight, and evaluate with precision-recall AUC rather than accuracy.\n\nCalibration: predicted probabilities from boosting may be miscalibrated. If decisions depend on probabilities, such as expected loss in lending, calibrate with isotonic or Platt scaling and check reliability curves.\n\nTrack every experiment, its parameters, data version and metrics with MLflow so results are reproducible." },
            { type: "text", title: "Evaluation, Explainability and Responsible AI", content: "A model is good only if it improves decisions.\n\nThreshold selection: choose a cut-off using the business cost of errors. In fraud, a false negative loses money; a false positive annoys a genuine customer and may block a salary transfer. Plot precision and recall against threshold and pick the point that minimises expected cost or meets a review-team capacity.\n\nEvaluate by segment: check performance across regions, channels, new versus existing customers and other relevant groups. A strong average can hide weak segments.\n\nExplainability: global feature importance shows overall drivers; SHAP values explain individual predictions, which helps loan officers and customers understand decisions and helps you find bugs.\n\nFairness: compare approval rates, error rates and calibration across groups. Avoid proxies for protected characteristics without justification. Document the model in a model card: purpose, data, performance, limitations and owners.\n\nPrivacy: under the NDPA 2023 use personal data only for stated purposes, minimise features and support human review where automated decisions significantly affect people.\n\nRobustness: test how predictions change with missing or unusual inputs." },
            { type: "text", title: "Experimentation and MLOps", content: "Offline metrics do not prove business impact. Measure it with an experiment: route a random share of traffic to the new model and compare business outcomes such as default rate or fraud losses against the current approach, with guardrails like customer complaints.\n\nMLOps makes models reliable in production:\n- Reproducibility: code in Git, data and model versions tracked, environments defined in requirements files or Docker.\n- Training pipelines orchestrated with Airflow, Databricks Workflows or Vertex AI Pipelines.\n- Model registry (MLflow) with stages and approvals.\n- Serving: batch scoring writes predictions to a table on a schedule; online serving exposes an API, for example with FastAPI, for real-time decisions.\n- Feature consistency: compute features the same way in training and serving, ideally with a feature store.\n\nMonitoring:\n- Data drift: input distributions change, for example after a new product launch.\n- Prediction drift: scores shift.\n- Performance: once labels arrive, track precision, recall or error.\n\nSet alert thresholds and a retraining process. Batch scoring is often simpler and more resilient where connectivity is unreliable; choose online serving only when decisions must be real time." },
            { type: "assignment", title: "Credit Default Model", maxScore: 100, content: "Brief: using the provided digital lending dataset with loan applications, repayment history and mobile transaction aggregates, build a 30-day default prediction model.\n\nDeliverables:\n1. Leakage-free features built relative to the application date, with a time-based train, validation and test split.\n2. A tuned LightGBM or XGBoost model tracked in MLflow, compared against a logistic regression baseline.\n3. Calibration analysis, a cost-based threshold and SHAP explanations.\n4. A fairness check across at least two customer segments and a short model card.\n\nGrading: validation and leakage prevention 35, model quality 25, evaluation and explainability 25, documentation 15." },
            { type: "quiz", title: "Intensive Check", questions: [
              { q: "Which feature would most likely cause leakage in a loan default model scored at application time?", options: ["Applicant’s age", "Number of transactions in the 30 days before application", "Number of days the loan was in arrears", "Device type used to apply"], answer: 2 },
              { q: "What does early stopping do in gradient boosting?", options: ["Stops adding trees when validation performance stops improving", "Removes features automatically", "Balances the classes", "Calibrates probabilities"], answer: 0 },
              { q: "For a highly imbalanced fraud problem, which metric is generally most informative?", options: ["Accuracy", "R-squared", "Mean absolute error", "Precision-recall AUC"], answer: 3 },
              { q: "What are SHAP values mainly used for?", options: ["Speeding up training", "Explaining the contribution of features to individual predictions", "Splitting data by time", "Compressing models"], answer: 1 },
              { q: "Input feature distributions in production shift after a new product launch. This is called:", options: ["Overfitting", "Data drift", "Calibration", "Regularisation"], answer: 1 },
              { q: "What is the strongest way to measure a new model’s business impact?", options: ["Higher cross-validation AUC", "Lower training loss", "A randomised controlled comparison against the current approach", "More features"], answer: 2 }
            ] },
            { type: "assignment", title: "Capstone: Fraud Detection System", maxScore: 100, content: "Shared brief: a Nigerian fintech processing card, transfer and mobile-money payments wants to reduce fraud losses without blocking too many genuine customers. You receive labelled transaction history, customer and device data.\nJunior: perform EDA, build leakage-free features, train and compare a baseline and a gradient boosting model, and choose a threshold with a confusion matrix analysis.\nMid: add time-based validation, tuning with MLflow tracking, calibration, SHAP explanations, a batch or API scoring service in Docker and a drift monitoring plan.\nSenior: design the full ML system including real-time and batch components, feedback loops from investigations, an A/B rollout plan, fairness and NDPA 2023 governance, model risk documentation and a team roadmap.\nDeliverables: code repository, model card, evaluation report and a 10-slide presentation.\nGrading: methodology and validation 30, model quality 25, deployment and governance 25, communication and level-appropriate depth 20." }
          ]
        }
      }
    }
  ]
};

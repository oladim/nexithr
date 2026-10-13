// NexIT-Africa role catalog — Cloud & DevOps area
export default {
  key: "cloud",
  title: "Cloud & DevOps",
  summary: "Roles that build, automate, run and scale the infrastructure software lives on — from cloud accounts and networks to CI/CD pipelines, Kubernetes platforms and production reliability. Teams in banks, telcos, fintechs and SaaS companies rely on these engineers to ship safely and keep services up despite real-world constraints.",
  roles: [
    {
      id: "cloud",
      title: "Cloud Engineer",
      summary: "Designs, provisions and operates infrastructure on public cloud platforms such as AWS, Azure and Google Cloud — networks, compute, storage, identity and cost controls. Sits between application teams and security/finance, turning requirements into secure, well-governed cloud environments, increasingly defined as code.",
      competencies: [
        { name: "Cloud networking & architecture", weight: 25, description: "Designs VPC/VNet layouts, subnets, routing, load balancing and hybrid connectivity that are secure and resilient." },
        { name: "Identity & security controls", weight: 20, description: "Applies least-privilege IAM, encryption, secrets management and guardrails aligned with frameworks and the NDPA 2023." },
        { name: "Infrastructure as code", weight: 20, description: "Provisions and changes infrastructure reproducibly with Terraform, Bicep or CloudFormation, with review and state hygiene." },
        { name: "Compute, storage & data services", weight: 20, description: "Selects and configures VMs, containers, serverless, object/block storage and managed databases for workload needs." },
        { name: "Cost & operations management", weight: 15, description: "Monitors, tags, right-sizes and budgets cloud resources and handles backup, patching and day-two operations." }
      ],
      levels: {
        junior: {
          minYears: 0,
          focus: "Trusted to provision and maintain standard cloud resources from documented patterns under review.",
          responsibilities: [
            "Provision VMs, storage buckets and databases from approved templates or Terraform modules",
            "Manage IAM users, groups and role assignments following least-privilege tickets",
            "Monitor resource health, alerts and budgets and escalate anomalies",
            "Apply OS patches, backups and snapshot schedules to cloud workloads",
            "Document environments and keep runbooks and diagrams up to date"
          ],
          skills: [
            "Linux administration",
            "VPC and subnet basics",
            "IAM roles and policies",
            "Terraform basics",
            "Bash scripting",
            "Cloud monitoring dashboards",
            "Backup and snapshots"
          ],
          tools: ["AWS Management Console", "Azure Portal", "Terraform", "AWS CLI", "Git", "Amazon CloudWatch"],
          certifications: ["AWS Certified Cloud Practitioner", "Microsoft Certified: Azure Fundamentals (AZ-900)", "AWS Certified Solutions Architect – Associate"],
          aiTopics: [
            "Core cloud service models (IaaS, PaaS, SaaS) and shared responsibility",
            "VPC/VNet basics: subnets, CIDR, route tables, security groups",
            "IAM fundamentals: users, roles, policies and least privilege",
            "Storage types: object, block and file, and when to use each",
            "Basic Linux and command-line troubleshooting on cloud VMs"
          ],
          aiScenarios: [
            "A developer cannot SSH into a new EC2 instance in a private subnet. Walk me through how you would diagnose it.",
            "Your team’s monthly cloud bill jumped noticeably overnight. What do you check first and how?",
            "You are asked to give a contractor read access to one S3 bucket only. How would you set that up safely?"
          ],
          aiExpectations: "A ready junior explains networking and IAM basics accurately, troubleshoots systematically (security groups, routes, keys) and knows when to escalate. Red flags include granting admin rights to “make it work”, confusing public and private subnets, or no awareness of cost.",
          proQuestions: [
            { q: "Walk me through a cloud resource you provisioned end to end — what did you set up and how did you verify it?", lookFor: "Concrete services, networking and access decisions, plus a verification step such as testing connectivity or checking logs." },
            { q: "Explain the difference between a security group and a network ACL and when you would use each.", lookFor: "Stateful vs stateless, instance vs subnet level, and a sensible example of each." },
            { q: "Tell me about a time you broke or nearly broke something in a cloud or lab environment. What happened next?", lookFor: "Ownership, how they recovered, and a specific lesson such as using plan/review or snapshots first." },
            { q: "How would you structure Terraform for a simple web app with a VM, a database and a bucket?", lookFor: "Separate resources/variables/outputs, remote state awareness, and not hardcoding secrets." },
            { q: "How do you keep track of cost on resources you create?", lookFor: "Tagging, budgets/alerts, shutting down unused resources and right-sizing awareness." }
          ]
        },
        mid: {
          minYears: 2,
          focus: "Trusted to design and own production cloud environments for a product or team with minimal supervision.",
          responsibilities: [
            "Design multi-AZ network and compute layouts for production workloads",
            "Build and maintain reusable Terraform modules with code review and remote state",
            "Implement centralized logging, monitoring and alerting for cloud services",
            "Set up hybrid connectivity (site-to-site VPN or private links) to on-prem systems",
            "Lead cost-optimization reviews using tagging, reservations and right-sizing"
          ],
          skills: [
            "Multi-AZ architecture design",
            "Terraform module design",
            "Hybrid VPN connectivity",
            "Secrets management",
            "Container hosting (ECS/AKS)",
            "Cloud cost optimization",
            "Disaster recovery planning"
          ],
          tools: ["Terraform", "AWS Systems Manager", "Azure Monitor", "HashiCorp Vault", "GitHub Actions", "Amazon EKS"],
          certifications: ["AWS Certified Solutions Architect – Associate", "Microsoft Certified: Azure Administrator Associate (AZ-104)", "HashiCorp Certified: Terraform Associate (004)"],
          aiTopics: [
            "High availability across availability zones and regions",
            "Terraform state management, modules and drift",
            "Hybrid networking: VPN, Direct Connect/ExpressRoute, DNS resolution",
            "Encryption at rest and in transit, KMS and secrets handling",
            "Backup, RPO/RTO and disaster recovery strategies"
          ],
          aiScenarios: [
            "A payments API must survive the loss of one availability zone. Design the network and compute layout and explain the failover path.",
            "Terraform plan shows unexpected changes to a production database. Walk me through how you investigate and proceed.",
            "An on-prem core banking system in Lagos must be reached privately from your cloud VPC over an unreliable link. How would you design and monitor it?"
          ],
          aiExpectations: "A ready mid-level engineer designs for failure, explains trade-offs between cost, availability and complexity, and treats IaC state and secrets carefully. Red flags include single-AZ production designs, manual console changes on managed resources, or no DR thinking.",
          proQuestions: [
            { q: "Describe a production environment you designed. What availability and security decisions did you make and why?", lookFor: "Multi-AZ reasoning, segmentation, IAM boundaries and explicit trade-offs tied to business needs." },
            { q: "How do you organise Terraform across environments and teams?", lookFor: "Modules, per-environment state, remote backends with locking, PR-based plans and drift handling." },
            { q: "Tell me about a cost reduction you delivered. How did you find it and measure the impact?", lookFor: "Data-driven discovery (cost explorer, tags), concrete actions, and measured before/after without breaking reliability." },
            { q: "How would you meet NDPA 2023 expectations for personal data stored in the cloud?", lookFor: "Data classification, encryption, access controls, logging, data residency/transfer awareness and retention." },
            { q: "Walk me through a DR test you ran or would run for a critical workload.", lookFor: "Defined RPO/RTO, realistic failover steps, validation and a written outcome with fixes." }
          ]
        },
        senior: {
          minYears: 5,
          focus: "Trusted to set cloud architecture, governance and landing-zone standards across the organisation and mentor others.",
          responsibilities: [
            "Design and own the multi-account/subscription landing zone and guardrails",
            "Set cloud security, tagging, cost and compliance policies with security and finance",
            "Lead architecture reviews and migrations of critical systems to the cloud",
            "Define DR and multi-region strategy for tier-1 services",
            "Mentor engineers and build reusable patterns and paved-road modules"
          ],
          skills: [
            "Landing zone design",
            "Cloud governance policies",
            "Migration strategy",
            "Multi-region architecture",
            "FinOps practices",
            "Policy as code",
            "Technical mentorship"
          ],
          tools: ["AWS Control Tower", "Azure Policy", "Terraform Cloud", "AWS Organizations", "Open Policy Agent", "Microsoft Defender for Cloud"],
          certifications: ["AWS Certified Solutions Architect – Professional", "Microsoft Certified: Azure Solutions Architect Expert", "Google Cloud Professional Cloud Architect"],
          aiTopics: [
            "Landing zones, account/subscription structure and organisational guardrails",
            "Migration strategies (rehost, replatform, refactor) and sequencing",
            "Multi-region active-active vs active-passive trade-offs",
            "Governance: policy as code, compliance evidence, NDPA and CBN expectations",
            "FinOps operating model and unit economics"
          ],
          aiScenarios: [
            "A Nigerian bank wants to move its customer-facing apps to the cloud while keeping regulators satisfied. Design the landing zone and migration plan.",
            "Ten product teams each created their own cloud accounts with no standards. How do you bring them under governance without halting delivery?",
            "Leadership asks whether to go multi-region for a mobile-money platform. How do you frame and make the decision?"
          ],
          aiExpectations: "A ready senior frames architecture around business risk, regulation and cost, designs guardrails that enable teams, and can lead a phased migration. Red flags include tool-first answers, ignoring compliance or data residency, or designs no team could realistically operate.",
          proQuestions: [
            { q: "Describe a landing zone or cloud foundation you designed. How did it evolve as adoption grew?", lookFor: "Account structure, network hub design, guardrails, identity federation and lessons from real adoption." },
            { q: "Tell me about a migration you led. How did you sequence workloads and manage risk?", lookFor: "Discovery, wave planning, rollback criteria, stakeholder management and measured outcomes." },
            { q: "How do you enforce standards without becoming a bottleneck?", lookFor: "Policy as code, paved-road modules, self-service with automated checks and clear exception processes." },
            { q: "Give an example of an architecture decision you reversed. What evidence changed your mind?", lookFor: "Intellectual honesty, data-driven reassessment and how the change was communicated and executed." },
            { q: "How have you grown other cloud engineers on your team?", lookFor: "Specific mentoring practices such as design reviews, pairing and delegated ownership, with an example outcome." }
          ]
        }
      },
      hrScenarios: [
        { q: "Tell me about a time a stakeholder pushed you to bypass a security control to meet a deadline. What did you do?", lookFor: "Holds the line on risk while offering a safe alternative and communicates clearly with the stakeholder." },
        { q: "Describe a situation where you had to explain a cloud cost overrun to non-technical managers.", lookFor: "Takes ownership, explains causes plainly, and presents a concrete remediation plan." },
        { q: "Tell me about a time you inherited a poorly documented environment. How did you handle it?", lookFor: "Methodical discovery, documentation, and improving things without blaming previous owners." }
      ],
      curriculum: {
        foundational: {
          title: "Cloud Engineering Foundations",
          summary: "A practical introduction to cloud computing for career-switchers and new engineers: core services, networking, identity and cost. You finish able to deploy and secure a simple workload.",
          duration: "4 weeks",
          modules: [
            { type: "text", title: "What the cloud really is", content: "Cloud computing means renting compute, storage and networking on demand from a provider such as AWS, Microsoft Azure or Google Cloud, paying for what you use instead of buying servers.\n\nKey ideas:\n- Service models: IaaS (you manage the OS, e.g. a VM), PaaS (you manage the app, e.g. App Service), SaaS (you just use it, e.g. Microsoft 365).\n- Regions and availability zones: a region is a geographic area; zones are isolated data centres inside it. AWS has a Cape Town region and Azure has South Africa regions, so latency and data-residency choices matter for Nigerian users.\n- Shared responsibility: the provider secures the physical cloud; you secure what you put in it — your data, identities, OS patches and network rules.\n\nWorked example: a small fintech hosts its API on two VMs in different zones behind a load balancer. If one zone fails, the other keeps serving. The provider guarantees the hardware; the team must still patch the VMs, rotate keys and back up the database.\n\nChecklist before using any service: Who manages patching? Where is the data stored? How is it billed?" },
            { type: "text", title: "Cloud networking basics", content: "Every workload lives in a virtual network: a VPC on AWS or Google Cloud, a VNet on Azure. You define its address range in CIDR notation, for example 10.0.0.0/16, then split it into subnets such as 10.0.1.0/24.\n\nPublic subnets have a route to an internet gateway; private subnets do not. Databases and internal services belong in private subnets. Private resources reach the internet for updates through a NAT gateway.\n\nTraffic control:\n- Security groups (AWS) or NSGs (Azure) act as firewalls on resources. AWS security groups are stateful: if inbound is allowed, the reply is allowed.\n- Network ACLs act at subnet level and are stateless.\n- Load balancers spread traffic across healthy instances.\n\nWorked example: a web app has a public load balancer in two public subnets, app servers in two private subnets, and a managed database in private data subnets. The app security group only accepts traffic from the load balancer’s security group, and the database only from the app security group.\n\nTroubleshooting order when something cannot connect: route table, security group, NACL, OS firewall, then the application itself." },
            { type: "text", title: "Identity, access and security", content: "Identity is the new perimeter in the cloud. Most serious incidents begin with leaked keys or over-permissive access, not exotic hacks.\n\nCore concepts:\n- Users and groups represent people; roles represent workloads or temporary access.\n- Policies grant permissions. Start with least privilege: only the actions and resources needed.\n- Prefer roles and short-lived credentials over long-lived access keys. Never commit keys to Git.\n- Turn on MFA for every human, especially the root/global admin account, then lock the root account away.\n\nEncryption: enable encryption at rest (provider-managed or customer-managed keys in KMS/Key Vault) and use TLS in transit.\n\nCompliance context: Nigeria’s Data Protection Act 2023 (NDPA) requires appropriate technical and organisational measures for personal data. In practice that means access control, encryption, logging and knowing where data lives.\n\nWorked example: an app must read files from one bucket. Instead of creating a user with keys, attach a role to the VM that allows only s3:GetObject on that bucket’s ARN. Credentials rotate automatically and nothing secret is stored on disk." },
            { type: "text", title: "Cost, monitoring and infrastructure as code", content: "Cloud makes it easy to spend money by accident. Good engineers treat cost as a design metric.\n\nCost habits:\n- Tag every resource with owner, environment and project.\n- Set budgets and alerts on day one.\n- Stop or delete idle dev resources; right-size over-provisioned VMs.\n- Watch for hidden costs: NAT gateway data, cross-zone traffic, unattached disks and old snapshots.\n\nMonitoring: use CloudWatch, Azure Monitor or Cloud Monitoring to track CPU, memory, disk and error rates, and alert on symptoms users feel.\n\nInfrastructure as code (IaC) means describing infrastructure in files so it can be reviewed, versioned and recreated. Terraform is the most widely used multi-cloud tool. A basic workflow:\n1. Write resources in .tf files.\n2. terraform init to download providers.\n3. terraform plan to preview changes.\n4. terraform apply after review.\n\nState files track what Terraform manages; store them remotely with locking (for example S3 with locking, or Terraform Cloud), never in Git. Rule of thumb: if you clicked it in the console, write it in code next time." },
            { type: "quiz", title: "Cloud Foundations Check", questions: [
              { q: "Under the shared responsibility model, who is responsible for patching the operating system on an IaaS virtual machine?", options: ["The cloud provider", "The customer", "The hardware vendor", "Nobody; it is automatic"], answer: 1 },
              { q: "A database should not be reachable from the internet. Where should it be placed?", options: ["A public subnet with a public IP", "A private subnet with no route to an internet gateway", "Behind a NAT gateway in a public subnet", "In the same subnet as the load balancer"], answer: 1 },
              { q: "What is the main advantage of attaching a role to a VM rather than storing access keys on it?", options: ["Roles are cheaper", "Roles make the VM faster", "Roles provide automatically rotated, short-lived credentials", "Roles bypass IAM policies"], answer: 2 },
              { q: "Which command previews Terraform changes without applying them?", options: ["terraform plan", "terraform init", "terraform apply", "terraform fmt"], answer: 0 },
              { q: "An AWS security group allows inbound HTTPS. What happens to the response traffic?", options: ["It is blocked unless an outbound rule exists", "It is allowed because security groups are stateful", "It is routed through the NAT gateway", "It depends on the network ACL only"], answer: 1 },
              { q: "Which practice best helps identify who owns a costly resource?", options: ["Using larger instances", "Disabling budgets", "Storing state in Git", "Consistent resource tagging"], answer: 3 }
            ] },
            { type: "assignment", title: "Deploy a secure two-tier web app", maxScore: 100, content: "Using a free-tier account on AWS, Azure or Google Cloud, deploy a simple web page on a VM in a private subnet behind a load balancer, with a managed database or storage bucket the VM can read from using a role (no access keys).\n\nDeliverables:\n1. An architecture diagram showing network, subnets and traffic flow.\n2. Your Terraform code (or console screenshots if you have not started IaC) in a Git repository.\n3. A one-page note covering security group rules, IAM permissions granted, tags applied and a budget alert you configured.\n4. Proof the app works, then proof you tore it down.\n\nGrading: network design and isolation 30, least-privilege access 25, cost controls and tagging 20, documentation clarity 15, clean teardown 10." }
          ]
        },
        intensive: {
          title: "Cloud Engineering Intensive",
          summary: "Job-ready cloud engineering: production network design, Terraform at scale, security and governance, resilience and cost management. Ends with a level-aware capstone mirroring real employer work.",
          duration: "8 weeks",
          modules: [
            { type: "text", title: "Production network architecture", content: "Production networks are designed for isolation, availability and growth.\n\nPatterns:\n- Multi-AZ by default: spread load balancers, app tiers and databases across at least two zones.\n- Tiered subnets: public (load balancers, NAT), private app, private data. Size CIDRs generously and avoid overlap with on-prem or partner ranges.\n- Hub-and-spoke: a shared hub network hosts firewalls, DNS and VPN; product spokes peer to it via Transit Gateway or Azure Virtual WAN.\n- Private endpoints let workloads reach managed services without traversing the internet.\n\nHybrid connectivity: site-to-site IPsec VPN is quick and cheap; AWS Direct Connect or Azure ExpressRoute gives dedicated bandwidth. Where links are unreliable, run two tunnels over different ISPs and monitor tunnel state.\n\nDNS is a frequent failure point: plan resolver rules so cloud resources resolve on-prem names and vice versa.\n\nWorked example: a fintech connects its cloud spoke to a partner bank. The team reserves a non-overlapping /20, uses two VPN tunnels over separate providers, routes only the partner’s prefixes, and alerts if either tunnel drops for over five minutes." },
            { type: "text", title: "Terraform at team scale", content: "Terraform for one engineer is easy; for a team it needs structure.\n\nPractices:\n- Modules: wrap repeated patterns (VPC, database, service) with clear inputs and outputs. Pin module and provider versions.\n- State: one state per environment and component, stored remotely with locking. Small states mean faster plans and smaller blast radius.\n- Workflow: changes go through pull requests; CI runs fmt, validate, tflint and a security scanner such as Checkov or Trivy, then posts the plan for review. Apply happens from CI, not laptops.\n- Secrets: never in .tf files or state outputs where avoidable; pull from Vault, AWS Secrets Manager or Key Vault.\n- Drift: schedule plans to detect manual changes, then decide whether to import or revert.\n\nWorked example: a plan unexpectedly shows a database will be replaced. Stop. Read which attribute forces replacement, check recent provider upgrades, and use lifecycle prevent_destroy on critical data. If the change is cosmetic, use ignore_changes or a moved block rather than letting Terraform destroy production data." },
            { type: "text", title: "Security, governance and compliance", content: "Security in the cloud is mostly configuration discipline at scale.\n\nFoundations:\n- Separate accounts or subscriptions per environment and workload; use AWS Organizations or Azure management groups.\n- Federate identity with an IdP (Entra ID, Okta) and use SSO with MFA instead of local users.\n- Guardrails: service control policies or Azure Policy to block risky actions such as disabling logging or creating public buckets.\n- Central logging: CloudTrail or Activity Logs shipped to a locked log account.\n- Posture management: AWS Security Hub, Microsoft Defender for Cloud or Google Security Command Center to flag misconfigurations.\n\nCompliance: NDPA 2023 requires appropriate safeguards and lawful cross-border transfers of personal data; financial institutions also follow Central Bank of Nigeria guidance on cloud and outsourcing. Engineers support this with encryption, access reviews, retention policies and audit evidence.\n\nChecklist for any new workload: data classification, encryption keys, network exposure, IAM boundaries, logging enabled, backup policy, owner tag." },
            { type: "text", title: "Resilience, operations and FinOps", content: "Resilience starts with targets: RPO (how much data you can lose) and RTO (how long you can be down). These drive design choices.\n\nStrategies, cheapest to most expensive: backup and restore, pilot light, warm standby, active-active multi-region. Most workloads need backup and restore with tested runbooks; tier-1 payment services may justify warm standby.\n\nOperations:\n- Automate patching with AWS Systems Manager or Azure Update Manager.\n- Use immutable images built with Packer for consistency.\n- Alert on user-facing symptoms; route to on-call with runbooks.\n- Test restores regularly — an untested backup is a hope, not a plan.\n\nFinOps: make cost visible and owned. Use tagging and cost allocation, review top spenders weekly, buy Savings Plans or reservations for steady load, use spot for fault-tolerant batch jobs, and set lifecycle rules to move old objects to cheaper storage tiers.\n\nWorked example: a team discovers a large share of spend is NAT data from instances pulling container images. Adding VPC endpoints for the registry and storage cuts that cost without changing the application." },
            { type: "assignment", title: "Terraform module and pipeline", maxScore: 100, content: "Build a reusable Terraform module for a production-style network (multi-AZ, public/private subnets, NAT, flow logs) and a second module for a small service that consumes it.\n\nDeliverables:\n1. Git repository with modules, an environment configuration, pinned versions and a README.\n2. A CI workflow (GitHub Actions or GitLab CI) running fmt, validate, tflint and Checkov, and posting the plan.\n3. Remote state with locking configured.\n4. A short design note explaining CIDR choices and cost implications.\n\nGrading: module design and reusability 30, security and scanning 25, CI workflow 20, state handling 15, documentation 10." },
            { type: "quiz", title: "Cloud Intensive Assessment", questions: [
              { q: "A workload has an RPO of 15 minutes. What does that constrain?", options: ["Maximum acceptable downtime", "Maximum acceptable data loss", "Maximum number of regions", "Minimum backup retention"], answer: 1 },
              { q: "Terraform plan shows a production database will be destroyed and recreated. What is the best first step?", options: ["Apply quickly before anyone notices", "Delete the state file", "Identify the attribute forcing replacement before proceeding", "Switch to the console to make the change"], answer: 2 },
              { q: "Which control best prevents any account in an organisation from disabling audit logging?", options: ["A tag policy", "A budget alert", "A security group", "A service control policy or equivalent guardrail"], answer: 3 },
              { q: "Why use VPC endpoints for object storage from private subnets?", options: ["To keep traffic private and reduce NAT data costs", "To make buckets public", "To replace IAM policies", "To increase storage durability"], answer: 0 },
              { q: "Which hybrid option gives dedicated, private bandwidth rather than an encrypted tunnel over the internet?", options: ["Site-to-site VPN", "AWS Direct Connect or Azure ExpressRoute", "VPC peering", "A NAT gateway"], answer: 1 },
              { q: "Which DR strategy is usually the cheapest?", options: ["Active-active multi-region", "Warm standby", "Pilot light", "Backup and restore"], answer: 3 }
            ] },
            { type: "assignment", title: "Capstone: Cloud foundation for a fintech", maxScore: 100, content: "A Lagos-based fintech is launching a mobile-money wallet API that stores customer personal data. It needs a secure, cost-aware cloud foundation and must satisfy NDPA 2023 and partner-bank connectivity requirements.\nJunior: Deploy the API environment from provided modules in one account: multi-AZ network, app tier, managed database, IAM roles, tagging and budget alerts, with a runbook for backups and patching.\nMid: Design and build the production and staging environments with your own Terraform modules, CI plan/apply, centralized logging, VPN to a partner bank and a tested backup restore with defined RPO/RTO.\nSenior: Design the multi-account landing zone, guardrails, identity federation, DR strategy and a migration plan for existing workloads, with a decision record covering compliance and cost trade-offs.\nDeliverables: Architecture diagram, Git repository or design pack, runbook or decision record, and a 10-minute recorded walkthrough.\nGrading: Architecture soundness 30, security and compliance 25, automation and reproducibility 20, cost awareness 15, communication 10." }
          ]
        }
      }
    },
    {
      id: "devops",
      title: "DevOps Engineer",
      summary: "Builds and maintains the pipelines, automation and environments that let development teams ship code quickly and safely — CI/CD, containers, configuration management and release practices. Works alongside developers, QA and operations to shorten feedback loops and remove manual toil from delivery.",
      competencies: [
        { name: "CI/CD pipeline engineering", weight: 25, description: "Designs build, test and deployment pipelines with gates, caching, artifacts and safe rollout strategies." },
        { name: "Containers & orchestration", weight: 20, description: "Packages applications into secure images and runs them on Docker and Kubernetes with sound configuration." },
        { name: "Automation & scripting", weight: 20, description: "Automates repetitive tasks with Bash, Python and configuration management tools such as Ansible." },
        { name: "Infrastructure as code", weight: 15, description: "Manages environments as versioned, reviewed code with Terraform or equivalent tools." },
        { name: "DevSecOps & release quality", weight: 20, description: "Integrates testing, dependency and image scanning, secrets handling and observability into delivery." }
      ],
      levels: {
        junior: {
          minYears: 0,
          focus: "Trusted to maintain existing pipelines and automate well-defined tasks with review.",
          responsibilities: [
            "Maintain and fix CI jobs for build, test and lint failures",
            "Write Dockerfiles and compose files for services under guidance",
            "Automate routine server tasks with Bash or Python scripts",
            "Support developers with environment and pipeline issues",
            "Keep pipeline documentation and READMEs current"
          ],
          skills: [
            "Git branching workflows",
            "Dockerfile writing",
            "Bash scripting",
            "CI pipeline YAML",
            "Linux fundamentals",
            "Basic networking (DNS, HTTP)",
            "Python scripting"
          ],
          tools: ["Git", "GitHub Actions", "Docker", "Jenkins", "Ansible", "Nginx"],
          certifications: ["Linux Foundation Certified System Administrator (LFCS)", "Kubernetes and Cloud Native Associate (KCNA)", "GitHub Actions"],
          aiTopics: [
            "Git workflows: branching, merging, pull requests and resolving conflicts",
            "CI concepts: stages, jobs, artifacts and caching",
            "Docker basics: images, layers, containers, volumes and ports",
            "Linux processes, permissions, logs and services",
            "DNS, HTTP and reverse proxies at a working level"
          ],
          aiScenarios: [
            "A CI build that passed yesterday now fails on a dependency install step. Walk me through how you would debug it.",
            "A container runs locally but exits immediately in the test environment. How do you find out why?",
            "Developers complain the pipeline takes 25 minutes. What would you look at first to speed it up?"
          ],
          aiExpectations: "A ready junior reads logs carefully, explains Git and Docker fundamentals accurately and debugs step by step. Red flags include rerunning jobs blindly without reading errors, running containers as root by default without awareness, or hardcoding secrets in pipelines.",
          proQuestions: [
            { q: "Show or describe a pipeline you built or maintained. What does each stage do?", lookFor: "Clear stages (build, test, scan, deploy), artifacts and why the order matters." },
            { q: "Walk me through writing a Dockerfile for a Node.js or Python app. What would you do to keep the image small and safe?", lookFor: "Slim or distroless base, multi-stage builds, .dockerignore, non-root user and layer ordering for caching." },
            { q: "Tell me about a script you wrote that saved time. How did you make it reliable?", lookFor: "A real problem, error handling, idempotency or logging, and measured benefit." },
            { q: "How should secrets be handled in a CI pipeline?", lookFor: "Using the CI secret store or a vault, masking, least privilege and never committing secrets to the repo." },
            { q: "Tell me about a time you had to learn a tool quickly to unblock your team.", lookFor: "Structured learning approach, asking for help appropriately and delivering a working result." }
          ]
        },
        mid: {
          minYears: 2,
          focus: "Trusted to design and own delivery pipelines and environments for multiple services end to end.",
          responsibilities: [
            "Design CI/CD pipelines with automated tests, scans and progressive deployments",
            "Run containerised workloads on Kubernetes with Helm and GitOps",
            "Manage environments with Terraform and configuration management",
            "Integrate security scanning and secrets management into delivery",
            "Lead incident fixes for failed deployments and improve rollback paths"
          ],
          skills: [
            "Kubernetes deployments",
            "Helm chart authoring",
            "GitOps with Argo CD",
            "Terraform workflows",
            "Blue-green and canary releases",
            "Container image scanning",
            "Pipeline performance tuning"
          ],
          tools: ["GitLab CI/CD", "Kubernetes", "Helm", "Argo CD", "Terraform", "Trivy"],
          certifications: ["Certified Kubernetes Application Developer (CKAD)", "HashiCorp Certified: Terraform Associate (004)", "AWS Certified Developer – Associate"],
          aiTopics: [
            "Deployment strategies: rolling, blue-green, canary and feature flags",
            "Kubernetes workloads: Deployments, Services, Ingress, ConfigMaps, Secrets, probes",
            "GitOps principles and drift reconciliation",
            "Supply chain security: SBOMs, image signing, dependency scanning",
            "Pipeline design for monorepos and microservices"
          ],
          aiScenarios: [
            "A new release passes all tests but error rates spike after deployment. Walk me through detection, rollback and prevention.",
            "You need to move twelve services from manual deployments to a GitOps model. How would you plan and execute it?",
            "A critical CVE is announced in a base image used by most of your services. What do you do in the first 48 hours?"
          ],
          aiExpectations: "A ready mid-level engineer designs pipelines that are fast, repeatable and safe, explains rollout and rollback mechanics, and embeds security without blocking teams. Red flags include no rollback plan, deploying directly from laptops, or treating Kubernetes manifests as untracked one-offs.",
          proQuestions: [
            { q: "Describe a CI/CD system you designed. How did you balance speed with safety?", lookFor: "Caching and parallelism, quality gates, progressive delivery and concrete metrics like lead time or failure rate." },
            { q: "How do you structure Helm charts or Kustomize overlays across environments?", lookFor: "Base plus overlays or values per environment, avoiding duplication, and secret handling outside the chart." },
            { q: "Tell me about a failed deployment you handled. What changed afterwards?", lookFor: "Calm response, quick rollback, blameless review and a specific pipeline or process improvement." },
            { q: "How do you add security scanning without frustrating developers?", lookFor: "Shift-left feedback, sensible severity thresholds, fast scans, clear remediation guidance and exception handling." },
            { q: "What DORA metrics have you tracked and how did you use them?", lookFor: "Deployment frequency, lead time, change failure rate, recovery time, and an example of acting on the data." }
          ]
        },
        senior: {
          minYears: 5,
          focus: "Trusted to set delivery strategy, standards and tooling across engineering and to mentor others.",
          responsibilities: [
            "Define the organisation’s CI/CD, branching and release standards",
            "Design reusable pipeline templates and golden paths for teams",
            "Own software supply-chain security and compliance evidence",
            "Lead DevOps transformation with engineering leadership",
            "Mentor engineers and run blameless post-incident reviews"
          ],
          skills: [
            "Delivery strategy design",
            "Pipeline template architecture",
            "Software supply chain security",
            "Kubernetes multi-cluster operations",
            "DORA metrics analysis",
            "Change management design",
            "Technical leadership"
          ],
          tools: ["GitHub Actions", "Argo CD", "Kubernetes", "Sigstore Cosign", "SonarQube", "HashiCorp Vault"],
          certifications: ["AWS Certified DevOps Engineer – Professional", "Microsoft Certified: DevOps Engineer Expert", "Certified Kubernetes Administrator (CKA)"],
          aiTopics: [
            "Organisation-wide pipeline architecture and reusable templates",
            "Supply chain frameworks such as SLSA, provenance and signing",
            "Release governance in regulated environments",
            "Scaling Kubernetes and GitOps across many teams",
            "Measuring and improving engineering delivery performance"
          ],
          aiScenarios: [
            "A regulated payments company needs audit evidence for every production change but teams want to deploy daily. Design the delivery model.",
            "Every team maintains its own pipeline and quality varies wildly. How do you standardise without killing autonomy?",
            "Your organisation suffered a compromised dependency in a build. Lead me through response and long-term hardening."
          ],
          aiExpectations: "A ready senior connects delivery practices to business outcomes and risk, designs standards teams adopt willingly, and leads incidents and change calmly. Red flags include one-size-fits-all mandates, ignoring audit needs, or no measurable way to show improvement.",
          proQuestions: [
            { q: "Describe a DevOps transformation you led. What was the starting point and what changed?", lookFor: "Baseline metrics, phased approach, cultural and tooling changes, and measured outcomes." },
            { q: "How have you designed reusable pipeline templates across teams?", lookFor: "Versioned shared templates, extension points, ownership model and migration support." },
            { q: "How would you meet change-management audit requirements with continuous delivery?", lookFor: "Automated evidence from PR approvals, pipeline logs, signed artifacts and policy checks instead of manual CAB meetings." },
            { q: "Tell me about a disagreement with engineering leadership on tooling or process. How was it resolved?", lookFor: "Data-backed argument, listening, compromise or experiment, and respectful outcome." },
            { q: "How do you develop DevOps engineers on your team?", lookFor: "Concrete mentoring, ownership opportunities, review practices and examples of growth." }
          ]
        }
      },
      hrScenarios: [
        { q: "Tell me about a time developers resisted a process or tooling change you introduced. How did you win them over?", lookFor: "Empathy for developer pain, involving them early, demonstrating value and adjusting based on feedback." },
        { q: "Describe a time you were on call and a release went badly late at night. How did you manage it and communicate?", lookFor: "Calm prioritisation, clear updates to stakeholders, escalation when needed and a follow-up review." },
        { q: "Tell me about a time you automated away work someone else depended on for their role. How did you handle it?", lookFor: "Sensitivity to people, transparent communication and helping others move to higher-value work." }
      ],
      curriculum: {
        foundational: {
          title: "DevOps Foundations",
          summary: "An entry-level path into DevOps covering Linux, Git, CI pipelines and containers. You finish able to containerise an app and ship it through an automated pipeline.",
          duration: "5 weeks",
          modules: [
            { type: "text", title: "DevOps culture and the delivery lifecycle", content: "DevOps is a way of working where development and operations share responsibility for delivering and running software. Tools matter, but the core goal is fast, safe, repeatable change.\n\nKey ideas:\n- Small batches: frequent small changes are easier to test and roll back than big releases.\n- Automation: anything done twice by hand is a candidate for scripting.\n- Feedback: tests, monitoring and reviews tell you quickly when something is wrong.\n- Shared ownership: “you build it, you run it” reduces hand-off delays.\n\nThe delivery lifecycle: plan, code, build, test, release, deploy, operate, monitor — then back to plan.\n\nThe DORA research programme measures delivery performance with four key metrics: deployment frequency, lead time for changes, change failure rate and time to restore service.\n\nWorked example: a team deploying monthly with manual steps often sees outages after release. They automate builds and tests, deploy weekly, then daily. Each change is smaller, problems are found sooner, and rollback takes minutes instead of hours.\n\nReflect: which manual step in your current or past work could be automated first?" },
            { type: "text", title: "Linux and Git essentials", content: "Most servers, containers and pipelines run Linux, and everything you change should live in Git.\n\nLinux essentials:\n- Navigation and files: ls, cd, cp, mv, find, grep.\n- Permissions: chmod and chown; understand user, group and other.\n- Processes and services: ps, top, systemctl status nginx, journalctl -u nginx.\n- Networking: curl, ss -tulpn, dig for DNS lookups.\n- Package managers: apt or dnf.\n\nGit essentials:\n- Commit small, focused changes with clear messages.\n- Use branches for features; open pull requests for review.\n- Rebase or merge to integrate changes; resolve conflicts carefully.\n- Never commit secrets; add a .gitignore early.\n\nWorked example: a web server is not responding. Check systemctl status nginx, read journalctl for errors, confirm it is listening with ss -tulpn, then curl localhost. If the config was recently changed, git log on the config repo shows who changed what and lets you revert quickly.\n\nPractise these commands daily; fluency on the command line is the foundation of every DevOps role." },
            { type: "text", title: "Continuous integration pipelines", content: "Continuous integration (CI) means every change is automatically built and tested when pushed, so problems surface within minutes.\n\nA typical pipeline in GitHub Actions or GitLab CI:\n1. Checkout code.\n2. Install dependencies, using a cache to save time.\n3. Lint and run unit tests.\n4. Build an artifact such as a Docker image.\n5. Scan for vulnerabilities.\n6. Publish the artifact to a registry.\n\nPipelines are written in YAML. Jobs run on runners (hosted or self-hosted). Secrets such as registry passwords are stored in the CI secret store and referenced as variables, never written in the file.\n\nGood habits:\n- Keep pipelines fast; developers ignore slow feedback.\n- Fail early: run cheap checks like linting first.\n- Make builds reproducible by pinning versions.\n- Treat a red main branch as an urgent team problem.\n\nWorked example: a build fails with “module not found” after a teammate added a library. Reading the log shows the lockfile was not committed. Committing the lockfile fixes it and makes future builds reproducible." },
            { type: "text", title: "Containers with Docker", content: "A container packages an application with its dependencies so it runs the same everywhere. Docker builds images from a Dockerfile; images run as containers.\n\nCore concepts:\n- Image layers: each Dockerfile instruction creates a layer. Put rarely changing steps (installing dependencies) before frequently changing ones (copying source) to benefit from caching.\n- Multi-stage builds: compile in one stage, copy only the result into a small runtime image.\n- Run as a non-root user and keep images minimal to reduce attack surface.\n- Configuration comes from environment variables, not baked-in secrets.\n- Containers are ephemeral; persistent data goes in volumes or managed databases.\n\nExample Dockerfile outline for a Python API:\nFROM python:3.12-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install --no-cache-dir -r requirements.txt\nCOPY . .\nUSER 1000\nCMD [\"gunicorn\", \"app:app\", \"-b\", \"0.0.0.0:8000\"]\n\nDocker Compose runs multi-container setups locally, such as an API plus a Postgres database. When a container exits immediately, check docker logs, the entrypoint command and required environment variables." },
            { type: "quiz", title: "DevOps Foundations Check", questions: [
              { q: "Which DORA metric measures how long it takes a committed change to reach production?", options: ["Deployment frequency", "Change failure rate", "Lead time for changes", "Time to restore service"], answer: 2 },
              { q: "Why place dependency installation before copying source code in a Dockerfile?", options: ["It makes the image run as root", "It lets Docker reuse cached layers when only source changes", "It is required by Docker syntax", "It reduces network ports"], answer: 1 },
              { q: "Where should a CI pipeline get a registry password from?", options: ["The CI platform’s secret store", "A comment in the YAML file", "The README", "A public environment file in the repo"], answer: 0 },
              { q: "A service is not responding on a Linux server. Which command shows whether it is running under systemd?", options: ["chmod", "git status", "docker build", "systemctl status"], answer: 3 },
              { q: "What is the main benefit of multi-stage Docker builds?", options: ["They allow running multiple apps in one container", "They remove the need for a registry", "They produce smaller runtime images without build tools", "They make containers persistent"], answer: 2 },
              { q: "Why should cheap checks such as linting run early in a pipeline?", options: ["They are required to run last", "To fail fast and give quicker feedback", "To increase runner costs", "Because tests cannot run without them"], answer: 1 }
            ] },
            { type: "assignment", title: "Containerise and pipeline a small app", maxScore: 100, content: "Take a simple web API (your own or a provided sample) and make it deployable through automation.\n\nDeliverables:\n1. A Dockerfile using a slim base, multi-stage build where relevant and a non-root user.\n2. A docker-compose.yml running the app with a database.\n3. A GitHub Actions or GitLab CI pipeline that lints, tests, builds the image, scans it with Trivy and pushes it to a registry on the main branch.\n4. A README explaining how to run locally and how the pipeline works, including how secrets are handled.\n\nGrading: Dockerfile quality 25, pipeline correctness 30, security practices 20, reproducibility 15, documentation 10." }
          ]
        },
        intensive: {
          title: "DevOps Engineering Intensive",
          summary: "Job-ready DevOps: Kubernetes delivery, GitOps, infrastructure as code, progressive releases and DevSecOps. Ends with a level-aware capstone based on a real delivery platform.",
          duration: "8 weeks",
          modules: [
            { type: "text", title: "Kubernetes for delivery engineers", content: "Kubernetes runs containers across a cluster and keeps them in the desired state.\n\nKey objects:\n- Deployment: manages replicas and rolling updates of Pods.\n- Service: stable network endpoint for Pods; Ingress or Gateway API exposes HTTP routes.\n- ConfigMap and Secret: configuration and sensitive values injected as env vars or files.\n- Probes: readiness decides when a Pod receives traffic; liveness restarts stuck containers; startup protects slow starters.\n- Resources: requests guide scheduling, limits cap usage. Missing requests cause noisy-neighbour problems.\n- HorizontalPodAutoscaler scales replicas on metrics.\n\nPackaging: Helm charts template manifests with values per environment; Kustomize layers overlays on a base.\n\nWorked example: after a deploy, Pods show CrashLoopBackOff. Run kubectl describe pod for events, kubectl logs --previous for the crash output. The log shows a missing DATABASE_URL; the new ConfigMap key was misspelled. Fix the manifest in Git, not with kubectl edit, so the cluster and repository stay in sync.\n\nRule: the cluster should always reflect what is in version control." },
            { type: "text", title: "GitOps and progressive delivery", content: "GitOps uses Git as the single source of truth for what runs. An agent such as Argo CD or Flux watches a repository and reconciles the cluster to match it.\n\nBenefits: every change is reviewed and auditable, rollback is a git revert, and manual drift is detected and corrected.\n\nTypical flow:\n1. CI builds, tests, scans and pushes an image with an immutable tag (commit SHA).\n2. CI or an image updater opens a PR bumping the tag in the environment repo.\n3. Merge triggers Argo CD to sync the change.\n\nProgressive delivery reduces blast radius:\n- Rolling updates replace Pods gradually.\n- Blue-green runs two versions and switches traffic at once, with instant rollback.\n- Canary sends a small share of traffic to the new version, checks metrics, then expands. Argo Rollouts or Flagger can automate analysis against Prometheus error rates.\n- Feature flags decouple deployment from release.\n\nWorked example: a canary shows error rates rising for 5% of traffic. Automated analysis aborts the rollout and shifts traffic back, so most users never see the bug." },
            { type: "text", title: "Infrastructure and configuration as code", content: "Delivery pipelines need consistent environments underneath.\n\nTerraform provisions cloud resources: clusters, networks, databases, registries. Keep state remote with locking, split it per environment, and run plan in CI with review before apply.\n\nAnsible configures servers and is useful for VMs, on-prem hosts and network devices. Playbooks should be idempotent: running twice produces the same result. Use roles for reuse and Ansible Vault or an external secret manager for secrets.\n\nEnvironment strategy:\n- Keep dev, staging and production as similar as practical, differing by size and data, not architecture.\n- Promote the same artifact through environments; never rebuild for production.\n- Ephemeral preview environments per pull request give fast feedback where budget allows.\n\nLocal context: some Nigerian teams run hybrid setups with on-prem servers in data centres plus cloud. Ansible and self-hosted runners help manage on-prem nodes, and pipelines should tolerate intermittent connectivity with retries and cached dependencies.\n\nWorked example: staging works but production fails because production was hand-configured. Codifying both with the same Terraform module and Ansible role removes the difference." },
            { type: "text", title: "DevSecOps and supply-chain security", content: "Attackers increasingly target the build process itself. DevSecOps builds security checks into every stage without slowing teams down.\n\nControls by stage:\n- Code: secret scanning (Gitleaks, GitHub secret scanning), SAST (Semgrep, SonarQube).\n- Dependencies: software composition analysis and Dependabot or Renovate updates.\n- Images: scan with Trivy or Grype, use minimal bases, rebuild regularly.\n- Artifacts: generate an SBOM (Syft) and sign images with Sigstore Cosign; verify signatures at deploy time with an admission policy (Kyverno or OPA Gatekeeper).\n- Pipelines: least-privilege tokens, OIDC federation to cloud instead of long-lived keys, pinned action versions.\n- Runtime: Kubernetes Pod Security Standards and network policies.\n\nThe SLSA framework describes levels of build integrity and provenance.\n\nTuning matters: block only on high-severity, fixable issues; report the rest with clear guidance.\n\nWorked example: a critical CVE hits a common base image. Because every image has an SBOM, the team queries which services are affected within minutes, rebuilds them through the pipeline and confirms the fix with a new scan." },
            { type: "assignment", title: "GitOps delivery to Kubernetes", maxScore: 100, content: "Deploy a two-service application to a local (kind or minikube) or cloud Kubernetes cluster using GitOps.\n\nDeliverables:\n1. Helm chart or Kustomize overlays for dev and prod, with probes, resource requests and a HorizontalPodAutoscaler.\n2. CI pipeline that tests, scans, signs and pushes images tagged by commit SHA.\n3. Argo CD application manifests syncing from an environment repo.\n4. Demonstration of a rollback via git revert, with screenshots or a short recording.\n\nGrading: Kubernetes manifests quality 25, CI/CD and GitOps flow 30, security controls 20, rollback demonstration 15, documentation 10." },
            { type: "quiz", title: "DevOps Intensive Assessment", questions: [
              { q: "Which Kubernetes probe controls whether a Pod receives traffic from a Service?", options: ["Liveness probe", "Readiness probe", "Startup probe", "Resource limit"], answer: 1 },
              { q: "In a GitOps model, what is the preferred way to roll back a bad release?", options: ["kubectl edit the Deployment", "Delete the namespace", "Revert the commit in the environment repository", "Restart all nodes"], answer: 2 },
              { q: "Why should the same artifact be promoted from staging to production rather than rebuilt?", options: ["Rebuilding is not possible", "Registries forbid it", "It makes images larger", "It guarantees production runs exactly what was tested"], answer: 3 },
              { q: "What does signing an image with Cosign and verifying it at admission protect against?", options: ["Running images that were not produced by your trusted pipeline", "Slow image pulls", "Pods using too much memory", "DNS failures"], answer: 0 },
              { q: "A canary release shows rising error rates. What should an automated analysis step do?", options: ["Promote to 100% to gather more data", "Abort and shift traffic back to the stable version", "Disable monitoring", "Scale the canary up"], answer: 1 },
              { q: "Why use OIDC federation from CI to the cloud instead of stored access keys?", options: ["It makes builds faster", "It removes the need for IAM", "It provides short-lived credentials with no long-lived secret to leak", "It is required for Docker builds"], answer: 2 }
            ] },
            { type: "assignment", title: "Capstone: Delivery platform for a payments service", maxScore: 100, content: "A Nigerian payments company runs a transfer API and a notification worker. Releases are manual, slow and risky, and auditors require evidence of every production change.\nJunior: Containerise both services, build a CI pipeline with tests, image scanning and registry push, and deploy them to a staging Kubernetes cluster with documented steps.\nMid: Deliver full GitOps to staging and production with Helm or Kustomize, canary releases with automated analysis, secrets from a vault, and a rollback runbook tested in a demo.\nSenior: Design the organisation-wide delivery standard: reusable pipeline templates, supply-chain controls (SBOM, signing, admission policy), audit evidence model, DORA metric tracking and an adoption plan for ten teams.\nDeliverables: Repositories or design pack, pipeline runs or diagrams, a runbook or standards document, and a 10-minute recorded walkthrough.\nGrading: Pipeline and deployment design 30, security and auditability 25, reliability of releases 20, documentation 15, communication 10." }
          ]
        }
      }
    },
    {
      id: "sre",
      title: "Site Reliability Engineer",
      summary: "Applies software engineering to operations to keep production services reliable, fast and scalable — defining SLOs, building observability, leading incident response and removing toil. Works closely with product engineering teams and shares on-call responsibility for critical systems.",
      competencies: [
        { name: "Observability & monitoring", weight: 20, description: "Instruments services with metrics, logs and traces and builds alerting that reflects user impact." },
        { name: "SLOs & reliability engineering", weight: 20, description: "Defines SLIs, SLOs and error budgets and uses them to guide engineering priorities." },
        { name: "Incident response & postmortems", weight: 25, description: "Leads structured incident response, mitigation and blameless reviews that produce lasting fixes." },
        { name: "Systems & performance troubleshooting", weight: 20, description: "Diagnoses issues across Linux, networks, databases and distributed systems under pressure." },
        { name: "Automation & capacity planning", weight: 15, description: "Writes code to eliminate toil and forecasts and tests capacity for growth and peak load." }
      ],
      levels: {
        junior: {
          minYears: 1,
          focus: "Trusted to respond to alerts with runbooks, improve monitoring and automate small operational tasks.",
          responsibilities: [
            "Respond to alerts as secondary on-call and follow runbooks",
            "Build and tune dashboards and alert rules for services",
            "Write scripts to automate repetitive operational tasks",
            "Gather timelines and evidence for incident postmortems",
            "Keep runbooks accurate after incidents and changes"
          ],
          skills: [
            "Linux troubleshooting",
            "PromQL queries",
            "Log analysis",
            "Python scripting",
            "Alert rule writing",
            "Networking fundamentals",
            "Runbook execution"
          ],
          tools: ["Prometheus", "Grafana", "Kubernetes", "PagerDuty", "Elasticsearch", "Git"],
          certifications: ["Prometheus Certified Associate (PCA)", "Linux Foundation Certified System Administrator (LFCS)", "Kubernetes and Cloud Native Associate (KCNA)"],
          aiTopics: [
            "The four golden signals: latency, traffic, errors, saturation",
            "Metrics vs logs vs traces and when to use each",
            "Linux performance basics: CPU, memory, disk I/O and load",
            "Alert design: symptoms vs causes and avoiding noise",
            "Incident roles and basic escalation"
          ],
          aiScenarios: [
            "You are paged at 2 a.m. because API latency doubled. Walk me through your first fifteen minutes.",
            "A server’s disk is 95% full and growing. How do you investigate and resolve it safely?",
            "Your team receives dozens of alerts a day that nobody acts on. How would you start fixing that?"
          ],
          aiExpectations: "A ready junior troubleshoots methodically from symptoms to cause, reads metrics and logs confidently and communicates during incidents. Red flags include restarting things without gathering evidence, no awareness of user impact, or not escalating when stuck.",
          proQuestions: [
            { q: "Walk me through how you would investigate high CPU on a Linux host.", lookFor: "top/htop, identifying processes, checking load vs cores, recent changes and next diagnostic steps." },
            { q: "Show or describe a dashboard you built. Why did you choose those panels?", lookFor: "Golden signals or RED/USE methods, user-facing focus and sensible time ranges." },
            { q: "Tell me about an incident you were part of. What was your role and what did you learn?", lookFor: "Clear timeline, their specific contribution, communication and a concrete lesson." },
            { q: "Write or describe a PromQL query for the 5xx error rate of a service.", lookFor: "Use of rate() over counters and dividing errors by total requests, with a sensible window." },
            { q: "What makes an alert good?", lookFor: "Actionable, tied to user impact, has a runbook, low false positives and correct severity." }
          ]
        },
        mid: {
          minYears: 3,
          focus: "Trusted to own reliability of production services, lead incidents and drive SLO-based improvements.",
          responsibilities: [
            "Define SLIs, SLOs and error budgets with service owners",
            "Serve as primary on-call and incident commander",
            "Build observability with OpenTelemetry tracing and structured logging",
            "Run capacity planning and load tests before peak events",
            "Lead blameless postmortems and track remediation to completion"
          ],
          skills: [
            "SLO definition",
            "Incident command",
            "Distributed tracing",
            "Load testing",
            "Capacity planning",
            "Kubernetes troubleshooting",
            "Go or Python tooling"
          ],
          tools: ["OpenTelemetry", "Grafana", "Prometheus", "k6", "Kubernetes", "Terraform"],
          certifications: ["Certified Kubernetes Administrator (CKA)", "Google Cloud Professional Cloud DevOps Engineer", "AWS Certified CloudOps Engineer – Associate"],
          aiTopics: [
            "SLIs, SLOs, error budgets and burn-rate alerting",
            "Incident command, communication and mitigation-first thinking",
            "Distributed tracing and diagnosing latency across services",
            "Capacity planning, autoscaling and load testing",
            "Failure modes: retries, timeouts, circuit breakers and cascading failures"
          ],
          aiScenarios: [
            "A mobile-money service expects triple traffic on salary day. How do you prepare and what do you watch on the day?",
            "Checkout latency is high but every individual service dashboard looks normal. How do you find the cause?",
            "A service has exhausted its monthly error budget in ten days. What do you do and how do you talk to the product team?"
          ],
          aiExpectations: "A ready mid-level SRE uses SLOs to make decisions, leads incidents with clear roles and communication, and reasons about distributed failure modes. Red flags include alerting on every metric, heroics instead of process, or postmortems that blame individuals.",
          proQuestions: [
            { q: "Describe SLOs you defined for a service. How did you choose the targets?", lookFor: "User-centred SLIs, data from current performance, stakeholder agreement and burn-rate alerting." },
            { q: "Walk me through an incident you led as incident commander.", lookFor: "Roles assigned, mitigation before root cause, regular stakeholder updates and a strong postmortem." },
            { q: "How do you prevent retry storms and cascading failures?", lookFor: "Timeouts, exponential backoff with jitter, retry budgets, circuit breakers and load shedding." },
            { q: "Tell me about a capacity or load test you ran. What did it reveal?", lookFor: "Realistic traffic model, clear goals, bottleneck found and action taken." },
            { q: "How do you measure and reduce toil?", lookFor: "Tracking time spent, prioritising automation by impact, and an example of eliminating a repetitive task." }
          ]
        },
        senior: {
          minYears: 6,
          focus: "Trusted to set reliability strategy, practices and architecture across the organisation and mentor SREs.",
          responsibilities: [
            "Set the organisation’s SLO, incident and on-call standards",
            "Lead reliability reviews of architecture for critical systems",
            "Design multi-region resilience and chaos engineering programmes",
            "Partner with leadership on reliability investment versus features",
            "Mentor SREs and build a healthy, sustainable on-call culture"
          ],
          skills: [
            "Reliability strategy",
            "Resilience architecture",
            "Chaos engineering",
            "Incident programme design",
            "Observability platform design",
            "Executive communication",
            "SRE team mentorship"
          ],
          tools: ["OpenTelemetry", "Grafana Mimir", "Datadog", "Gremlin", "PagerDuty", "Kubernetes"],
          certifications: ["Google Cloud Professional Cloud DevOps Engineer", "AWS Certified DevOps Engineer – Professional", "Certified Kubernetes Security Specialist (CKS)"],
          aiTopics: [
            "Organisation-wide SLO and error-budget policy",
            "Resilience patterns across regions and dependencies",
            "Chaos engineering and game days",
            "Observability architecture and cost at scale",
            "On-call health, incident programme maturity and culture"
          ],
          aiScenarios: [
            "A bank’s transfer platform has had three major outages in a quarter. Leadership asks you for a reliability plan. Walk me through it.",
            "Observability costs are growing faster than traffic. How do you redesign the approach without losing visibility?",
            "Design a game day to test whether your platform survives the loss of a third-party payment gateway."
          ],
          aiExpectations: "A ready senior SRE ties reliability to business risk, builds programmes and culture rather than heroics, and designs resilience across dependencies. Red flags include chasing 100% availability, no plan for on-call sustainability, or recommendations without data.",
          proQuestions: [
            { q: "Describe a reliability programme you built or transformed. What measurable change did it produce?", lookFor: "Baseline, SLO adoption, incident trends, practices introduced and honest outcomes." },
            { q: "How do you negotiate reliability work against feature delivery with product leadership?", lookFor: "Error budget policy, data-driven framing of risk and agreed escalation paths." },
            { q: "Tell me about a chaos experiment or game day you designed. What did it uncover?", lookFor: "Hypothesis, controlled blast radius, findings and follow-up fixes." },
            { q: "How do you keep on-call sustainable for a growing team?", lookFor: "Rotation design, alert hygiene, compensation or time-off norms, handovers and measuring pages per shift." },
            { q: "How have you grown SREs into incident commanders or technical leads?", lookFor: "Shadowing, structured training, gradual ownership and specific examples." }
          ]
        }
      },
      hrScenarios: [
        { q: "Tell me about a time you had to deliver bad news about an outage to senior leaders or customers.", lookFor: "Honest, timely, plain-language communication with ownership and a clear next step." },
        { q: "Describe a time on-call stress or fatigue affected you or your team. What did you do about it?", lookFor: "Self-awareness, raising the issue constructively and contributing to a sustainable fix." },
        { q: "Tell me about a postmortem where someone was being blamed. How did you respond?", lookFor: "Steers to systemic causes, protects psychological safety and still drives accountability for fixes." }
      ],
      curriculum: {
        foundational: {
          title: "Site Reliability Foundations",
          summary: "An introduction to SRE for engineers moving from support, sysadmin or development roles: monitoring, Linux troubleshooting, incident basics and SLO thinking.",
          duration: "4 weeks",
          modules: [
            { type: "text", title: "What SRE is and why it exists", content: "Site Reliability Engineering, popularised by Google, treats operations as a software problem. SREs keep services reliable while allowing teams to ship quickly.\n\nCore principles:\n- Reliability is a feature users notice, but 100% is the wrong target: it is too expensive and slows change.\n- Service Level Indicators (SLIs) measure what users experience, such as the share of successful requests or requests faster than 300 ms.\n- Service Level Objectives (SLOs) are targets for SLIs, such as 99.9% success over 30 days.\n- The error budget is the allowed unreliability: 0.1% of requests in that example. If budget remains, teams ship faster; if it is spent, they focus on reliability.\n- Toil is manual, repetitive operational work that scales with traffic. SREs automate it away.\n\nWorked example: a 99.9% monthly availability SLO allows roughly 43 minutes of downtime per 30 days. A team that has already used 40 minutes pauses risky launches and fixes the main cause of failures.\n\nSRE differs from traditional ops by writing code, sharing ownership with developers and using data to balance speed against stability." },
            { type: "text", title: "Monitoring and observability", content: "You cannot fix what you cannot see. Observability combines three signal types:\n- Metrics: numeric time series (request rate, latency, CPU). Cheap to store, great for alerts and trends. Prometheus is the common open-source choice; Grafana visualises it.\n- Logs: detailed event records. Use structured (JSON) logs with request IDs so they can be searched.\n- Traces: follow a single request across services, showing where time is spent. OpenTelemetry is the standard for instrumentation.\n\nWhat to measure: the four golden signals — latency, traffic, errors and saturation. For request-driven services the RED method (rate, errors, duration) works well; for resources use USE (utilisation, saturation, errors).\n\nPromQL example for error ratio over five minutes:\nsum(rate(http_requests_total{status=~\"5..\"}[5m])) / sum(rate(http_requests_total[5m]))\n\nUse percentiles, not averages, for latency: an average can hide that 5% of users wait ten seconds.\n\nDashboards should answer “are users OK?” at a glance, then allow drilling into causes." },
            { type: "text", title: "Linux and network troubleshooting", content: "Most incidents end in a Linux host, a network path or a dependency. A repeatable method beats guessing.\n\nMethod:\n1. Define the symptom: what is broken, for whom, since when?\n2. Check what changed: deploys, config, traffic, dependencies.\n3. Narrow down layer by layer.\n\nHost checks:\n- uptime and top: load average versus CPU cores, top processes.\n- free -m: memory and swap; look for the OOM killer in dmesg.\n- df -h and du: disk space; df -i for inodes.\n- iostat: disk latency.\n- journalctl and application logs.\n\nNetwork checks:\n- dig for DNS resolution, curl -v for HTTP and TLS, ss -tulpn for listening ports, traceroute or mtr for path issues.\n\nLocal context: power cuts and ISP instability are real in many Nigerian data centres and offices. Check whether a symptom correlates with generator switchover or link flaps before chasing application bugs.\n\nWorked example: a disk fills up. du -sh /var/log/* shows a log file growing fast. Truncate it safely, fix log rotation, then add an alert on disk usage growth rate." },
            { type: "text", title: "Incident response basics", content: "An incident is any unplanned disruption that affects users or risks doing so. Good response is calm and structured.\n\nRoles:\n- Incident commander: coordinates, decides, keeps everyone focused.\n- Operations lead: hands on keyboard, investigating and mitigating.\n- Communications lead: updates stakeholders and status pages.\n- Scribe: records the timeline.\nOn small teams one person may hold several roles, but name them explicitly.\n\nPriorities: mitigate first, diagnose later. Rolling back a deploy, failing over or shedding load restores users faster than finding root cause live.\n\nCommunication: regular updates at a set interval (for example every 30 minutes) with impact, current actions and next update time.\n\nAfter the incident: a blameless postmortem covering timeline, impact, contributing factors, what went well, and action items with owners and dates. Blameless means focusing on systems and decisions, not punishing people, so engineers share honestly.\n\nWorked example: payments fail after a release. The commander asks for an immediate rollback; errors drop in five minutes. The postmortem finds a missing database index and adds a pre-release query performance check." },
            { type: "quiz", title: "SRE Foundations Check", questions: [
              { q: "What is an error budget?", options: ["The money set aside for outages", "The number of engineers on call", "The allowed amount of unreliability implied by an SLO", "The maximum log volume per day"], answer: 2 },
              { q: "Why are latency percentiles preferred over averages?", options: ["Averages can hide a slow tail of users", "Percentiles are cheaper to store", "Averages cannot be graphed", "Percentiles ignore errors"], answer: 0 },
              { q: "During an incident, what should usually come first?", options: ["Writing the postmortem", "Finding the exact root cause", "Assigning blame", "Mitigating user impact, for example by rolling back"], answer: 3 },
              { q: "Which signal follows a single request across multiple services?", options: ["Metrics", "Traces", "Dashboards", "Alerts"], answer: 1 },
              { q: "A disk shows free space but writes fail with “no space left on device”. What should you check?", options: ["CPU load", "DNS resolution", "Inode usage with df -i", "Swap usage"], answer: 2 },
              { q: "Which best describes toil?", options: ["Manual, repetitive operational work that scales with load", "Writing design documents", "Planning SLOs", "Code review"], answer: 0 }
            ] },
            { type: "assignment", title: "Monitor a service and write a runbook", maxScore: 100, content: "Run a sample web service (provided or your own) with Prometheus and Grafana using Docker Compose.\n\nDeliverables:\n1. A Grafana dashboard showing the four golden signals with latency percentiles.\n2. Two alert rules: one on error ratio, one on saturation, each with a severity and a linked runbook.\n3. A runbook for one alert covering symptoms, checks, mitigation and escalation.\n4. A short mock postmortem for a simulated failure you triggered (for example, stopping the database).\n\nGrading: dashboard quality 25, alert design 25, runbook usefulness 25, postmortem clarity and blamelessness 25." }
          ]
        },
        intensive: {
          title: "Site Reliability Engineering Intensive",
          summary: "Job-ready SRE practice: SLOs and burn-rate alerting, distributed observability, incident command, resilience patterns and capacity planning. Ends with a level-aware capstone on a real-world service.",
          duration: "9 weeks",
          modules: [
            { type: "text", title: "SLOs and burn-rate alerting", content: "SLOs only help if they drive decisions and alerts.\n\nDesigning SLIs: pick what users feel. For an API: availability (good requests / valid requests) and latency (requests under a threshold / valid requests). Measure as close to the user as possible, such as at the load balancer.\n\nSetting SLOs: start from current performance and user expectations, not aspiration. Agree targets with product owners and write an error budget policy: what happens when the budget is spent, such as freezing risky launches.\n\nBurn-rate alerting: instead of alerting on any error spike, alert when the budget is being consumed too fast. Burn rate 1 means you will spend exactly the budget over the window. A common multi-window approach pages when burn rate exceeds about 14 over one hour (confirmed by a short window), and tickets on slower burns over several hours or days.\n\nWorked example: a 99.9% SLO over 30 days. A sudden outage burning budget at 14x would exhaust it in about two days, so it pages. A slow 2x burn creates a ticket to investigate during working hours, avoiding night-time noise.\n\nReview SLOs quarterly and adjust as user needs change." },
            { type: "text", title: "Observability for distributed systems", content: "In microservices, failures hide between services. Mature observability connects signals.\n\nPractices:\n- Instrument with OpenTelemetry SDKs and send data through the OpenTelemetry Collector, which can sample, enrich and route to back ends such as Prometheus, Tempo, Jaeger, Loki or a vendor like Datadog.\n- Propagate trace context through HTTP headers and message queues so traces span the whole journey.\n- Use exemplars to jump from a latency spike on a metric to a specific trace.\n- Control cardinality: labels such as user ID on metrics explode storage costs; put high-cardinality data in traces and logs.\n- Sample intelligently: tail-based sampling keeps slow and failed traces while dropping routine ones.\n\nWorked example: checkout latency is high but each service looks normal. A trace shows the payment service calling a fraud API three times due to retries, each with a 2-second timeout. Individually each call looks fine; together they add six seconds. Fix: shorter timeouts, a retry budget and a cached fallback.\n\nGood observability lets an on-call engineer answer new questions without shipping new code." },
            { type: "text", title: "Incident command and learning", content: "At scale, incident response is a programme, not a hero.\n\nFoundations:\n- Severity levels defined by user and business impact, with clear paging and communication rules for each.\n- Trained incident commanders on rotation; new commanders shadow first.\n- Dedicated incident channels, status page updates and a stakeholder template.\n- Clear handover when incidents span shifts.\n\nDuring incidents: stabilise first using rollbacks, feature flags, failover or load shedding. Avoid making multiple changes at once; record every action with a timestamp.\n\nPostmortems: blameless, written within days, reviewed in a regular forum. Look for contributing factors across technology, process and organisation. Ask “how did this make sense to the person at the time?” Action items must be specific, owned and tracked; prioritise those that prevent recurrence or reduce detection and recovery time.\n\nTrack trends: incident count by severity, time to detect, time to mitigate, and repeat causes.\n\nWorked example: three incidents in a quarter share a cause — config changes without validation. Instead of three separate fixes, the team adds config schema checks in CI and staged rollout for config, eliminating the class of failure." },
            { type: "text", title: "Resilience patterns and capacity planning", content: "Reliable systems assume dependencies will fail.\n\nPatterns:\n- Timeouts on every network call; no infinite waits.\n- Retries with exponential backoff and jitter, limited by a retry budget to avoid retry storms.\n- Circuit breakers stop calling a failing dependency and fail fast.\n- Bulkheads isolate resources so one slow dependency cannot exhaust all threads.\n- Graceful degradation: serve cached or partial results when non-critical parts fail.\n- Load shedding and rate limiting protect the core under overload.\n- Idempotency keys make retried payments safe — critical for mobile-money and card flows.\n\nCapacity planning: model demand from business forecasts and known peaks (salary days, festive seasons, promotions). Load test with k6 or Locust to find the breaking point and the first bottleneck. Keep headroom, configure autoscaling with tested limits and know database and third-party rate limits.\n\nChaos engineering: run controlled experiments, such as killing pods or adding latency to a dependency, with a hypothesis and limited blast radius, to verify these patterns work.\n\nWorked example: load testing shows the database connection pool saturates first. Adding connection pooling and read replicas raises capacity before the peak arrives." },
            { type: "assignment", title: "SLOs and observability for a microservice app", maxScore: 100, content: "Deploy a multi-service demo application (for example the OpenTelemetry Demo) to Kubernetes.\n\nDeliverables:\n1. SLI and SLO definitions for two user journeys, with an error budget policy.\n2. Multi-window burn-rate alerts implemented in Prometheus or your observability tool.\n3. Distributed tracing configured through the OpenTelemetry Collector, with a screenshot of a trace diagnosing an injected fault.\n4. A k6 load test report identifying the first bottleneck and your recommendation.\n\nGrading: SLO design 25, alerting quality 25, tracing and diagnosis 25, load test analysis 15, documentation 10." },
            { type: "quiz", title: "SRE Intensive Assessment", questions: [
              { q: "A service is burning error budget at a rate of 1. What does that mean?", options: ["It has no errors", "It will exactly exhaust its budget by the end of the SLO window", "It is down", "It will exhaust its budget within one hour"], answer: 1 },
              { q: "Why should user IDs not be used as metric labels?", options: ["They create high cardinality that inflates storage and query cost", "They are not strings", "Prometheus forbids text labels", "They break tracing"], answer: 0 },
              { q: "What is the main purpose of adding jitter to retry backoff?", options: ["To make retries faster", "To guarantee success", "To avoid many clients retrying in synchronised waves", "To log retries"], answer: 2 },
              { q: "Why are idempotency keys important for payment APIs?", options: ["They encrypt the payment", "They speed up the database", "They replace authentication", "They ensure a retried request does not charge the customer twice"], answer: 3 },
              { q: "During an incident, why avoid making several changes at once?", options: ["It is against policy", "It becomes unclear which change helped or harmed", "It costs more", "Monitoring stops working"], answer: 1 },
              { q: "Which sampling approach keeps slow and failed traces while dropping routine ones?", options: ["Head-based random sampling", "No sampling", "Metric sampling", "Tail-based sampling"], answer: 3 }
            ] },
            { type: "assignment", title: "Capstone: Reliability for a mobile-money platform", maxScore: 100, content: "A mobile-money platform serving customers across Nigeria handles transfers, airtime purchases and bank payouts through third-party gateways. Users complain of failed transfers at peak times and outages are frequent.\nJunior: Build golden-signal dashboards and actionable alerts for the transfer service, write runbooks for the top three alerts and produce a postmortem for a simulated gateway outage.\nMid: Define SLOs for transfers and payouts, implement burn-rate alerting and tracing, run a load test simulating salary-day traffic, and deliver a prioritised reliability backlog with resilience fixes such as timeouts, retries and idempotency.\nSenior: Design the reliability programme: SLO and error-budget policy, incident severity and command structure, on-call model, multi-gateway resilience architecture, a game day plan and a quarterly roadmap presented to leadership.\nDeliverables: Dashboards or designs, SLO documents, runbooks or programme plan, and a 10-minute recorded walkthrough.\nGrading: Technical soundness 30, user-impact focus 25, incident and learning practices 20, feasibility 15, communication 10." }
          ]
        }
      }
    },
    {
      id: "platform",
      title: "Platform Engineer",
      summary: "Builds and runs the internal developer platform — Kubernetes clusters, golden-path templates, self-service infrastructure and developer portals — so product teams can ship without reinventing infrastructure. Treats the platform as a product with developers as its customers, working with SRE, security and DevOps peers.",
      competencies: [
        { name: "Kubernetes platform operations", weight: 25, description: "Builds, upgrades and secures multi-tenant Kubernetes clusters and their core add-ons." },
        { name: "Self-service & golden paths", weight: 20, description: "Designs templates, APIs and portals that let developers provision and deploy safely on their own." },
        { name: "Infrastructure automation", weight: 20, description: "Automates infrastructure with Terraform, Crossplane or similar and GitOps reconciliation." },
        { name: "Platform security & policy", weight: 15, description: "Enforces multi-tenancy, policy as code, secrets and supply-chain controls by default." },
        { name: "Platform product thinking", weight: 20, description: "Measures adoption and developer experience and prioritises the platform roadmap like a product." }
      ],
      levels: {
        junior: {
          minYears: 1,
          focus: "Trusted to operate platform components and extend templates and automation under guidance.",
          responsibilities: [
            "Maintain cluster add-ons such as ingress, cert-manager and monitoring agents",
            "Extend service templates and Helm charts used by product teams",
            "Handle developer support requests for namespaces, access and pipelines",
            "Write automation and Terraform changes for platform resources",
            "Document platform features and onboarding guides"
          ],
          skills: [
            "Kubernetes fundamentals",
            "Helm chart basics",
            "Terraform basics",
            "GitOps workflows",
            "Linux and containers",
            "YAML and scripting",
            "Developer support"
          ],
          tools: ["Kubernetes", "Helm", "Argo CD", "Terraform", "Backstage", "cert-manager"],
          certifications: ["Kubernetes and Cloud Native Associate (KCNA)", "Certified Kubernetes Application Developer (CKAD)", "HashiCorp Certified: Terraform Associate (004)"],
          aiTopics: [
            "Kubernetes core objects, namespaces and RBAC basics",
            "Ingress, TLS certificates and DNS for services",
            "Helm and GitOps fundamentals",
            "Container image basics and registries",
            "Supporting developers: triage, documentation and communication"
          ],
          aiScenarios: [
            "A team’s new service is deployed but unreachable through the ingress. Walk me through how you debug it.",
            "A developer asks for cluster-admin access to fix their deployment. How do you respond and help them?",
            "TLS certificates for several services expired overnight. What do you check and how do you prevent recurrence?"
          ],
          aiExpectations: "A ready junior understands core Kubernetes networking and RBAC, debugs from Service to Pod methodically, and supports developers helpfully without bypassing controls. Red flags include granting broad permissions to unblock people, editing live resources instead of Git, or poor communication with users.",
          proQuestions: [
            { q: "Explain how a request reaches a Pod from outside the cluster.", lookFor: "DNS, load balancer, ingress controller, Service selection and endpoints, with awareness of where things break." },
            { q: "Tell me about a time you helped a developer get unblocked on infrastructure.", lookFor: "Understanding their need, fixing or guiding, and improving docs or templates to prevent repeats." },
            { q: "How does Kubernetes RBAC work, and how would you give a team access only to its namespace?", lookFor: "Roles vs ClusterRoles, RoleBindings scoped to namespace, groups from the IdP." },
            { q: "Walk me through a change you made to a Helm chart or template. How did you test it?", lookFor: "Templating, values, helm template/lint, testing in a non-production cluster and review." },
            { q: "How would you document a platform feature so developers actually use it?", lookFor: "Task-oriented guides, examples, discoverability in a portal and feedback loops." }
          ]
        },
        mid: {
          minYears: 3,
          focus: "Trusted to design and own major platform capabilities used by many product teams.",
          responsibilities: [
            "Design and run production Kubernetes clusters including upgrades",
            "Build golden-path templates for new services with CI/CD and observability built in",
            "Implement self-service infrastructure via Terraform modules or Crossplane",
            "Enforce policy as code for security and multi-tenancy",
            "Run a developer portal and measure platform adoption"
          ],
          skills: [
            "Cluster lifecycle management",
            "Golden path design",
            "Crossplane compositions",
            "Policy as code",
            "Multi-tenancy design",
            "Developer portal setup",
            "Platform observability"
          ],
          tools: ["Kubernetes", "Backstage", "Crossplane", "Kyverno", "Argo CD", "External Secrets Operator"],
          certifications: ["Certified Kubernetes Administrator (CKA)", "Certified Kubernetes Security Specialist (CKS)", "Certified Cloud Native Platform Engineering Associate (CNPA)"],
          aiTopics: [
            "Cluster upgrades, version skew and add-on compatibility",
            "Golden paths and service templates with Backstage scaffolder",
            "Self-service infrastructure APIs with Crossplane or Terraform",
            "Multi-tenancy: namespaces, quotas, network policies and policy engines",
            "Secrets management and workload identity"
          ],
          aiScenarios: [
            "You must upgrade twelve production clusters across two Kubernetes minor versions. Plan the process and risk controls.",
            "Product teams take two weeks to get a new service into production. Design a golden path that gets it under a day.",
            "One tenant’s workload is consuming most of a shared cluster’s resources and degrading others. How do you fix it now and prevent it later?"
          ],
          aiExpectations: "A ready mid-level platform engineer designs capabilities that are secure by default and easy to use, plans cluster operations carefully and measures adoption. Red flags include building features nobody asked for, upgrades without rollback plans, or multi-tenancy without quotas and policy.",
          proQuestions: [
            { q: "Describe a golden path or service template you built. How did teams adopt it?", lookFor: "What was included by default, how they gathered feedback, and adoption or lead-time metrics." },
            { q: "Walk me through how you upgrade a production Kubernetes cluster.", lookFor: "Reading release notes, deprecated API checks, add-on compatibility, staged rollout, node draining and rollback plan." },
            { q: "How do you enforce security policies on the platform without blocking developers?", lookFor: "Audit mode first, clear error messages, exceptions process and policy tests in CI." },
            { q: "How would you let developers provision a database themselves safely?", lookFor: "Opinionated abstraction via Crossplane or Terraform modules, guardrails, secrets delivery and cost visibility." },
            { q: "How do you decide what goes on the platform roadmap?", lookFor: "User research, pain-point data, adoption metrics and balancing reliability work with new features." }
          ]
        },
        senior: {
          minYears: 6,
          focus: "Trusted to set the internal platform strategy and architecture, lead the platform as a product and mentor engineers.",
          responsibilities: [
            "Define the internal developer platform vision, architecture and roadmap",
            "Own platform reliability, security posture and cost at organisation scale",
            "Lead build-versus-buy decisions for platform capabilities",
            "Partner with engineering leaders to drive adoption and measure developer experience",
            "Mentor platform engineers and establish platform team practices"
          ],
          skills: [
            "Platform strategy",
            "Platform-as-product management",
            "Multi-cluster architecture",
            "Build-versus-buy analysis",
            "Developer experience metrics",
            "Stakeholder alignment",
            "Engineering mentorship"
          ],
          tools: ["Kubernetes", "Backstage", "Crossplane", "Argo CD", "Open Policy Agent", "Terraform"],
          certifications: ["Certified Kubernetes Administrator (CKA)", "Certified Kubernetes Security Specialist (CKS)", "Google Cloud Professional Cloud Architect"],
          aiTopics: [
            "Internal developer platform architecture and reference models",
            "Platform-as-product: user research, adoption and DX metrics",
            "Multi-cluster and multi-region fleet management",
            "Build-versus-buy and total cost of ownership",
            "Organisational design and team topologies for platform teams"
          ],
          aiScenarios: [
            "A growing fintech has forty engineers using a mix of VMs, ad-hoc scripts and one Kubernetes cluster. Design the platform strategy for the next 18 months.",
            "Adoption of your platform has stalled at 40% of teams. How do you diagnose why and change course?",
            "Leadership asks whether to buy a commercial platform or keep building on open source. How do you make and present the decision?"
          ],
          aiExpectations: "A ready senior treats the platform as a product with clear users and outcomes, designs a coherent architecture that teams can adopt incrementally, and leads with evidence. Red flags include mandating adoption without value, overbuilding for imaginary scale, or ignoring team cognitive load and cost.",
          proQuestions: [
            { q: "Describe a platform you led. What was the vision and how did you know it was working?", lookFor: "Clear user problem, architecture, adoption and DX metrics, and honest lessons." },
            { q: "Tell me about a build-versus-buy decision you made for a platform capability.", lookFor: "Requirements, TCO, team capacity, lock-in risk and how the decision was revisited." },
            { q: "How do you reduce cognitive load for product teams without hiding too much?", lookFor: "Sensible abstractions, escape hatches, good defaults and documentation, informed by user feedback." },
            { q: "How have you handled a team that refused to adopt the platform?", lookFor: "Listening to their reasons, addressing gaps or accepting valid exceptions, and building trust." },
            { q: "How do you grow platform engineers to think like product owners?", lookFor: "Involving them in user research, ownership of capabilities, metrics and mentoring examples." }
          ]
        }
      },
      hrScenarios: [
        { q: "Tell me about a time internal users were frustrated with a tool or service you owned. How did you respond?", lookFor: "Treats them as customers, listens without defensiveness, and acts on feedback visibly." },
        { q: "Describe a situation where you had to say no to a team’s request for the platform. How did you handle it?", lookFor: "Clear reasoning, offering alternatives or a timeline, and keeping the relationship constructive." },
        { q: "Tell me about a time you had to coordinate a disruptive change, such as a migration, across many teams.", lookFor: "Early communication, a realistic plan, support for teams and follow-through on stragglers." }
      ],
      curriculum: {
        foundational: {
          title: "Platform Engineering Foundations",
          summary: "An introduction to platform engineering for DevOps, sysadmin and developer backgrounds: Kubernetes basics, GitOps, templates and the platform-as-product mindset.",
          duration: "5 weeks",
          modules: [
            { type: "text", title: "What platform engineering is", content: "Platform engineering builds an internal developer platform (IDP): a set of self-service tools, templates and infrastructure that lets product teams build and run software without each team becoming infrastructure experts.\n\nWhy it emerged: as organisations adopted cloud, Kubernetes and microservices, every team had to learn dozens of tools. That cognitive load slowed delivery and created inconsistent, insecure setups.\n\nKey ideas:\n- Golden paths: opinionated, supported ways to do common tasks, such as creating a new service with CI/CD, monitoring and security built in.\n- Self-service: developers get what they need through a portal, API or Git change, not a ticket queue.\n- Platform as a product: developers are the customers. The platform team does user research, measures adoption and improves based on feedback.\n- Thinnest viable platform: start small with the most painful problems, not a grand build.\n\nWorked example: a fintech’s teams each took two weeks to set up a new service. The platform team built a template that creates a repository, pipeline, Kubernetes manifests and dashboards in minutes. Lead time drops and every service now has the same security baseline.\n\nPlatform engineering complements DevOps and SRE rather than replacing them." },
            { type: "text", title: "Kubernetes essentials for platforms", content: "Kubernetes is the foundation of most modern internal platforms.\n\nArchitecture: a control plane (API server, scheduler, controllers, etcd) manages worker nodes that run Pods. Managed services such as Amazon EKS, Azure AKS and Google GKE run the control plane for you.\n\nObjects you will use daily:\n- Namespace: a logical boundary, often one per team or service.\n- Deployment, Service, Ingress: run, expose and route to applications.\n- ConfigMap and Secret: configuration.\n- ResourceQuota and LimitRange: cap what a namespace can consume.\n- Role and RoleBinding: who can do what in a namespace.\n\nPlatform add-ons are cluster-wide components the platform team runs: an ingress controller (ingress-nginx or a Gateway API implementation), cert-manager for TLS, ExternalDNS, monitoring agents and a policy engine.\n\nWorked example: a team’s service is unreachable. Check DNS, then the Ingress rules and TLS certificate, then whether the Service selector matches Pod labels (kubectl get endpoints), then Pod readiness. Most issues are a label mismatch or a failing readiness probe." },
            { type: "text", title: "GitOps and templates", content: "Platforms rely on Git as the source of truth and on templates for consistency.\n\nGitOps: tools like Argo CD or Flux continuously reconcile the cluster with manifests stored in Git. Benefits for platforms: every change is reviewed, auditable and reversible, and drift is corrected automatically. Platform add-ons and team applications can both be managed this way, often using an “app of apps” pattern.\n\nTemplates: Helm charts or Kustomize bases provide a standard way to deploy services. A good service chart includes sensible defaults for probes, resource requests, security context (non-root, read-only filesystem) and labels for monitoring.\n\nScaffolding: Backstage’s software templates (scaffolder) generate a new repository from a template, fill in names and owners, register the service in the catalog and set up the pipeline.\n\nChecklist for a golden-path template:\n- Repository with CI pipeline and tests.\n- Dockerfile following best practice.\n- Kubernetes manifests with secure defaults.\n- Dashboards and alerts.\n- Ownership metadata in the catalog.\n- Documentation on how to extend it." },
            { type: "text", title: "Platform as a product", content: "The biggest platform failures are not technical; they are platforms nobody wants to use.\n\nProduct practices for platform teams:\n- Know your users: interview developers, shadow them deploying a service, and map where time is lost.\n- Define value: what problem does each capability solve, and for whom?\n- Measure: adoption (share of services on the golden path), lead time for a new service, deployment frequency, developer satisfaction surveys and support ticket volume.\n- Market internally: demos, documentation, office hours and champions in product teams.\n- Keep escape hatches: allow teams with valid needs to go off-path while still meeting security baselines.\n\nCognitive load is a useful lens: the platform should remove undifferentiated work, not hide everything. Developers should still understand how their service runs.\n\nLocal context: many Nigerian engineering teams are small and growing quickly. A lightweight platform — a template, a GitOps repo and good docs — often delivers more value than a large custom portal.\n\nWorked example: survey results show developers waste time getting database credentials. The team prioritises automated secret delivery over a planned UI redesign, and ticket volume drops." },
            { type: "quiz", title: "Platform Foundations Check", questions: [
              { q: "What is a golden path?", options: ["A mandatory approval process", "An opinionated, supported way to perform a common task", "The fastest network route", "A premium cloud tier"], answer: 1 },
              { q: "A Service has no endpoints. What is the most likely cause?", options: ["The selector does not match the Pod labels or Pods are not ready", "The cluster has too many nodes", "TLS is misconfigured", "The namespace is too large"], answer: 0 },
              { q: "Which object limits the total CPU and memory a namespace can consume?", options: ["Ingress", "ConfigMap", "RoleBinding", "ResourceQuota"], answer: 3 },
              { q: "Which metric best indicates whether a platform is delivering value?", options: ["Number of tools installed", "Size of the platform team", "Adoption and lead time for teams using it", "Number of clusters"], answer: 2 },
              { q: "What does Argo CD do in a GitOps setup?", options: ["Builds container images", "Reconciles the cluster state to match manifests in Git", "Scans code for vulnerabilities", "Manages DNS records"], answer: 1 },
              { q: "Why keep escape hatches on a platform?", options: ["So teams with valid special needs can go off-path while meeting baselines", "To avoid writing documentation", "To disable security controls", "To reduce adoption"], answer: 0 }
            ] },
            { type: "assignment", title: "Build a mini golden path", maxScore: 100, content: "Create a minimal golden path for deploying a new web service to a local kind or minikube cluster.\n\nDeliverables:\n1. A service template repository (cookiecutter, Backstage template or a simple script) that generates a Dockerfile, CI pipeline and Helm chart with secure defaults.\n2. An Argo CD setup that deploys generated services from Git.\n3. A namespace-per-team setup with ResourceQuota and RBAC.\n4. A one-page developer guide explaining how to create and deploy a service in under 15 minutes.\n\nGrading: template quality and secure defaults 30, GitOps setup 25, multi-tenancy controls 20, developer guide usability 15, presentation 10." }
          ]
        },
        intensive: {
          title: "Platform Engineering Intensive",
          summary: "Job-ready platform engineering: production cluster operations, self-service infrastructure, policy and multi-tenancy, developer portals and platform product management. Ends with a level-aware capstone.",
          duration: "10 weeks",
          modules: [
            { type: "text", title: "Production cluster operations", content: "Running clusters for many teams demands discipline.\n\nCluster design:\n- Managed control planes (EKS, AKS, GKE) reduce operational burden.\n- Separate clusters by environment and, where needed, by compliance boundary. Use node pools for different workload types.\n- Define everything — clusters, node pools, add-ons — in Terraform and GitOps.\n\nUpgrades: Kubernetes releases a minor version roughly three times a year, and each is supported for a limited period, so upgrades are routine work. A safe process:\n1. Read release notes and deprecated APIs; scan manifests with a tool such as Pluto or kubent.\n2. Check add-on compatibility.\n3. Upgrade non-production first and run smoke tests.\n4. Upgrade the control plane, then node pools with surge and PodDisruptionBudgets respected.\n5. Have a documented rollback or blue-green cluster strategy.\n\nCapacity: use cluster autoscaling or Karpenter, set resource requests on every workload, and watch for bin-packing waste.\n\nWorked example: an upgrade breaks ingress because a deprecated API was removed. Scanning manifests before upgrading would have flagged it; the team adds the scan to CI for all charts." },
            { type: "text", title: "Self-service infrastructure", content: "Developers need databases, queues and buckets, not just clusters. Self-service infrastructure lets them provision these safely.\n\nApproaches:\n- Terraform modules triggered through a portal or pull request, applied by CI. Simple and widely understood.\n- Crossplane: defines infrastructure as Kubernetes APIs. Platform teams publish Composite Resource Definitions (XRDs) such as a PostgreSQLInstance with a few parameters (size, environment); compositions map them to real cloud resources with secure defaults.\n- Operators for in-cluster services.\n\nDesign principles:\n- Expose intent, not every knob: “small, medium, large” instead of 50 parameters.\n- Bake in encryption, backups, tagging and network isolation.\n- Deliver credentials automatically via External Secrets Operator or workload identity.\n- Show cost to teams so self-service does not become uncontrolled spend.\n\nWorked example: instead of filing a ticket and waiting days, a developer adds a short PostgreSQLInstance manifest to their service repo. Argo CD applies it, Crossplane creates an encrypted, backed-up managed database in a private subnet, and the connection secret appears in their namespace." },
            { type: "text", title: "Policy, security and multi-tenancy", content: "A shared platform must keep tenants safe from each other and from mistakes.\n\nMulti-tenancy controls:\n- Namespaces per team or service with RBAC bound to IdP groups.\n- ResourceQuotas and LimitRanges to prevent noisy neighbours.\n- NetworkPolicies to default-deny traffic between namespaces, allowing only what is needed.\n- Pod Security Standards (restricted profile) to block privileged containers.\n\nPolicy as code: Kyverno or OPA Gatekeeper enforce rules at admission, such as requiring resource requests, disallowing latest tags, requiring signed images and mandatory ownership labels. Roll out in audit mode first, publish clear messages and test policies in CI.\n\nSecrets: avoid plain Kubernetes Secrets in Git. Use External Secrets Operator with a vault or cloud secret manager, and workload identity for cloud access.\n\nCompliance: platform defaults are the cheapest way to meet obligations such as NDPA 2023 safeguards — encryption, access logging and least privilege applied once for every team.\n\nWorked example: a policy in audit mode reveals that many deployments lack resource requests. The team updates the golden-path chart, notifies owners and switches the policy to enforce a month later." },
            { type: "text", title: "Developer portals and platform metrics", content: "A developer portal is the front door to the platform.\n\nBackstage, an open-source CNCF project, is the most widely used foundation. Core features:\n- Software catalog: every service, owner, API and dependency in one place.\n- Scaffolder: templates that create new services on the golden path.\n- TechDocs: documentation-as-code shown alongside each service.\n- Plugins: surface CI status, deployments, costs and incidents.\n\nA portal is not the platform; it is an interface. Start with the catalog and one high-value template rather than many half-finished plugins.\n\nMeasuring the platform:\n- Adoption: share of services and teams on golden paths.\n- Speed: time to first deploy for a new service; DORA metrics for platform users.\n- Quality: incidents caused by platform components, policy violations over time.\n- Experience: regular developer surveys and support ticket trends.\n\nRun the platform like a product: publish a roadmap, hold demos, gather feedback in office hours and retire capabilities nobody uses.\n\nWorked example: the catalog shows forty services with no listed owner. The team makes ownership mandatory in templates and runs a clean-up campaign, improving incident routing." },
            { type: "assignment", title: "Self-service database capability", maxScore: 100, content: "Build a self-service capability that lets developers request a PostgreSQL database for their service.\n\nDeliverables:\n1. A Crossplane composition (or Terraform module triggered via pull request) exposing a simple interface with secure defaults: encryption, backups, private networking and tags.\n2. Automatic delivery of connection credentials into the team namespace.\n3. Kyverno or Gatekeeper policies enforcing required labels and size limits.\n4. A Backstage template or documented workflow showing how a developer requests the database.\n\nGrading: abstraction and interface design 30, security defaults 25, automation end to end 20, policy enforcement 15, documentation 10." },
            { type: "quiz", title: "Platform Intensive Assessment", questions: [
              { q: "What should be done before upgrading a cluster to a new Kubernetes minor version?", options: ["Delete all workloads", "Scan for deprecated or removed APIs and check add-on compatibility", "Disable PodDisruptionBudgets permanently", "Upgrade production first"], answer: 1 },
              { q: "What does a Crossplane Composite Resource Definition provide?", options: ["A container image", "A CI pipeline", "A platform-defined API for requesting infrastructure", "A network policy"], answer: 2 },
              { q: "Why roll out new admission policies in audit mode first?", options: ["To discover violations and inform teams before blocking deployments", "Audit mode is faster", "Enforce mode does not exist", "To avoid writing policies"], answer: 0 },
              { q: "Which control prevents Pods in one namespace from talking to another by default?", options: ["ResourceQuota", "LimitRange", "ConfigMap", "A default-deny NetworkPolicy"], answer: 3 },
              { q: "Which is the best signal that a golden path is succeeding?", options: ["The portal has many plugins", "The platform team is large", "Time to first deploy falls and adoption rises", "The template has many parameters"], answer: 2 },
              { q: "Why expose “small, medium, large” instead of every cloud parameter in a self-service database API?", options: ["It reduces cognitive load and embeds safe defaults", "Clouds only support three sizes", "It is required by Kubernetes", "It hides costs from teams"], answer: 0 }
            ] },
            { type: "assignment", title: "Capstone: Internal developer platform for a scaling fintech", maxScore: 100, content: "A Lagos fintech with about forty engineers runs services on a mix of VMs, scripts and one Kubernetes cluster. New services take weeks to launch, security baselines vary and leadership wants a platform that speeds delivery and meets NDPA 2023 obligations.\nJunior: Operate a provided cluster setup: install and configure ingress, cert-manager and monitoring via GitOps, extend the service Helm chart with secure defaults and write onboarding documentation.\nMid: Build the golden path end to end: Backstage template, CI/CD, GitOps deployment, multi-tenant namespaces with policy as code, and one self-service infrastructure capability, with adoption metrics defined.\nSenior: Design the platform strategy: target architecture, build-versus-buy decisions, team structure, security and compliance defaults, an 18-month roadmap and the metrics you will report to leadership, plus a migration plan for existing services.\nDeliverables: Repositories or design pack, architecture diagrams, documentation or roadmap, and a 10-minute recorded walkthrough.\nGrading: Architecture and technical quality 30, developer experience and adoption thinking 25, security and governance 20, feasibility 15, communication 10." }
          ]
        }
      }
    }
  ]
};

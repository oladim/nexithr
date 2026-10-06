// Placeholder training catalogs. Swap these for API data.
// SPECIFIC = the enrolled/paid programme for candidates who trained with us.
// SUGGESTED = recommendations for candidates who didn't subscribe.

export const SPECIFIC_COURSES = [
  { id: "s1", title: "Backend Development", provider: "TechCorp Inc", badge: "Enrolled", type: "Backend", form: "Online", price: 99, weeks: 6, desc: "If you are looking to gain experience in backend development, this course is for you — real projects and mentor reviews." },
  { id: "s2", title: "Product Development", provider: "NexIT Academy", badge: "Paid", type: "Product", form: "Online", price: 120, weeks: 8, desc: "Take your product skills from idea to shipped feature with hands-on modules and assessments." },
  { id: "s3", title: "Product Design", provider: "Design.co", badge: "Enrolled", type: "Design", form: "Online", price: 89, weeks: 5, desc: "Master UX and UI fundamentals, prototyping and design systems through guided projects." },
  { id: "s4", title: "Test Development", provider: "QualityLabs", badge: "Paid", type: "Backend", form: "Onsite", price: 110, weeks: 6, desc: "Learn automated and manual testing practices used by high-performing engineering teams." },
  { id: "s5", title: "Frontend Development", provider: "TechCorp Inc", badge: "Enrolled", type: "Frontend", form: "Online", price: 99, weeks: 6, desc: "Build responsive, accessible interfaces with modern frameworks and real-world tasks." },
  { id: "s6", title: "Data Foundations", provider: "DataWise", badge: "Paid", type: "Data", form: "Online", price: 130, weeks: 7, desc: "From SQL to analytics — a practical grounding in working with data for tech roles." },
];

export const SUGGESTED_COURSES = [
  { id: "g1", title: "Backend Development", provider: "TechCorp Inc", badge: "Recommended", type: "Backend", form: "Online", price: 0, weeks: 6, desc: "If you are looking to gain experience in backend development, this course is a great place to start." },
  { id: "g2", title: "Frontend Development", provider: "Skilled", badge: "Popular", type: "Frontend", form: "Online", price: 0, weeks: 4, desc: "A popular intro to building modern web interfaces — great for closing frontend skill gaps." },
  { id: "g3", title: "Product Management", provider: "PM School", badge: "Recommended", type: "Product", form: "Online", price: 49, weeks: 5, desc: "Learn to define, prioritise and ship products that users love." },
  { id: "g4", title: "UX Research", provider: "Design.co", badge: "Popular", type: "Design", form: "Online", price: 0, weeks: 3, desc: "Understand your users with practical research methods and usability testing." },
  { id: "g5", title: "Cloud Basics", provider: "CloudPath", badge: "Recommended", type: "Backend", form: "Online", price: 59, weeks: 6, desc: "Get comfortable with cloud deployment, containers and CI/CD pipelines." },
  { id: "g6", title: "Data Analytics", provider: "DataWise", badge: "Popular", type: "Data", form: "Onsite", price: 0, weeks: 4, desc: "Turn raw data into insight with spreadsheets, SQL and visualisation tools." },
];

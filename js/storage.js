import { generateId, showToast } from './utils.js';

export const STORAGE_KEY = 'portfolia_user_portfolio_v1';

export const DEFAULT_PORTFOLIO_DATA = {
  profile: {
    fullName: "Kartik Patel",
    title: "Software Engineer",
    photo: "assets/images/profile.jpg",
    email: "kt0909@example.com",
    phone: "+91 1234567890",
    location: "Bengaluru, India",
    website: "",
    bio: "Early-career Software Engineer with a Master's degree in Computer Applications and a strong foundation in Object-Oriented Programming, Data Structures, Algorithms, and web development. Experienced in building practical web applications using Python, Django, HTML, CSS, and JavaScript.",
    about: "Early-career Software Engineer with a Master's degree in Computer Applications and a strong foundation in Object-Oriented Programming, Data Structures, Algorithms, and web development. Passionate about building practical and user-friendly applications while continuously improving software development skills."
  },
  skills: [
    { id: generateId(), name: "Python", category: "Backend / Programming", level: 85 },
    { id: generateId(), name: "JavaScript", category: "Frontend", level: 85 },
    { id: generateId(), name: "HTML5", category: "Frontend", level: 90 },
    { id: generateId(), name: "CSS3", category: "Frontend", level: 85 },
    { id: generateId(), name: "Django", category: "Web Framework", level: 80 },
    { id: generateId(), name: "SQL", category: "Database", level: 80 },
    { id: generateId(), name: "Git", category: "Version Control", level: 85 },
    { id: generateId(), name: "GitHub", category: "Version Control", level: 85 },
    { id: generateId(), name: "Object-Oriented Programming", category: "Core Concepts", level: 85 },
    { id: generateId(), name: "Data Structures", category: "Core Concepts", level: 85 },
    { id: generateId(), name: "Algorithms", category: "Core Concepts", level: 80 }
  ],
  education: [
    {
      id: generateId(),
      degree: "Master of Computer Applications (MCA)",
      institution: "IPS Academy",
      location: "Indore, India",
      startYear: "2021",
      endYear: "2023",
      description: "Master's degree focused on computer applications, programming, software development, databases, and core computer science concepts."
    }
  ],
  experience: [
    {
      id: generateId(),
      title: "Software Developer",
      company: "Freelance / Personal Projects",
      location: "Remote",
      startDate: "2023-06",
      endDate: "",
      current: true,
      description: "Developed practical web applications and projects using Python, Django, HTML, CSS, and JavaScript, with a focus on clean functionality and user-friendly interfaces."
    }
  ],
  projects: [
    {
      id: generateId(),
      name: "Freelancer Marketplace",
      description: "Developed a full-stack freelancer marketplace web application using Python and Django, with features designed to connect clients and freelancers through a structured platform.",
      technologies: ["Python", "Django", "HTML", "CSS", "JavaScript"],
      githubUrl: "",
      demoUrl: "",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
      featured: true
    },
    {
      id: generateId(),
      name: "Emotion Face Reader",
      description: "Built an application that analyzes facial expressions and identifies emotions using computer vision concepts.",
      technologies: ["Python", "Computer Vision", "HTML", "CSS", "JavaScript"],
      githubUrl: "",
      demoUrl: "",
      image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80",
      featured: true
    },
    {
      id: generateId(),
      name: "Portfolio Builder",
      description: "Created a frontend portfolio builder using HTML, CSS, and JavaScript that allows users to enter their professional information, customize templates, preview portfolios, and save data locally.",
      technologies: ["HTML", "CSS", "JavaScript"],
      githubUrl: "",
      demoUrl: "",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
      featured: false
    }
  ],
  certifications: [
    {
      id: generateId(),
      name: "Enter your certification",
      organization: "Organization name",
      issueDate: "",
      credentialId: "",
      credentialUrl: ""
    }
  ],
  social: {
    github: "",
    linkedin: "",
    twitter: "",
    instagram: "",
    youtube: "",
    website: ""
  },
  template: "modern",
  theme: {
    primaryColor: "#6366f1",
    accentColor: "#8b5cf6",
    backgroundColor: "#0f172a",
    textColor: "#f8fafc",
    fontFamily: "'Inter', sans-serif",
    mode: "dark",
    borderRadius: "12px",
    sectionSpacing: "48px",
    cardStyle: "glass"
  },
  sectionOrder: ["profile", "skills", "experience", "projects", "education", "certifications"]
};

let currentPortfolioData = null;

export function cloneData(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export function loadPortfolioData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      currentPortfolioData = cloneData(DEFAULT_PORTFOLIO_DATA);
      savePortfolioData(currentPortfolioData, false);
      return currentPortfolioData;
    }
    const parsed = JSON.parse(raw);
    currentPortfolioData = {
      ...cloneData(DEFAULT_PORTFOLIO_DATA),
      ...parsed,
      profile: { ...DEFAULT_PORTFOLIO_DATA.profile, ...(parsed.profile || {}) },
      social: { ...DEFAULT_PORTFOLIO_DATA.social, ...(parsed.social || {}) },
      theme: { ...DEFAULT_PORTFOLIO_DATA.theme, ...(parsed.theme || {}) },
      skills: Array.isArray(parsed.skills) ? parsed.skills : cloneData(DEFAULT_PORTFOLIO_DATA.skills),
      education: Array.isArray(parsed.education) ? parsed.education : cloneData(DEFAULT_PORTFOLIO_DATA.education),
      experience: Array.isArray(parsed.experience) ? parsed.experience : cloneData(DEFAULT_PORTFOLIO_DATA.experience),
      projects: Array.isArray(parsed.projects) ? parsed.projects : cloneData(DEFAULT_PORTFOLIO_DATA.projects),
      certifications: Array.isArray(parsed.certifications) ? parsed.certifications : cloneData(DEFAULT_PORTFOLIO_DATA.certifications),
      sectionOrder: Array.isArray(parsed.sectionOrder) ? parsed.sectionOrder : cloneData(DEFAULT_PORTFOLIO_DATA.sectionOrder)
    };
    return currentPortfolioData;
  } catch (err) {
    console.error('Error loading portfolio data from LocalStorage:', err);
    currentPortfolioData = cloneData(DEFAULT_PORTFOLIO_DATA);
    return currentPortfolioData;
  }
}

export function savePortfolioData(data, notify = false) {
  try {
    currentPortfolioData = data;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    const statusEl = document.getElementById('save-status');
    if (statusEl) {
      statusEl.innerHTML = `<i class="fa-solid fa-check text-success"></i> Saved`;
      statusEl.classList.remove('status-saving');
      statusEl.classList.add('status-saved');
    }

    if (notify) {
      showToast('Portfolio saved successfully!', 'success');
    }
  } catch (err) {
    console.error('Failed to save to LocalStorage:', err);
    if (err.name === 'QuotaExceededError' || err.code === 22) {
      showToast('Storage quota exceeded! Try using smaller image uploads.', 'error');
    } else {
      showToast('Could not save data locally.', 'error');
    }
  }
}

export function getPortfolioData() {
  if (!currentPortfolioData) {
    return loadPortfolioData();
  }
  return currentPortfolioData;
}

export function resetPortfolioData() {
  const emptyState = {
    profile: {
      fullName: "",
      title: "",
      photo: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      bio: "",
      about: ""
    },
    skills: [],
    education: [],
    experience: [],
    projects: [],
    certifications: [],
    social: {
      github: "",
      linkedin: "",
      twitter: "",
      instagram: "",
      youtube: "",
      website: ""
    },
    template: "modern",
    theme: cloneData(DEFAULT_PORTFOLIO_DATA.theme),
    sectionOrder: ["profile", "skills", "experience", "projects", "education", "certifications"]
  };
  savePortfolioData(emptyState, true);
  return emptyState;
}

export function loadDemoData() {
  const demo = cloneData(DEFAULT_PORTFOLIO_DATA);
  savePortfolioData(demo, true);
  showToast('⚡ Demo data loaded successfully!', 'success');
  return demo;
}

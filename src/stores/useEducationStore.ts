import { create } from 'zustand';

export interface Education {
  id: number;
  degree: string;
  school: string;
  location: string;
  period: string;
  gpa: string;
  status: string;
  description: string;
  coursework: string[];
  achievements: string[];
}

interface EducationState {
  education: Education[];
}

export const useEducationStore = create<EducationState>(() => ({
  education: [
    {
      id: 1,
      degree: "Bachelor of Science in Information Technology",
      school: "Liceo de Cagayan University",
      location: "Cagayan de Oro, Misamis Oriental",
      period: "2022 - 2026",
      gpa: "",
      status: "In Progress",
      description: "Pursuing comprehensive education in Information Technology with focus on software development, database management, and modern web technologies. Building expertise in full-stack development and emerging technologies.",
      coursework: [
        "Software Development",
        "Database Management Systems",
        "Web Technologies",
        "Mobile Application Development",
        "System Analysis & Design",
        "Network Administration"
      ],
      achievements: [
        "Consistent Dean's Lister (8 semesters)",
        "President, Wizardry Society (2024 - 2025)",
        "Vice President, Wizardry Society (2025 - 2026)",
        "Participant, Hack4Gov (2024)"
      ]
    },
    {
      id: 2,
      degree: "Information Communication Technology (ICT) Strand",
      school: "Liceo de Cagayan University",
      location: "Cagayan de Oro, Misamis Oriental",
      period: "2020 - 2022",
      gpa: "",
      status: "Graduated",
      description: "Completed Senior High School with specialization in Information Communication Technology, focusing on computer programming, web development, and IT fundamentals.",
      coursework: [
        "Computer Programming",
        "Web Development",
        "Database Fundamentals",
        "Networking Basics",
        "IT Fundamentals",
        "Digital Design"
      ],
      achievements: [
        "ICT Strand Graduate",
        "Foundation in IT Technologies"
      ]
    }
  ]
}));

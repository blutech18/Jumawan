"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { useInView } from "react-intersection-observer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Calendar, ExternalLink } from "lucide-react";

const certificates = [
  {
    id: 1,
    title: "React Developer Certification",
    issuer: "Meta (Facebook)",
    date: "2024",
    skills: ["React", "JavaScript", "Frontend Development"],
    description: "Advanced certification covering modern React patterns, hooks, and state management.",
    credentialUrl: "#",
    imageUrl: "/placeholder.svg"
  },
  {
    id: 2,
    title: "Full Stack Web Development",
    issuer: "FreeCodeCamp",
    date: "2023",
    skills: ["HTML", "CSS", "JavaScript", "Node.js", "MongoDB"],
    description: "Comprehensive certification covering both frontend and backend development.",
    credentialUrl: "#",
    imageUrl: "/placeholder.svg"
  },
  {
    id: 3,
    title: "AWS Cloud Practitioner",
    issuer: "Amazon Web Services",
    date: "2023",
    skills: ["AWS", "Cloud Computing", "DevOps"],
    description: "Foundation-level certification in cloud computing and AWS services.",
    credentialUrl: "#",
    imageUrl: "/placeholder.svg"
  },
  {
    id: 4,
    title: "JavaScript Algorithms and Data Structures",
    issuer: "FreeCodeCamp",
    date: "2023",
    skills: ["JavaScript", "Algorithms", "Data Structures"],
    description: "Advanced problem-solving certification focusing on algorithms and data structures.",
    credentialUrl: "#",
    imageUrl: "/placeholder.svg"
  }
];

export function CertificatesSection() {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.4,
        staggerChildren: 0.12,
      },
    },
  }), []);

  const itemVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
  }), []);

  return (
    <section id="certificates" className="py-20 relative overflow-hidden" style={{ backgroundColor: 'hsl(227 100% 8% / 0.5)' }}>
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="w-full px-6 md:px-10 lg:px-16 relative z-10">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Certificates & Achievements
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Professional certifications and achievements that validate my technical expertise
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full"
        >
          {certificates.map((cert) => (
            <motion.div
              key={cert.id}
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="transform-gpu"
              style={{ willChange: "transform, opacity" }}
            >
              <Card className="p-6 h-full bg-gradient-card border-border/20 shadow-card hover:shadow-glow transition-all duration-300 group">
                {/* Certificate Image */}
                <div className="mb-4">
                  <div className="w-full rounded-md overflow-hidden" style={{ aspectRatio: '11 / 8.5' }}>
                    <img
                      src={cert.imageUrl}
                      alt={`${cert.title} certificate`}
                      className="w-full h-full object-contain opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = `
                          <div class=\"flex flex-col items-center justify-center text-muted-foreground\">\n                            <svg class=\"h-12 w-12 mb-2\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z\" stroke=\"currentColor\" stroke-width=\"1.5\"/></svg>\n                            <span class=\"text-sm\">Certificate Image</span>\n                          </div>\n                        `;
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-start gap-4 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:shadow-glow transition-all duration-300 will-change-transform transform-gpu">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {cert.title}
                    </h3>
                    <p className="text-primary font-medium mb-1">{cert.issuer}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{cert.date}</span>
                    </div>
                  </div>
                </div>
                
                <div className="h-px w-full bg-border/20 mb-4" />
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {cert.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {cert.skills.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
                
                <motion.a
                  href={cert.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors font-medium"
                  whileHover={{ x: 5 }}
                >
                  View Credential
                  <ExternalLink className="h-4 w-4" />
                </motion.a>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
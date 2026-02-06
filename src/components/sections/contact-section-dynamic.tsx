"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle, Github, Linkedin, Twitter, Facebook, Instagram, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export function ContactSection() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');



  const submitMessage = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      // Simulate submission or implement actual Supabase logic here
      // For now, we simulate a success response to match the UI behavior
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSubmitStatus('success');
      return true;
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetStatus = () => {
    setSubmitStatus('idle');
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = "Subject must be at least 5 characters";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const success = await submitMessage(formData);

    if (success) {
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    }

    // Reset status after 5 seconds
    setTimeout(() => resetStatus(), 5000);
  };

  const contactInfo = [
    {
      icon: Mail,
      label: "Email",
      value: "cristanjade14@gmail.com",
      href: "mailto:cristanjade14@gmail.com",
    },
    {
      icon: Phone,
      label: "Phone",
      value: "+639617110582",
      href: "tel:+639617110582",
    },
    {
      icon: MapPin,
      label: "Location",
      value: "Zone 2-A Looc, Igpit Opol Misamis Oriental",
      href: "#",
    },
  ];

  const socialLinks = [
    {
      icon: Github,
      label: "GitHub",
      href: "https://github.com/blutech18",
      color: "hover:text-gray-400",
    },
    {
      icon: Linkedin,
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/cristan-jade-jumawan-45b27b39b",
      color: "hover:text-blue-500",
    },
    {
      icon: Twitter,
      label: "Twitter",
      href: "https://twitter.com/cristanjade",
      color: "hover:text-blue-400",
    },
    {
      icon: Facebook,
      label: "Facebook",
      href: "https://facebook.com/yourprofile",
      color: "hover:text-blue-600",
    },
    {
      icon: Instagram,
      label: "Instagram",
      href: "https://instagram.com/yourprofile",
      color: "hover:text-pink-500",
    },
    {
      icon: Music,
      label: "TikTok",
      href: "https://tiktok.com/@yourprofile",
      color: "hover:text-white",
    },
  ];

  return (
    <section id="contact" className="py-20 bg-transparent relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="flex flex-col items-center mb-16 mx-auto w-fit"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-center">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Let's Work Together
            </span>
          </h2>
          <div className="flex items-center justify-center gap-3 w-full">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/70" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/80" />
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/70" />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
          {/* Contact Form - Takes 2 Columns (Main Content) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6 md:p-8 backdrop-blur-md relative overflow-hidden group">
              {/* Top Accent Gradient */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/60 via-accent/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Send a Message
                </h3>
                <p className="text-muted-foreground text-sm">
                  Fill out the form below and I'll get back to you as soon as possible.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-foreground/80">
                      Name *
                    </label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={cn(
                        "bg-white/[0.03] border-white/[0.08] focus:border-primary/50 focus:bg-white/[0.05] transition-all duration-300 placeholder:text-muted-foreground/40",
                        errors.name && "border-destructive/80 focus:border-destructive"
                      )}
                    />
                    {errors.name && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-destructive flex items-center gap-1"
                      >
                        <AlertCircle className="h-4 w-4" />
                        {errors.name}
                      </motion.p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-foreground/80">
                      Email *
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={cn(
                        "bg-white/[0.03] border-white/[0.08] focus:border-primary/50 focus:bg-white/[0.05] transition-all duration-300 placeholder:text-muted-foreground/40",
                        errors.email && "border-destructive/80 focus:border-destructive"
                      )}
                    />
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-destructive flex items-center gap-1"
                      >
                        <AlertCircle className="h-4 w-4" />
                        {errors.email}
                      </motion.p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium text-foreground/80">
                    Subject *
                  </label>
                  <Input
                    id="subject"
                    type="text"
                    placeholder="What's this about?"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    className={cn(
                      "bg-white/[0.03] border-white/[0.08] focus:border-primary/50 focus:bg-white/[0.05] transition-all duration-300 placeholder:text-muted-foreground/40",
                      errors.subject && "border-destructive/80 focus:border-destructive"
                    )}
                  />
                  {errors.subject && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-destructive flex items-center gap-1"
                    >
                      <AlertCircle className="h-4 w-4" />
                      {errors.subject}
                    </motion.p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-foreground/80">
                    Message *
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Tell me about your project..."
                    rows={6}
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    className={cn(
                      "bg-white/[0.03] border-white/[0.08] focus:border-primary/50 focus:bg-white/[0.05] transition-all duration-300 resize-none placeholder:text-muted-foreground/40",
                      errors.message && "border-destructive/80 focus:border-destructive"
                    )}
                  />
                  {errors.message && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-destructive flex items-center gap-1"
                    >
                      <AlertCircle className="h-4 w-4" />
                      {errors.message}
                    </motion.p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-bold py-6 rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-all duration-300"
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="flex items-center gap-2"
                    >
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                      Sending...
                    </motion.div>
                  ) : submitStatus === 'success' ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="h-5 w-5" />
                      Message Sent!
                    </motion.div>
                  ) : submitStatus === 'error' ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-2"
                    >
                      <AlertCircle className="h-5 w-5" />
                      Error - Try Again
                    </motion.div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="h-5 w-5" />
                      Send Message
                    </div>
                  )}
                </Button>
              </form>
            </div>
          </motion.div>

          {/* Contact Information - Sidebar (1 Column) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="space-y-8 lg:col-span-1"
          >
            <div>
              <div className="space-y-4">
                {contactInfo.map((info, index) => (
                  <motion.a
                    key={info.label}
                    href={info.href}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-primary/30 hover:bg-white/[0.04] hover:shadow-[0_0_15px_rgba(34,211,238,0.1)] transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors shrink-0">
                      <info.icon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{info.label}</p>
                      <p className="text-muted-foreground text-sm truncate">{info.value}</p>
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div className="pt-6 border-t border-white/[0.06]">
              <div className="grid grid-cols-3 gap-4 w-full">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.1, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "flex flex-col items-center justify-center text-muted-foreground transition-all duration-300 w-full",
                      social.color
                    )}
                    title={social.label}
                  >
                    <social.icon className="h-10 w-10 mb-2" />
                    <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity md:block hidden text-center">
                      {social.label}
                    </span>
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

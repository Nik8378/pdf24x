"use client";
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Mail, MessageSquare, Bug, Lightbulb, CheckCircle } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "general", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mailto = `mailto:contact@pdf24x.com?subject=${encodeURIComponent(form.subject + " - " + form.name)}&body=${encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\nMessage:\n${form.message}`)}`;
    window.location.href = mailto;
    setSubmitted(true);
  };

  return (
    <div className="w-full flex gap-0 items-start">
      <Sidebar />
      <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-12 max-w-4xl">

        <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1917] mb-2">Contact Us</h1>
        <p className="text-[14px] text-[#7a7875] mb-8">Have a question, found a bug, or want to suggest a feature? We&apos;d love to hear from you.</p>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* Left — Contact info */}
          <div className="w-full lg:w-[260px] shrink-0 space-y-4">
            <div className="bg-white border border-[#1a1917]/10 rounded-2xl p-5">
              <h2 className="text-[13px] font-bold text-[#1a1917] uppercase tracking-widest mb-4">Get in Touch</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail size={16} className="text-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[12px] font-bold text-[#1a1917]">Email</p>
                    <a href="mailto:contact@pdf24x.com" className="text-[12.5px] text-accent hover:underline">contact@pdf24x.com</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MessageSquare size={16} className="text-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[12px] font-bold text-[#1a1917]">Response Time</p>
                    <p className="text-[12.5px] text-[#7a7875]">Within 24-48 hours</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#1a1917]/10 rounded-2xl p-5">
              <h2 className="text-[13px] font-bold text-[#1a1917] uppercase tracking-widest mb-3">Common Topics</h2>
              <div className="space-y-2">
                {[
                  { icon: Bug, label: "Report a Bug", color: "text-red-500" },
                  { icon: Lightbulb, label: "Feature Request", color: "text-yellow-500" },
                  { icon: MessageSquare, label: "General Inquiry", color: "text-blue-500" },
                  { icon: Mail, label: "Business / Partnership", color: "text-green-500" },
                ].map(item => (
                  <button key={item.label} onClick={() => setForm(p => ({ ...p, subject: item.label.toLowerCase().replace(/ /g, "-") }))}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12.5px] text-left transition-all border ${form.subject === item.label.toLowerCase().replace(/ /g, "-") ? "border-accent bg-accent-bg" : "border-[#e5e3de] hover:border-accent/40"}`}>
                    <item.icon size={14} className={item.color} />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#f4f3f0] border border-[#e5e3de] rounded-2xl p-4">
              <p className="text-[12px] font-bold text-[#1a1917] mb-1">Privacy Note</p>
              <p className="text-[11.5px] text-[#7a7875] leading-relaxed">Your message is sent directly via email. We never share your contact information with third parties.</p>
            </div>
          </div>

          {/* Right — Form */}
          <div className="flex-1 min-w-0">
            {submitted ? (
              <div className="bg-green-50 border border-green-100 rounded-2xl p-8 text-center">
                <CheckCircle size={40} className="text-green-500 mx-auto mb-4" />
                <h2 className="text-[16px] font-bold text-[#1a1917] mb-2">Message Sent!</h2>
                <p className="text-[13px] text-[#7a7875]">Your email client should have opened. We&apos;ll get back to you within 24-48 hours.</p>
                <button onClick={() => setSubmitted(false)} className="mt-4 text-[13px] text-accent hover:underline">Send another message</button>
              </div>
            ) : (
              <div className="bg-white border border-[#1a1917]/10 rounded-2xl p-6">
                <h2 className="text-[15px] font-bold text-[#1a1917] mb-5">Send a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10.5px] font-bold text-[#7a7875] uppercase tracking-widest mb-1 block">Your Name *</label>
                      <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        placeholder="John Smith"
                        className="w-full bg-[#f4f3f0] border border-[#e5e3de] rounded-xl px-4 py-2.5 text-[13px] text-[#1a1917] focus:outline-none focus:border-accent transition-all" />
                    </div>
                    <div>
                      <label className="text-[10.5px] font-bold text-[#7a7875] uppercase tracking-widest mb-1 block">Email Address *</label>
                      <input required type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                        placeholder="john@example.com"
                        className="w-full bg-[#f4f3f0] border border-[#e5e3de] rounded-xl px-4 py-2.5 text-[13px] text-[#1a1917] focus:outline-none focus:border-accent transition-all" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10.5px] font-bold text-[#7a7875] uppercase tracking-widest mb-1 block">Subject *</label>
                    <select required value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                      className="w-full bg-[#f4f3f0] border border-[#e5e3de] rounded-xl px-4 py-2.5 text-[13px] text-[#1a1917] focus:outline-none focus:border-accent transition-all">
                      <option value="general">General Inquiry</option>
                      <option value="bug-report">Bug Report</option>
                      <option value="feature-request">Feature Request</option>
                      <option value="business-partnership">Business / Partnership</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10.5px] font-bold text-[#7a7875] uppercase tracking-widest mb-1 block">Message *</label>
                    <textarea required value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                      placeholder="Describe your question, issue, or suggestion in detail..."
                      rows={6}
                      className="w-full bg-[#f4f3f0] border border-[#e5e3de] rounded-xl px-4 py-2.5 text-[13px] text-[#1a1917] focus:outline-none focus:border-accent transition-all resize-none" />
                  </div>

                  <button type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark text-white font-semibold text-[14px] py-3.5 rounded-full shadow-md hover:shadow-lg transition-all">
                    <Mail size={16} /> Send Message
                  </button>
                  <p className="text-[11.5px] text-[#7a7875] text-center">This will open your email client to send the message.</p>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

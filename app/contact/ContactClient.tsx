"use client";
import { useState } from "react";
import { Mail, Send, CheckCircle, AlertCircle } from "lucide-react";

const C = { ink: "#1a1a1a", sub: "#6b6760", brand: "#FF6B5E", line: "#1c1c1c", surface: "#ffffff", cream: "#f4f1ea", redsoft: "#ffe7e3" };
const shadow = "3px 3px 0 0 #1c1c1c";

export default function ContactClient() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "", website: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong. Please try again.");
        setStatus("error");
      } else {
        setStatus("success");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white" style={{ border: `1px solid ${C.line}`, boxShadow: shadow }}>
          <CheckCircle size={32} style={{ color: "#27AE60" }} />
        </span>
        <h1 className="text-2xl font-extrabold" style={{ color: C.ink, fontFamily: "Archivo, Inter, sans-serif" }}>Message received!</h1>
        <p className="mt-3 text-sm" style={{ color: C.sub }}>Thank you for reaching out. We will get back to you shortly.</p>
        <button onClick={() => { setForm({ name: "", email: "", subject: "", message: "", website: "" }); setStatus("idle"); }}
          className="mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
          style={{ background: C.brand, border: `1px solid ${C.line}`, boxShadow: shadow }}>
          Send another message
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white" style={{ border: `1px solid ${C.line}`, boxShadow: shadow }}>
          <Mail size={26} style={{ color: C.brand }} />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl" style={{ color: C.ink, fontFamily: "Archivo, Inter, sans-serif" }}>Contact Us</h1>
          <p className="mt-1 text-sm" style={{ color: C.sub }}>Questions, feedback, or found a bug? We read every message.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Honeypot — hidden from real users */}
        <input
          type="text"
          name="website"
          value={form.website}
          onChange={e => update("website", e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{ display: "none" }}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold" style={{ color: C.ink }}>
              Name <span style={{ color: C.brand }}>*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => update("name", e.target.value)}
              placeholder="Your name"
              required
              maxLength={100}
              className="w-full rounded-xl px-4 py-2.5 text-sm"
              style={{ border: `1px solid ${C.line}`, background: C.cream, color: C.ink, outline: "none" }}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold" style={{ color: C.ink }}>
              Email <span style={{ color: C.brand }}>*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={e => update("email", e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full rounded-xl px-4 py-2.5 text-sm"
              style={{ border: `1px solid ${C.line}`, background: C.cream, color: C.ink, outline: "none" }}
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold" style={{ color: C.ink }}>
            Subject <span style={{ color: C.brand }}>*</span>
          </label>
          <input
            type="text"
            value={form.subject}
            onChange={e => update("subject", e.target.value)}
            placeholder="What is your message about?"
            required
            maxLength={200}
            className="w-full rounded-xl px-4 py-2.5 text-sm"
            style={{ border: `1px solid ${C.line}`, background: C.cream, color: C.ink, outline: "none" }}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold" style={{ color: C.ink }}>
            Message <span style={{ color: C.brand }}>*</span>
          </label>
          <textarea
            value={form.message}
            onChange={e => update("message", e.target.value)}
            placeholder="Tell us how we can help..."
            required
            minLength={10}
            maxLength={5000}
            rows={6}
            className="w-full rounded-xl px-4 py-2.5 text-sm resize-y"
            style={{ border: `1px solid ${C.line}`, background: C.cream, color: C.ink, outline: "none" }}
          />
          <p className="mt-1 text-xs text-right" style={{ color: C.sub }}>{form.message.length}/5000</p>
        </div>

        {status === "error" && (
          <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm" style={{ background: C.redsoft, border: `1px solid ${C.line}` }}>
            <AlertCircle size={16} style={{ color: C.brand }} />
            <span style={{ color: C.ink }}>{errorMsg}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white disabled:opacity-50 transition-all hover:-translate-y-0.5"
          style={{ background: C.brand, border: `1px solid ${C.line}`, boxShadow: shadow }}
        >
          <Send size={16} />
          {status === "sending" ? "Sending…" : "Send Message"}
        </button>
      </form>
    </div>
  );
}

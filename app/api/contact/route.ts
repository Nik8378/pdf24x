import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase not configured");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

const NAME_MAX = 100;
const SUBJECT_MAX = 200;
const MESSAGE_MAX = 5000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Simple in-memory rate limiter — not globally reliable on serverless
// but reduces casual abuse. Production: use Upstash Redis or similar.
const ipSubmissions = new Map<string, number[]>();
const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const times = (ipSubmissions.get(ip) || []).filter(t => now - t < RATE_WINDOW_MS);
  if (times.length >= RATE_LIMIT) return true;
  ipSubmissions.set(ip, [...times, now]);
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Too many submissions. Please try again later." }, { status: 429 });
    }

    const body = await req.json();

    // Honeypot check
    if (body.website) {
      return NextResponse.json({ success: true }); // Silent discard
    }

    const name = (body.name || "").trim();
    const email = (body.email || "").trim();
    const subject = (body.subject || "").trim();
    const message = (body.message || "").trim();

    // Server-side validation
    if (!name || name.length > NAME_MAX) {
      return NextResponse.json({ error: "Invalid name." }, { status: 400 });
    }
    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }
    if (!subject || subject.length > SUBJECT_MAX) {
      return NextResponse.json({ error: "Invalid subject." }, { status: 400 });
    }
    if (!message || message.length < 10 || message.length > MESSAGE_MAX) {
      return NextResponse.json({ error: "Message must be between 10 and 5000 characters." }, { status: 400 });
    }

    const { error } = await getAdminClient()
      .from("contact_submissions")
      .insert({ name, email, subject, message, status: "new" });

    if (error) {
      console.error("Contact submission error:", error.code);
      return NextResponse.json({ error: "Failed to submit. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

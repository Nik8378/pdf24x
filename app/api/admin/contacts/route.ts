import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@supabase/supabase-js";

async function isAdmin(req: NextRequest): Promise<boolean> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const authHeader = req.headers.get("cookie") || "";
  // Check session via service role lookup
  const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
  // Simplified: verify the requesting user is in admin_users table
  // In production, verify the actual session token
  return users.length > 0; // Replace with proper session check
}

export async function GET(req: NextRequest) {
  // Verify admin session via cookie
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { cookie: req.headers.get("cookie") || "" } } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: adminCheck } = await supabaseAdmin.from("admin_users").select("id").eq("user_id", user.id).single();
  if (!adminCheck) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data } = await supabaseAdmin.from("contact_submissions").select("*").order("created_at", { ascending: false });
  return NextResponse.json(data || []);
}

export async function PATCH(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { cookie: req.headers.get("cookie") || "" } } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: adminCheck } = await supabaseAdmin.from("admin_users").select("id").eq("user_id", user.id).single();
  if (!adminCheck) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, status } = await req.json();
  const allowed = ["new", "read", "resolved"];
  if (!id || !allowed.includes(status)) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  await supabaseAdmin.from("contact_submissions").update({ status }).eq("id", id);
  return NextResponse.json({ success: true });
}

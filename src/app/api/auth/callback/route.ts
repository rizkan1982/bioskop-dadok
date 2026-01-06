import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { IS_DEVELOPMENT } from "@/utils/constants";
import { cookies } from "next/headers";

// ============================================
// WHITELIST EMAIL ADMIN
// Hanya email ini yang bisa akses admin panel
// ============================================
const ADMIN_EMAILS = [
  "stressgue934@gmail.com",
];

export const GET = async (request: Request) => {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const isAdminLogin = searchParams.get("admin_login") === "true";

  let next = searchParams.get("next") ?? "/";
  if (!next.startsWith("/")) {
    next = "/";
  }

  const getRedirectUrl = (path: string) => {
    const forwardedHost = request.headers.get("x-forwarded-host");
    if (IS_DEVELOPMENT) {
      return `${origin}${path}`;
    } else if (forwardedHost) {
      return `https://${forwardedHost}${path}`;
    } else {
      return `${origin}${path}`;
    }
  };

  if (code) {
    const supabase = await createClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && user) {
      console.info("Auth callback user:", { email: user.email, isAdminLogin });

      // Handle admin login
      if (isAdminLogin) {
        const userEmail = user.email || "";
        const isAdmin = ADMIN_EMAILS.includes(userEmail);
        
        console.log("Admin login check:", { email: userEmail, isAdmin });
        
        if (!isAdmin) {
          // Not admin, redirect to admin login with error
          return NextResponse.redirect(getRedirectUrl("/auth/admin?error=unauthorized"));
        }
        
        // Create admin session cookie
        const username = user.email?.split("@")[0] || user.user_metadata?.full_name || user.user_metadata?.name || "Admin";
        
        const sessionData = {
          username,
          role: "admin",
          email: user.email || "",
          exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        };
        
        const cookieStore = await cookies();
        const encodedSession = Buffer.from(JSON.stringify(sessionData)).toString("base64");
        
        cookieStore.set("admin_session", encodedSession, {
          httpOnly: true,
          secure: !IS_DEVELOPMENT,
          sameSite: "lax",
          maxAge: 24 * 60 * 60, // 24 hours
          path: "/",
        });
        
        console.log("Admin session created for:", userEmail);
        
        // Redirect to admin dashboard
        return NextResponse.redirect(getRedirectUrl("/admin"));
      }

      // Regular user login - create profile if needed
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      if (!profile) {
        // Get base username dari Google
        const baseUsername =
          user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0];

        // Function buat generate unique username
        const generateUniqueUsername = async (base: string) => {
          let username = base;
          let attempts = 0;
          const maxAttempts = 5; // Prevent infinite loop

          while (attempts < maxAttempts) {
            // Check if username exists
            const { data: existing } = await supabase
              .from("profiles")
              .select("username")
              .eq("username", username)
              .single();

            if (!existing) {
              // Username available!
              return username;
            }

            // Username taken, add random 4 digits
            const randomNum = Math.floor(1000 + Math.random() * 9000); // 1000-9999
            username = `${base}#${randomNum}`;
            attempts++;
          }

          // Fallback: use timestamp if still can't find unique
          return `${base}${Date.now()}`;
        };

        // Generate unique username
        const uniqueUsername = await generateUniqueUsername(baseUsername);

        // Insert profile with unique username
        const { error: profileError } = await supabase.from("profiles").insert({
          id: user.id,
          username: uniqueUsername,
        });

        if (profileError) {
          console.error("Profile creation error:", profileError);
        } else {
          console.log("Profile created with username:", uniqueUsername);
        }
      }

      return NextResponse.redirect(getRedirectUrl(next));
    }
  }

  return NextResponse.redirect(getRedirectUrl("/auth?error=true"));
};

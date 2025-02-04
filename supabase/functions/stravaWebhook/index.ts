import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const VERIFY_TOKEN = "your_custom_token"; // Replace this with your token

serve(async (req) => {
  const { searchParams } = new URL(req.url);

  // ✅ Webhook Verification
  if (req.method === "GET") {
    if (searchParams.get("hub.verify_token") === VERIFY_TOKEN) {
      return new Response(
        JSON.stringify({ "hub.challenge": searchParams.get("hub.challenge") }),
        { headers: { "Content-Type": "application/json" } }
      );
    } else {
      return new Response("Invalid token", { status: 403 });
    }
  }

  // ✅ Handle Strava Activity Updates
  if (req.method === "POST") {
    const body = await req.json();
    console.log("📩 Received Strava Webhook:", body);

    if (body.object_type === "activity" && body.aspect_type === "create") {
      const activityId = body.object_id;
      const athleteId = body.owner_id;

      // Fetch full activity details from Strava
      const STRAVA_ACCESS_TOKEN = Deno.env.get("STRAVA_ACCESS_TOKEN")!;
      const response = await fetch(`https://www.strava.com/api/v3/activities/${activityId}`, {
        headers: { Authorization: `Bearer ${STRAVA_ACCESS_TOKEN}` },
      });

      const activity = await response.json();
      console.log("🏃 New Activity Data:", activity);

      // Insert run data into Supabase
      const { error } = await supabase
        .from("exercise_progress")
        .insert([
          {
            exercise: "running",
            count: activity.distance / 1000, // Convert meters to km
            date: new Date().toISOString().split("T")[0], // YYYY-MM-DD format
          },
        ]);

      if (error) console.error("❌ Error inserting data into Supabase:", error);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response("Not Found", { status: 404 });
});

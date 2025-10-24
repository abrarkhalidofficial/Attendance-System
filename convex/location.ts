import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Helper function to get current user and verify authentication
const getCurrentUser = async (ctx: any) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthorized");
  }
  
  const user = await ctx.db
    .query("users")
    .filter((q) => q.eq(q.field("email"), identity.email))
    .first();
  
  if (!user) {
    throw new Error("User not found");
  }
  
  return user;
};

// Get organization's geofence settings
export const getGeofenceSettings = query({
  handler: async (ctx) => {
    // Get current user
    await getCurrentUser(ctx);
    
    // Get the attendance policy with geofence settings
    const policy = await ctx.db
      .query("attendancePolicies")
      .first();
    
    if (!policy || !policy.geofences) {
      return { geofences: [] };
    }
    
    return { geofences: policy.geofences };
  },
});

// Check if a location is within any geofence
export const checkLocationInGeofence = query({
  args: {
    lat: v.number(),
    lng: v.number(),
  },
  handler: async (ctx, args) => {
    // Get current user
    await getCurrentUser(ctx);
    
    // Get the attendance policy with geofence settings
    const policy = await ctx.db
      .query("attendancePolicies")
      .first();
    
    if (!policy || !policy.geofences || policy.geofences.length === 0) {
      return { inOffice: false, locationName: "Remote" };
    }
    
    // Check each geofence
    for (const geofence of policy.geofences) {
      const distance = calculateDistance(
        args.lat, 
        args.lng, 
        geofence.center.lat, 
        geofence.center.lng
      );
      
      if (distance <= geofence.radiusM) {
        return { inOffice: true, locationName: geofence.name };
      }
    }
    
    return { inOffice: false, locationName: "Remote" };
  },
});

// Update geofence settings (admin only)
export const updateGeofenceSettings = mutation({
  args: {
    geofences: v.array(v.object({
      name: v.string(),
      center: v.object({
        lat: v.number(),
        lng: v.number(),
      }),
      radiusM: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    // Get current user and verify admin
    const user = await getCurrentUser(ctx);
    if (user.role !== "admin") {
      throw new Error("Unauthorized. Only admins can update geofence settings.");
    }
    
    // Get existing policy or create new one
    const existingPolicy = await ctx.db
      .query("attendancePolicies")
      .first();
    
    if (existingPolicy) {
      // Update existing policy
      await ctx.db.patch(existingPolicy._id, {
        geofences: args.geofences,
        updatedAt: Date.now(),
      });
    } else {
      // Create new policy
      await ctx.db.insert("attendancePolicies", {
        geofences: args.geofences,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
    
    // Create audit log
    await ctx.db.insert("auditLogs", {
      actorId: user._id,
      action: "update_geofence_settings",
      target: {
        type: "attendancePolicies",
        id: existingPolicy ? existingPolicy._id : "new",
      },
      metadata: {
        geofences: args.geofences,
      },
      at: Date.now(),
    });
    
    return { success: true };
  },
});

// Get location history for a session
export const getSessionLocationHistory = query({
  args: {
    sessionId: v.id("attendanceSessions"),
  },
  handler: async (ctx, args) => {
    // Get current user
    const user = await getCurrentUser(ctx);
    
    // Get the session
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error("Session not found");
    }
    
    // Check permissions
    if (session.userId !== user._id && 
        user.role !== "admin" && 
        user.role !== "manager") {
      throw new Error("Unauthorized to view this session's location history");
    }
    
    // For privacy reasons, we only return the first and last location
    // (clock-in and clock-out locations)
    const locations = [];
    
    // Add clock-in location if available
    if (session.verification && session.verification.geo) {
      locations.push({
        type: "clock_in",
        timestamp: session.clockInAt,
        location: session.verification.geo,
      });
    }
    
    // Add clock-out location if available
    if (session.clockOutAt && session.verification && session.verification.geo) {
      locations.push({
        type: "clock_out",
        timestamp: session.clockOutAt,
        location: session.verification.geo,
      });
    }
    
    return { locations };
  },
});

// Helper function to calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}
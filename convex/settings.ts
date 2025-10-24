import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Company Settings
export const getSettings = query({
  handler: async (ctx) => {
    const settings = await ctx.db.query("companySettings").first();
    
    // Return default settings if none exist
    if (!settings) {
      return {
        allowSelfRegistration: true,
        requireFaceVerification: false,
        enableGeofencing: false,
        officeLocations: [],
        overtimeRules: {
          dailyThreshold: 8,
          weeklyThreshold: 40,
          multiplier: 1.5,
        },
        workingHoursPerDay: 8,
        workingDaysPerWeek: 5,
      };
    }
    
    return settings;
  },
});

export const updateSettings = mutation({
  args: {
    allowSelfRegistration: v.optional(v.boolean()),
    requireFaceVerification: v.optional(v.boolean()),
    enableGeofencing: v.optional(v.boolean()),
    officeLocations: v.optional(v.array(v.object({
      id: v.string(),
      name: v.string(),
      latitude: v.number(),
      longitude: v.number(),
      radius: v.number(),
    }))),
    overtimeRules: v.optional(v.object({
      dailyThreshold: v.number(),
      weeklyThreshold: v.number(),
      multiplier: v.number(),
    })),
    workingHoursPerDay: v.optional(v.number()),
    workingDaysPerWeek: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existingSettings = await ctx.db.query("companySettings").first();
    
    if (existingSettings) {
      return await ctx.db.patch(existingSettings._id, args);
    } else {
      // Create initial settings with defaults
      return await ctx.db.insert("companySettings", {
        allowSelfRegistration: args.allowSelfRegistration ?? true,
        requireFaceVerification: args.requireFaceVerification ?? false,
        enableGeofencing: args.enableGeofencing ?? false,
        officeLocations: args.officeLocations ?? [],
        overtimeRules: args.overtimeRules ?? {
          dailyThreshold: 8,
          weeklyThreshold: 40,
          multiplier: 1.5,
        },
        workingHoursPerDay: args.workingHoursPerDay ?? 8,
        workingDaysPerWeek: args.workingDaysPerWeek ?? 5,
      });
    }
  },
});

export const addOfficeLocation = mutation({
  args: {
    name: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    radius: v.number(),
  },
  handler: async (ctx, args) => {
    const settings = await ctx.db.query("companySettings").first();
    
    const newLocation = {
      id: crypto.randomUUID(),
      name: args.name,
      latitude: args.latitude,
      longitude: args.longitude,
      radius: args.radius,
    };
    
    if (settings) {
      return await ctx.db.patch(settings._id, {
        officeLocations: [...settings.officeLocations, newLocation],
      });
    } else {
      // Create settings with the new location
      return await ctx.db.insert("companySettings", {
        allowSelfRegistration: true,
        requireFaceVerification: false,
        enableGeofencing: true,
        officeLocations: [newLocation],
        overtimeRules: {
          dailyThreshold: 8,
          weeklyThreshold: 40,
          multiplier: 1.5,
        },
        workingHoursPerDay: 8,
        workingDaysPerWeek: 5,
      });
    }
  },
});

export const updateOfficeLocation = mutation({
  args: {
    locationId: v.string(),
    name: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    radius: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const settings = await ctx.db.query("companySettings").first();
    
    if (!settings) {
      throw new Error("Settings not found");
    }
    
    const updatedLocations = settings.officeLocations.map(location => {
      if (location.id === args.locationId) {
        return {
          ...location,
          name: args.name ?? location.name,
          latitude: args.latitude ?? location.latitude,
          longitude: args.longitude ?? location.longitude,
          radius: args.radius ?? location.radius,
        };
      }
      return location;
    });
    
    return await ctx.db.patch(settings._id, {
      officeLocations: updatedLocations,
    });
  },
});

export const removeOfficeLocation = mutation({
  args: { locationId: v.string() },
  handler: async (ctx, args) => {
    const settings = await ctx.db.query("companySettings").first();
    
    if (!settings) {
      throw new Error("Settings not found");
    }
    
    const updatedLocations = settings.officeLocations.filter(
      location => location.id !== args.locationId
    );
    
    return await ctx.db.patch(settings._id, {
      officeLocations: updatedLocations,
    });
  },
});

export const updateOvertimeRules = mutation({
  args: {
    dailyThreshold: v.optional(v.number()),
    weeklyThreshold: v.optional(v.number()),
    multiplier: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const settings = await ctx.db.query("companySettings").first();
    
    const updatedRules = {
      dailyThreshold: args.dailyThreshold ?? settings?.overtimeRules.dailyThreshold ?? 8,
      weeklyThreshold: args.weeklyThreshold ?? settings?.overtimeRules.weeklyThreshold ?? 40,
      multiplier: args.multiplier ?? settings?.overtimeRules.multiplier ?? 1.5,
    };
    
    if (settings) {
      return await ctx.db.patch(settings._id, {
        overtimeRules: updatedRules,
      });
    } else {
      return await ctx.db.insert("companySettings", {
        allowSelfRegistration: true,
        requireFaceVerification: false,
        enableGeofencing: false,
        officeLocations: [],
        overtimeRules: updatedRules,
        workingHoursPerDay: 8,
        workingDaysPerWeek: 5,
      });
    }
  },
});

// Helper functions
export const isLocationWithinOffice = query({
  args: {
    latitude: v.number(),
    longitude: v.number(),
  },
  handler: async (ctx, args) => {
    const settings = await ctx.db.query("companySettings").first();
    
    if (!settings || !settings.enableGeofencing || settings.officeLocations.length === 0) {
      return { isWithin: true, location: null }; // Allow if geofencing is disabled
    }
    
    // Calculate distance using Haversine formula
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371e3; // Earth's radius in meters
      const φ1 = lat1 * Math.PI / 180;
      const φ2 = lat2 * Math.PI / 180;
      const Δφ = (lat2 - lat1) * Math.PI / 180;
      const Δλ = (lon2 - lon1) * Math.PI / 180;

      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

      return R * c; // Distance in meters
    };
    
    for (const location of settings.officeLocations) {
      const distance = calculateDistance(
        args.latitude,
        args.longitude,
        location.latitude,
        location.longitude
      );
      
      if (distance <= location.radius) {
        return { isWithin: true, location };
      }
    }
    
    return { isWithin: false, location: null };
  },
});

export const calculateOvertime = query({
  args: {
    dailyHours: v.number(),
    weeklyHours: v.number(),
  },
  handler: async (ctx, args) => {
    const settings = await ctx.db.query("companySettings").first();
    
    const rules = settings?.overtimeRules ?? {
      dailyThreshold: 8,
      weeklyThreshold: 40,
      multiplier: 1.5,
    };
    
    const dailyOvertime = Math.max(0, args.dailyHours - rules.dailyThreshold);
    const weeklyOvertime = Math.max(0, args.weeklyHours - rules.weeklyThreshold);
    
    // Use the higher of daily or weekly overtime calculation
    const overtimeHours = Math.max(dailyOvertime, weeklyOvertime);
    const overtimePay = overtimeHours * rules.multiplier;
    
    return {
      regularHours: Math.min(args.dailyHours, rules.dailyThreshold),
      overtimeHours,
      overtimeMultiplier: rules.multiplier,
      overtimePay,
    };
  },
});
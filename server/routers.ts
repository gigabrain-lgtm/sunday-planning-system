import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { saveManifestationToAirtable, getLatestManifestation as getLatestManifestationFromAirtable } from "./airtable";
import { postDailyManifestationToSlack } from "./slack";
import * as clickup from "./clickup";
import { ENV } from "./_core/env";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  planning: router({
    save: protectedProcedure
      .input(z.object({
        weekOf: z.string(),
        businessPlanning: z.object({
          companyWide: z.string().optional(),
          marketing: z.string().optional(),
          sales: z.string().optional(),
          churn: z.string().optional(),
          creatives: z.string().optional(),
          dsp: z.string().optional(),
          finance: z.string().optional(),
          recruiting: z.string().optional(),
          systems: z.string().optional(),
          fulfilment: z.string().optional(),
          pendingRoadmap: z.string().optional(),
        }),
        personalPlanning: z.object({
          eaTasks: z.string().optional(),
          paTasks: z.string().optional(),
          personalTasks: z.string().optional(),
        }),
        manifestations: z.object({
          ratings: z.object({
            spiritual: z.number().min(0).max(10).optional(),
            social: z.number().min(0).max(10).optional(),
            relationship: z.number().min(0).max(10).optional(),
            status: z.number().min(0).max(10).optional(),
            team: z.number().min(0).max(10).optional(),
            business: z.number().min(0).max(10).optional(),
            travel: z.number().min(0).max(10).optional(),
            environment: z.number().min(0).max(10).optional(),
            family: z.number().min(0).max(10).optional(),
            skills: z.number().min(0).max(10).optional(),
            health: z.number().min(0).max(10).optional(),
            affirmations: z.number().min(0).max(10).optional(),
          }),
          reflections: z.object({
            spiritual: z.string().optional(),
            social: z.string().optional(),
            relationship: z.string().optional(),
            status: z.string().optional(),
            team: z.string().optional(),
            business: z.string().optional(),
            travel: z.string().optional(),
            environment: z.string().optional(),
            family: z.string().optional(),
            skills: z.string().optional(),
            health: z.string().optional(),
            affirmations: z.string().optional(),
          }),
          actionables: z.object({
            spiritual: z.string().optional(),
            social: z.string().optional(),
            relationship: z.string().optional(),
            status: z.string().optional(),
            team: z.string().optional(),
            business: z.string().optional(),
            travel: z.string().optional(),
            environment: z.string().optional(),
            family: z.string().optional(),
            skills: z.string().optional(),
            health: z.string().optional(),
            affirmations: z.string().optional(),
          }),
        }),
      }))
      .mutation(async ({ ctx, input }) => {
        const weekOf = new Date(input.weekOf);

        await db.saveWeeklyPlanning({
          userId: ctx.user.id,
          weekOf,
          ...input.businessPlanning,
          ...input.personalPlanning,
        });

        await db.saveManifestation({
          userId: ctx.user.id,
          weekOf,
          spiritualRating: input.manifestations.ratings.spiritual,
          socialRating: input.manifestations.ratings.social,
          relationshipRating: input.manifestations.ratings.relationship,
          statusRating: input.manifestations.ratings.status,
          teamRating: input.manifestations.ratings.team,
          businessRating: input.manifestations.ratings.business,
          travelRating: input.manifestations.ratings.travel,
          environmentRating: input.manifestations.ratings.environment,
          familyRating: input.manifestations.ratings.family,
          skillsRating: input.manifestations.ratings.skills,
          healthRating: input.manifestations.ratings.health,
          affirmationsRating: input.manifestations.ratings.affirmations,
          spiritualCurrentState: input.manifestations.reflections.spiritual,
          socialCurrentState: input.manifestations.reflections.social,
          relationshipCurrentState: input.manifestations.reflections.relationship,
          statusCurrentState: input.manifestations.reflections.status,
          teamCurrentState: input.manifestations.reflections.team,
          businessCurrentState: input.manifestations.reflections.business,
          travelCurrentState: input.manifestations.reflections.travel,
          environmentCurrentState: input.manifestations.reflections.environment,
          familyCurrentState: input.manifestations.reflections.family,
          skillsCurrentState: input.manifestations.reflections.skills,
          healthCurrentState: input.manifestations.reflections.health,
          affirmationsCurrentState: input.manifestations.reflections.affirmations,
          spiritualActionables: input.manifestations.actionables.spiritual,
          socialActionables: input.manifestations.actionables.social,
          relationshipActionables: input.manifestations.actionables.relationship,
          statusActionables: input.manifestations.actionables.status,
          teamActionables: input.manifestations.actionables.team,
          businessActionables: input.manifestations.actionables.business,
          travelActionables: input.manifestations.actionables.travel,
          environmentActionables: input.manifestations.actionables.environment,
          familyActionables: input.manifestations.actionables.family,
          skillsActionables: input.manifestations.actionables.skills,
          healthActionables: input.manifestations.actionables.health,
          affirmationsActionables: input.manifestations.actionables.affirmations,
        });

        await saveManifestationToAirtable({
          "Week Of": input.weekOf,
          Spiritual: input.manifestations.ratings.spiritual,
          Social: input.manifestations.ratings.social,
          Relationship: input.manifestations.ratings.relationship,
          Status: input.manifestations.ratings.status,
          Team: input.manifestations.ratings.team,
          Business: input.manifestations.ratings.business,
          Travel: input.manifestations.ratings.travel,
          Environment: input.manifestations.ratings.environment,
          Family: input.manifestations.ratings.family,
          Skills: input.manifestations.ratings.skills,
          Health: input.manifestations.ratings.health,
          Affirmations: input.manifestations.ratings.affirmations,
          "Spiritual Reflection": input.manifestations.reflections.spiritual,
          "Social Reflection": input.manifestations.reflections.social,
          "Relationship Reflection": input.manifestations.reflections.relationship,
          "Status Reflection": input.manifestations.reflections.status,
          "Team Reflection": input.manifestations.reflections.team,
          "Business Reflection": input.manifestations.reflections.business,
          "Travel Reflection": input.manifestations.reflections.travel,
          "Environment Reflection": input.manifestations.reflections.environment,
          "Family Reflection": input.manifestations.reflections.family,
          "Skills Reflection": input.manifestations.reflections.skills,
          "Health Reflection": input.manifestations.reflections.health,
          "Affirmations Reflection": input.manifestations.reflections.affirmations,
          "Spiritual Actionables": input.manifestations.actionables.spiritual,
          "Social Actionables": input.manifestations.actionables.social,
          "Relationship Actionables": input.manifestations.actionables.relationship,
          "Status Actionables": input.manifestations.actionables.status,
          "Team Actionables": input.manifestations.actionables.team,
          "Business Actionables": input.manifestations.actionables.business,
          "Travel Actionables": input.manifestations.actionables.travel,
          "Environment Actionables": input.manifestations.actionables.environment,
          "Family Actionables": input.manifestations.actionables.family,
          "Skills Actionables": input.manifestations.actionables.skills,
          "Health Actionables": input.manifestations.actionables.health,
          "Affirmations Actionables": input.manifestations.actionables.affirmations,
        });

        return { success: true };
      }),

    getLatest: protectedProcedure.query(async ({ ctx }) => {
      const planning = await db.getLatestWeeklyPlanning(ctx.user.id);
      const manifestation = await db.getLatestManifestation(ctx.user.id);

      return {
        planning,
        manifestation,
      };
    }),
  }),

  needleMovers: router({
    fetchBusiness: protectedProcedure.query(async () => {
      return await clickup.fetchNeedleMovers(process.env.CLICKUP_BUSINESS_LIST_ID || "");
    }),

    fetchPersonal: protectedProcedure.query(async () => {
      return await clickup.fetchNeedleMovers(process.env.CLICKUP_PERSONAL_LIST_ID || "");
    }),

    createBusiness: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        priority: z.enum(["urgent", "high", "normal", "low"]),
        confidenceLevel: z.number().min(0).max(10).optional(),
        assigneeId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const taskId = await clickup.createNeedleMover(
          process.env.CLICKUP_BUSINESS_LIST_ID || "",
          input
        );
        return { id: taskId };
      }),

    createPersonal: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        priority: z.enum(["urgent", "high", "normal", "low"]),
        confidenceLevel: z.number().min(0).max(10).optional(),
      }))
      .mutation(async ({ input }) => {
        const taskId = await clickup.createNeedleMover(
          process.env.CLICKUP_PERSONAL_LIST_ID || "",
          input
        );
        return { id: taskId };
      }),

    update: protectedProcedure
      .input(z.object({
        taskId: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        priority: z.enum(["urgent", "high", "normal", "low"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { taskId, ...updates } = input;
        await clickup.updateNeedleMover(taskId, updates);
        return { success: true };
      }),

    markComplete: protectedProcedure
      .input(z.object({
        taskId: z.string(),
      }))
      .mutation(async ({ input }) => {
        await clickup.markTaskComplete(input.taskId);
        return { success: true };
      }),

    batchMarkComplete: protectedProcedure
      .input(z.object({
        taskIds: z.array(z.string()),
      }))
      .mutation(async ({ input }) => {
        await Promise.all(
          input.taskIds.map(taskId => clickup.markTaskComplete(taskId))
        );
        return { success: true, count: input.taskIds.length };
      }),

    getTeamMembers: protectedProcedure
      .input(z.object({ listType: z.enum(["business", "personal"]) }))
      .query(async ({ input }) => {
        const listId = input.listType === "business" 
          ? ENV.clickupBusinessListId 
          : ENV.clickupPersonalListId;
        return await clickup.getTeamMembers(listId);
      }),
  }),

  slack: router({
    postDaily: publicProcedure.mutation(async () => {
      const latestManifestation = await getLatestManifestationFromAirtable();

      if (!latestManifestation) {
        throw new Error("No manifestation data found");
      }

      await postDailyManifestationToSlack({
        spiritual: latestManifestation["Spiritual Reflection"],
        social: latestManifestation["Social Reflection"],
        relationship: latestManifestation["Relationship Reflection"],
        status: latestManifestation["Status Reflection"],
        team: latestManifestation["Team Reflection"],
        business: latestManifestation["Business Reflection"],
        travel: latestManifestation["Travel Reflection"],
        environment: latestManifestation["Environment Reflection"],
        family: latestManifestation["Family Reflection"],
        skills: latestManifestation["Skills Reflection"],
        health: latestManifestation["Health Reflection"],
      });

      return { success: true };
    }),
  }),
});

export type AppRouter = typeof appRouter;

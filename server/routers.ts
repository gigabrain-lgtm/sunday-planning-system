import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { saveManifestationToAirtable, getLatestManifestation as getLatestManifestationFromAirtable } from "./airtable";
import { postDailyManifestationToSlack } from "./slack";
import * as clickup from "./clickup";

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
          currentStates: z.object({
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
          spiritualCurrentState: input.manifestations.currentStates.spiritual,
          socialCurrentState: input.manifestations.currentStates.social,
          relationshipCurrentState: input.manifestations.currentStates.relationship,
          statusCurrentState: input.manifestations.currentStates.status,
          teamCurrentState: input.manifestations.currentStates.team,
          businessCurrentState: input.manifestations.currentStates.business,
          travelCurrentState: input.manifestations.currentStates.travel,
          environmentCurrentState: input.manifestations.currentStates.environment,
          familyCurrentState: input.manifestations.currentStates.family,
          skillsCurrentState: input.manifestations.currentStates.skills,
          healthCurrentState: input.manifestations.currentStates.health,
          affirmationsCurrentState: input.manifestations.currentStates.affirmations,
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
          "Spiritual Current State": input.manifestations.currentStates.spiritual,
          "Social Current State": input.manifestations.currentStates.social,
          "Relationship Current State": input.manifestations.currentStates.relationship,
          "Status Current State": input.manifestations.currentStates.status,
          "Team Current State": input.manifestations.currentStates.team,
          "Business Current State": input.manifestations.currentStates.business,
          "Travel Current State": input.manifestations.currentStates.travel,
          "Environment Current State": input.manifestations.currentStates.environment,
          "Family Current State": input.manifestations.currentStates.family,
          "Skills Current State": input.manifestations.currentStates.skills,
          "Health Current State": input.manifestations.currentStates.health,
          "Affirmations Current State": input.manifestations.currentStates.affirmations,
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

    getTeamMembers: protectedProcedure.query(async () => {
      return await clickup.getTeamMembers();
    }),
  }),

  slack: router({
    postDaily: publicProcedure.mutation(async () => {
      const latestManifestation = await getLatestManifestationFromAirtable();

      if (!latestManifestation) {
        throw new Error("No manifestation data found");
      }

      await postDailyManifestationToSlack({
        spiritual: latestManifestation["Spiritual Current State"],
        social: latestManifestation["Social Current State"],
        relationship: latestManifestation["Relationship Current State"],
        status: latestManifestation["Status Current State"],
        team: latestManifestation["Team Current State"],
        business: latestManifestation["Business Current State"],
        travel: latestManifestation["Travel Current State"],
        environment: latestManifestation["Environment Current State"],
        family: latestManifestation["Family Current State"],
        skills: latestManifestation["Skills Current State"],
        health: latestManifestation["Health Current State"],
      });

      return { success: true };
    }),
  }),
});

export type AppRouter = typeof appRouter;

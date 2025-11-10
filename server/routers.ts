import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { saveManifestationToAirtable, getLatestManifestation as getLatestManifestationFromAirtable } from "./airtable";
import { postDailyManifestationToSlack } from "./slack";
import * as clickup from "./clickup";
import * as hiring from "./hiring";
import * as dashboard from "./dashboard";
import * as airtableMarketing from "./airtable-marketing";
import { getAgencyById } from "./orgChart";
import { postContentReviewNotification } from "./slack";
import { ENV } from "./_core/env";

// Helper function to calculate match score between task and Key Result
function calculateMatchScore(task: any, keyResult: any, objective: any): number {
  let score = 0;
  const taskText = `${task.name} ${task.description || ""}`.toLowerCase();
  const krText = `${keyResult.name} ${keyResult.description || ""}`.toLowerCase();
  const objText = `${objective.name} ${objective.description || ""}`.toLowerCase();
  
  // Keyword matching
  const taskWords = taskText.split(/\s+/);
  const krWords = new Set(krText.split(/\s+/));
  const objWords = new Set(objText.split(/\s+/));
  
  for (const word of taskWords) {
    if (word.length > 3) { // Ignore short words
      if (krWords.has(word)) score += 2;
      if (objWords.has(word)) score += 1;
    }
  }
  
  return score;
}

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
      const tasks = await clickup.fetchNeedleMovers(process.env.CLICKUP_BUSINESS_LIST_ID || "");
      
      // Fetch OKRs for enrichment
      const [keyResults, objectives] = await Promise.all([
        clickup.fetchKeyResults(),
        clickup.fetchObjectives(),
      ]);
      
      // Enrich tasks with OKR linkage
      return await clickup.enrichWithOKRLinkage(tasks, keyResults, objectives);
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
        assigneeId: z.number().optional(),
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

    fetchRoadmap: protectedProcedure.query(async () => {
      return await clickup.fetchRoadmapTasks();
    }),

    moveToRoadmap: protectedProcedure
      .input(z.object({
        taskId: z.string(),
      }))
      .mutation(async ({ input }) => {
        await clickup.moveTaskToList(input.taskId, ENV.clickupRoadmapListId);
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

    updateRoadmapTask: protectedProcedure
      .input(z.object({
        taskId: z.string(),
        notes: z.string().optional(),
        targetWeek: z.string().optional(),
        priority: z.enum(["urgent", "high", "normal", "low"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { taskId, notes, targetWeek, priority } = input;
        const updates: Record<string, any> = {};
        
        if (priority) {
          updates.priority = priority;
        }
        
        // Combine notes and target week into description
        let description = "";
        if (notes) {
          description += `**Planning Notes:**\n${notes}\n\n`;
        }
        if (targetWeek) {
          description += `**Target Week:** ${targetWeek}`;
        }
        
        if (description) {
          updates.description = description;
        }
        
        if (Object.keys(updates).length > 0) {
          await clickup.updateNeedleMover(taskId, updates);
        }
        
        return { success: true };
      }),
  }),

  okr: router({ 
    fetchObjectives: publicProcedure.query(async () => {
      try {
        return await clickup.fetchObjectives();
      } catch (error) {
        console.error("[OKR] Error fetching objectives:", error);
        throw new Error("Failed to fetch objectives");
      }
    }),

    fetchKeyResults: publicProcedure.query(async () => {
      try {
        const keyResults = await clickup.fetchKeyResults();
        
        // Fetch mappings from database
        const mappings = await db.getKeyResultObjectiveMappings();
        
        // Enrich key results with mapped objective IDs
        return keyResults.map(kr => {
          const mapping = mappings.find(m => m.keyResultId === kr.id);
          if (mapping) {
            return {
              ...kr,
              objectiveIds: [mapping.objectiveId],
            };
          }
          return kr;
        });
      } catch (error) {
        console.error("[OKR] Error fetching key results:", error);
        throw new Error("Failed to fetch key results");
      }
    }),

    addSubtask: publicProcedure
      .input(z.object({
        parentId: z.string(),
        name: z.string(),
      }))
      .mutation(async ({ input }) => {
        try {
          // First, get the parent task to find its list_id
          const parentResponse = await fetch(
            `https://api.clickup.com/api/v2/task/${input.parentId}`,
            {
              headers: {
                'Authorization': process.env.CLICKUP_API_KEY!,
              },
            }
          );

          if (!parentResponse.ok) {
            throw new Error(`Failed to fetch parent task: ${parentResponse.statusText}`);
          }

          const parentData = await parentResponse.json();
          const listId = parentData.list.id;

          // Now create the subtask in the same list as the parent
          const response = await fetch(
            `https://api.clickup.com/api/v2/list/${listId}/task`,
            {
              method: 'POST',
              headers: {
                'Authorization': process.env.CLICKUP_API_KEY!,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                name: input.name,
                parent: input.parentId,
              }),
            }
          );

          if (!response.ok) {
            const errorText = await response.text();
            console.error('[OKR] ClickUp API error response:', errorText);
            throw new Error(`ClickUp API error: ${response.statusText}`);
          }

          const data = await response.json();
          return { success: true, taskId: data.id };
        } catch (error) {
          console.error("[OKR] Error adding subtask:", error);
          throw new Error("Failed to add subtask");
        }
      }),

    deleteSubtask: publicProcedure
      .input(z.object({
        taskId: z.string(),
      }))
      .mutation(async ({ input }) => {
        try {
          const response = await fetch(
            `https://api.clickup.com/api/v2/task/${input.taskId}`,
            {
              method: 'DELETE',
              headers: {
                'Authorization': process.env.CLICKUP_API_KEY!,
              },
            }
          );

          if (!response.ok) {
            throw new Error(`ClickUp API error: ${response.statusText}`);
          }

          return { success: true };
        } catch (error) {
          console.error("[OKR] Error deleting subtask:", error);
          throw new Error("Failed to delete subtask");
        }
      }),

    saveKeyResultObjectiveMapping: publicProcedure
      .input(z.object({
        keyResultId: z.string(),
        objectiveId: z.string(),
      }))
      .mutation(async ({ input }) => {
        try {
          console.log(`[OKR Mapping] Mutation called with:`, input);
          const result = await db.saveKeyResultObjectiveMapping(input.keyResultId, input.objectiveId);
          console.log(`[OKR Mapping] DB function returned:`, result);
          return { success: true };
        } catch (error) {
          console.error("[OKR] Error saving mapping:", error);
          throw new Error("Failed to save Key Result-Objective mapping");
        }
      }),

    getKeyResultObjectiveMappings: publicProcedure.query(async () => {
      try {
        return await db.getKeyResultObjectiveMappings();
      } catch (error) {
        console.error("[OKR] Error fetching mappings:", error);
        throw new Error("Failed to fetch Key Result-Objective mappings");
      }
    }),

    moveToNeedleMovers: publicProcedure
      .input(z.object({
        taskId: z.string(),
        keyResultId: z.string(),
      }))
      .mutation(async ({ input }) => {
        console.log(`[OKR] moveToNeedleMovers called with taskId=${input.taskId}, keyResultId=${input.keyResultId}`);
        try {
          // Fetch the original subtask details
          console.log(`[OKR] Fetching subtask details...`);
          const subtask = await clickup.getTask(input.taskId);
          console.log(`[OKR] Subtask fetched: ${subtask.name}`);
          
          // Create a NEW task in Needle Movers list (copying subtask data)
          console.log(`[OKR] Creating new task in Needle Movers list: ${ENV.clickupBusinessListId}`);
          const newTask = await clickup.createNeedleMover(ENV.clickupBusinessListId, {
            name: subtask.name,
            description: subtask.description || "",
            priority: clickup.mapClickUpPriority(subtask.priority) || "normal",
          });
          console.log(`[OKR] New task created: ${newTask.id}`);
          
          if (!newTask.id) {
            throw new Error("Failed to create task: no task ID returned");
          }
          
          // Link the NEW task to the Key Result
          console.log(`[OKR] Linking new task ${newTask.id} to Key Result ${input.keyResultId}`);
          await clickup.linkTasks(newTask.id, input.keyResultId, 'relates to');
          console.log(`[OKR] Link created successfully`);
          
          // TODO: Optionally mark the original subtask as "moved" or "in progress"
          
          return { success: true, newTaskId: newTask.id };
        } catch (error) {
          console.error("[OKR] Error moving to needle movers:", error);
          console.error("[OKR] Error details:", JSON.stringify(error, null, 2));
          throw new Error("Failed to move task to needle movers");
        }
      }),

    linkTaskToKeyResult: publicProcedure
      .input(z.object({
        taskId: z.string(),
        keyResultId: z.string(),
        linkType: z.enum(["blocking", "waiting on", "relates to"]).optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          await clickup.linkTasks(
            input.taskId,
            input.keyResultId,
            input.linkType || "relates to"
          );
          return { success: true };
        } catch (error) {
          console.error("[OKR] Error linking task to key result:", error);
          throw new Error("Failed to link task to key result");
        }
      }),

    linkNeedleMoverToOKR: publicProcedure
      .input(z.object({
        taskId: z.string(),
        keyResultId: z.string(),
        objectiveId: z.string(),
        keyTargetId: z.string().optional(), // Optional key target (subtask) ID
      }))
      .mutation(async ({ input }) => {
        console.log(`[OKR] Linking needle mover ${input.taskId} to KR ${input.keyResultId} and Objective ${input.objectiveId}`);
        if (input.keyTargetId) {
          console.log(`[OKR] Also linking to Key Target ${input.keyTargetId}`);
        }
        
        // Save the key result → objective mapping to database
        await db.saveKeyResultObjectiveMapping(input.keyResultId, input.objectiveId);
        
        // Link in ClickUp (this creates a task relationship)
        try {
          // Link to key result
          await clickup.linkTasks(input.taskId, input.keyResultId, "relates to");
          
          // If key target is specified, also link to it
          if (input.keyTargetId) {
            await clickup.linkTasks(input.taskId, input.keyTargetId, "relates to");
          }
        } catch (error) {
          console.warn("[OKR] Failed to link in ClickUp, but database mapping saved:", error);
        }
        
        return { success: true };
      }),

    suggestTaskMappings: publicProcedure.query(async () => {
      console.log('[OKR] Starting AI task categorization');
      
      // Check if CLICKUP_BUSINESS_LIST_ID is configured
      if (!process.env.CLICKUP_BUSINESS_LIST_ID) {
        console.warn('[OKR] CLICKUP_BUSINESS_LIST_ID not configured, returning empty suggestions');
        return [];
      }
      
      // Fetch all data
      const objectives = await clickup.fetchObjectives();
      const keyResults = await clickup.fetchKeyResults();
      const needleMovers = await clickup.fetchNeedleMovers(process.env.CLICKUP_BUSINESS_LIST_ID);
      
      // Fetch existing mappings from database
      const existingMappings = await db.getKeyResultObjectiveMappings();
      
      // Enrich key results with mapped objective IDs
      const enrichedKeyResults = keyResults.map(kr => {
        const mapping = existingMappings.find(m => m.keyResultId === kr.id);
        if (mapping) {
          return {
            ...kr,
            objectiveIds: [mapping.objectiveId],
          };
        }
        return kr;
      });
      
      console.log(`[OKR] Loaded ${objectives.length} objectives, ${enrichedKeyResults.length} key results, ${needleMovers.length} needle movers`);
      
      // Build context for AI
      const context = objectives.map(obj => {
        const objKeyResults = enrichedKeyResults.filter(kr => 
          kr.objectiveIds?.includes(obj.id || "")
        );
        return {
          objective: obj,
          keyResults: objKeyResults
        };
      });
      
      // For each task, suggest the best Key Result
      const suggestions = [];
      
      for (const task of needleMovers) {
        // Note: We don't check linkedKeyResultId because the Get Tasks API doesn't return
        // relationship data. Instead, we'll suggest mappings for all tasks and let users
        // review them. Tasks that are already linked will show up in the review UI.
        // Only skip if linkedObjectiveName is explicitly set (from custom fields or enrichment)
        if (task.linkedObjectiveName) {
          console.log(`[OKR] Skipping task "${task.name}" - has linkedObjectiveName`);
          continue;
        }
        
        // Simple keyword matching for now (can be enhanced with actual AI later)
        let bestMatch = null;
        let bestScore = 0;
        
        for (const ctx of context) {
          for (const kr of ctx.keyResults) {
            const score = calculateMatchScore(task, kr, ctx.objective);
            if (score > bestScore) {
              bestScore = score;
              bestMatch = {
                taskId: task.id,
                taskName: task.name,
                keyResultId: kr.id,
                keyResultName: kr.name,
                objectiveId: ctx.objective.id,
                objectiveName: ctx.objective.name,
                confidence: Math.min(score / 5, 1), // Normalize to 0-1
                assigneeId: task.assigneeId,
                assigneeName: task.assigneeName
              };
            }
          }
        }
        
        // Always suggest the best match, even if confidence is low
        // Users can review and skip suggestions they don't like
        if (bestMatch) {
          suggestions.push(bestMatch);
        }
      }
      
      console.log(`[OKR] Generated ${suggestions.length} mapping suggestions`);
      return suggestions;
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
    
    postVisualization: publicProcedure
      .input(z.object({
        userId: z.number(),
      }))
      .mutation(async ({ input }) => {
        const visualization = await db.getVisualization(input.userId);
        
        if (!visualization) {
          throw new Error("No visualization found for user");
        }
        
        const { postVisualizationToSlack } = await import("./slack");
        await postVisualizationToSlack(visualization.content);
        
        return { success: true };
      }),
  }),

  visualization: router({
    save: protectedProcedure
      .input(z.object({
        content: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.saveVisualization(ctx.user.id, input.content);
        return { success: true };
      }),
    
    get: protectedProcedure.query(async ({ ctx }) => {
      const visualization = await db.getVisualization(ctx.user.id);
      return visualization;
    }),
    
    getHistory: protectedProcedure.query(async ({ ctx }) => {
      const history = await db.getVisualizationHistory(ctx.user.id);
      return history;
    }),
  }),
  
  microsoft: router({
    getAuthUrl: protectedProcedure.query(({ ctx }) => {
      const redirectUri = `${ctx.req.protocol}://${ctx.req.get('host')}/api/trpc/microsoft.callback`;
      const { getMicrosoftAuthUrl } = require('./microsoft');
      return { url: getMicrosoftAuthUrl(redirectUri) };
    }),
    
    callback: publicProcedure
      .input(z.object({
        code: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) {
          throw new Error('Not authenticated');
        }
        
        const redirectUri = `${ctx.req.protocol}://${ctx.req.get('host')}/api/trpc/microsoft.callback`;
        const { getMicrosoftAccessToken } = await import('./microsoft');
        const tokenData = await getMicrosoftAccessToken(input.code, redirectUri);
        
        // Store tokens in database
        await db.saveMicrosoftTokens(
          ctx.user.id,
          tokenData.access_token,
          tokenData.refresh_token,
          new Date(Date.now() + tokenData.expires_in * 1000)
        );
        
        return { success: true };
      }),
    
    getConnectionStatus: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserById(ctx.user.id);
      return {
        connected: !!user?.microsoftAccessToken,
        tokenExpiry: user?.microsoftTokenExpiry,
      };
    }),
  }),
  
  scorecard: router({
    fetchData: protectedProcedure.mutation(async ({ ctx }) => {
      const user = await db.getUserById(ctx.user.id);
      
      if (!user?.microsoftAccessToken) {
        throw new Error('OneDrive not connected');
      }
      
      // Check if token is expired
      if (user.microsoftTokenExpiry && new Date(user.microsoftTokenExpiry) < new Date()) {
        // Refresh token
        const { refreshMicrosoftAccessToken } = await import('./microsoft');
        const tokenData = await refreshMicrosoftAccessToken(user.microsoftRefreshToken!);
        
        await db.saveMicrosoftTokens(
          ctx.user.id,
          tokenData.access_token,
          tokenData.refresh_token,
          new Date(Date.now() + tokenData.expires_in * 1000)
        );
        
        user.microsoftAccessToken = tokenData.access_token;
      }
      
      // Fetch and parse Excel file
      const { MicrosoftGraphClient } = await import('./microsoft');
      const { parseScorecardData } = await import('./scorecard-parser');
      
      const client = new MicrosoftGraphClient(user.microsoftAccessToken);
      const file = await client.findFileByName('GigaBrands PNL');
      const scorecardData = await client.getWorksheetData(file.id, 'Scorecard');
      const salesProjectionData = await client.getWorksheetData(file.id, 'Sales projection');
      
      const parsed = parseScorecardData(scorecardData, salesProjectionData);
      
      // Store in database for historical tracking
      await db.saveScorecardData(ctx.user.id, parsed);
      
      return parsed;
    }),
    
    getLatest: protectedProcedure.query(async ({ ctx }) => {
      return await db.getLatestScorecardData(ctx.user.id);
    }),
    
    getHistory: protectedProcedure.query(async ({ ctx }) => {
      return await db.getScorecardHistory(ctx.user.id);
    }),
  }),

  sleep: router({
    fetchData: protectedProcedure.mutation(async ({ ctx }) => {
      const { spawn } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify((await import('child_process')).exec);
      
      try {
        console.log('[Sleep] Starting Python script to fetch Eight Sleep data...');
        
        // Execute Python script
        const scriptPath = './scripts/fetch_eight_sleep.py';
        const { stdout, stderr } = await execAsync(`python3 ${scriptPath}`, {
          env: {
            ...process.env,
            DATABASE_URL: ENV.DATABASE_URL,
            EIGHT_EMAIL: ENV.EIGHT_EMAIL,
            EIGHT_PASSWORD: ENV.EIGHT_PASSWORD,
            EIGHT_TIMEZONE: ENV.EIGHT_TIMEZONE,
          },
        });
        
        console.log('[Sleep] Python script output:', stdout);
        if (stderr) {
          console.error('[Sleep] Python script stderr:', stderr);
        }
        
        return { 
          success: true, 
          message: 'Successfully fetched sleep data using Python script' 
        };
      } catch (error: any) {
        console.error('[Sleep] Error fetching data:', error);
        console.error('[Sleep] Error stdout:', error.stdout);
        console.error('[Sleep] Error stderr:', error.stderr);
        throw new Error(`Failed to fetch sleep data: ${error.message}`);
      }
    }),
    
    getWeeklySummary: protectedProcedure.query(async ({ ctx }) => {
      return await db.getWeeklySleepSummary(ctx.user.id);
    }),
    
    getSessions: protectedProcedure
      .input(z.object({
        days: z.number().optional().default(30),
      }))
      .query(async ({ ctx, input }) => {
        return await db.getSleepSessions(ctx.user.id, input.days);
      }),
  }),

  cron: router({
    postDailyVisualization: publicProcedure.mutation(async () => {
      const { postDailyVisualization } = await import("./cron/post-visualization");
      return await postDailyVisualization();
    }),
  }),

  diagnostic: router({
    checkPython: publicProcedure.query(async () => {
      const { checkPythonAvailability } = await import("./check-python");
      return await checkPythonAvailability();
    }),
  }),

  hiring: router({
    fetchPriorities: protectedProcedure.query(async () => {
      try {
        return await hiring.fetchHiringPriorities();
      } catch (error) {
        console.error("[Hiring] Error fetching priorities:", error);
        throw error;
      }
    }),
    
    updatePriority: protectedProcedure
      .input(z.object({
        taskId: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        status: z.string().optional(),
        priority: z.number().optional(),
        assigneeId: z.number().optional(),
        dueDate: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { taskId, ...updates } = input;
        await hiring.updateHiringPriority(taskId, updates);
        return { success: true };
      }),
    
    createPriority: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        priority: z.number().optional(),
        assigneeId: z.number().optional(),
        dueDate: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await hiring.createHiringPriority(input);
      }),
    
    deletePriority: protectedProcedure
      .input(z.object({
        taskId: z.string(),
      }))
      .mutation(async ({ input }) => {
        try {
          const response = await fetch(
            `https://api.clickup.com/api/v2/task/${input.taskId}`,
            {
              method: 'DELETE',
              headers: {
                'Authorization': ENV.clickupApiKey,
              },
            }
          );

          if (!response.ok) {
            throw new Error(`ClickUp API error: ${response.statusText}`);
          }

          return { success: true };
        } catch (error) {
          console.error("[Hiring] Error deleting priority:", error);
          throw new Error("Failed to delete priority");
        }
      }),
  }),

  marketing: router({
    getAllData: protectedProcedure.query(async () => {
      try {
        const data = await airtableMarketing.fetchAllMarketingData();
        return data;
      } catch (error) {
        console.error("[Marketing] Error fetching data:", error);
        throw error;
      }
    }),
  }),

  dashboard: router({
    getPendingItems: protectedProcedure.query(async () => {
      try {
        const tasks = await dashboard.fetchDashboardTasks();
        const allTasks = [...tasks.personal, ...tasks.ea, ...tasks.pa];
        const categories = dashboard.categorizeTasks(allTasks);
        
        return {
          tasks,
          categories,
          total: tasks.total,
        };
      } catch (error) {
        console.error("[Dashboard] Error fetching pending items:", error);
        throw error;
      }
    }),
    
    completeTask: protectedProcedure
      .input(z.object({
        taskId: z.string(),
      }))
      .mutation(async ({ input }) => {
        try {
          await dashboard.updateTaskStatus(input.taskId, 'complete');
          return { success: true };
        } catch (error) {
          console.error("[Dashboard] Error completing task:", error);
          throw error;
        }
      }),

    moveTaskToList: protectedProcedure
      .input(z.object({
        taskId: z.string(),
        targetList: z.enum(['ea', 'pa']),
      }))
      .mutation(async ({ input }) => {
        try {
          const targetListId = input.targetList === 'ea' 
            ? ENV.clickupDashboardEAListId 
            : ENV.clickupDashboardPAListId;
          
          await dashboard.moveTaskToList(input.taskId, targetListId);
          return { success: true };
        } catch (error) {
          console.error("[Dashboard] Error moving task:", error);
          throw error;
        }
      }),

    submitContent: publicProcedure
      .input(z.object({
        agencyName: z.string().min(1, "Agency name is required"),
        agencyId: z.string().optional(),
        contentLink: z.string().url("Must be a valid URL"),
        description: z.string().min(1, "Description is required"),
        dueDate: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          // Create task in Personal list with CONTENT APPROVAL status
          const taskName = `[${input.agencyName}] - Content Review`;
          const taskDescription = `**Agency:** ${input.agencyName}\n**Content Link:** ${input.contentLink}\n\n**Description:**\n${input.description}`;
          
          const response = await fetch(
            `https://api.clickup.com/api/v2/list/${ENV.clickupDashboardPersonalListId}/task`,
            {
              method: 'POST',
              headers: {
                'Authorization': ENV.clickupApiKey,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                name: taskName,
                description: taskDescription,
                status: 'CONTENT APPROVAL',
                due_date: input.dueDate ? new Date(input.dueDate).getTime() : undefined,
              }),
            }
          );

          if (!response.ok) {
            const errorText = await response.text();
            console.error('[Dashboard] Failed to create content task:', errorText);
            throw new Error('Failed to create content submission');
          }

          const data = await response.json();
          const taskUrl = data.url || `https://app.clickup.com/t/${data.id}`;
          
          // Send Slack notification to agency's channel if agencyId is provided
          if (input.agencyId) {
            try {
              const agency = getAgencyById(input.agencyId);
              if (agency?.slackChannelId) {
                await postContentReviewNotification(
                  agency.slackChannelId,
                  input.agencyName,
                  input.contentLink,
                  input.description,
                  taskUrl
                );
                console.log(`[Dashboard] Sent Slack notification to ${agency.name} (${agency.slackChannelId})`);
              }
            } catch (slackError) {
              console.error('[Dashboard] Failed to send Slack notification:', slackError);
              // Don't fail the whole request if Slack fails
            }
          }
          
          return { success: true, taskId: data.id };
        } catch (error) {
          console.error("[Dashboard] Error submitting content:", error);
          throw error;
        }
      }),
  }),

  agencies: router({
    getAll: protectedProcedure.query(async () => {
      return await db.getAllAgencies();
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getAgencyById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1, "Agency name is required"),
        slackChannelId: z.string().min(1, "Slack channel ID is required"),
        contactEmail: z.string().email().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createAgency(input);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        slackChannelId: z.string().min(1).optional(),
        contactEmail: z.string().email().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        return await db.updateAgency(id, updates);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteAgency(input.id);
        return { success: true };
      }),
  }),

});

export type AppRouter = typeof appRouter;

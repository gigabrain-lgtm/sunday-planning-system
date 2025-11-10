import { ENV } from "./_core/env";

const AFFIRMATIONS = [
  "I am a peak performer",
  "I am living my best life and it keeps getting better",
  "I am growing my businesses to new heights",
  "I live in extreme abundance and security",
  "Everyone around me supports me",
  "I don't let me past results define me",
  "I write my future with my own hands and conquer the world",
  "I am a world conqueror",
  "There is nothing I cannot achieve",
  "I am getting in the best shape of my life",
  "I am learning new things every day",
  "I am a sales master and my team is incredible at sales",
  "I am a marketing genius and my team brings in thousands of qualified leads every month",
  "My stock portfolio is growing at an exponential rate with over 50% annual returns",
  "I am profiting hundreds of thousands of dollars every single month",
  "I have an incredible and extremely capable team that I enjoy working with",
  "I am networking hard AF",
  "I am the HARDEST WORKER IN EVERY ROOM",
  "I have the house I want and the car I want and every material possession I want",
  "I am fulfilled",
  "I am getting closer to God",
  "I am taking care of my family",
  "I am evolving at an exponential rate",
];

interface ManifestationData {
  spiritual?: string;
  social?: string;
  relationship?: string;
  status?: string;
  team?: string;
  business?: string;
  travel?: string;
  environment?: string;
  family?: string;
  skills?: string;
  health?: string;
}

export async function postDailyManifestationToSlack(manifestations: ManifestationData) {
  const manifestationText = Object.entries(manifestations)
    .filter(([_, value]) => value)
    .map(([key, value]) => `*${key.charAt(0).toUpperCase() + key.slice(1)}:*\n${value}`)
    .join("\n\n");

  const affirmationsText = AFFIRMATIONS.map((aff, i) => `${i + 1}. ${aff}`).join("\n");

  const message = {
    channel: ENV.slackChannelId,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "🌟 Daily Manifestation & Affirmations",
          emoji: true,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*Weekly Visualizations:*",
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: manifestationText || "No manifestations set for this week.",
        },
      },
      {
        type: "divider",
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*Repeat it one more time - Daily Affirmations:*",
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: affirmationsText,
        },
      },
    ],
  };

  const response = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ENV.slackBotToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });

  const data = await response.json();

  if (!data.ok) {
    throw new Error(`Slack API error: ${data.error}`);
  }

  return data;
}

export async function postVisualizationToSlack(content: string, channelId: string = "C098KHBJWKW") {
  const message = {
    channel: channelId,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "Stay focused brother. Remember why we are doing this. Follow the white rabbit.",
          emoji: true,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Remember where you're going:*\n\n${content}`,
        },
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `Posted on ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`,
          },
        ],
      },
    ],
  };

  const response = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ENV.slackBotToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });

  const data = await response.json();

  if (!data.ok) {
    throw new Error(`Slack API error: ${data.error}`);
  }

  return data;
}

/**
 * Post content review notification to agency's Slack channel
 */
export async function postContentReviewNotification(
  channelId: string,
  agencyName: string,
  contentLink: string,
  description: string,
  taskUrl: string
) {
  const message = {
    channel: channelId,
    text: "Content Review Requested",
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "📝 Content Review Requested",
          emoji: true,
        },
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Agency:*\n${agencyName}`,
          },
          {
            type: "mrkdwn",
            text: `*Status:*\nPending Review`,
          },
        ],
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Content Link:*\n<${contentLink}|View Content>`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Description:*\n${description}`,
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "View in ClickUp",
              emoji: true,
            },
            url: taskUrl,
            style: "primary",
          },
        ],
      },
    ],
  };

  const response = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ENV.slackBotToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });

  const data = await response.json();

  if (!data.ok) {
    console.error("[Slack] Failed to post content review notification:", data.error);
    throw new Error(data.error || "Failed to post to Slack");
  }

  return data;
}

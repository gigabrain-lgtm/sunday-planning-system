export interface Agency {
  id: string;
  name: string;
  slug?: string; // custom URL slug (defaults to id if not set)
  slackChannelId: string;
  logo?: string;
  teamSize?: number;
  subTeams?: number;
}

export interface Department {
  id: string;
  name: string;
  agencies: Agency[];
}

export const orgChartData = {
  ceo: {
    name: "Hunter Harris",
    email: "hunter@iscalewithgigabrands.com",
    photo: "/hunter-photo.jpg", // You can add this later
  },
  
  departments: [
    {
      id: "recruitment",
      name: "Recruitment & Shorts",
      teamSize: 7,
      subTeams: 2,
      agencies: [
        {
          id: "stealth",
          name: "Stealth",
          slackChannelId: "C09DF899GCA",
          logo: "/agency-logos/stealth.png",
        },
        {
          id: "talent-voyager",
          name: "Talent Voyager",
          slackChannelId: "C09EHLJJ583C",
          logo: "/agency-logos/talent-voyager.png",
        },
      ],
    },
    {
      id: "video-editors",
      name: "Youtube Video Editors",
      teamSize: 8,
      subTeams: 1,
      agencies: [
        {
          id: "brandive",
          name: "Brandive",
          slackChannelId: "C07H142P7FS",
          logo: "/agency-logos/brandive.png",
        },
      ],
    },
    {
      id: "branding",
      name: "Branding Development (Content)",
      teamSize: 7,
      subTeams: 3,
      agencies: [
        {
          id: "ai-development",
          name: "AI Development",
          slackChannelId: "", // Add if available
          teamSize: 1,
        },
        {
          id: "video-marketer",
          name: "Video Marketer",
          slackChannelId: "", // Add if available
          teamSize: 1,
        },
      ],
    },
    {
      id: "media-buying",
      name: "Media Buying",
      teamSize: 24,
      subTeams: 3,
      agencies: [
        {
          id: "highminded",
          name: "HighMinded",
          slackChannelId: "C06F9UVEP44",
          logo: "/agency-logos/highminded.png",
        },
        {
          id: "trivium",
          name: "Trivium",
          slackChannelId: "C09040H9NTT",
          logo: "/agency-logos/trivium.png",
        },
        {
          id: "blue-water",
          name: "Blue Water Marketing",
          slackChannelId: "C0B8G7V70JY",
          logo: "/agency-logos/blue-water.png",
        },
        {
          id: "ugc-factory",
          name: "UGC Factory",
          slackChannelId: "C095RNJ523D",
          logo: "/agency-logos/ugc-factory.png",
        },
      ],
    },
    {
      id: "social-media",
      name: "Social Media",
      teamSize: 6,
      subTeams: 1,
      agencies: [
        {
          id: "mogul-media",
          name: "Mogul Media",
          slackChannelId: "C09Q0RUN0Q0",
          logo: "/agency-logos/mogul-media.png",
        },
      ],
    },
  ] as Department[],
  
  services: [
    {
      id: "7-figure-system",
      name: "7 Figure System",
      subName: "7 Figures System DFY",
      slackChannelId: "C09L861RWP8",
      teamSize: 2,
      subTeams: 1,
    },
    {
      id: "clickup-consulting",
      name: "ClickUp Consulting Services",
      subName: "Tip Tops",
      slackChannelId: "C09J8396XE3",
      teamSize: 4,
      subTeams: 1,
    },

  ],
};

// Helper function to get all agencies for dropdown
export function getAllAgencies(): Agency[] {
  const agencies: Agency[] = [];
  
  orgChartData.departments.forEach(dept => {
    dept.agencies.forEach(agency => {
      agencies.push(agency);
    });
  });
  
  orgChartData.services.forEach(service => {
    agencies.push({
      id: service.id,
      name: service.name,
      slackChannelId: service.slackChannelId,
    });
  });
  
  return agencies;
}

// Helper function to generate submission link
export function getSubmissionLink(agencySlug: string): string {
  return `${window.location.origin}/submissions?agency=${agencySlug}`;
}

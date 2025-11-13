// Shared org chart data for server-side use
// This is a duplicate of client/src/data/orgChart.ts for server access

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
    photo: "/hunter-photo.jpg",
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
          slackChannelId: "C09EHLJJ583",
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
          slackChannelId: "C09DQNVV3QN",
          logo: "/agency-logos/brandive.png",
        },
      ],
    },
    {
      id: "branding",
      name: "Branding Development",
      teamSize: 7,
      subTeams: 2,
      agencies: [
        {
          id: "ai-development",
          name: "AI Development",
          slackChannelId: "C09DQNVV3QN",
          logo: "/agency-logos/ai-development.png",
        },
        {
          id: "video-marketer",
          name: "Video Marketer",
          slackChannelId: "C09DQNVV3QN",
          logo: "/agency-logos/video-marketer.png",
        },
      ],
    },
    {
      id: "media-buying",
      name: "Media Buying",
      teamSize: 18,
      subTeams: 4,
      agencies: [
        {
          id: "highminded",
          name: "HighMinded",
          slackChannelId: "C09DQNVV3QN",
          logo: "/agency-logos/highminded.png",
        },
        {
          id: "trivium",
          name: "Trivium",
          slackChannelId: "C09DQNVV3QN",
          logo: "/agency-logos/trivium.png",
        },
        {
          id: "blue-water",
          name: "Blue Water Marketing",
          slackChannelId: "C09DQNVV3QN",
          logo: "/agency-logos/blue-water.png",
        },
        {
          id: "ugc-factory",
          name: "UGC Factory",
          slackChannelId: "C09DQNVV3QN",
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
  ],
  
  services: [
    {
      id: "7-figure-system",
      name: "7 Figure System",
      slackChannelId: "C09DQNVV3QN",
      logo: "/agency-logos/7-figure-system.png",
    },
    {
      id: "clickup-consulting",
      name: "ClickUp Consulting Services",
      slackChannelId: "C09DQNVV3QN",
      logo: "/agency-logos/clickup-consulting.png",
    },
  ],
};

/**
 * Get all agencies from all departments and services
 */
export function getAllAgencies(): Agency[] {
  const departmentAgencies = orgChartData.departments.flatMap(dept => dept.agencies);
  const serviceAgencies = orgChartData.services;
  return [...departmentAgencies, ...serviceAgencies];
}

/**
 * Find agency by ID
 */
export function getAgencyById(agencyId: string): Agency | undefined {
  return getAllAgencies().find(agency => agency.id === agencyId);
}

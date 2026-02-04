const RAPIDAPI_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY || '';
const RAPIDAPI_HOST = 'soccer-football-info.p.rapidapi.com';
const BASE_URL = 'https://soccer-football-info.p.rapidapi.com';

export class FootballApiError extends Error {
  status: number;
  errors: any[];

  constructor(status: number, errors: any[]) {
    const message = errors[0]?.message || 'Unknown Football API Error';
    super(message);
    this.status = status;
    this.errors = errors;
    this.name = 'FootballApiError';
  }
}

async function fetchFootball(endpoint: string) {
  const url = `${BASE_URL}${endpoint}`;
  console.log(`[FootballAPI] Calling: ${url}`);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': RAPIDAPI_HOST,
    },
    next: { revalidate: 3600 } // Cache for 1 hour
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new FootballApiError(response.status, [{ message: `Invalid JSON response: ${text.slice(0, 100)}` }]);
  }

  if (!response.ok || (data && data.status && data.status !== 200)) {
    throw new FootballApiError(data?.status || response.status, data?.errors || [{ message: response.statusText }]);
  }

  return data;
}

export const footballApi = {
  // Get standings for a championship
  getStandings: async (championshipId: string) => {
    // Correct Path: /championships/view/
    // Parameter: i (id)
    return fetchFootball(`/championships/view/?i=${championshipId}&l=en_US`);
  },

  // Get recent/upcoming matches for a championship
  getMatches: async (championshipId: string) => {
    // Correct Path for List: /matches/by/full/
    // Parameter: c (championship)
    return fetchFootball(`/matches/by/full/?c=${championshipId}&l=en_US`);
  },

  // Get details for a championship
  getChampionship: async (championshipId: string) => {
    return fetchFootball(`/championships/view/?i=${championshipId}&l=en_US`);
  },

  // Get list of all championships
  listChampionships: async () => {
    return fetchFootball('/championships/list/?l=en_US');
  }
};

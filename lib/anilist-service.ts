import type { GameCharacter, Tier } from '@/types/game';

const ANILIST_API_URL = 'https://graphql.anilist.co';
const RATE_LIMIT_MS = 700; // 90 requests per minute is ~667ms per request

const CHARACTER_QUERY = `
query ($search: String, $id: Int) {
  Character(search: $search, id: $id) {
    id
    name { full }
    image { large }
    favourites
    media(sort: POPULARITY_DESC, perPage: 1) {
      nodes {
        meanScore
        title { english romaji }
      }
    }
  }
}
`;

const SEARCH_CHARACTERS_QUERY = `
query ($search: String, $perPage: Int) {
  Page(perPage: $perPage) {
    characters(search: $search, sort: FAVOURITES_DESC) {
      id
      name { full }
      image { large }
      favourites
      media(sort: POPULARITY_DESC, perPage: 1) {
        nodes {
          meanScore
          title { english romaji }
        }
      }
    }
  }
}
`;

// For MVP, we'll use a predefined list of popular characters
const CHARACTER_NAMES = [
  // Dragon Ball
  'Goku', 'Vegeta', 'Gohan', 'Piccolo', 'Frieza', 'Trunks', 'Majin Buu',
  // Naruto
  'Naruto Uzumaki', 'Sasuke Uchiha', 'Sakura Haruno', 'Kakashi Hatake', 'Itachi Uchiha', 'Gaara', 'Jiraiya', 'Hinata Hyuga',
  // One Piece
  'Monkey D. Luffy', 'Roronoa Zoro', 'Nami', 'Sanji', 'Tony Tony Chopper', 'Nico Robin', 'Usopp', 'Shanks',
  // Bleach
  'Ichigo Kurosaki', 'Rukia Kuchiki', 'Sosuke Aizen', 'Kenpachi Zaraki', 'Byakuya Kuchiki',
  // One Punch Man
  'Saitama', 'Genos', 'Tatsumaki', 'Garou',
  // Attack on Titan
  'Eren Yeager', 'Mikasa Ackerman', 'Levi Ackerman', 'Armin Arlert',
  // My Hero Academia
  'Izuku Midoriya', 'Katsuki Bakugo', 'Shoto Todoroki', 'All Might', 'Ochaco Uraraka',
  // Hunter x Hunter
  'Gon Freecss', 'Killua Zoldyck', 'Hisoka Morow', 'Kurapika',
  // Demon Slayer
  'Tanjiro Kamado', 'Nezuko Kamado', 'Zenitsu Agatsuma', 'Inosuke Hashibira', 'Kyojuro Rengoku',
  // Jujutsu Kaisen
  'Yuji Itadori', 'Satoru Gojo', 'Megumi Fushiguro', 'Nobara Kugisaki',
  // Fullmetal Alchemist
  'Edward Elric', 'Alphonse Elric', 'Roy Mustang',
  // Death Note
  'Light Yagami', 'L Lawliet', 'Ryuk',
  // Others
  'Spike Spiegel', 'Guts', 'Natsu Dragneel', 'Erza Scarlet', 'Yusuke Urameshi'
];

const calculateTier = (totalStats: number): Tier => {
  if (totalStats >= 480) return 'S++';
  if (totalStats >= 460) return 'S+';
  if (totalStats >= 440) return 'S';
  
  if (totalStats >= 410) return 'A+';
  if (totalStats >= 390) return 'A';
  if (totalStats >= 370) return 'A-';
  
  if (totalStats >= 340) return 'B+';
  if (totalStats >= 320) return 'B';
  if (totalStats >= 300) return 'B-';
  
  if (totalStats >= 270) return 'C+';
  if (totalStats >= 250) return 'C';
  if (totalStats >= 230) return 'C-';
  
  if (totalStats >= 200) return 'D+';
  if (totalStats >= 180) return 'D';
  return 'D-';
};

const generateStats = (favourites: number, meanScore: number | null) => {
  const score = meanScore || 75; // Default score if not available

  // Power ~120-160
  const power = Math.floor(score * 1.6);
  
  // Defense ~0-100. Lower divider means higher defense, but we want it capped.
  const defense = Math.min(100, Math.floor(favourites / 300));
  
  // HP derived from power and defense
  const hp = Math.floor((power + defense) * 0.8);
  
  const speed = Math.floor(Math.random() * 50) + 50; // 50-100
  const skill = Math.floor(Math.random() * 50) + 50; // 50-100

  const total = hp + power + defense + speed + skill;
  const tier = calculateTier(total);

  return { hp, power, defense, speed, skill, tier };
};

const requestQueue: { name: string; resolve: (value: GameCharacter | null) => void; reject: (reason?: unknown) => void; }[] = [];
let isProcessing = false;

const processQueue = async () => {
  if (requestQueue.length === 0) {
    isProcessing = false;
    return;
  }

  isProcessing = true;
  const { name, resolve, reject } = requestQueue.shift()!;

  try {
    const character = await fetchCharacter(name);
    resolve(character);
  } catch (error) {
    reject(error);
  }

  setTimeout(processQueue, RATE_LIMIT_MS);
};

export const getCharacter = (name: string): Promise<GameCharacter | null> => {
  return new Promise((resolve, reject) => {
    requestQueue.push({ name, resolve, reject });
    if (!isProcessing) {
      processQueue();
    }
  });
};

export const fetchCharacter = async (name: string): Promise<GameCharacter | null> => {
  try {
    const response = await fetch(ANILIST_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: CHARACTER_QUERY,
        variables: { search: name },
      }),
    });

    console.log(`[anilist-service] Fetch response for ${name}:`, response.status, response.statusText);

    const jsonData = await response.json();
    console.log(`[anilist-service] JSON data for ${name}:`, jsonData);

    const character = jsonData.data?.Character;

    if (!character) {
      console.warn(`[anilist-service] Character not found for name: ${name}`);
      return null;
    }

    const stats = generateStats(
      character.favourites,
      character.media.nodes[0]?.meanScore
    );

    return {
      id: character.id,
      instanceId: 'temp-id',
      name: character.name.full,
      image: character.image.large,
      tier: stats.tier,
      stats: {
        hp: stats.hp,
        power: stats.power,
        defense: stats.defense,
        speed: stats.speed,
        skill: stats.skill,
      },
    };
  } catch (error) {
    console.error(`[anilist-service] Failed to fetch character ${name}:`, error);
    return null;
  }
};

export const searchCharacters = async (query: string, limit = 10): Promise<GameCharacter[]> => {
  try {
    const response = await fetch(ANILIST_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: SEARCH_CHARACTERS_QUERY,
        variables: { search: query, perPage: limit },
      }),
    });

    const jsonData = await response.json();
    const characters = jsonData.data?.Page?.characters || [];

    return characters.map((char: any) => {
      const stats = generateStats(
        char.favourites,
        char.media.nodes[0]?.meanScore
      );

      return {
        id: char.id,
        instanceId: crypto.randomUUID(),
        name: char.name.full,
        image: char.image.large,
        tier: stats.tier,
        stats: {
          hp: stats.hp,
          power: stats.power,
          defense: stats.defense,
          speed: stats.speed,
          skill: stats.skill,
        },
      };
    });
  } catch (error) {
    console.error(`[anilist-service] Failed to search characters ${query}:`, error);
    return [];
  }
};

export const getCharacterDeck = async (count = 10): Promise<GameCharacter[]> => {
  const characters: GameCharacter[] = [];
  const selectedNames = new Set<string>();

  while (characters.length < count) {
    const shuffledNames = [...CHARACTER_NAMES].sort(() => 0.5 - Math.random());
    const name = shuffledNames[0];

    if (!selectedNames.has(name)) {
      selectedNames.add(name);
      const character = await getCharacter(name);
      if (character) {
        characters.push(character);
      }
    }
  }

  return characters;
};

export const getRandomCharacter = async (excludeNames: string[] = []): Promise<GameCharacter | null> => {
  const availableNames = CHARACTER_NAMES.filter(name => !excludeNames.includes(name));
  
  if (availableNames.length === 0) {
    console.warn('[anilist-service] No more unique characters to choose from.');
    return null;
  }
  
  const randomName = availableNames[Math.floor(Math.random() * availableNames.length)];
  
  return getCharacter(randomName);
};

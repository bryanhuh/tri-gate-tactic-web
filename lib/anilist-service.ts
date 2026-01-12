import type { GameCharacter, Tier } from '@/types/game';

const ANILIST_API_URL = 'https://graphql.anilist.co';

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

// For MVP, we'll use a predefined list of popular characters
const CHARACTER_NAMES = [
  'Goku', 'Vegeta', 'Gohan', 'Piccolo', 'Krillin',
  'Naruto Uzumaki', 'Sasuke Uchiha', 'Sakura Haruno', 'Kakashi Hatake', 'Itachi Uchiha',
  'Monkey D. Luffy', 'Roronoa Zoro', 'Nami', 'Sanji', 'Tony Tony Chopper',
  'Ichigo Kurosaki', 'Rukia Kuchiki', 'Saitama', 'Genos', 'Tatsumaki',
  'Kuririn', 'Gokuu Son'
];

const calculateTier = (totalStats: number): Tier => {
  if (totalStats > 450) return 'S+';
  if (totalStats > 400) return 'S';
  if (totalStats > 350) return 'A+';
  if (totalStats > 300) return 'A';
  return 'A-';
};

const generateStats = (favourites: number, meanScore: number | null) => {
  const score = meanScore || 75; // Default score if not available

  // Normalize and scale stats to be out of 100
  const power = Math.min(100, Math.floor(score * 1.2));
  const defense = Math.min(100, Math.floor(favourites / 150));
  const hp = Math.min(100, Math.floor((power + defense) / 2));
  const speed = Math.floor(Math.random() * 50) + 50; // 50-99
  const skill = Math.floor(Math.random() * 50) + 50; // 50-99

  const total = hp + power + defense + speed + skill;
  const tier = calculateTier(total);

  return { hp, power, defense, speed, skill, tier };
};

export const getCharacter = async (name: string): Promise<GameCharacter | null> => {
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

import thumbMusic from "@/assets/thumb-music.png";
import thumbAnimals from "@/assets/thumb-animals.png";
import thumbCrafts from "@/assets/thumb-crafts.png";
import thumbStories from "@/assets/thumb-stories.png";
import thumbScience from "@/assets/thumb-science.png";
import thumbGames from "@/assets/thumb-games.png";
import thumbNursery from "@/assets/thumb-nursery.png";
import thumbCartoons from "@/assets/thumb-cartoons.png";
import thumbEducation from "@/assets/thumb-education.png";
import thumbYoga from "@/assets/thumb-yoga.png";
import thumbCooking from "@/assets/thumb-cooking.png";
import thumbNature from "@/assets/thumb-nature.png";

export interface VideoCategory {
  id: string;
  name: string;
  emoji: string;
  description: string;
  thumbnail: string;
  ageRange: string;
}

export interface VideoItem {
  id: string;
  title: string;
  thumbnail: string;
  creator: string;
  views: number;
  likes: number;
  comments: number;
  duration: string;
  category: string;
  description: string;
  youtubeId: string;
  ageRecommendation: string;
}

export const videoCategories: VideoCategory[] = [
  { id: "nursery", name: "Nursery Rhymes", emoji: "🎶", description: "Classic songs & lullabies for little ones", thumbnail: thumbNursery, ageRange: "0-5" },
  { id: "cartoons", name: "Cartoons", emoji: "📺", description: "Fun animated shows & characters", thumbnail: thumbCartoons, ageRange: "2-8" },
  { id: "music", name: "Music & Dance", emoji: "🎵", description: "Sing along & dance party!", thumbnail: thumbMusic, ageRange: "2-10" },
  { id: "animals", name: "Animals", emoji: "🐾", description: "Learn about cute animals", thumbnail: thumbAnimals, ageRange: "2-10" },
  { id: "stories", name: "Stories", emoji: "🏰", description: "Fairy tales & bedtime stories", thumbnail: thumbStories, ageRange: "3-10" },
  { id: "crafts", name: "Art & Crafts", emoji: "🎨", description: "Creative projects & drawing", thumbnail: thumbCrafts, ageRange: "3-10" },
  { id: "science", name: "Science", emoji: "🔬", description: "Fun experiments & discoveries", thumbnail: thumbScience, ageRange: "5-12" },
  { id: "games", name: "Games", emoji: "🎮", description: "Play-along games & puzzles", thumbnail: thumbGames, ageRange: "3-10" },
  { id: "education", name: "ABC & Numbers", emoji: "📚", description: "Learn letters, numbers & shapes", thumbnail: thumbEducation, ageRange: "2-6" },
  { id: "nature", name: "Nature", emoji: "🌿", description: "Explore the natural world", thumbnail: thumbNature, ageRange: "3-10" },
  { id: "cooking", name: "Cooking", emoji: "🍳", description: "Kid-friendly recipes & baking", thumbnail: thumbCooking, ageRange: "4-12" },
  { id: "yoga", name: "Yoga & Exercise", emoji: "🧘", description: "Stay active & healthy!", thumbnail: thumbYoga, ageRange: "3-10" },
  { id: "quran_stories", name: "Quran Stories", emoji: "📖", description: "Beautiful stories from the Quran", thumbnail: thumbStories, ageRange: "3-12" },
  { id: "nasheed", name: "Islamic Nasheed", emoji: "🎶", description: "Beautiful Islamic songs for kids", thumbnail: thumbMusic, ageRange: "2-12" },
  { id: "ramadan", name: "Ramadan & Eid", emoji: "🌙", description: "Learn about Islamic celebrations", thumbnail: thumbEducation, ageRange: "3-12" },
  { id: "dua_prayer", name: "Dua & Prayer", emoji: "🤲", description: "Learn duas and salah", thumbnail: thumbEducation, ageRange: "3-12" },
  { id: "farm", name: "Farm & Animals", emoji: "🐄", description: "Fun farm life & animals", thumbnail: thumbAnimals, ageRange: "2-8" },
  { id: "sports", name: "Sports", emoji: "⚽", description: "Sports fun for kids", thumbnail: thumbGames, ageRange: "4-12" },
  { id: "cars", name: "Cars & Trucks", emoji: "🚗", description: "Vehicles, racing & machines", thumbnail: thumbGames, ageRange: "2-8" },
  { id: "magic", name: "Magic & Wizards", emoji: "🪄", description: "Magical adventures & spells", thumbnail: thumbStories, ageRange: "4-10" },
];

export const sampleVideos: VideoItem[] = [
  // Nursery Rhymes
  {
    id: "n1",
    title: "🎶 Baby Shark Dance - Sing Along!",
    thumbnail: thumbNursery,
    creator: "Pinkfong",
    views: 14000000,
    likes: 890000,
    comments: 45000,
    duration: "2:16",
    category: "nursery",
    description: "Doo doo doo doo doo doo! Join Baby Shark and his family in this super fun sing-along dance! 🦈",
    youtubeId: "XqZsoesa55w",
    ageRecommendation: "0-5",
  },
  {
    id: "n2",
    title: "🎶 Wheels on the Bus - Fun Ride!",
    thumbnail: thumbNursery,
    creator: "CoComelon",
    views: 8500000,
    likes: 520000,
    comments: 32000,
    duration: "3:45",
    category: "nursery",
    description: "The wheels on the bus go round and round! Hop on for a musical adventure! 🚌",
    youtubeId: "e_04ZrNroTo",
    ageRecommendation: "0-5",
  },
  {
    id: "n3",
    title: "🎶 Twinkle Twinkle Little Star",
    thumbnail: thumbNursery,
    creator: "Little Angel",
    views: 5200000,
    likes: 340000,
    comments: 18000,
    duration: "4:12",
    category: "nursery",
    description: "A beautiful rendition of the classic bedtime song with twinkling stars! ⭐",
    youtubeId: "yCjJyiqpAuU",
    ageRecommendation: "0-5",
  },

  // Cartoons
  {
    id: "c1",
    title: "📺 Peppa Pig - Muddy Puddles!",
    thumbnail: thumbCartoons,
    creator: "Peppa Pig Official",
    views: 9800000,
    likes: 650000,
    comments: 28000,
    duration: "5:05",
    category: "cartoons",
    description: "Peppa and George love jumping in muddy puddles! Join their fun adventure! 🐷",
    youtubeId: "gLMbIEPtz3Q",
    ageRecommendation: "2-6",
  },
  {
    id: "c2",
    title: "📺 Bluey - The Beach Episode",
    thumbnail: thumbCartoons,
    creator: "Bluey Official",
    views: 7200000,
    likes: 480000,
    comments: 22000,
    duration: "7:30",
    category: "cartoons",
    description: "Bluey and Bingo have the best day at the beach with Dad! 🐕",
    youtubeId: "ux-9V4z0VuM",
    ageRecommendation: "3-8",
  },

  // Music & Dance
  {
    id: "1",
    title: "🎵 Rainbow Dance Party with Friends!",
    thumbnail: thumbMusic,
    creator: "Sara's World",
    views: 125000,
    likes: 8500,
    comments: 234,
    duration: "4:32",
    category: "music",
    description: "Join us for the most colorful dance party ever! Learn fun dance moves and sing along with your favorite rainbow characters! 💃🌈",
    youtubeId: "L_jWHffIx5E",
    ageRecommendation: "2-8",
  },
  {
    id: "m2",
    title: "🎵 Freeze Dance - Fun Movement Song!",
    thumbnail: thumbMusic,
    creator: "The Kiboomers",
    views: 3400000,
    likes: 210000,
    comments: 12000,
    duration: "3:22",
    category: "music",
    description: "Dance, dance, FREEZE! Can you hold still when the music stops? 🕺❄️",
    youtubeId: "2UcZWXvgMZE",
    ageRecommendation: "2-8",
  },

  // Animals
  {
    id: "2",
    title: "🐾 Learn Animal Sounds - Fun for Kids!",
    thumbnail: thumbAnimals,
    creator: "Little Learners",
    views: 89000,
    likes: 5200,
    comments: 156,
    duration: "6:15",
    category: "animals",
    description: "Discover all the amazing sounds that animals make! From dogs and cats to elephants and lions! 🐕🦁",
    youtubeId: "t99ULJjCsaM",
    ageRecommendation: "2-6",
  },
  {
    id: "a2",
    title: "🐾 Baby Animals Playing - So Cute!",
    thumbnail: thumbAnimals,
    creator: "Animal Planet Kids",
    views: 4500000,
    likes: 320000,
    comments: 15000,
    duration: "8:40",
    category: "animals",
    description: "Watch adorable baby animals playing, eating, and having fun! 🐱🐶🐰",
    youtubeId: "PZ9KwmpsIzM",
    ageRecommendation: "2-10",
  },

  // Stories
  {
    id: "4",
    title: "🏰 The Princess and the Magic Castle",
    thumbnail: thumbStories,
    creator: "Story Time",
    views: 234000,
    likes: 12000,
    comments: 567,
    duration: "12:30",
    category: "stories",
    description: "Once upon a time in a magical kingdom... Join us for an enchanting story! 👑🏰",
    youtubeId: "RQmEERvqq70",
    ageRecommendation: "3-8",
  },
  {
    id: "s2",
    title: "🏰 Three Little Pigs - Classic Tale!",
    thumbnail: thumbStories,
    creator: "Fairy Tales for Kids",
    views: 6100000,
    likes: 390000,
    comments: 24000,
    duration: "10:15",
    category: "stories",
    description: "I'll huff and I'll puff! Watch the three little pigs build their houses! 🐷🏠",
    youtubeId: "QLR2pLUsl-Y",
    ageRecommendation: "3-8",
  },

  // Art & Crafts
  {
    id: "3",
    title: "🎨 Easy DIY Crafts - Make a Rainbow!",
    thumbnail: thumbCrafts,
    creator: "Crafty Kids",
    views: 67000,
    likes: 4100,
    comments: 89,
    duration: "8:45",
    category: "crafts",
    description: "Get creative with us! Learn how to make beautiful rainbow crafts! 🎨✨",
    youtubeId: "0TgLtF3PMOc",
    ageRecommendation: "3-10",
  },
  {
    id: "cr2",
    title: "🎨 Easy Origami Animals for Kids!",
    thumbnail: thumbCrafts,
    creator: "Paper Art Kids",
    views: 2300000,
    likes: 180000,
    comments: 9000,
    duration: "11:20",
    category: "crafts",
    description: "Learn to fold cute paper animals! Dogs, cats, birds and more! 📄🐶",
    youtubeId: "_nCwz_FH5SU",
    ageRecommendation: "4-10",
  },

  // Science
  {
    id: "5",
    title: "🔬 Cool Science Experiments at Home!",
    thumbnail: thumbScience,
    creator: "Science Fun",
    views: 156000,
    likes: 9800,
    comments: 345,
    duration: "7:22",
    category: "science",
    description: "Science is amazing! Learn cool experiments you can try at home! 🧪✨",
    youtubeId: "js0hVFCHPOo",
    ageRecommendation: "5-12",
  },
  {
    id: "sc2",
    title: "🔬 How Volcanoes Erupt - For Kids!",
    thumbnail: thumbScience,
    creator: "SciShow Kids",
    views: 3800000,
    likes: 250000,
    comments: 14000,
    duration: "6:30",
    category: "science",
    description: "Learn how volcanoes work and make your own eruption! 🌋💥",
    youtubeId: "lAmqsMQG3RM",
    ageRecommendation: "5-10",
  },

  // Games
  {
    id: "6",
    title: "🎮 Fun Games for Kids - Play Along!",
    thumbnail: thumbGames,
    creator: "Game Time",
    views: 198000,
    likes: 11200,
    comments: 678,
    duration: "15:00",
    category: "games",
    description: "Join the fun gaming adventure! Play along with us! 🎮🎉",
    youtubeId: "nKIu9yen5nc",
    ageRecommendation: "3-10",
  },

  // Education (ABC & Numbers)
  {
    id: "e1",
    title: "📚 Learn ABCs with Fun Songs!",
    thumbnail: thumbEducation,
    creator: "ABC Learning",
    views: 7600000,
    likes: 480000,
    comments: 28000,
    duration: "25:30",
    category: "education",
    description: "Learn the alphabet with catchy songs and colorful animations! A-B-C-D-E-F-G... 🔤",
    youtubeId: "hq3yfQnllfQ",
    ageRecommendation: "2-5",
  },
  {
    id: "e2",
    title: "📚 Counting 1 to 20 - Number Fun!",
    thumbnail: thumbEducation,
    creator: "Number Buddies",
    views: 4200000,
    likes: 290000,
    comments: 16000,
    duration: "8:15",
    category: "education",
    description: "Count along with us! Learn numbers 1 through 20 with fun visuals! 🔢✨",
    youtubeId: "DR-cfDsHCGA",
    ageRecommendation: "2-5",
  },

  // Nature
  {
    id: "na1",
    title: "🌿 Beautiful Butterflies - Nature Wonders!",
    thumbnail: thumbNature,
    creator: "Nature Kids",
    views: 2800000,
    likes: 190000,
    comments: 11000,
    duration: "9:45",
    category: "nature",
    description: "Discover the magical world of butterflies! Watch them fly and learn about their life cycle! 🦋🌸",
    youtubeId: "7oOY8Odi79k",
    ageRecommendation: "3-10",
  },
  {
    id: "na2",
    title: "🌿 Ocean Animals for Kids - Deep Sea!",
    thumbnail: thumbNature,
    creator: "Ocean Explorers",
    views: 5100000,
    likes: 350000,
    comments: 19000,
    duration: "12:00",
    category: "nature",
    description: "Dive deep into the ocean and meet incredible sea creatures! 🐙🦑🐠",
    youtubeId: "eWgBBjmcEMQ",
    ageRecommendation: "3-10",
  },

  // Cooking
  {
    id: "co1",
    title: "🍳 Easy Cookies for Kids to Bake!",
    thumbnail: thumbCooking,
    creator: "Tiny Chefs",
    views: 1900000,
    likes: 140000,
    comments: 8000,
    duration: "10:30",
    category: "cooking",
    description: "Bake the yummiest cookies with easy steps! Perfect for little chefs! 🍪👩‍🍳",
    youtubeId: "sFEGG1T_Qqo",
    ageRecommendation: "4-10",
  },
  {
    id: "co2",
    title: "🍳 Rainbow Fruit Popsicles - So Yummy!",
    thumbnail: thumbCooking,
    creator: "Yummy Kids Kitchen",
    views: 2400000,
    likes: 170000,
    comments: 9500,
    duration: "7:15",
    category: "cooking",
    description: "Make colorful fruit popsicles at home! Healthy and delicious! 🍓🫐🍊",
    youtubeId: "Kab4F0Sr7m4",
    ageRecommendation: "4-10",
  },

  // Yoga & Exercise
  {
    id: "y1",
    title: "🧘 Cosmic Kids Yoga - Dinosaur Adventure!",
    thumbnail: thumbYoga,
    creator: "Cosmic Kids Yoga",
    views: 6800000,
    likes: 420000,
    comments: 25000,
    duration: "14:30",
    category: "yoga",
    description: "Join us on a yoga adventure with dinosaurs! Stretch, breathe, and have fun! 🦖🧘",
    youtubeId: "LhYtcadR9nw",
    ageRecommendation: "3-8",
  },
  {
    id: "y2",
    title: "🧘 Kids Dance Exercise - Get Moving!",
    thumbnail: thumbYoga,
    creator: "GoNoodle",
    views: 3500000,
    likes: 230000,
    comments: 13000,
    duration: "5:20",
    category: "yoga",
    description: "Time to get moving! Fun exercise routine that kids will love! 💪😄",
    youtubeId: "ymigWt5TOV8",
    ageRecommendation: "3-10",
  },

  // Quran Stories
  {
    id: "qs1", title: "📖 Story of Prophet Nuh (Noah) for Kids",
    thumbnail: thumbStories, creator: "FreeQuranEducation", views: 5200000,
    likes: 340000, comments: 18000, duration: "12:30", category: "quran_stories",
    description: "Learn the beautiful story of Prophet Nuh and the great flood! 🌊",
    youtubeId: "JFJUCNiJDaA", ageRecommendation: "3-12",
  },
  {
    id: "qs2", title: "📖 Story of Prophet Yusuf for Children",
    thumbnail: thumbStories, creator: "IslamicCartoons", views: 3800000,
    likes: 250000, comments: 12000, duration: "15:00", category: "quran_stories",
    description: "The amazing story of Prophet Yusuf told for kids! ⭐",
    youtubeId: "gkS_-WWkIoU", ageRecommendation: "4-12",
  },

  // Islamic Nasheed
  {
    id: "ns1", title: "🎶 Bismillah - Islamic Song for Kids",
    thumbnail: thumbMusic, creator: "OnePath Network", views: 8500000,
    likes: 520000, comments: 25000, duration: "3:45", category: "nasheed",
    description: "A beautiful nasheed about saying Bismillah! 🌟",
    youtubeId: "bE8fOXHc9gY", ageRecommendation: "2-10",
  },
  {
    id: "ns2", title: "🎶 Allah Made Everything - Kids Nasheed",
    thumbnail: thumbMusic, creator: "ZainBhikha", views: 4200000,
    likes: 280000, comments: 15000, duration: "4:20", category: "nasheed",
    description: "Beautiful song about Allah's creation! 🌸",
    youtubeId: "GxUaNZ0MhfA", ageRecommendation: "2-10",
  },

  // Ramadan & Eid
  {
    id: "rm1", title: "🌙 Ramadan Song for Kids - Welcome Ramadan!",
    thumbnail: thumbEducation, creator: "IslamicSongsForKids", views: 6100000,
    likes: 380000, comments: 20000, duration: "4:00", category: "ramadan",
    description: "Get excited about Ramadan with this fun song! 🎉",
    youtubeId: "FHFJ8K5L4s8", ageRecommendation: "3-10",
  },
  {
    id: "rm2", title: "🌙 Eid Mubarak - Celebration Song",
    thumbnail: thumbEducation, creator: "OmarAndHana", views: 4500000,
    likes: 290000, comments: 16000, duration: "3:30", category: "ramadan",
    description: "Celebrate Eid with this joyful song! 🎊",
    youtubeId: "gT2fntJuELY", ageRecommendation: "2-10",
  },

  // Dua & Prayer
  {
    id: "dp1", title: "🤲 Learn How to Pray Salah for Kids",
    thumbnail: thumbEducation, creator: "IslamicKids", views: 7200000,
    likes: 450000, comments: 22000, duration: "8:00", category: "dua_prayer",
    description: "Step by step guide to learn salah! 🕌",
    youtubeId: "T4auGhmeBlw", ageRecommendation: "4-12",
  },
  {
    id: "dp2", title: "🤲 Daily Duas for Muslim Kids",
    thumbnail: thumbEducation, creator: "LearnWithAdam", views: 3600000,
    likes: 220000, comments: 11000, duration: "6:30", category: "dua_prayer",
    description: "Learn important daily duas with fun animations! ✨",
    youtubeId: "bbiRfDq8jHE", ageRecommendation: "3-10",
  },

  // Farm & Animals
  {
    id: "fm1", title: "🐄 Old MacDonald Had a Farm - Animals!",
    thumbnail: thumbAnimals, creator: "SuperSimpleSongs", views: 12000000,
    likes: 780000, comments: 35000, duration: "3:30", category: "farm",
    description: "Sing along and learn about farm animals! 🐓",
    youtubeId: "5oYKonYBujg", ageRecommendation: "1-5",
  },
  {
    id: "fm2", title: "🐄 Farm Animal Sounds for Kids",
    thumbnail: thumbAnimals, creator: "KidsLearningTube", views: 8500000,
    likes: 520000, comments: 28000, duration: "5:00", category: "farm",
    description: "Learn what sounds different farm animals make! 🐴",
    youtubeId: "LGtYpl3s15k", ageRecommendation: "1-6",
  },

  // Sports
  {
    id: "sp1", title: "⚽ Learn Soccer Skills for Kids!",
    thumbnail: thumbGames, creator: "KidsSportsAcademy", views: 4100000,
    likes: 260000, comments: 14000, duration: "7:00", category: "sports",
    description: "Fun soccer drills and skills for beginners! 🏆",
    youtubeId: "z8jFuBmUGqY", ageRecommendation: "4-12",
  },
  {
    id: "sp2", title: "⚽ Kids Workout & Sports Fun",
    thumbnail: thumbYoga, creator: "CosmicKidsYoga", views: 5500000,
    likes: 340000, comments: 18000, duration: "10:00", category: "sports",
    description: "Get active with this fun sports workout! 💪",
    youtubeId: "L_A_HjHd2C8", ageRecommendation: "4-10",
  },

  // Cars & Trucks
  {
    id: "cr1", title: "🚗 Monster Trucks for Kids - Big Machines!",
    thumbnail: thumbGames, creator: "GeckoGarage", views: 9800000,
    likes: 600000, comments: 30000, duration: "12:00", category: "cars",
    description: "Amazing monster trucks and big vehicles! 🚛",
    youtubeId: "s1LUXQWzCno", ageRecommendation: "2-8",
  },
  {
    id: "cr2", title: "🚗 Construction Vehicles for Children",
    thumbnail: thumbGames, creator: "BlippiToys", views: 7200000,
    likes: 440000, comments: 22000, duration: "8:00", category: "cars",
    description: "Learn about excavators, bulldozers and more! 🏗️",
    youtubeId: "bUQXHPDxMFI", ageRecommendation: "2-7",
  },

  // Magic & Wizards
  {
    id: "mg1", title: "🪄 Easy Magic Tricks for Kids!",
    thumbnail: thumbScience, creator: "KidsMagicShow", views: 6300000,
    likes: 390000, comments: 20000, duration: "8:30", category: "magic",
    description: "Learn amazing magic tricks to impress your friends! ✨",
    youtubeId: "VaWQm5J0abU", ageRecommendation: "5-12",
  },
  {
    id: "mg2", title: "🪄 The Wizard's Adventure - Animated Story",
    thumbnail: thumbStories, creator: "FairyTalesKids", views: 4800000,
    likes: 300000, comments: 16000, duration: "10:00", category: "magic",
    description: "Join the little wizard on a magical adventure! 🏰",
    youtubeId: "s2R0C8mGAsk", ageRecommendation: "4-10",
  },
];

// Helper to get video by ID
export const getVideoById = (id: string): VideoItem | undefined => {
  return sampleVideos.find(v => v.id === id);
};

// Helper to get category by ID
export const getCategoryById = (id: string): VideoCategory | undefined => {
  return videoCategories.find(c => c.id === id);
};

// Helper to get videos by category
export const getVideosByCategory = (categoryId: string): VideoItem[] => {
  if (categoryId === "all") return sampleVideos;
  return sampleVideos.filter(v => v.category === categoryId);
};

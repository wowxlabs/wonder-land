import { InfoPoint } from "@/store/useExperienceStore";

export interface Place {
  id: string;
  name: string;
  tagline: string;
  description: string;
  thumbnail: string;
  position: [number, number, number];
  cameraOffset: [number, number, number];
  color: string;
  glowColor: string;
  icon: string;
  environment: "rock" | "fort" | "temple" | "mountain" | "jungle" | "city" | "ruins" | "park";
  infoPoints: InfoPoint[];
}

export const PLACES: Place[] = [
  {
    id: "sigiriya",
    name: "Sigiriya",
    tagline: "The Lion Rock Fortress",
    description:
      "An ancient rock fortress rising 200m above the surrounding plains. Built by King Kashyapa in the 5th century, it is one of the best-preserved examples of ancient urban planning.",
    thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Sigiriya_%28141688197%29.jpeg/330px-Sigiriya_%28141688197%29.jpeg",
    position: [-0.16, 0.15, -0.56],
    cameraOffset: [0, 8, 10],
    color: "#f59e0b",
    glowColor: "rgba(245, 158, 11, 0.5)",
    icon: "🏛️",
    environment: "rock",
    infoPoints: [
      {
        id: "sig-1",
        title: "Lion's Paw Entrance",
        description: "The massive carved lion paws that mark the gateway to the summit.",
        details:
          "Originally a full lion sculpture flanked the final stairway. Only the enormous paws survive today, carved directly from the rock face. Visitors once climbed between the lion's legs to reach the summit palace.",
        position: [2, 0.5, 0],
        type: "landmark",
      },
      {
        id: "sig-2",
        title: "Mirror Wall",
        description: "A polished plaster wall that once reflected the king's image.",
        details:
          "The mirror wall was so highly polished that the king could see himself in it as he walked by. Over centuries, visitors carved poems and graffiti on it — some of the oldest surviving Sinhala writing in the world.",
        position: [-2, 0.5, 1],
        type: "info",
      },
      {
        id: "sig-3",
        title: "Kumari the Guide",
        description: "A local archaeologist who has studied Sigiriya for 20 years.",
        details:
          "\"Every stone here tells a story. The frescoes you see are just a fraction of the original 500 paintings that once covered the western face. They depicted the king's celestial maidens — no one knows exactly who they were.\"",
        position: [0, 0, -2],
        type: "npc",
        npcName: "Kumari Perera",
      },
    ],
  },
  {
    id: "kandy",
    name: "Kandy",
    tagline: "Sacred City of the Tooth Relic",
    description:
      "Sri Lanka's cultural capital, nestled in the central highlands around a serene lake. Home to the Temple of the Tooth Relic — one of the most sacred sites in Buddhism, said to house a tooth of the Buddha himself.",
    thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/SL_Kandy_asv2020-01_img33_Sacred_Tooth_Temple.jpg/330px-SL_Kandy_asv2020-01_img33_Sacred_Tooth_Temple.jpg",
    position: [-0.75, 0.10, 1.20],
    cameraOffset: [0, 6, 8],
    color: "#8b5cf6",
    glowColor: "rgba(139, 92, 246, 0.5)",
    icon: "🛕",
    environment: "temple",
    infoPoints: [
      {
        id: "kan-1",
        title: "Temple of the Tooth",
        description: "The Sri Dalada Maligawa, housing the sacred tooth relic of the Buddha.",
        details:
          "The golden-roofed octagonal tower (Paththirippuwa) has become an icon of Sri Lanka. The relic is held in a golden casket nested inside six others and is brought out for public viewing during the Esala Perahera festival each August.",
        position: [0, 0.5, -2],
        type: "landmark",
      },
      {
        id: "kan-2",
        title: "Kandy Lake",
        description: "An artificial lake built by the last Kandyan king in 1807.",
        details:
          "King Sri Vikrama Rajasinha built the lake using forced labour, which enraged the Sinhalese nobles. The cloud-wall running along the north bank was built to hide the royal bathing area from public view — a design unique in Sri Lankan architecture.",
        position: [2, 0, 1],
        type: "info",
      },
      {
        id: "kan-3",
        title: "Nimal the Drummer",
        description: "A traditional Kandyan drummer who performs at the perahera.",
        details:
          "\"The Esala Perahera is 10 days of fire, drums and elephants. Over a hundred tuskers walk through the streets. I have been drumming since I was eight years old — my father taught me, and his father taught him.\"",
        position: [-2, 0, 0],
        type: "npc",
        npcName: "Nimal Bandara",
      },
    ],
  },
  {
    id: "galle",
    name: "Galle Fort",
    tagline: "A Living Dutch Colonial Fortress",
    description:
      "A UNESCO World Heritage fortress on Sri Lanka's southwestern tip, built by the Portuguese in 1588 and fortified by the Dutch in the 17th century. Its cobbled streets, colonial villas and lighthouse make it one of Asia's best-preserved colonial cities.",
    thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Galle_Fort.jpg/330px-Galle_Fort.jpg",
    position: [-1.80, 0.05, 4.80],
    cameraOffset: [0, 6, 8],
    color: "#0f766e",
    glowColor: "rgba(15, 118, 110, 0.5)",
    icon: "🏰",
    environment: "fort",
    infoPoints: [
      {
        id: "gal-1",
        title: "The Lighthouse",
        description: "A 26m lighthouse built by the British in 1938, still in operation.",
        details:
          "Standing on the southernmost bastion, the lighthouse replaced an earlier colonial tower. Its beam sweeps 26 nautical miles out to sea — and on clear nights you can see its flash from the beaches of Unawatuna just a kilometre away.",
        position: [2, 0.5, -1],
        type: "landmark",
      },
      {
        id: "gal-2",
        title: "Dutch Reformed Church",
        description: "The oldest Protestant church in Sri Lanka, built in 1755.",
        details:
          "The floor of the church is paved with gravestones of Dutch burghers, many of whom died of fever and dysentery far from home. Their epitaphs, written in Dutch, record the names of wives and children left behind in Amsterdam and Leiden.",
        position: [-1, 0, -2],
        type: "info",
      },
      {
        id: "gal-3",
        title: "Amara the Batik Artist",
        description: "She runs a small atelier inside the fort walls.",
        details:
          "\"My family has lived inside the fort for four generations. After the 2004 tsunami the walls protected us — the water came up to the ramparts and stopped. Everyone inside survived. We light a lamp at the church every year on that day.\"",
        position: [0, 0, 2],
        type: "npc",
        npcName: "Amara de Silva",
      },
    ],
  },
  {
    id: "adams-peak",
    name: "Adam's Peak",
    tagline: "The Sacred Footprint Mountain",
    description:
      "A 2,243m conical peak in the central highlands, considered sacred by four religions. At its summit lies a hollow in the rock venerated as the footprint of the Buddha, Shiva, Adam, and St Thomas respectively. Pilgrims climb through the night by lantern light.",
    thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Sri_Pada.JPG/330px-Sri_Pada.JPG",
    position: [-1.10, 0.15, 2.62],
    cameraOffset: [0, 8, 10],
    color: "#ef4444",
    glowColor: "rgba(239, 68, 68, 0.5)",
    icon: "⛰️",
    environment: "mountain",
    infoPoints: [
      {
        id: "adm-1",
        title: "Sri Pada (Sacred Footprint)",
        description: "A hollow formation at the summit, 1.8m long, enshrined under a golden roof.",
        details:
          "Buddhists call it Sri Pada and attribute it to the Buddha. Hindus say it is Shiva's footprint. Muslims and Christians believe Adam stood here after his expulsion from Eden. The shrine has been a place of pilgrimage for over 1,000 years.",
        position: [0, 1, 0],
        type: "landmark",
      },
      {
        id: "adm-2",
        title: "The Chain of Bells",
        description: "Pilgrims ring a bell for each successful ascent completed.",
        details:
          "A long chain of small bells stretches the final steep section. The tradition is that you ring the bell once for your first climb, twice for your second, and so on. Some devotees have rung the bell fifty or sixty times across a lifetime of pilgrimage.",
        position: [-2, 0.5, 0],
        type: "info",
      },
      {
        id: "adm-3",
        title: "Senaka the Tea Seller",
        description: "He has sold tea on the mountain path for 30 years.",
        details:
          "\"People arrive at midnight and reach the top just before dawn to see the shadow of the mountain fall perfectly on the plains below. It only lasts a minute. Some people cry the first time they see it. Even I still feel something, after all these years.\"",
        position: [2, 0, 1],
        type: "npc",
        npcName: "Senaka Wijeratne",
      },
    ],
  },
  {
    id: "ella",
    name: "Ella",
    tagline: "Hill Country & Nine Arch Bridge",
    description:
      "A small hill-country town perched at 1,041m, famous for sweeping valley views, tea estates and the iconic Nine Arch Bridge — a British colonial railway viaduct built entirely of stone, brick and cement with no steel.",
    thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/The_Nine_Arches_Bridge.jpg/330px-The_Nine_Arches_Bridge.jpg",
    position: [0.48, 0.12, 2.46],
    cameraOffset: [0, 6, 8],
    color: "#22c55e",
    glowColor: "rgba(34, 197, 94, 0.5)",
    icon: "🌿",
    environment: "jungle",
    infoPoints: [
      {
        id: "ela-1",
        title: "Nine Arch Bridge",
        description: "A 24m-high, nine-span viaduct built between 1919 and 1921.",
        details:
          "Legend says the bridge was designed and built by a local, Appuhami, when steel could not be delivered due to World War I. He substituted stone, brick and cement — and the result has outlasted steel bridges elsewhere on the same line by decades.",
        position: [2, 0, 0],
        type: "landmark",
      },
      {
        id: "ela-2",
        title: "Little Adam's Peak",
        description: "A gentle 1,141m summit, an easy two-hour hike through tea estates.",
        details:
          "The path winds through neatly clipped tea bushes, cardamom groves and eucalyptus forest before opening onto a rocky summit with 360° views over the Ella Gap. On clear mornings you can see all the way to the southern coast.",
        position: [-2, 0, -1],
        type: "info",
      },
      {
        id: "ela-3",
        title: "Priyanka the Tea Plucker",
        description: "She has worked the same estate since she was 18.",
        details:
          "\"A skilled plucker takes only the top two leaves and a bud — nothing more. I can fill 18 kilos in a day. The tourists take photos of us and ask to try. They last about five minutes before their backs give out.\"",
        position: [0, 0, -2],
        type: "npc",
        npcName: "Priyanka Rasaiah",
      },
    ],
  },
  {
    id: "dambulla",
    name: "Dambulla",
    tagline: "Golden Cave Temple",
    description:
      "A UNESCO World Heritage Site containing five magnificent cave shrines carved into a massive granite outcrop. Over 150 statues of the Buddha and stunning ceiling murals covering 2,100 sq m have been maintained here since the 1st century BC.",
    thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Dambulla-buddhastupa.jpg/330px-Dambulla-buddhastupa.jpg",
    position: [-0.65, 0.12, -0.50],
    cameraOffset: [0, 6, 8],
    color: "#f97316",
    glowColor: "rgba(249, 115, 22, 0.5)",
    icon: "🪔",
    environment: "temple",
    infoPoints: [
      {
        id: "dam-1",
        title: "Cave of the Great Kings",
        description: "The largest cave, housing a 15m reclining Buddha carved from the rock.",
        details:
          "The reclining Buddha, carved directly from the granite face, depicts the moment of the Buddha's parinirvana. The figure is so large that it spans the full length of the cave. Its feet are said to represent the gateway to nirvana.",
        position: [0, 0.5, -2],
        type: "landmark",
      },
      {
        id: "dam-2",
        title: "Ceiling Murals",
        description: "2,100 sq m of painted ceiling depicting Jataka tales and Hindu mythology.",
        details:
          "The paintings were laid down in successive layers over two millennia. Conservators using infrared imaging have found at least four distinct historical periods of painting, some deliberately covering others as religious patronage shifted between kings.",
        position: [2, 0.5, 0],
        type: "info",
      },
      {
        id: "dam-3",
        title: "Monk Sumedha",
        description: "A resident monk who has tended the caves for 40 years.",
        details:
          "\"Pilgrims come barefoot because the rock is sacred — hot as coals at noon in July. We sweep the caves every morning before sunrise. The bats in the upper crevices have lived here longer than any of us. We do not disturb them.\"",
        position: [-2, 0, 1],
        type: "npc",
        npcName: "Venerable Sumedha",
      },
    ],
  },
  {
    id: "polonnaruwa",
    name: "Polonnaruwa",
    tagline: "Medieval Capital of Ceylon",
    description:
      "Sri Lanka's second ancient capital, flourishing from the 10th to 13th centuries. Its royal palace, moonstone entrances, audience halls and the Gal Vihara rock-carved Buddha sculptures are among the finest medieval ruins in Asia.",
    thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Polonnaruwa_01.jpg/330px-Polonnaruwa_01.jpg",
    position: [0.35, 0.08, -0.75],
    cameraOffset: [0, 6, 8],
    color: "#b45309",
    glowColor: "rgba(180, 83, 9, 0.5)",
    icon: "🗿",
    environment: "ruins",
    infoPoints: [
      {
        id: "pol-1",
        title: "Gal Vihara",
        description: "Four magnificent Buddha images carved directly into a single granite face.",
        details:
          "The tallest standing Buddha, at 7m, and a 15m reclining figure are the jewels of the site. They were commissioned by King Parakramabahu I in the 12th century. The sculptor's tools show no sign of iron — many historians believe they used harder stone chisels alone.",
        position: [2, 0.5, -1],
        type: "landmark",
      },
      {
        id: "pol-2",
        title: "The Parakrama Samudra",
        description: "A vast irrigation reservoir built to feed the ancient city.",
        details:
          "King Parakramabahu declared: 'Let not a drop of water that falls as rain be allowed to flow into the sea without first serving man.' The reservoir, covering 2,500 hectares, is still in use today and irrigates the surrounding rice paddies.",
        position: [-2, 0, 0],
        type: "info",
      },
      {
        id: "pol-3",
        title: "Chaminda the Archaeologist",
        description: "He leads excavations for the Cultural Triangle Project.",
        details:
          "\"We are still finding things. Last season we uncovered a bronze Buddha with a coral inlay in the eyes — completely unknown type. The jungle swallows everything here. The roots split the stones but also hold the walls together. It is a complicated relationship.\"",
        position: [0, 0, 2],
        type: "npc",
        npcName: "Chaminda Jayawardena",
      },
    ],
  },
  {
    id: "nuwara-eliya",
    name: "Nuwara Eliya",
    tagline: "Little England in the Clouds",
    description:
      "Sri Lanka's highest city at 1,868m, surrounded by emerald tea estates and misty peaks. The British built a hill station here so faithful to England that it still has a post office, a golf course and a Tudor-style hotel among the tea-scented fog.",
    thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/NuwaraEliya_from_top.jpg/330px-NuwaraEliya_from_top.jpg",
    position: [-0.26, 0.18, 2.22],
    cameraOffset: [0, 6, 8],
    color: "#06b6d4",
    glowColor: "rgba(6, 182, 212, 0.5)",
    icon: "🍵",
    environment: "jungle",
    infoPoints: [
      {
        id: "nuw-1",
        title: "Pedro Tea Estate",
        description: "One of the oldest working tea estates, established in 1885.",
        details:
          "At this altitude the tea grows very slowly — up to 30% slower than lowland tea. The result is a brisk, delicate flavour with a bright golden liquor. Pedro Single Estate teas are exported to over 40 countries and fetch some of the highest prices at the Colombo Tea Auction.",
        position: [2, 0, -1],
        type: "landmark",
      },
      {
        id: "nuw-2",
        title: "Horton Plains",
        description: "A high plateau with World's End — a sheer 870m drop.",
        details:
          "The plateau is a silent cloud-forest ecosystem found nowhere else on earth. The world famous 'World's End' cliff drops 870m straight down. On clear mornings between January and March the entire southern coast of Sri Lanka is visible from the edge.",
        position: [-2, 0, -1],
        type: "info",
      },
      {
        id: "nuw-3",
        title: "Laxmi the Estate Manager",
        description: "Third-generation Tamil tea planter managing 200 hectares.",
        details:
          "\"My grandfather came from Tamil Nadu to work these fields. My father became a supervisor. I studied agriculture in Colombo and came back to manage the whole estate. The tea remembers the altitude and the mist — every single cup.\"",
        position: [0, 0, 2],
        type: "npc",
        npcName: "Laxmi Krishnasamy",
      },
    ],
  },
  {
    id: "yala",
    name: "Yala",
    tagline: "Leopards & Wild Elephants",
    description:
      "Sri Lanka's most visited national park, covering 979 sq km of scrub jungle, lagoons, and coastal dunes. Yala has the world's highest density of leopards, alongside elephants, sloth bears, mugger crocodiles and over 200 species of birds.",
    thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Yala_Beach.jpg/330px-Yala_Beach.jpg",
    position: [1.52, 0.06, 3.86],
    cameraOffset: [0, 6, 8],
    color: "#d97706",
    glowColor: "rgba(217, 119, 6, 0.5)",
    icon: "🐆",
    environment: "park",
    infoPoints: [
      {
        id: "yal-1",
        title: "Leopard Territory",
        description: "Yala holds the highest density of wild leopards in the world.",
        details:
          "Each leopard has a defined home range marked with scent. The dominant male, nicknamed 'Sathosa' by rangers, controls Block 1 near the Yala lagoon. Sightings are most reliable in the early morning when leopards descend from rocky outcrops to drink at waterholes.",
        position: [0, 0.5, -2],
        type: "landmark",
      },
      {
        id: "yal-2",
        title: "Kumana Lagoon",
        description: "A bird sanctuary hosting nesting colonies of painted storks.",
        details:
          "Between April and July, painted storks, spoonbills and open-billed storks nest here in thousands. The lagoon also supports the largest recorded congregation of lesser adjutants in Sri Lanka. At sunrise the sky turns orange with birds rising from the mangroves.",
        position: [2, 0, 1],
        type: "info",
      },
      {
        id: "yal-3",
        title: "Ravi the Safari Guide",
        description: "He has guided in Yala for 22 years.",
        details:
          "\"The elephants know our jeeps. They don't run anymore. The young bulls sometimes mock-charge to test us. I know them all by their ear shapes. The leopards are different — they appear when they want to. You earn their attention. You cannot demand it.\"",
        position: [-2, 0, 0],
        type: "npc",
        npcName: "Ravi Samaraweera",
      },
    ],
  },
  {
    id: "trincomalee",
    name: "Trincomalee",
    tagline: "Natural Harbour & Whale Beach",
    description:
      "A city built around one of the world's finest deep-water natural harbours. Its powder-white beaches, coral reefs and predictable whale-watching season (May–October) draw divers and sailors, while the hilltop Koneswaram Temple watches over the sea.",
    thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Bay_of_Trincomalee.jpg/330px-Bay_of_Trincomalee.jpg",
    position: [1.02, 0.06, -2.72],
    cameraOffset: [0, 6, 8],
    color: "#0284c7",
    glowColor: "rgba(2, 132, 199, 0.5)",
    icon: "🐋",
    environment: "city",
    infoPoints: [
      {
        id: "tri-1",
        title: "Koneswaram Temple",
        description: "An ancient Hindu temple perched on Swami Rock, 130m above the sea.",
        details:
          "The temple is dedicated to Shiva and has stood on this promontory for over 2,500 years. When Dutch forces demolished it in 1624, the sacred Lingam was hurled into the sea. Divers recovered it in 1956 and it was re-enshrined. The original bronze statue of Shiva lies in the Rijksmuseum in Amsterdam.",
        position: [2, 0.5, -1],
        type: "landmark",
      },
      {
        id: "tri-2",
        title: "Marble Beach",
        description: "A 3km arc of calm turquoise water once reserved for the Sri Lanka Navy.",
        details:
          "The beach was a private naval facility until the early 2000s. The calm bay is protected by a headland that blocks the northeast monsoon swell, making it swimmable year-round. Spinner dolphins pass within 500m of the shore on most mornings.",
        position: [-1, 0, 2],
        type: "info",
      },
      {
        id: "tri-3",
        title: "Fathima the Fisherman",
        description: "A third-generation Tamil fisher who works the offshore waters.",
        details:
          "\"From May to October the blue whales come — sometimes 20 in a day. They follow the upwelling that the southwest monsoon brings. My grandfather called them 'the blue mountains of the sea.' He never left the harbour in his life but he watched them from the shore.\"",
        position: [0, 0, -2],
        type: "npc",
        npcName: "Fathima Nusrath",
      },
    ],
  },
  {
    id: "jaffna",
    name: "Jaffna",
    tagline: "The Resilient Northern Capital",
    description:
      "The cultural heart of Sri Lanka's Tamil community, sitting at the northern tip of the island on a shallow lagoon. Known for its distinctive cuisine, Hindu kovils, Dutch fort and the warmth of a city that rebuilt itself after decades of conflict.",
    thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Jaffna_montage.jpg/330px-Jaffna_montage.jpg",
    position: [-1.80, 0.05, -5.80],
    cameraOffset: [0, 6, 8],
    color: "#dc2626",
    glowColor: "rgba(220, 38, 38, 0.5)",
    icon: "🌺",
    environment: "city",
    infoPoints: [
      {
        id: "jaf-1",
        title: "Nallur Kandaswamy Kovil",
        description: "The most revered Hindu temple in Sri Lanka, rebuilt seven times.",
        details:
          "The golden gopuram (tower) visible across Jaffna was erected in the 19th century. The annual Nallur Festival runs for 25 days, with chariot processions and vel (spear) ceremonies. At its peak, over a million pilgrims visit in a single day — one of the largest Hindu gatherings in South Asia.",
        position: [0, 0.5, 2],
        type: "landmark",
      },
      {
        id: "jaf-2",
        title: "Jaffna Fort",
        description: "A 17th-century Dutch fort that changed hands five times in four centuries.",
        details:
          "Built by the Portuguese in 1618 and heavily expanded by the Dutch in 1680, the fort passed to the British in 1795. Its star-shaped ramparts and moat remain largely intact. The fort served as a military base until 2011, after which it was opened to the public for the first time in living memory.",
        position: [-2, 0, 0],
        type: "info",
      },
      {
        id: "jaf-3",
        title: "Meena the Library Keeper",
        description: "She helped rebuild the Jaffna Public Library after its destruction.",
        details:
          "\"The library held 97,000 manuscripts — palm-leaf texts going back 500 years. When it was burned in 1981, a generation of knowledge vanished. We have spent 40 years gathering what survived in private collections. We are still only halfway. Some things cannot be recovered. But we do not stop.\"",
        position: [2, 0, -1],
        type: "npc",
        npcName: "Meena Ponnambalam",
      },
    ],
  },
];

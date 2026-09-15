import { WorldKnowledgeNode } from '../types';

export const WORLD_KNOWLEDGE_NODES: WorldKnowledgeNode[] = [
  // --- EARTH WONDERS ---
  {
    id: 'pyramids-giza',
    name: 'Great Pyramids of Giza & Sphinx',
    nativeOrAlternateName: 'أهرامات الجيزة',
    realm: 'earth_wonders',
    category: 'Ancient Architecture',
    subLocation: 'Cairo, Egypt',
    coordinates: { lat: 29.9792, lng: 31.1342, distanceOrAltitude: '138.8m height' },
    eraOrScale: 'c. 2560 BCE (4,500+ years old)',
    tagline: 'Last standing wonder of the original Seven Ancient Wonders',
    fascinatingFact: 'The Great Pyramid was built using ~2.3 million stone blocks weighing an average of 2.5 tons each, aligned to true cardinal North with an error of less than 4 arcminutes (1/15th of a degree).',
    description: 'Constructed as the eternal tomb for Pharaoh Khufu during Egypt\'s Fourth Dynasty, the Great Pyramid was the tallest man-made structure in the world for over 3,800 years. Its inner passages include the Grand Gallery, the King\'s Chamber with its red granite sarcophagus, and mystical shafts aligned toward celestial stars like Orion and Alpha Draconis.',
    keyInsights: [
      'Engineered with mortar that has endured four millennia and remains stronger than modern cement.',
      'Casing stones originally formed a blindingly reflective polished white limestone shell seen for miles in the desert sun.',
      'Surrounded by the enigmatic Great Sphinx carved from a single limestone ridge.'
    ],
    metrics: {
      'Base Width': '230.4 m',
      'Weight': '~5.75 Million Tons',
      'Original Height': '146.6 m',
      'Blocks': '~2.3 Million'
    },
    iconType: 'Pyramid',
    colorAccent: '#f59e0b'
  },
  {
    id: 'taj-mahal',
    name: 'Taj Mahal',
    nativeOrAlternateName: 'تاج محل',
    realm: 'earth_wonders',
    category: 'Mughal Architecture',
    subLocation: 'Agra, Uttar Pradesh, India',
    coordinates: { lat: 27.1751, lng: 78.0421, distanceOrAltitude: '73m minaret height' },
    eraOrScale: '1632 - 1648 CE',
    tagline: 'The timeless monument of eternal love and marble symmetry',
    fascinatingFact: 'The four corner minarets were deliberately constructed leaning slightly outwards (at an angle of a few degrees) so that in case of an earthquake, they would collapse away from the central mausoleum dome.',
    description: 'Commissioned by Mughal Emperor Shah Jahan to house the tomb of his beloved wife Mumtaz Mahal, the Taj Mahal is recognized worldwide as the jewel of Islamic art in India. Built with translucent white Makrana marble inlaid with 28 types of precious and semi-precious stones (pietra dura technique), it shifts hue throughout the day—blushing pink in dawn, dazzling white at midday, and glowing golden beneath the moonlight.',
    keyInsights: [
      'Absolute bilateral symmetry maintained across the entire complex, broken only by Shah Jahan’s tomb positioned beside Mumtaz.',
      'Constructed by over 20,000 master artisans, calligraphers, and stonemasons from across Asia.',
      'Flanked by the holy Yamuna river with lush Persian Charbagh paradise gardens.'
    ],
    metrics: {
      'Dome Height': '73 meters',
      'Workers': '20,000+ artisans',
      'Materials': 'Makrana White Marble',
      'Inlaid Gems': '28 varieties'
    },
    iconType: 'Crown',
    colorAccent: '#ec4899'
  },
  {
    id: 'great-wall-china',
    name: 'Great Wall of China',
    nativeOrAlternateName: '万里长城 (Wànlǐ Chángchéng)',
    realm: 'earth_wonders',
    category: 'Military Fortification',
    subLocation: 'Northern China',
    coordinates: { lat: 40.4319, lng: 116.5704, distanceOrAltitude: '21,196 km total length' },
    eraOrScale: '7th century BCE - Ming Dynasty (1644 CE)',
    tagline: 'The longest man-made defensive structure across continents',
    fascinatingFact: 'The mortar used during the Ming Dynasty contained sticky rice flour! The amylopectin in sticky rice helped bond the bricks so tightly that weeds still cannot grow between them centuries later.',
    description: 'Stretching across rugged mountain ridges, grasslands, and desert sands from the Bohai Sea to Lop Nur, the Great Wall was constructed by successive Chinese dynasties to protect against nomadic invasions, control Silk Road trade, and broadcast imperial authority via beacon smoke signals.',
    keyInsights: [
      'Not a single continuous wall, but a vast network of stone walls, trenches, natural barriers, and over 25,000 watchtowers.',
      'Contrary to myth, it is not readily visible from low Earth orbit with the naked eye without optical magnification.',
      'Employed hundreds of thousands of soldiers, peasants, and convicts across 2,000 years of construction.'
    ],
    metrics: {
      'Total Length': '21,196 km',
      'Average Height': '6 to 8 meters',
      'Watchtowers': 'Over 25,000',
      'Dynasties': 'Qin, Han, Ming'
    },
    iconType: 'Shield',
    colorAccent: '#ef4444'
  },
  {
    id: 'machu-picchu',
    name: 'Machu Picchu',
    nativeOrAlternateName: 'Machu Pikchu (Quechua)',
    realm: 'earth_wonders',
    category: 'Inca Astronomy & Royal Estate',
    subLocation: 'Andes Mountains, Cusco, Peru',
    coordinates: { lat: -13.1631, lng: -72.5450, distanceOrAltitude: '2,430m above sea level' },
    eraOrScale: 'c. 1450 CE',
    tagline: 'The mystical Inca Citadel nestled among the Andean cloud forests',
    fascinatingFact: 'The Incas built Machu Picchu without using wheels, draft animals, or iron tools, and without mortar! The polished dry-stone stones fit together so tightly (ashlar technique) that not even a credit card can slip between them, and the stones \'dance\' during earthquakes before settling back perfectly.',
    description: 'Perched upon a narrow ridge between two sharp Andean peaks (Machu Picchu and Huayna Picchu), this imperial royal estate of Inca Emperor Pachacuti functioned as a sacred ceremonial sanctuary. It features astronomical temples like the Intihuatana stone ("hitching post of the sun"), the Temple of the Sun, and over 700 agricultural terraces with advanced drainage.',
    keyInsights: [
      'Preserved because Spanish conquistadors never found the secret cloud forest mountain trail.',
      'Designed with engineered drainage channels that still manage heavy tropical monsoon rains without landslides.',
      'Aligned with sacred mountain spirits (Apus) and solstices.'
    ],
    metrics: {
      'Altitude': '2,430 m (7,970 ft)',
      'Terraces': '700+ stone levels',
      'Construction': 'Mortar-less Ashlar',
      'UNESCO': 'World Heritage Site'
    },
    iconType: 'Mountain',
    colorAccent: '#10b981'
  },
  {
    id: 'petra',
    name: 'Petra - The Rose City',
    nativeOrAlternateName: 'البتراء (Al-Batrāʾ)',
    realm: 'earth_wonders',
    category: 'Rock-Cut Architecture',
    subLocation: 'Ma\'an Governorate, Jordan',
    coordinates: { lat: 30.3285, lng: 35.4444, distanceOrAltitude: '810m elevation' },
    eraOrScale: 'c. 4th Century BCE - 100 CE',
    tagline: 'Ancient Nabataean capital carved directly into rosy sandstone cliffs',
    fascinatingFact: 'The Nabataeans engineered an ingenious water management system of terracotta pipes, cisterns, dams, and bypass tunnels that collected flash flood waters, turning a bone-dry desert canyon into a lush oasis supporting 30,000 residents.',
    description: 'Approached through the narrow Siq—a 1.2-kilometer-long winding gorge flanked by 80-meter-high cliffs—Petra suddenly reveals the breathtaking Al-Khazneh (The Treasury). Carved by the Nabataean Arabs at the crossroads of spice, incense, and silk trade routes between Arabia, Egypt, and Syria-Phoenicia.',
    keyInsights: [
      'Over 85% of the ancient city still remains buried underground waiting to be excavated.',
      'Combines Hellenistic Greco-Roman columns and pediments with Nabataean religious motifs.',
      'Known as the "Rose-Red City half as old as time" due to the vibrant layered sandstone strata.'
    ],
    metrics: {
      'The Treasury': '40m high x 25m wide',
      'The Siq Length': '1.2 km',
      'Excavated': '~15% discovered',
      'Peak Population': '30,000+'
    },
    iconType: 'Sparkles',
    colorAccent: '#f97316'
  },
  {
    id: 'colosseum-rome',
    name: 'The Colosseum',
    nativeOrAlternateName: 'Amphitheatrum Flavium',
    realm: 'earth_wonders',
    category: 'Roman Engineering',
    subLocation: 'Rome, Italy',
    coordinates: { lat: 41.8902, lng: 12.4922, distanceOrAltitude: '48m height' },
    eraOrScale: '72 - 80 CE (Flavian Dynasty)',
    tagline: 'The colossal amphitheater of gladiators and imperial spectacles',
    fascinatingFact: 'The Romans could flood the Colosseum arena floor to stage mock naval battles (naumachiae) with real warships and combatants, utilizing an intricate system of aqueducts and massive drainage valves underneath.',
    description: 'Commissioned by Emperor Vespasian and inaugurated by Titus with 100 days of games, the Colosseum held between 50,000 and 80,000 spectators. It featured 80 arched entrances, a retractable canvas awning (velarium) operated by Roman naval sailors, and a multi-level subterranean labyrinth (hypogeum) with trapdoors and counterweight elevators for beasts.',
    keyInsights: [
      'Pioneered the use of Roman pozzolanic volcanic concrete, enabling colossal arches without collapsing under their own weight.',
      'Seating was strictly stratified by Roman social caste, from senators at the ring to plebeians and enslaved citizens at the summit.',
      'Stands as the world\'s largest standing ancient amphitheater.'
    ],
    metrics: {
      'Capacity': '50,000 - 80,000',
      'Arched Entrances': '80 vomitoria',
      'Outer Perimeter': '527 meters',
      'Material': 'Travertine & Roman Concrete'
    },
    iconType: 'Landmark',
    colorAccent: '#d97706'
  },

  // --- COSMIC & PLANETARY WORLDS ---
  {
    id: 'mars-olympus-mons',
    name: 'Mars - Olympus Mons & Valles Marineris',
    nativeOrAlternateName: 'Red Planet (Ares)',
    realm: 'cosmic_planets',
    category: 'Planetary Geology',
    subLocation: 'Tharsis Volcanic Plateau, Mars',
    coordinates: { lat: 18.65, lng: -133.8, distanceOrAltitude: '225 Million km from Earth' },
    eraOrScale: 'Formed 4.5 Billion Years Ago',
    tagline: 'Solar System’s tallest volcano and deepest colossal canyon',
    fascinatingFact: 'Olympus Mons is 21.9 kilometers high—nearly 2.5 times the height of Mount Everest! It is so enormous that its base would cover the entire country of France or the state of Arizona, and its peak pokes right into the Martian stratosphere.',
    description: 'Mars is a cold, desert world with a thin carbon dioxide atmosphere, rusted iron oxide soil, and ancient river deltas testifying that liquid oceans once bathed its northern plains. Nearby lies Valles Marineris, a canyon system 4,000 km long and up to 7 km deep, dwarfing Earth\'s Grand Canyon by tenfold.',
    keyInsights: [
      'Mars lacks tectonic plate movement; a single volcanic hotspot erupted continually for millions of years to build Olympus Mons.',
      'Currently explored by NASA’s Perseverance and Curiosity rovers seeking biosignatures in ancient riverbeds.',
      'Has two captured asteroid moons, Phobos and Deimos, with Phobos destined to break into a planetary ring in 50 million years.'
    ],
    metrics: {
      'Olympus Mons Height': '21.9 km (72,000 ft)',
      'Valles Marineris': '4,000 km long',
      'Day Length': '24 hours 37 mins',
      'Gravity': '38% of Earth'
    },
    iconType: 'Globe',
    colorAccent: '#f43f5e'
  },
  {
    id: 'europa-ocean-moon',
    name: 'Europa - The Subsurface Ocean World',
    nativeOrAlternateName: 'Jupiter II',
    realm: 'cosmic_planets',
    category: 'Astrobiology & Ocean Worlds',
    subLocation: 'Orbiting Jupiter (Jovian System)',
    coordinates: { lat: 0, lng: 0, distanceOrAltitude: '628 Million km from Earth' },
    eraOrScale: 'Age: 4.5 Billion Years',
    tagline: 'A global saltwater ocean harboring twice the water of all Earth oceans',
    fascinatingFact: 'Beneath Europa’s 15-to-25 km thick shell of water ice lies a global liquid ocean estimated to be 60 to 150 km deep. Gravitational tidal flexing from massive Jupiter keeps this hidden ocean warm and liquid without sunlight!',
    description: 'Europa is widely regarded as one of the most promising candidates for extraterrestrial life in our solar system. Hydrothermal vents on its silicate rocky seafloor could provide chemical energy and essential minerals, mirroring the extreme deep-sea vents where life first ignited on Earth.',
    keyInsights: [
      'Target of NASA\'s Europa Clipper and ESA\'s JUICE missions investigating habitability.',
      'Surface crisscrossed by reddish fractures called lineae, caused by Jupiter\'s immense tidal squeezing.',
      'Water vapor geysers have been observed venting tens of kilometers into space.'
    ],
    metrics: {
      'Ocean Depth': '60 - 150 km',
      'Ice Shell': '15 - 25 km thick',
      'Water Volume': '2x all Earth Oceans',
      'Surface Temp': '-170°C'
    },
    iconType: 'Compass',
    colorAccent: '#06b6d4'
  },
  {
    id: 'titan-methane-world',
    name: 'Titan - The Organic Methane World',
    nativeOrAlternateName: 'Saturn VI',
    realm: 'cosmic_planets',
    category: 'Planetary Atmospheres',
    subLocation: 'Orbiting Saturn (Chronian System)',
    coordinates: { lat: 25.0, lng: -40.0, distanceOrAltitude: '1.4 Billion km from Earth' },
    eraOrScale: 'Discovered 1655 by Christiaan Huygens',
    tagline: 'The only moon with a dense atmosphere and flowing surface liquids',
    fascinatingFact: 'Titan is the only body other than Earth with stable rivers, rainfall, and seas on its surface—except instead of water, it rains liquid methane and ethane! Its atmosphere is so thick and its gravity so low that a human with cardboard wings attached to their arms could fly.',
    description: 'Titan is larger than the planet Mercury and possesses a dense nitrogen atmosphere with golden hydrocarbon smog. Beneath the orange haze lie seas like Kraken Mare, towering dunes of organic soot, cryovolcanoes that erupt ice-lava, and potentially a prebiotic chemical soup that mimics early primordial Earth.',
    keyInsights: [
      'NASA\'s Dragonfly mission (rotorcraft lander) is scheduled to fly across Titan\'s sands in the 2030s.',
      'Atmospheric pressure is 1.45 times Earth’s sea level pressure.',
      'The Huygens probe landed on Titan in 2005, sending back photos of rounded pebbles of rock-hard water ice.'
    ],
    metrics: {
      'Atmosphere': '95% Nitrogen, 5% Methane',
      'Diameter': '5,149 km (larger than Mercury)',
      'Kraken Mare Sea': '400,000 sq km',
      'Surface Temp': '-179°C (-290°F)'
    },
    iconType: 'Cloud',
    colorAccent: '#eab308'
  },
  {
    id: 'moon-tranquility',
    name: 'The Moon - Sea of Tranquility & Shackleton Crater',
    nativeOrAlternateName: 'Luna / Selene / Chandra',
    realm: 'cosmic_planets',
    category: 'Lunar Geography & Space Exploration',
    subLocation: 'Earth Orbit (384,400 km away)',
    coordinates: { lat: 0.674, lng: 23.473, distanceOrAltitude: '384,400 km from Earth' },
    eraOrScale: 'Formed ~4.51 Billion Years Ago (Theia impact)',
    tagline: 'Humanity\'s celestial sister and cosmic stepping stone',
    fascinatingFact: 'Because the Moon has no atmosphere, liquid water, or wind erosion, the footprints left by Neil Armstrong and Buzz Aldrin in the fine regolith dust at Tranquility Base on July 20, 1969, will remain undisturbed for millions of years.',
    description: 'Born from a colossal collision between young proto-Earth and a Mars-sized planet named Theia, the Moon stabilizes Earth’s axial tilt and drives the ocean tides that fostered early biological evolution. Today, its South Pole (Shackleton Crater) holds billions of tons of ancient water ice shielded in permanent shadows.',
    keyInsights: [
      'Tidally locked to Earth: the same "near side" face always looks down upon our planet.',
      'Target of the Artemis program and India’s Chandrayaan-3, which made history landing near the South Pole.',
      'Lunar regolith contains Helium-3, a potential clean fuel for future nuclear fusion reactors.'
    ],
    metrics: {
      'Distance': '384,400 km average',
      'Diameter': '3,474 km (27% of Earth)',
      'Gravity': '1/6th Earth gravity',
      'Apollo Sites': '6 crewed landings'
    },
    iconType: 'Moon',
    colorAccent: '#a855f7'
  },
  {
    id: 'jupiter-great-red-spot',
    name: 'Jupiter - The Great Red Spot & King of Worlds',
    nativeOrAlternateName: 'Brihaspati / Zeus / Jovian World',
    realm: 'cosmic_planets',
    category: 'Gas Giant Worlds',
    subLocation: '5th Planet from the Sun',
    coordinates: { lat: -22.0, lng: 0.0, distanceOrAltitude: '778 Million km from Sun' },
    eraOrScale: 'Storm Observed for 350+ Years',
    tagline: 'Colossal anticyclonic storm large enough to swallow the entire Earth',
    fascinatingFact: 'Jupiter is more massive than all the other planets in our solar system combined (2.5 times their total mass). Its gravity acts as a cosmic vacuum cleaner, deflecting thousands of potentially lethal comets away from Earth throughout history.',
    description: 'A swirling kaleidoscope of ammonia clouds, hydrogen gas, and fierce atmospheric jet streams exceeding 600 km/h. At Jupiter\'s core, pressures reach millions of atmospheres, compressing hydrogen into an exotic state of liquid metallic hydrogen that generates a magnetic field 20,000 times stronger than Earth\'s.',
    keyInsights: [
      'The Great Red Spot is an anticyclone that has raged continuously since at least 1665.',
      'Hosts 95 known moons including Ganymede (the largest moon in the solar system, with its own magnetic field).',
      'Emits more heat than it receives from the Sun due to ongoing gravitational contraction.'
    ],
    metrics: {
      'Storm Width': '16,350 km (1.3x Earth diameter)',
      'Day Length': '9 hours 56 mins (fastest spin)',
      'Mass': '318 Earth masses',
      'Known Moons': '95 moons'
    },
    iconType: 'Sun',
    colorAccent: '#f97316'
  },

  // --- ANCIENT CIVILIZATIONS ---
  {
    id: 'indus-valley-civilization',
    name: 'Indus Valley Civilization',
    nativeOrAlternateName: 'Harappa & Mohenjo-Daro (Sindhu-Saraswati)',
    realm: 'civilizations',
    category: 'Bronze Age Civilization',
    subLocation: 'Indus River Basin (India & Pakistan)',
    coordinates: { lat: 27.3249, lng: 68.1378, distanceOrAltitude: 'Cradle of Urban Sanitation' },
    eraOrScale: '3300 - 1300 BCE (Peak 2600 - 1900 BCE)',
    tagline: 'Pioneers of grid-based urban planning and underground sanitation',
    fascinatingFact: 'Over 4,500 years ago, houses in Mohenjo-Daro and Harappa had private bathrooms with flush toilets connected to an advanced covered brick drainage system running beneath the streets—a level of sanitation unmatched anywhere in Europe until the 19th century.',
    description: 'Spanning over one million square kilometers—larger than ancient Egypt and Mesopotamia combined—the Indus Valley Civilization was celebrated for its peaceful trade, standardized brick sizes (ratio 4:2:1), sophisticated bronze metallurgy, dockyards at Lothal, and the Great Bath. Its script remains one of history\'s greatest undeciphered linguistic mysteries.',
    keyInsights: [
      'Demonstrated remarkably little evidence of warfare, royal palaces, or military conquest; driven by egalitarian commerce.',
      'Conducted maritime trade with ancient Sumer (Mesopotamia), where they were known as "Meluhha".',
      'Developed standardized binary and decimal weight systems accurate to fractions of a gram.'
    ],
    metrics: {
      'Area': 'Over 1,000,000 sq km',
      'Major Cities': 'Harappa, Mohenjo-Daro, Dholavira, Lothal',
      'Brick Ratio': 'Strict 4:2:1 mathematical standard',
      'Script': 'Undeciphered Indus Script'
    },
    iconType: 'History',
    colorAccent: '#0ea5e9'
  },
  {
    id: 'ancient-mesopotamia',
    name: 'Ancient Mesopotamia - Cradle of Civilizations',
    nativeOrAlternateName: 'The Land Between Two Rivers (Tigris & Euphrates)',
    realm: 'civilizations',
    category: 'Birthplace of Writing & Law',
    subLocation: 'Modern Iraq, Kuwait, Syria',
    coordinates: { lat: 32.5363, lng: 44.4208, distanceOrAltitude: 'Babylon & Ziggurat of Ur' },
    eraOrScale: 'c. 4500 - 539 BCE',
    tagline: 'Where humanity invented writing, the wheel, math, and written law',
    fascinatingFact: 'Mesopotamian astronomers based their mathematics on the sexagesimal system (base 60). It is because of them that we still have 60 seconds in a minute, 60 minutes in an hour, and 360 degrees in a circle today!',
    description: 'Home to Sumer, Akkad, Babylonia, and Assyria, Mesopotamia pioneered the foundations of urban civilization: cuneiform clay script, irrigation agriculture, the potter\'s wheel, monumental tiered mud-brick temples called Ziggurats, the Epic of Gilgamesh, and King Hammurabi\'s historic legal code ("an eye for an eye").',
    keyInsights: [
      'Uruk was the world’s first true mega-city, with 50,000 citizens by 3000 BCE.',
      'Invented the 7-day week and mapped the zodiac constellations still used by stargazers.',
      'The mythical Hanging Gardens of Babylon were ranked among the Seven Wonders of the Ancient World.'
    ],
    metrics: {
      'Writing System': 'Cuneiform on clay tablets',
      'Numerical Base': 'Sexagesimal (Base 60)',
      'First Empire': 'Akkadian Empire (Sargon the Great)',
      'Legal Code': 'Code of Hammurabi (282 laws)'
    },
    iconType: 'BookOpen',
    colorAccent: '#8b5cf6'
  },
  {
    id: 'ancient-egypt-thebes',
    name: 'Ancient Egypt - The Valley of the Kings & Karnak',
    nativeOrAlternateName: 'Kemet (The Black Land)',
    realm: 'civilizations',
    category: 'Nile Kingdom & Pharaonic Dynasties',
    subLocation: 'Luxor & Aswan, Egypt',
    coordinates: { lat: 25.6989, lng: 32.6421, distanceOrAltitude: 'Along the River Nile' },
    eraOrScale: 'c. 3100 - 30 BCE',
    tagline: 'Three millennia of pharaohs, hieroglyphs, and cosmic eternity',
    fascinatingFact: 'King Tutankhamun’s innermost gold coffin alone weighs 110.4 kg of pure solid gold, and his famous burial mask is adorned with lapis lazuli, turquoise, and carnelian that have kept their dazzling luster for over 3,300 years.',
    description: 'Nourished by the seasonal flooding of the Nile, Ancient Egypt flourished across thirty dynasties. Pharaohs built monumental mortuary temples at Karnak and Luxor, covered with painted hieroglyphs of Osiris, Ra, and Anubis, safeguarding their souls on the journey through the Duat (underworld).',
    keyInsights: [
      'Women held unprecedented legal rights for antiquity, owning property, initiating divorce, and serving as Pharaoh (Hatshepsut, Cleopatra).',
      'Developed advanced surgery, set bone fractures, and created the 365-day solar calendar.',
      'The Rosetta Stone deciphered their hieroglyphic writing in 1822 via the Greek inscription.'
    ],
    metrics: {
      'Duration': 'Over 3,000 years',
      'Nile Length': '6,650 km lifeline',
      'Tutankhamun Gold Mask': '10.23 kg solid gold',
      'Tombs in Valley': '65+ cataloged tombs'
    },
    iconType: 'Sun',
    colorAccent: '#fbbf24'
  },
  {
    id: 'mayan-civilization',
    name: 'Maya Civilization - Tikal & Chichen Itza',
    nativeOrAlternateName: 'Mayab / Mesoamerica',
    realm: 'civilizations',
    category: 'Mesoamerican Astronomy & Mathematics',
    subLocation: 'Guatemala, Mexico, Belize, Honduras',
    coordinates: { lat: 17.2220, lng: -89.6237, distanceOrAltitude: 'Jungle Canopy Observatories' },
    eraOrScale: '2000 BCE - 1697 CE (Classic: 250 - 900 CE)',
    tagline: 'Astronomical geniuses who independently invented the concept of Zero',
    fascinatingFact: 'The Maya calculated the solar year at 365.242 days—more accurate than the Gregorian calendar used in Europe at the time! At the pyramid of El Castillo during the equinoxes, the setting sun casts a serpentine shadow that slithers down the pyramid stairs to the carved head of Kukulkan.',
    description: 'Flourishing in dense tropical rainforests, the Maya built grand jungle metropolises with soaring limestone step pyramids, ball courts, and stone stelae. They developed the only fully functional written script in pre-Columbian Americas, alongside sophisticated calendrical cycles (Tzolk\'in and Long Count).',
    keyInsights: [
      'Independently invented the mathematical concept of zero (represented as a stylized shell) by 36 BCE.',
      'Practiced complex slash-and-burn milpa and raised-bed wetland agriculture supporting millions.',
      'Decoded planetary movements of Venus and predicted solar eclipses with minute precision.'
    ],
    metrics: {
      'Number System': 'Vigesimal (Base 20) with Zero',
      'Solar Year Precision': '365.242 days',
      'Pyramid of El Castillo': '91 steps per side + 1 top = 365 days',
      'Cities Discovered': 'Over 4,400 structures in Tikal'
    },
    iconType: 'Sparkles',
    colorAccent: '#10b981'
  },

  // --- DEEP FRONTIERS & EXTREME EARTH WORLDS ---
  {
    id: 'mariana-trench-challenger-deep',
    name: 'Mariana Trench - Challenger Deep',
    nativeOrAlternateName: 'The Abyssal Hadal Zone',
    realm: 'deep_frontiers',
    category: 'Oceanic Abyssal Zone',
    subLocation: 'Western Pacific Ocean, near Guam',
    coordinates: { lat: 11.3493, lng: 142.1996, distanceOrAltitude: '-10,994 meters deep' },
    eraOrScale: 'Formed via Tectonic Plate Subduction',
    tagline: 'The deepest, darkest, most extreme abyss on planet Earth',
    fascinatingFact: 'At the bottom of Challenger Deep, the hydrostatic water pressure is over 1,086 bar (15,750 psi)—equivalent to having the weight of 50 jumbo jets pressing down on a human body! Yet bizarre translucent snailfish, amphipods, and xenophyophores thrive there in total pitch darkness.',
    description: 'Formed where the Pacific Plate is pushed beneath the smaller Mariana Plate, Challenger Deep descends nearly 11 kilometers beneath the surface. If Mount Everest were placed into the trench, its summit would still be covered by over 2 kilometers of ice-cold ocean water.',
    keyInsights: [
      'More humans have walked on the Moon than have visited the bottom of Challenger Deep.',
      'Fascinating chemosynthetic bacteria thrive around hydrothermal vents, metabolizing sulfur without photosynthesis.',
      'Plastics and human chemical residues have sadly been found even at these deepest abyssal trenches.'
    ],
    metrics: {
      'Maximum Depth': '10,994 meters (36,070 ft)',
      'Water Pressure': '1,086 atmospheres',
      'Water Temperature': '1°C to 4°C',
      'First Descent': 'Trieste bathyscaphe (1960)'
    },
    iconType: 'Waves',
    colorAccent: '#0284c7'
  },
  {
    id: 'mount-everest-himalayas',
    name: 'Mount Everest - Sagarmatha',
    nativeOrAlternateName: 'Chomolungma (Goddess Mother of the World)',
    realm: 'deep_frontiers',
    category: 'Tectonic Roof of the World',
    subLocation: 'Himalayas, Border of Nepal & Tibet (China)',
    coordinates: { lat: 27.9881, lng: 86.9250, distanceOrAltitude: '8,848.86 meters above sea level' },
    eraOrScale: 'Formed ~50 Million Years Ago (Ongoing Collision)',
    tagline: 'The highest mountain on Earth and the crowning apex of the Himalayas',
    fascinatingFact: 'Mount Everest is still actively growing! Because the Indian tectonic plate is continually crashing into the Eurasian plate at a rate of ~5 cm per year, Everest rises by about 4 millimeters every year, pushing marine limestone fossils from an ancient sea bed to the top of the sky.',
    description: 'Standing at 8,848.86 meters, Everest pierces the jet stream winds where temperatures can plummet to -60°C. Above 8,000 meters lies the infamous "Death Zone," where the barometric pressure drops so low that the human body consumes oxygen faster than it can be replenished.',
    keyInsights: [
      'The summit rock is Ordovician limestone formed beneath the ancient Tethys Ocean, containing fossilized sea lilies and trilobites.',
      'First officially summited on May 29, 1953, by Sir Edmund Hillary and Sherpa Tenzing Norgay.',
      'Sherpa mountaineering culture holds Everest sacred as Miyolangsangma, a Buddhist goddess of wealth.'
    ],
    metrics: {
      'Official Height': '8,848.86 meters (29,031.7 ft)',
      'Tectonic Growth': '~4 mm / year',
      'Death Zone': 'Above 8,000m (oxygen 33% of sea level)',
      'First Summit': 'May 29, 1953'
    },
    iconType: 'Mountain',
    colorAccent: '#38bdf8'
  },
  {
    id: 'amazon-rainforest-river',
    name: 'The Amazon Rainforest & River',
    nativeOrAlternateName: 'The Green Ocean / Lung of the Earth',
    realm: 'deep_frontiers',
    category: 'Global Biosphere Sanctuary',
    subLocation: 'South America (Brazil, Peru, Colombia)',
    coordinates: { lat: -3.4653, lng: -62.2159, distanceOrAltitude: '6.7 Million sq km basin' },
    eraOrScale: 'Over 55 Million Years Old',
    tagline: 'The supreme cradle of biodiversity and water cycle on planet Earth',
    fascinatingFact: 'The Amazon River discharges approximately 219,000 cubic meters of freshwater into the Atlantic Ocean every single second—that is roughly 20% of the entire world’s river flow combined! It is so voluminous that it dilutes the salinity of the ocean for over 160 km out to sea.',
    description: 'Covering 40% of South America, the Amazon basin contains over 390 billion individual trees belonging to 16,000 species. Its canopy creates its own weather via "flying rivers"—massive atmospheric rivers of water vapor transpired by the forest that generate rain thousands of miles away.',
    keyInsights: [
      'Home to 1 in 10 known species on Earth, including pink river dolphins, poison dart frogs, and harpy eagles.',
      'Stores an estimated 150 to 200 billion tons of carbon, acting as a crucial planetary climate stabilizer.',
      'Archaeologists have discovered ancient earthwork geoglyphs showing complex pre-Columbian urban civilizations once lived harmoniously in the forest.'
    ],
    metrics: {
      'Basin Area': '6.7 Million sq km',
      'River Discharge': '219,000 m³/s (20% of world total)',
      'Tree Count': '~390 Billion trees',
      'Medicinal Plants': '>25% of modern pharmaceuticals derived'
    },
    iconType: 'Leaf',
    colorAccent: '#22c55e'
  },
  {
    id: 'aurora-borealis-polar',
    name: 'Aurora Borealis & Aurora Australis',
    nativeOrAlternateName: 'The Northern & Southern Lights',
    realm: 'deep_frontiers',
    category: 'Geomagnetic Atmospheric Wonder',
    subLocation: 'Arctic & Antarctic Auroral Ovals',
    coordinates: { lat: 69.6492, lng: 18.9553, distanceOrAltitude: '100 - 400 km altitude in ionosphere' },
    eraOrScale: 'Continuous with Solar Wind Cycles',
    tagline: 'Solar storms dancing across Earth\'s geomagnetic shield',
    fascinatingFact: 'The vibrant dancing colors are caused by different atmospheric gases colliding with solar particles: oxygen atoms at ~100 km glow radiant emerald green, while rare high-altitude oxygen (above 300 km) emits deep ruby red, and nitrogen creates vivid violet and blue ribbons.',
    description: 'When coronal mass ejections and solar winds strike Earth’s magnetosphere, charged protons and electrons are channeled along magnetic field lines into the polar regions. As they slam into gas molecules in the upper thermosphere, excitation discharges into ethereal curtains of light visible across Tromsø, Iceland, Alaska, and Antarctica.',
    keyInsights: [
      'Follows the Sun’s 11-year solar magnetic cycle; Solar Maximum generates spectacular global auroral storms.',
      'Auroras also occur on other planets with magnetic fields, including colossal UV auroras on Jupiter and Saturn.',
      'In Norse folklore, the lights were believed to be reflections from the shields and armor of the Valkyries.'
    ],
    metrics: {
      'Altitude Range': '80 to 600 kilometers',
      'Speed of Solar Wind': '400 - 800 km/second',
      'Primary Color': 'Emerald Green (557.7 nm oxygen emission)',
      'Solar Cycle': '11-year sunspot period'
    },
    iconType: 'Sparkles',
    colorAccent: '#a855f7'
  }
];

export const WORLD_REALM_METADATA = {
  all: {
    id: 'all',
    label: 'All Whole Worlds',
    description: 'Planets, World Wonders, Civilizations & Ocean Frontiers',
    icon: 'Globe',
    count: WORLD_KNOWLEDGE_NODES.length,
  },
  earth_wonders: {
    id: 'earth_wonders',
    label: 'World Wonders & Heritage',
    description: '7 Wonders, Pyramids, Taj Mahal, Machu Picchu & Ancient Engineering',
    icon: 'Landmark',
    count: WORLD_KNOWLEDGE_NODES.filter(n => n.realm === 'earth_wonders').length,
  },
  cosmic_planets: {
    id: 'cosmic_planets',
    label: 'Cosmic & Planetary Worlds',
    description: 'Mars, Europa, Titan, Moon, Jupiter & Solar System Mysteries',
    icon: 'Moon',
    count: WORLD_KNOWLEDGE_NODES.filter(n => n.realm === 'cosmic_planets').length,
  },
  civilizations: {
    id: 'civilizations',
    label: 'Ancient Civilizations',
    description: 'Indus Valley, Mesopotamia, Ancient Egypt, Maya & Global Origins',
    icon: 'History',
    count: WORLD_KNOWLEDGE_NODES.filter(n => n.realm === 'civilizations').length,
  },
  deep_frontiers: {
    id: 'deep_frontiers',
    label: 'Extreme Earth Frontiers',
    description: 'Mariana Trench, Mount Everest, Amazon Basin & Auroras',
    icon: 'Compass',
    count: WORLD_KNOWLEDGE_NODES.filter(n => n.realm === 'deep_frontiers').length,
  },
};

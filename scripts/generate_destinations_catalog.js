import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const statesDir = path.resolve(__dirname, '../src/models/states');
const files = fs.readdirSync(statesDir).filter((f) => f.endsWith('.ts') && f !== 'index.ts');

// Extract destinations from TS models
const inAppDestinations = {};
for (const file of files) {
  const content = fs.readFileSync(path.join(statesDir, file), 'utf8');
  const code = file.replace('.ts', '').toUpperCase();
  const matches = [...content.matchAll(/id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*category:\s*'([^']+)'/g)];
  inAppDestinations[code] = matches.map((m) => ({
    id: m[1],
    name: m[2],
    category: m[3],
  }));
}

// Complete catalog metadata and curated expansion destinations for every federative unit
const statesCatalog = [
  // --- REGIÃO NORTE ---
  {
    code: 'AC',
    name: 'Acre',
    region: 'Norte',
    capital: 'Rio Branco',
    expansions: [
      { name: 'Cachoeira do Formoso', category: 'Waterfall', location: 'Mâncio Lima', highlight: 'Cristal-clear waters within Amazon rainforest setting' },
      { name: 'Parque Nacional da Serra do Moa', category: 'TouristSpot', location: 'Cruzeiro do Sul', highlight: 'Ancient geological formations and Amazonian biodiversity' },
      { name: 'Xapuri (Cidade Histórica & Casa de Chico Mendes)', category: 'FamousCity', location: 'Xapuri', highlight: 'Historic center of Acre rubber boom and environmental history' },
      { name: 'Geoglifos do Acre', category: 'TouristSpot', location: 'Rio Branco / Senador Guiomard', highlight: 'Pre-Columbian monumental earthworks and archaeological heritage' },
    ],
  },
  {
    code: 'AM',
    name: 'Amazonas',
    region: 'Norte',
    capital: 'Manaus',
    expansions: [
      { name: 'Parque Nacional do Jaú', category: 'TouristSpot', location: 'Novo Airão', highlight: 'UNESCO World Heritage site and preserved Amazonian blackwater reserve' },
      { name: 'Praia do Tupé (Reserva do Tupé)', category: 'Beach', location: 'Manaus', highlight: 'River beach with white sand and indigenous community cultural exchange' },
      { name: 'Cachoeira da Onça', category: 'Waterfall', location: 'Presidente Figueiredo', highlight: 'Popular natural pool and ecological trail in the land of waterfalls' },
      { name: 'Cachoeira das Orquídeas', category: 'Waterfall', location: 'Presidente Figueiredo', highlight: 'Surrounded by wild orchids in dense Amazonian forest' },
      { name: 'Parintins (Ilha Tupinambarana)', category: 'FamousCity', location: 'Parintins', highlight: 'World-renowned Festival Folclórico dos Bois Garantido e Caprichoso' },
      { name: 'Mercado Municipal Adolpho Lisboa', category: 'TouristSpot', location: 'Manaus', highlight: 'Historic Art Nouveau iron structure on the banks of Rio Negro' },
    ],
  },
  {
    code: 'AP',
    name: 'Amapá',
    region: 'Norte',
    capital: 'Macapá',
    expansions: [
      { name: 'Cachoeira de Santo Antônio', category: 'Waterfall', location: 'Laranjal do Jari', highlight: 'Impressive waterfall on the Jari River between Amapá and Pará' },
      { name: 'Praia da Fazendinha', category: 'Beach', location: 'Macapá', highlight: 'Famous freshwater beach along the Amazon River with local gastronomy' },
      { name: 'Oiapoque (Extremo Norte do Brasil)', category: 'FamousCity', location: 'Oiapoque', highlight: 'Border city with French Guiana and gateway to Tumucumaque' },
      { name: 'Parque do Forte (Macapá)', category: 'TouristSpot', location: 'Macapá', highlight: 'Urban cultural park surrounding the 18th-century Portuguese fortress' },
    ],
  },
  {
    code: 'PA',
    name: 'Pará',
    region: 'Norte',
    capital: 'Belém',
    expansions: [
      { name: 'Ilha do Marajó (Praia do Pesqueiro & Soure)', category: 'Island', location: 'Soure / Salvaterra', highlight: 'Largest fluvial-maritime island on Earth, water buffalo culture and wild beaches' },
      { name: 'Praia do Atalaia', category: 'Beach', location: 'Salinópolis', highlight: 'Famous ocean beach where vehicles drive onto the hard-packed sand' },
      { name: 'Cachoeira de Santo Antônio do Jari', category: 'Waterfall', location: 'Almeirim', highlight: 'Massive cascade in northern Pará rainforest' },
      { name: 'Forte do Presépio & Complexo Feliz Lusitânia', category: 'TouristSpot', location: 'Belém', highlight: 'Birthplace of Belém (1616), colonial baroque churches and historical museum' },
      { name: 'Teatro da Paz', category: 'TouristSpot', location: 'Belém', highlight: 'Neoclassical opera house from the rubber era facing Praça da República' },
      { name: 'Praia do Amor (Alter do Chão)', category: 'Beach', location: 'Santarém', highlight: 'The iconic sandy peninsula known as the Caribbean of the Amazon' },
    ],
  },
  {
    code: 'RO',
    name: 'Rondônia',
    region: 'Norte',
    capital: 'Porto Velho',
    expansions: [
      { name: 'Forte Príncipe da Beira', category: 'TouristSpot', location: 'Costa Marques', highlight: 'Colonial Portuguese 18th-century fortress deep in the Amazon basin' },
      { name: 'Cachoeira de Teotônio', category: 'Waterfall', location: 'Porto Velho', highlight: 'Historic rapids on the Madeira River, rich fishing traditions' },
      { name: 'Parque Nacional de Pacaás Novos', category: 'TouristSpot', location: 'Campo Novo de Rondônia', highlight: 'Highest point in Rondônia (Pico da Borboleta) and Uru-Eu-Wau-Wau lands' },
      { name: 'Guajará-Mirim', category: 'FamousCity', location: 'Guajará-Mirim', highlight: 'Border city with Bolivia and historic terminus of the Madeira-Mamoré Railway' },
    ],
  },
  {
    code: 'RR',
    name: 'Roraima',
    region: 'Norte',
    capital: 'Boa Vista',
    expansions: [
      { name: 'Praia Grande (Rio Branco)', category: 'Beach', location: 'Boa Vista', highlight: 'Freshwater river beach appearing during dry season along Rio Branco' },
      { name: 'Serra do Tepequém (Cachoeira do Paiva)', category: 'Waterfall', location: 'Amajari', highlight: 'Plateau filled with scenic waterfalls, ancient diamond mining trails and lookouts' },
      { name: 'Pedra Pintada (Sítio Arqueológico)', category: 'TouristSpot', location: 'Pacaraima', highlight: 'Monolithic rock shelter featuring prehistoric rupestrian rock art' },
      { name: 'Uiramutã (Terra Indígena Raposa Serra do Sol)', category: 'FamousCity', location: 'Uiramutã', highlight: 'Northernmost municipality in Brazil, stunning mountainous tepui terrain' },
    ],
  },
  {
    code: 'TO',
    name: 'Tocantins',
    region: 'Norte',
    capital: 'Palmas',
    expansions: [
      { name: 'Praia da Graciosa', category: 'Beach', location: 'Palmas', highlight: 'Urban reservoir beach on the Tocantins River with vibrant sunset boulevard' },
      { name: 'Cachoeira da Fumaça', category: 'Waterfall', location: 'Jalapão / Ponte Alta', highlight: 'Powerful waterfall surrounded by red canyon sands' },
      { name: 'Canyon Sussuapara', category: 'TouristSpot', location: 'Ponte Alta do Tocantins', highlight: 'Lush narrow canyon with dripping moss, fern curtains and spring waters' },
      { name: 'Natividade (Centro Histórico)', category: 'FamousCity', location: 'Natividade', highlight: 'Historic 18th-century gold rush town and traditional filigrana jewelry' },
      { name: 'Ilha do Bananal', category: 'Island', location: 'Lagoa da Confusão', highlight: 'World’s largest fluvial island, between Araguaia and Javaés rivers' },
    ],
  },

  // --- REGIÃO NORDESTE ---
  {
    code: 'AL',
    name: 'Alagoas',
    region: 'Nordeste',
    capital: 'Maceió',
    expansions: [
      { name: 'Praia de Antunes', category: 'Beach', location: 'Maragogi', highlight: 'Famous warm turquoise water sandbanks and coconut palm trees' },
      { name: 'Praia do Patacho', category: 'Beach', location: 'Porto de Pedras', highlight: 'Award-winning preserved beach with tranquil low-tide coral reef pools' },
      { name: 'Piranhas (Centro Histórico & Cânion do Xingó)', category: 'FamousCity', location: 'Piranhas', highlight: 'Colonial town on the São Francisco River, historic cangaço route' },
      { name: 'Cachoeira do Tombador', category: 'Waterfall', location: 'Ibateguara', highlight: 'Scenic waterfall nestled in the Atlantic Forest of northern Alagoas' },
      { name: 'Marechal Deodoro (Centro Histórico & Praia do Francês)', category: 'FamousCity', location: 'Marechal Deodoro', highlight: 'First capital of Alagoas, colonial architecture, and lacemaking' },
    ],
  },
  {
    code: 'BA',
    name: 'Bahia',
    region: 'Nordeste',
    capital: 'Salvador',
    expansions: [
      { name: 'Porto Seguro (Passarela do Descobrimento & Arraial d’Ajuda)', category: 'FamousCity', location: 'Porto Seguro', highlight: 'Historic landing site of Cabral (1500), lively beaches and clifftop villages' },
      { name: 'Praia do Forte (Reserva Sapiranga & Projeto Tamar)', category: 'Beach', location: 'Mata de São João', highlight: 'Sea turtle sanctuary, ruins of Garcia d’Ávila castle and natural tide pools' },
      { name: 'Cachoeira (Recôncavo Baiano)', category: 'FamousCity', location: 'Cachoeira', highlight: 'Monumental colonial heritage town on the Paraguaçu River, Afro-Brazilian culture' },
      { name: 'Lençóis (Portal da Chapada Diamantina)', category: 'FamousCity', location: 'Lençóis', highlight: 'Charming 19th-century diamond-era town and base for hiking' },
      { name: 'Praia do Prado & Corumbau', category: 'Beach', location: 'Prado', highlight: 'Endless red cliffs, tranquil sandspits and gateway to Abrolhos marine park' },
      { name: 'Parque Nacional Marinho dos Abrolhos', category: 'Island', location: 'Caravelas', highlight: 'Archipelago renowned for humpback whale nursery and scuba diving' },
    ],
  },
  {
    code: 'CE',
    name: 'Ceará',
    region: 'Nordeste',
    capital: 'Fortaleza',
    expansions: [
      { name: 'Praia da Lagoinha', category: 'Beach', location: 'Paraipaba', highlight: 'Crescent-shaped cove with freshwater lagoons, coconut groves, and dunes' },
      { name: 'Praia de Morro Branco (Labirinto das Falésias)', category: 'Beach', location: 'Beberibe', highlight: 'Multi-colored sandstone labyrinth used for bottle sand art' },
      { name: 'Cachoeira da Bica do Ipu', category: 'Waterfall', location: 'Ipu', highlight: '130m drop down the Ibiapaba mountain range, immortalized by José de Alencar' },
      { name: 'Guaramiranga (Suiça Cearense)', category: 'FamousCity', location: 'Guaramiranga', highlight: 'Highland mountain refuge, jazz and blues festivals and cool climate' },
      { name: 'Juazeiro do Norte (Colina do Horto & Padre Cícero)', category: 'FamousCity', location: 'Juazeiro do Norte', highlight: 'Major religious pilgrimage capital in the Cariri region' },
      { name: 'Praia do Futuro', category: 'Beach', location: 'Fortaleza', highlight: 'Iconic urban beach famed for mega beach clubs (barracas) and fresh crab' },
    ],
  },
  {
    code: 'MA',
    name: 'Maranhão',
    region: 'Nordeste',
    capital: 'São Luís',
    expansions: [
      { name: 'Alcântara (Ruínas Coloniais)', category: 'FamousCity', location: 'Alcântara', highlight: 'Colonial ghost town of grand sugar barons, ruins of São Matias and pelourinho' },
      { name: 'Cachoeira do Prata (Chapada das Mesas)', category: 'Waterfall', location: 'Carolina', highlight: 'Wide, roaring waterfall on the Farinha river' },
      { name: 'Poço Azul (Riachão)', category: 'Waterfall', location: 'Riachão', highlight: 'Crystalline blue natural pool surrounded by limestone canyon walls' },
      { name: 'Praia de Caburé', category: 'Beach', location: 'Barreirinhas / Paulino Neves', highlight: 'Narrow strip of golden sand separating Preguiças River from the Atlantic Ocean' },
      { name: 'Palácio dos Leões', category: 'TouristSpot', location: 'São Luís', highlight: 'Seat of government built on the original French fort (Saint-Louis, 1612)' },
    ],
  },
  {
    code: 'PB',
    name: 'Paraíba',
    region: 'Nordeste',
    capital: 'João Pessoa',
    expansions: [
      { name: 'Praia Bela', category: 'Beach', location: 'Pitimbu', highlight: 'Confluence of Mucatu River and ocean, creating a scenic relaxing natural pool' },
      { name: 'Praia de Coqueirinho', category: 'Beach', location: 'Conde', highlight: 'Coastline flanked by coconut groves, vivid red cliffs and natural viewpoints' },
      { name: 'Lajedo de Pai Mateus', category: 'TouristSpot', location: 'Cabaceiras', highlight: 'Giant granite spheroidal boulders in the Cariri semi-arid landscape' },
      { name: 'Campina Grande (Maior São João do Mundo)', category: 'FamousCity', location: 'Campina Grande', highlight: 'Renowned interior cultural and technological hub, epic month-long June festivity' },
      { name: 'Cachoeira do Roncador', category: 'Waterfall', location: 'Bananeiras / Borborema', highlight: 'Pleasant cascade in the Brejo Paraibano highland microclimate' },
    ],
  },
  {
    code: 'PE',
    name: 'Pernambuco',
    region: 'Nordeste',
    capital: 'Recife',
    expansions: [
      { name: 'Praia da Baía do Sancho (Fernando de Noronha)', category: 'Beach', location: 'Fernando de Noronha', highlight: 'Repeatedly voted best beach in the world, crystal emerald waters and marine life' },
      { name: 'Praia dos Carneiros', category: 'Beach', location: 'Tamandaré', highlight: 'Iconic 18th-century São Benedito chapel directly on coconut-lined turquoise sand' },
      { name: 'Praia da Baía dos Porcos', category: 'Beach', location: 'Fernando de Noronha', highlight: 'Natural rock pools framed by the iconic Morro Dois Irmãos volcanic peak' },
      { name: 'Oficina Cerâmica Francisco Brennand', category: 'TouristSpot', location: 'Recife', highlight: 'Surreal sculpture park and monumental ceramic museum inside an old tile factory' },
      { name: 'Instituto Ricardo Brennand (Castelo São João)', category: 'TouristSpot', location: 'Recife', highlight: 'World-class medieval castle museum with vast arms collection and Frans Post art' },
      { name: 'Cachoeira Véu da Noiva (Bonito)', category: 'Waterfall', location: 'Bonito', highlight: 'Popular 32m waterfall with ecological rappelling in agreste highlands' },
      { name: 'Gravatá (Serra das Russas)', category: 'FamousCity', location: 'Gravatá', highlight: 'Mountain resort famous for fondues, cool breezes, and craft furniture' },
    ],
  },
  {
    code: 'PI',
    name: 'Piauí',
    region: 'Nordeste',
    capital: 'Teresina',
    expansions: [
      { name: 'Praia de Macapá', category: 'Beach', location: 'Luís Correia', highlight: 'Kitesurfing haven with shallow tide lagoons and fine white dunes' },
      { name: 'Praia da Barra Grande', category: 'Beach', location: 'Cajueiro da Praia', highlight: 'Boho-chic seaside village, seahorse sanctuary and steady trade winds' },
      { name: 'Cachoeira do Urubu', category: 'Waterfall', location: 'Esperantina / Batalha', highlight: 'Spectacular cascades formed during the rainy season on Longá River' },
      { name: 'Cânion do Rio Poty', category: 'TouristSpot', location: 'Castelo do Piauí', highlight: 'Dramatically sculpted canyon walls and ancient petroglyphs' },
      { name: 'Oeiras (Primeira Capital do Piauí)', category: 'FamousCity', location: 'Oeiras', highlight: 'Historic religious hub, colonial churches and traditional Holy Week processions' },
    ],
  },
  {
    code: 'RN',
    name: 'Rio Grande do Norte',
    region: 'Nordeste',
    capital: 'Natal',
    expansions: [
      { name: 'Praia do Amor & Chapadão', category: 'Beach', location: 'Tibau do Sul / Pipa', highlight: 'Heart-shaped bay bordered by towering rust-red sandstone cliffs' },
      { name: 'Baía dos Golfinhos', category: 'Beach', location: 'Pipa', highlight: 'Calm cove where wild dolphins regularly swim close to bathers' },
      { name: 'Parrachos de Maracajaú', category: 'Beach', location: 'Maxaranguape', highlight: 'Submerged coral barrier 7km offshore, known as the Caribbean of Rio Grande do Norte' },
      { name: 'São Miguel do Gostoso', category: 'FamousCity', location: 'São Miguel do Gostoso', highlight: 'Laid-back coastal village where the wind makes a curve, top windsports hub' },
      { name: 'Maior Cajueiro do Mundo', category: 'TouristSpot', location: 'Parnamirim', highlight: 'Single cashew tree covering over 8,500 square meters due to genetic mutation' },
      { name: 'Cachoeira de Pinga', category: 'Waterfall', location: 'Portalegre', highlight: 'Picturesque waterfall in the mountain range of western Rio Grande do Norte' },
    ],
  },
  {
    code: 'SE',
    name: 'Sergipe',
    region: 'Nordeste',
    capital: 'Aracaju',
    expansions: [
      { name: 'Cânion do Xingó (Rio São Francisco)', category: 'TouristSpot', location: 'Canindé de São Francisco', highlight: 'Majestic emerald-green waters navigations through granite orange canyons' },
      { name: 'Praia do Saco', category: 'Beach', location: 'Estância', highlight: 'Dune-fringed cove at the mouth of Rio Real, calm clear waters and boat tours' },
      { name: 'Praia de Atalaia & Passarela do Caranguejo', category: 'Beach', location: 'Aracaju', highlight: 'Main vibrant coastline of Aracaju, giant crab monument and oceanarium' },
      { name: 'Cachoeira de Macambira', category: 'Waterfall', location: 'Macambira', highlight: 'Also known as Cachoeira de São José, scenic natural bath in Sergipe agreste' },
      { name: 'Laranjeiras (Centro Histórico)', category: 'FamousCity', location: 'Laranjeiras', highlight: 'Cradle of folklore, colonial churches and Afro-Brazilian cultural heritage' },
    ],
  },

  // --- REGIÃO CENTRO-OESTE ---
  {
    code: 'DF',
    name: 'Distrito Federal',
    region: 'Centro-Oeste',
    capital: 'Brasília',
    expansions: [
      { name: 'Santuário Dom Bosco', category: 'TouristSpot', location: 'Brasília', highlight: '80 gothic columns with 12 shades of glowing blue stained glass and Murano chandelier' },
      { name: 'Pontão do Lago Sul', category: 'TouristSpot', location: 'Brasília', highlight: 'Scenic waterfront leisure hub on Lake Paranoá with sunset dining' },
      { name: 'Cachoeira do Tororó', category: 'Waterfall', location: 'Santa Maria', highlight: 'Popular 18m waterfall and rappelling spot inside Cerrado vegetation' },
      { name: 'Cachoeira do Poço Azul', category: 'Waterfall', location: 'Brazlândia', highlight: 'Tiered cascades carving through quartz stone with clear natural pools' },
      { name: 'Torre de TV de Brasília & Mirante', category: 'TouristSpot', location: 'Brasília', highlight: 'Lucio Costa designed tower with panoramic views over the Pilot Plan axis' },
    ],
  },
  {
    code: 'GO',
    name: 'Goiás',
    region: 'Centro-Oeste',
    capital: 'Goiânia',
    expansions: [
      { name: 'Cachoeira Santa Bárbara (Cavalcante)', category: 'Waterfall', location: 'Cavalcante', highlight: 'World-famous turquoise basin hidden inside the Kalunga Quilombo community' },
      { name: 'Cataratas dos Couros', category: 'Waterfall', location: 'Alto Paraíso de Goiás', highlight: 'Monumental series of cascading drops and pools along the Couros River' },
      { name: 'Parque Nacional das Emas', category: 'TouristSpot', location: 'Chapada do Céu / Mineiros', highlight: 'UNESCO Cerrado sanctuary famous for bioluminescent termite mounds in spring' },
      { name: 'Praia do Cerrado (Hot Park)', category: 'Beach', location: 'Rio Quente', highlight: 'Largest artificial warm-water beach in the world with natural thermal waves' },
      { name: 'Salto do Itiquira', category: 'Waterfall', location: 'Formosa', highlight: 'One of Brazil’s tallest accessible falls at 168 meters of free-fall drop' },
      { name: 'Cidade de Goiás (Centro Histórico & Casa de Cora Coralina)', category: 'FamousCity', location: 'Goiás Velho', highlight: 'UNESCO World Heritage former state capital with cobblestone streets and poetry heritage' },
    ],
  },
  {
    code: 'MS',
    name: 'Mato Grosso do Sul',
    region: 'Centro-Oeste',
    capital: 'Campo Grande',
    expansions: [
      { name: 'Abismo Anhumas', category: 'TouristSpot', location: 'Bonito', highlight: 'Subterranean cavern entered via 72m vertical rappel into an underground crystal lake' },
      { name: 'Rio Sucuri (Flutuação)', category: 'TouristSpot', location: 'Bonito', highlight: 'Considered one of the clearest rivers on planet Earth for snorkeling with fish' },
      { name: 'Boca da Onça (Maior Cachoeira do MS - 156m)', category: 'Waterfall', location: 'Bodoquena', highlight: 'Highest waterfall in the state with panoramic canyon views' },
      { name: 'Cachoeiras da Serra da Bodoquena', category: 'Waterfall', location: 'Bodoquena', highlight: 'Lush calc-tufa waterfalls, natural zip-lines and kayak trails' },
      { name: 'Corumbá & Estrada Parque Pantanal', category: 'FamousCity', location: 'Corumbá', highlight: 'Capital of the Pantanal on the Paraguay River, colonial port and wildlife safari' },
    ],
  },
  {
    code: 'MT',
    name: 'Mato Grosso',
    region: 'Centro-Oeste',
    capital: 'Cuiabá',
    expansions: [
      { name: 'Cachoeira Véu de Noiva (Chapada dos Guimarães)', category: 'Waterfall', location: 'Chapada dos Guimarães', highlight: '86m waterfall plummeting down a red sandstone canyon, park postcard' },
      { name: 'Cidade de Pedra & Mirante do Centro Geodésico', category: 'TouristSpot', location: 'Chapada dos Guimarães', highlight: 'Sculpted sandstone towers and geographical center of South America view' },
      { name: 'Nobres (Aquário Encantado & Reino Encantado)', category: 'TouristSpot', location: 'Nobres', highlight: 'Crystal clear springs and rivers teeming with fish, limestone karst scenery' },
      { name: 'Cachoeira dos Namorados & Cachoeirinha', category: 'Waterfall', location: 'Chapada dos Guimarães', highlight: 'Gentle cascades with sandy bathing pools along the national park trails' },
      { name: 'Barão de Melgaço (Pantanal Norte)', category: 'FamousCity', location: 'Barão de Melgaço', highlight: 'Prime gateway for jaguar spotting expeditions along Pantanal waterways' },
    ],
  },

  // --- REGIÃO SUDESTE ---
  {
    code: 'ES',
    name: 'Espírito Santo',
    region: 'Sudeste',
    capital: 'Vitória',
    expansions: [
      { name: 'Praias de Guarapari (Praia das Castanheiras & Areia Preta)', category: 'Beach', location: 'Guarapari', highlight: 'Famous coastal resort renowned for therapeutic monazitic sands and clear coves' },
      { name: 'Praia da Costa', category: 'Beach', location: 'Vila Velha', highlight: 'Golden urban beach nestled right below Morro do Moreno and Convento da Penha' },
      { name: 'Cachoeira da Fumaça (Alegre)', category: 'Waterfall', location: 'Alegre', highlight: 'Dramatic 144m waterfall on the Braço Norte Esquerdo river park' },
      { name: 'Cachoeira de Matilde', category: 'Waterfall', location: 'Alfredo Chaves', highlight: 'Spectacular tiered waterfall and natural valley framed by railway viaduct' },
      { name: 'Santa Teresa (Cidades das Colibris)', category: 'FamousCity', location: 'Santa Teresa', highlight: 'First Italian settlement in Brazil, home of naturalist Augusto Ruschi and wines' },
      { name: 'Itaúnas (Dunas & Vila do Forró)', category: 'Beach', location: 'Conceição da Barra', highlight: 'Giant sand dunes burying the old village, legendary birthplace of national Forró' },
    ],
  },
  {
    code: 'MG',
    name: 'Minas Gerais',
    region: 'Sudeste',
    capital: 'Belo Horizonte',
    expansions: [
      { name: 'Inhotim (Maior Museu de Arte Contemporânea a Céu Aberto)', category: 'TouristSpot', location: 'Brumadinho', highlight: 'World-renowned open-air contemporary art pavilions and botanical gardens' },
      { name: 'Centro Histórico de São João del-Rei', category: 'FamousCity', location: 'São João del-Rei', highlight: 'Colonial town famous for baroque churches, bell ringers and Maria Fumaça train' },
      { name: 'Santuário do Bom Jesus de Matosinhos (Profetas de Aleijadinho)', category: 'TouristSpot', location: 'Congonhas', highlight: 'UNESCO World Heritage masterpiece featuring 12 soapstone statues by Aleijadinho' },
      { name: 'Cachoeira do Casca d’Anta (Serra da Canastra)', category: 'Waterfall', location: 'São Roque de Minas', highlight: '186m cascade, first major drop of the nascent São Francisco River' },
      { name: 'Cachoeira da Fumaça (Carrancas)', category: 'Waterfall', location: 'Carrancas', highlight: 'Famous waterfall land, popular film location for historical telenovelas' },
      { name: 'Cachoeira Grande & Véu da Noiva (Serra do Cipó)', category: 'Waterfall', location: 'Santana do Riacho', highlight: 'Iconic wide falls and crystal pools in the biodiversity capital of Minas' },
      { name: 'Monte Verde (Serra da Mantiqueira)', category: 'FamousCity', location: 'Camanducaia', highlight: 'Alpine-style village with mountain trails (Pedra Redonda), fondues and chill climate' },
      { name: 'São Thomé das Letras (Pirâmide & Vale das Borboletas)', category: 'FamousCity', location: 'São Thomé das Letras', highlight: 'Mystical stone city perched on a quartzite mountain with magical sunsets' },
      { name: 'Mercado Central de Belo Horizonte', category: 'TouristSpot', location: 'Belo Horizonte', highlight: 'Cultural and culinary epicenter of Minas Gerais (cheeses, cachaças, and petiscos)' },
    ],
  },
  {
    code: 'RJ',
    name: 'Rio de Janeiro',
    region: 'Sudeste',
    capital: 'Rio de Janeiro',
    expansions: [
      { name: 'Praia de Copacabana & Forte de Copacabana', category: 'Beach', location: 'Rio de Janeiro', highlight: 'World-famous princess of the sea, iconic Burle Marx wave boardwalk' },
      { name: 'Praia de Grumari & Prainha', category: 'Beach', location: 'Rio de Janeiro', highlight: 'Protected ecological sanctuaries with wild Atlantic Forest waves and surfs' },
      { name: 'Parque Nacional da Tijuca & Vista Chinesa', category: 'TouristSpot', location: 'Rio de Janeiro', highlight: 'One of the world’s largest urban forests, Chinese pagoda lookout over Corcovado' },
      { name: 'Real Gabinete Português de Leitura', category: 'TouristSpot', location: 'Rio de Janeiro', highlight: 'Neo-Manueline library repeatedly ranked among the most beautiful libraries in the world' },
      { name: 'Cachoeira do Tobogã & Poço do Tarzan', category: 'Waterfall', location: 'Paraty', highlight: 'Natural rock slide where locals surf down into freshwater pools' },
      { name: 'Cachoeira da Fumaça (Resende)', category: 'Waterfall', location: 'Resende', highlight: '2km of rushing cascades located in the Agulhas Negras region' },
      { name: 'Cabo Frio (Praia do Forte & Bairro da Passagem)', category: 'FamousCity', location: 'Cabo Frio', highlight: 'Fine white silica sand, historical Portuguese fort São Mateus and colonial lanes' },
      { name: 'Visconde de Mauá & Maringá', category: 'FamousCity', location: 'Resende / Itatiaia', highlight: 'High Mantiqueira mountain valley with trout gastronomy and hidden waterfalls' },
      { name: 'Teresópolis (Parque Nacional da Serra dos Órgãos / Dedo de Deus)', category: 'FamousCity', location: 'Teresópolis', highlight: 'Iconic mountain silhouette of Brazil, alpine climbing and cool weather' },
    ],
  },
  {
    code: 'SP',
    name: 'São Paulo',
    region: 'Sudeste',
    capital: 'São Paulo',
    expansions: [
      { name: 'Parque Estadual da Serra do Mar (Núcleo Picinguaba)', category: 'TouristSpot', location: 'Ubatuba', highlight: 'Where the Atlantic rainforest touches the sea directly with preserved quilombos' },
      { name: 'Praia de Maresias', category: 'Beach', location: 'São Sebastião', highlight: 'World-class surf break, international surfing competitions and vibrant nightlife' },
      { name: 'Ilha de Santo Amaro & Praias Selvagens', category: 'Island', location: 'Guarujá', highlight: 'Trek-accessible beaches like Praia Branca, Preta and Camburizinho' },
      { name: 'Cachoeira da Veada (Serra da Bocaina)', category: 'Waterfall', location: 'São José do Barreiro', highlight: 'Dramatic 200m drop in two falls along the historic Gold Trail (Trilha do Ouro)' },
      { name: 'Cachoeira do Poço das Moças', category: 'Waterfall', location: 'Ilhabela', highlight: 'Freshwater natural pool surrounded by dense forest along the Castilhanos trail' },
      { name: 'Cananéia (Cidade Mais Antiga do Brasil)', category: 'FamousCity', location: 'Cananéia', highlight: 'Colonial town founded in 1531, gateway to dolphin watching in Lagamar' },
      { name: 'Cunha (Ateliês de Cerâmica & Lavandário)', category: 'FamousCity', location: 'Cunha', highlight: 'Capital of Noborigama pottery, lavender fields and Serra da Bocaina views' },
      { name: 'Museu do Ipiranga & Parque da Independência', category: 'TouristSpot', location: 'São Paulo', highlight: 'Historic monument palace where Brazil proclaimed independence in 1822' },
      { name: 'Pinacoteca do Estado & Parque da Luz', category: 'TouristSpot', location: 'São Paulo', highlight: 'Prestigious visual arts museum housed in Ramos de Azevedo’s 1900 brick building' },
      { name: 'Bairro da Liberdade', category: 'TouristSpot', location: 'São Paulo', highlight: 'Largest Japanese and Asian cultural community outside of Japan with lantern streets' },
      { name: 'Águas de Lindóia', category: 'FamousCity', location: 'Águas de Lindóia', highlight: 'Renowned hydro-mineral spa resort on the Paulista mountain circuit' },
    ],
  },

  // --- REGIÃO SUL ---
  {
    code: 'PR',
    name: 'Paraná',
    region: 'Sul',
    capital: 'Curitiba',
    expansions: [
      { name: 'Península e Praia de Pontal do Sul', category: 'Beach', location: 'Pontal do Paraná', highlight: 'Gateway port for Ilha do Mel, dolphins and wide open beaches' },
      { name: 'Praia Brava & Praia Mansa (Caiobá)', category: 'Beach', location: 'Matinhos', highlight: 'Top coastal beach resort of Paraná with surfing and family recreation' },
      { name: 'Cachoeira do Buraco do Padre', category: 'Waterfall', location: 'Ponta Grossa', highlight: 'Subterranean 30m waterfall dropping into a 50m diameter collapsed sinkhole (furnas)' },
      { name: 'Cachoeira Salto São Francisco (Prudentópolis)', category: 'Waterfall', location: 'Prudentópolis / Guarapuava', highlight: 'Highest waterfall in Southern Brazil (196m free drop) in Ukrainian heritage region' },
      { name: 'Salto São João', category: 'Waterfall', location: 'Prudentópolis', highlight: '84m waterfall with canyon views in the land of giant waterfalls' },
      { name: 'Parque Estadual de Vila Velha', category: 'TouristSpot', location: 'Ponta Grossa', highlight: 'Iconic sandstone formations (Taça, Camelo), furnas and golden lagoon' },
      { name: 'Lapa (Centro Histórico & Cerco da Lapa)', category: 'FamousCity', location: 'Lapa', highlight: 'Preserved 18th-century tropeiro town with cobblestones and dramatic civil war history' },
      { name: 'Museu Oscar Niemeyer (MON / Olho)', category: 'TouristSpot', location: 'Curitiba', highlight: 'Iconic eye-shaped modern art museum designed by Oscar Niemeyer' },
    ],
  },
  {
    code: 'RS',
    name: 'Rio Grande do Sul',
    region: 'Sul',
    capital: 'Porto Alegre',
    expansions: [
      { name: 'Praia da Guarita (Torres)', category: 'Beach', location: 'Torres', highlight: 'Only beach in southern Brazil with basaltic ocean sea towers (Torres)' },
      { name: 'Cânion Fortaleza (Parque Nacional da Serra Geral)', category: 'TouristSpot', location: 'Cambará do Sul', highlight: 'Monumental 7.5km long canyon with vertical 900m cliffs and Mirante do Tigre Preto' },
      { name: 'Cachoeira Salto do Yucumã', category: 'Waterfall', location: 'Derrubadas', highlight: 'Longest longitudinal waterfall in the world (1,800m wide) along the Uruguay River' },
      { name: 'Cachoeira Cascata dos Venâncios', category: 'Waterfall', location: 'Cambará do Sul / Jaquirana', highlight: 'Four series of wide natural cascades along the Camisas river' },
      { name: 'Vale dos Vinhedos & Bento Gonçalves', category: 'FamousCity', location: 'Bento Gonçalves', highlight: 'Heart of Brazilian fine wine country, Italian immigrant heritage and Maria Fumaça' },
      { name: 'Canela (Catedral de Pedra & Parque do Caracol)', category: 'FamousCity', location: 'Canela', highlight: 'Sister city of Gramado, gothic stone cathedral and pine-wooded mountains' },
      { name: 'Centro Histórico de Pelotas', category: 'FamousCity', location: 'Pelotas', highlight: 'Aristocratic charqueada mansions, grand theaters and traditional Portuguese sweets' },
      { name: 'Monumento ao Laçador & Orla do Guaíba', category: 'TouristSpot', location: 'Porto Alegre', highlight: 'Symbol of Gaúcho heritage and revitalized lakefront sunset park' },
    ],
  },
  {
    code: 'SC',
    name: 'Santa Catarina',
    region: 'Sul',
    capital: 'Florianópolis',
    expansions: [
      { name: 'Praia do Rosa', category: 'Beach', location: 'Imbituba', highlight: 'World-class bay for right whale watching (Jul-Nov) and bohemian beach vibe' },
      { name: 'Praia da Guarda do Embaú', category: 'Beach', location: 'Palhoça', highlight: 'World Surfing Reserve crossed by the Madre river onto pristine dunes' },
      { name: 'Praia do Campeche & Ilha do Campeche', category: 'Beach', location: 'Florianópolis', highlight: 'Caribbean-like transparent water and prehistoric rupestrian inscription trails' },
      { name: 'Praia de Bombinhas & Quatro Ilhas', category: 'Beach', location: 'Bombinhas', highlight: 'Diving capital of Santa Catarina with crystal coves and emerald nature' },
      { name: 'Praia Central & Roda Gigante (Balneário Camboriú)', category: 'Beach', location: 'Balneário Camboriú', highlight: 'Brazil’s high-rise coast with modernized widened beach and Barra Sul cable car' },
      { name: 'Cachoeira Salto do Zinco', category: 'Waterfall', location: 'Benedito Novo', highlight: 'Breathtaking 76m fall dropping down a vertical volcanic basalt rock wall' },
      { name: 'Cachoeira Véu de Noiva (Urubici)', category: 'Waterfall', location: 'Urubici', highlight: 'Scenic 62m sliding cascade inside a lush pine forest in the cold highlands' },
      { name: 'Pomerode (Nossa Pequena Alemanha)', category: 'FamousCity', location: 'Pomerode', highlight: 'Most German town in Brazil, enxaimel (half-timbered) houses and Osterfest' },
      { name: 'São Joaquim (Neve e Vinhedos de Altitude)', category: 'FamousCity', location: 'São Joaquim', highlight: 'Coldest city in Brazil with winter snowfalls and altitude apple/wine production' },
      { name: 'Ponte Hercílio Luz', category: 'TouristSpot', location: 'Florianópolis', highlight: 'Iconic heritage suspension bridge connecting Santa Catarina island to mainland' },
    ],
  },
];

// Generate Markdown
let md = `# Catalog of Brazilian Tourist Destinations by State (Catálogo de Destinos Turísticos)

This document provides a comprehensive, structured catalogue of Brazilian tourist destinations grouped across all **27 Federative Units** (26 States + Federal District), covering:
- **Praias (Beaches)**
- **Cachoeiras (Waterfalls)**
- **Cidades Famosas (Famous & Historic Cities)**
- **Pontos Turísticos & Centros Históricos (Landmarks, National Parks & Historical Sites)**

---

## 🧭 Legend & Status in Application

| Status Icon | Status Meaning | Description |
| :---: | :--- | :--- |
| **✅ In App** | **Na Aplicação** | Destination is registered, interactive on the interactive map/sidebar, and can be scratched off / unlocked. |
| **💡 Suggested / Expansion** | **Sugestão para Expansão** | Renowned Brazilian destination curated for future app expansions, roadmap releases, or custom travel plans. |

---

## 📊 Summary by Region & State

`;

// Calculate summary numbers
let grandTotalInApp = 0;
let grandTotalSuggested = 0;

const summaryRows = [];
for (const state of statesCatalog) {
  const inAppList = inAppDestinations[state.code] || [];
  // Exclude the state polygon item itself from tourist spots count if present
  const inAppPoints = inAppList.filter((d) => d.category !== 'State');
  const expCount = state.expansions.length;
  grandTotalInApp += inAppPoints.length;
  grandTotalSuggested += expCount;

  summaryRows.push({
    code: state.code,
    name: state.name,
    region: state.region,
    inAppCount: inAppPoints.length,
    suggestedCount: expCount,
    total: inAppPoints.length + expCount,
  });
}

md += `| Region | State Code | State Name | ✅ In App Points | 💡 Suggested Points | Total Cataloged |
| :--- | :---: | :--- | :---: | :---: | :---: |
`;

for (const row of summaryRows) {
  md += `| ${row.region} | **${row.code}** | ${row.name} | ${row.inAppCount} | ${row.suggestedCount} | **${row.total}** |\n`;
}

md += `| **TOTAL** | **27 UFs** | **Brasil** | **${grandTotalInApp}** | **${grandTotalSuggested}** | **${grandTotalInApp + grandTotalSuggested}** |\n\n---\n\n`;

// Generate detailed tables per state
const regions = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'];

for (const reg of regions) {
  md += `## 🌴 Região ${reg}\n\n`;
  const statesInRegion = statesCatalog.filter((s) => s.region === reg);

  for (const state of statesInRegion) {
    const inAppList = (inAppDestinations[state.code] || []).filter((d) => d.category !== 'State');
    md += `### ${state.name} (${state.code}) - Capital: ${state.capital}\n\n`;

    md += `| Destination Name (Nome do Destino) | Category (Categoria) | Location (Localização) | Status in App | Highlights & Tourist Relevance |\n`;
    md += `| :--- | :--- | :--- | :---: | :--- |\n`;

    // 1. In App destinations
    for (const d of inAppList) {
      const catMap = {
        Beach: '🏖️ Praia / Litoral',
        Waterfall: '🌊 Cachoeira',
        FamousCity: '🏙️ Cidade Famosa',
        TouristSpot: '🏛️ Ponto Turístico',
        Island: '🏝️ Ilha',
      };
      const catLabel = catMap[d.category] || d.category;
      md += `| **${d.name}** | ${catLabel} | ${state.name} (${state.code}) | ✅ **In App** | Registered in the interactive map and points system. |\n`;
    }

    // 2. Expansion destinations
    for (const exp of state.expansions) {
      const catMap = {
        Beach: '🏖️ Praia / Litoral',
        Waterfall: '🌊 Cachoeira',
        FamousCity: '🏙️ Cidade Famosa / Histórica',
        TouristSpot: '🏛️ Ponto Turístico / Histórico',
        Island: '🏝️ Ilha',
      };
      const catLabel = catMap[exp.category] || exp.category;
      md += `| **${exp.name}** | ${catLabel} | ${exp.location} | 💡 *Suggested* | ${exp.highlight} |\n`;
    }

    md += `\n`;
  }
}

const outputPath = path.resolve(__dirname, '../Docs/BRAZIL_TOURIST_DESTINATIONS_CATALOG.md');
fs.writeFileSync(outputPath, md, 'utf8');
console.log('Catalogue generated successfully at:', outputPath);

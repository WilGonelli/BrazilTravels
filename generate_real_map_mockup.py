"""
Script to generate ultra-realistic Brazil Map UI mockup using true IBGE geographic coordinates.
"""
import json, math, os
from PIL import Image, ImageDraw, ImageFont

with open('brazil_states.json', 'r', encoding='utf-8') as f:
    geo_data = json.load(f)

# Geographic Projection setup
min_lon, max_lon = -74.0, -34.7
min_lat, max_lat = -33.8, 5.3

min_lon_rad = math.radians(min_lon)
max_lon_rad = math.radians(max_lon)

def merc_y(lat_deg):
    r = math.radians(lat_deg)
    return math.log(math.tan(math.pi / 4 + r / 2))

min_y_rad = merc_y(min_lat)
max_y_rad = merc_y(max_lat)

span_x_rad = max_lon_rad - min_lon_rad
span_y_rad = max_y_rad - min_y_rad

# Map canvas placement
width = 530.0
scale = width / span_x_rad
height = span_y_rad * scale

ox = 275.0
oy = 860.0

def proj(lon_deg, lat_deg):
    clamped_lon = max(min_lon, min(max_lon + 1.2, lon_deg))
    x_rad = math.radians(clamped_lon)
    y_rad = merc_y(lat_deg)
    x = ox + (x_rad - min_lon_rad) * scale
    y = oy + (max_y_rad - y_rad) * scale
    return round(x, 1), round(y, 1)

# Color palettes by region (matching reference poster)
# North (Verde), Northeast (Vermelho/Coral), Center-West (Roxo), Southeast (Laranja), South (Azul)
REGION_COLORS = {
    'Norte': '#10b981',       # Emerald
    'Nordeste': '#ef4444',    # Coral Red
    'Centro-Oeste': '#8b5cf6',# Purple
    'Sudeste': '#f97316',     # Orange
    'Sul': '#06b6d4',         # Cyan/Ocean Blue
}

# Specific state color shades for unlocked states (to match poster rich gradients)
STATE_COLORS = {
    # Unlocked states in this demo: AM, PA, MA, BA, RJ, PR
    'AM': '#059669', # Vivid Amazon green
    'PA': '#10b981', # Green
    'MA': '#dc2626', # Deep red
    'BA': '#ef4444', # Coral red
    'PE': '#f87171', # Light coral
    'RJ': '#ea580c', # Vivid Rio Orange
    'PR': '#0284c7', # Vivid South Blue
}

UNLOCKED_STATES = {'AM', 'MA', 'BA', 'PE', 'RJ', 'PR'}

# Pre-extract all state polygons and centers
states_geometry = {}
for feat in geo_data['features']:
    uf = feat['properties']['UF_05']
    name = feat['properties']['NOME_UF']
    region = feat['properties']['REGIAO']
    
    geom = feat['geometry']
    coords = geom['coordinates']
    t = geom['type']
    polys = [coords] if t == 'Polygon' else coords
    
    proj_polys = []
    all_px, all_py = [], []
    for poly in polys:
        proj_ring = []
        for ring in poly:
            r_pts = []
            for pt in ring:
                px, py = proj(pt[0], pt[1])
                r_pts.append((px, py))
                all_px.append(px)
                all_py.append(py)
            proj_ring.append(r_pts)
        proj_polys.append(proj_ring)
        
    cx = round(sum(all_px)/len(all_px), 1) if all_px else 0
    cy = round(sum(all_py)/len(all_py), 1) if all_py else 0
    
    # Manual fine-tuning for centroids of curved states
    if uf == 'RN': cx, cy = cx - 5, cy
    if uf == 'PB': cx, cy = cx - 5, cy + 2
    if uf == 'PE': cx, cy = cx - 25, cy + 2
    if uf == 'PI': cx, cy = cx, cy + 8
    if uf == 'BA': cx, cy = cx, cy + 10
    if uf == 'RJ': cx, cy = cx, cy + 3
    if uf == 'ES': cx, cy = cx + 2, cy
    if uf == 'DF': cx, cy = cx, cy
    if uf == 'SP': cx, cy = cx - 5, cy
    if uf == 'PR': cx, cy = cx - 5, cy
    if uf == 'SC': cx, cy = cx - 5, cy
    if uf == 'RS': cx, cy = cx, cy + 8
    if uf == 'AM': cx, cy = cx - 15, cy
    if uf == 'PA': cx, cy = cx, cy + 10

    states_geometry[uf] = {
        'name': name,
        'region': region,
        'polys': proj_polys,
        'center': (cx, cy),
        'is_unlocked': (uf in UNLOCKED_STATES),
        'color': STATE_COLORS.get(uf, REGION_COLORS.get(region, '#10b981'))
    }

print(f'Processed {len(states_geometry)} states successfully.')

def generate_svg():
    svg_parts = ["""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920" style="background:#0e1117; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <defs>
    <!-- Scratch-off Metallic Silver Gradient -->
    <linearGradient id="scratchSilver" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#b0b5be" />
      <stop offset="25%" stop-color="#d8dce2" />
      <stop offset="50%" stop-color="#9ca3af" />
      <stop offset="75%" stop-color="#cbd5e1" />
      <stop offset="100%" stop-color="#828994" />
    </linearGradient>
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e2638" />
      <stop offset="100%" stop-color="#111622" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- BACKGROUND -->
  <rect width="1080" height="1920" fill="#0f141c" />

  <!-- ========================================== -->
  <!-- TOP SECTION: PHOTO SLIDESHOW (H: 630px)    -->
  <!-- ========================================== -->
  <rect x="24" y="24" width="1032" height="630" rx="20" fill="url(#headerGrad)" stroke="#1e293b" stroke-width="2" filter="url(#shadow)" />

  <g transform="translate(60, 60)">
    <circle cx="16" cy="16" r="8" fill="#10b981" />
    <text x="36" y="22" fill="#94a3b8" font-size="16" font-weight="600" letter-spacing="2">TRAVEL MEMORIES • MEMÓRIAS DE VIAGEM</text>
    <text x="0" y="65" fill="#f8fafc" font-size="32" font-weight="bold">Slideshow das Viagens Desbloqueadas</text>
    <rect x="740" y="8" width="170" height="38" rx="19" fill="#1e293b" stroke="#334155" stroke-width="1"/>
    <text x="825" y="33" fill="#38bdf8" font-size="15" font-weight="bold" text-anchor="middle">6 Destinos Registrados</text>
  </g>

  <!-- Hero Photo Card -->
  <g transform="translate(60, 150)">
    <rect x="0" y="0" width="620" height="420" rx="16" fill="#1e293b" stroke="#334155" stroke-width="1" filter="url(#shadow)" />
    <!-- Photo artwork -->
    <rect x="12" y="12" width="596" height="320" rx="12" fill="#0369a1" />
    <path d="M 12 260 Q 180 180 320 250 T 608 230 L 608 332 L 12 332 Z" fill="#0284c7" />
    <path d="M 12 280 Q 200 230 400 300 T 608 270 L 608 332 L 12 332 Z" fill="#f59e0b" opacity="0.8" />
    <circle cx="510" cy="80" r="38" fill="#fbbf24" opacity="0.9" filter="url(#glow)" />
    
    <rect x="30" y="30" width="220" height="36" rx="8" fill="#000000" opacity="0.75" />
    <text x="42" y="54" fill="#34d399" font-size="14" font-weight="bold">★ DESTINO DESBLOQUEADO</text>
    
    <text x="24" y="365" fill="#f8fafc" font-size="22" font-weight="bold">Praia do Sancho - Fernando de Noronha, PE</text>
    <text x="24" y="395" fill="#94a3b8" font-size="15">Viagem realizada em Outubro/2026 • Foto por Lucas &amp; Família</text>

    <!-- Side Thumbnails -->
    <g transform="translate(645, 0)">
      <rect x="0" y="0" width="285" height="95" rx="12" fill="#0f172a" stroke="#38bdf8" stroke-width="2" />
      <rect x="10" y="10" width="80" height="75" rx="8" fill="#047857" />
      <text x="102" y="38" fill="#f8fafc" font-size="15" font-weight="bold">Lençóis Maranhenses</text>
      <text x="102" y="60" fill="#94a3b8" font-size="13">Maranhão • 3 fotos</text>
      <circle cx="265" cy="48" r="6" fill="#38bdf8" />

      <rect x="0" y="108" width="285" height="95" rx="12" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
      <rect x="10" y="118" width="80" height="75" rx="8" fill="#ea580c" />
      <text x="102" y="146" fill="#f8fafc" font-size="15" font-weight="bold">Cristo Redentor</text>
      <text x="102" y="168" fill="#94a3b8" font-size="13">Rio de Janeiro • 2 fotos</text>

      <rect x="0" y="216" width="285" height="95" rx="12" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
      <rect x="10" y="226" width="80" height="75" rx="8" fill="#0284c7" />
      <text x="102" y="254" fill="#f8fafc" font-size="15" font-weight="bold">Cataratas do Iguaçu</text>
      <text x="102" y="276" fill="#94a3b8" font-size="13">Paraná • 4 fotos</text>

      <rect x="0" y="324" width="285" height="95" rx="12" fill="#0f172a" stroke="#334155" stroke-dasharray="6,6" stroke-width="1" />
      <text x="142" y="378" fill="#64748b" font-size="14" text-anchor="middle">+ Clique no mapa para liberar</text>
    </g>
  </g>

  <!-- ========================================== -->
  <!-- BOTTOM SECTION: REAL BRAZIL SCRATCH MAP    -->
  <!-- ========================================== -->
  <rect x="24" y="680" width="1032" height="1215" rx="20" fill="#12161f" stroke="#1e293b" stroke-width="2" filter="url(#shadow)" />

  <!-- Map Header -->
  <g transform="translate(60, 720)">
    <text x="0" y="35" fill="#f8fafc" font-size="34" font-weight="900" letter-spacing="1">MAPA DO BRASIL • ESTILO RASPAGEM</text>
    <text x="0" y="68" fill="#94a3b8" font-size="16">Fronteiras Geográficas Oficiais (IBGE) • Clique para raspar e revelar cores</text>
    
    <rect x="680" y="10" width="280" height="50" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1" />
    <text x="700" y="42" fill="#f8fafc" font-size="15" font-weight="bold">Progresso: 6 / 27 Estados (22%)</text>
  </g>

  <!-- Left Column: ILHAS, CIDADES FAMOSAS, PONTOS TURÍSTICOS -->
  <g transform="translate(48, 800)">
    <!-- ILHAS -->
    <rect x="0" y="0" width="220" height="110" rx="12" fill="#18202f" stroke="#1e293b" stroke-width="1" />
    <text x="16" y="24" fill="#38bdf8" font-size="12" font-weight="bold" letter-spacing="1">ILHAS</text>
    <!-- Unlocked Item with + button -->
    <rect x="12" y="34" width="196" height="28" rx="6" fill="#047857" />
    <text x="20" y="52" fill="#ffffff" font-size="11" font-weight="bold">✓ Fernando de Noronha</text>
    <!-- Dedicated + SVG button on unlocked item -->
    <rect x="178" y="38" width="24" height="20" rx="4" fill="#065f46" stroke="#34d399" stroke-width="1"/>
    <text x="190" y="53" fill="#ffffff" font-size="14" font-weight="bold" text-anchor="middle">+</text>

    <!-- Locked Item -->
    <rect x="12" y="68" width="196" height="28" rx="6" fill="url(#scratchSilver)" />
    <text x="20" y="86" fill="#111827" font-size="11" font-weight="bold">🔒 Ilha Grande (RJ)</text>

    <!-- CIDADES FAMOSAS -->
    <rect x="0" y="125" width="220" height="310" rx="12" fill="#18202f" stroke="#1e293b" stroke-width="1" />
    <text x="16" y="148" fill="#38bdf8" font-size="12" font-weight="bold" letter-spacing="1">CIDADES FAMOSAS</text>
    <g transform="translate(12, 160)">
      <!-- Unlocked Rio with + button -->
      <rect x="0" y="0" width="196" height="26" rx="5" fill="#ea580c" />
      <text x="8" y="17" fill="#ffffff" font-size="11" font-weight="bold">✓ Rio de Janeiro</text>
      <rect x="166" y="3" width="24" height="20" rx="4" fill="#9a3412" stroke="#fdba74" stroke-width="1"/>
      <text x="178" y="18" fill="#ffffff" font-size="14" font-weight="bold" text-anchor="middle">+</text>

      <!-- Unlocked Salvador with + button -->
      <rect x="0" y="30" width="196" height="26" rx="5" fill="#ef4444" />
      <text x="8" y="47" fill="#ffffff" font-size="11" font-weight="bold">✓ Salvador</text>
      <rect x="166" y="33" width="24" height="20" rx="4" fill="#991b1b" stroke="#fca5a5" stroke-width="1"/>
      <text x="178" y="48" fill="#ffffff" font-size="14" font-weight="bold" text-anchor="middle">+</text>

      <!-- Locked Items -->
      <rect x="0" y="60" width="196" height="26" rx="5" fill="url(#scratchSilver)" />
      <text x="8" y="77" fill="#111827" font-size="11" font-weight="bold">🔒 São Paulo</text>

      <rect x="0" y="90" width="196" height="26" rx="5" fill="url(#scratchSilver)" />
      <text x="8" y="107" fill="#111827" font-size="11" font-weight="bold">🔒 Florianópolis</text>

      <rect x="0" y="120" width="196" height="26" rx="5" fill="url(#scratchSilver)" />
      <text x="8" y="137" fill="#111827" font-size="11" font-weight="bold">🔒 Manaus</text>

      <rect x="0" y="150" width="196" height="26" rx="5" fill="url(#scratchSilver)" />
      <text x="8" y="167" fill="#111827" font-size="11" font-weight="bold">🔒 Ouro Preto</text>

      <rect x="0" y="180" width="196" height="26" rx="5" fill="url(#scratchSilver)" />
      <text x="8" y="197" fill="#111827" font-size="11" font-weight="bold">🔒 Gramado</text>

      <rect x="0" y="210" width="196" height="26" rx="5" fill="url(#scratchSilver)" />
      <text x="8" y="227" fill="#111827" font-size="11" font-weight="bold">🔒 Brasília (DF)</text>

      <rect x="0" y="240" width="196" height="26" rx="5" fill="url(#scratchSilver)" />
      <text x="8" y="257" fill="#111827" font-size="11" font-weight="bold">🔒 Curitiba</text>
    </g>

    <!-- PONTOS TURÍSTICOS -->
    <rect x="0" y="450" width="220" height="310" rx="12" fill="#18202f" stroke="#1e293b" stroke-width="1" />
    <text x="16" y="473" fill="#38bdf8" font-size="12" font-weight="bold" letter-spacing="1">PONTOS TURÍSTICOS</text>
    <g transform="translate(12, 485)">
      <!-- Unlocked Lençóis with + button -->
      <rect x="0" y="0" width="196" height="26" rx="5" fill="#047857" />
      <text x="8" y="17" fill="#ffffff" font-size="11" font-weight="bold">✓ Lençóis Maranhenses</text>
      <rect x="166" y="3" width="24" height="20" rx="4" fill="#065f46" stroke="#34d399" stroke-width="1"/>
      <text x="178" y="18" fill="#ffffff" font-size="14" font-weight="bold" text-anchor="middle">+</text>

      <!-- Unlocked Cataratas with + button -->
      <rect x="0" y="30" width="196" height="26" rx="5" fill="#0284c7" />
      <text x="8" y="47" fill="#ffffff" font-size="11" font-weight="bold">✓ Cataratas do Iguaçu</text>
      <rect x="166" y="33" width="24" height="20" rx="4" fill="#0369a1" stroke="#38bdf8" stroke-width="1"/>
      <text x="178" y="48" fill="#ffffff" font-size="14" font-weight="bold" text-anchor="middle">+</text>

      <rect x="0" y="60" width="196" height="26" rx="5" fill="url(#scratchSilver)" />
      <text x="8" y="77" fill="#111827" font-size="11" font-weight="bold">🔒 Chapada Diamantina</text>

      <rect x="0" y="90" width="196" height="26" rx="5" fill="url(#scratchSilver)" />
      <text x="8" y="107" fill="#111827" font-size="11" font-weight="bold">🔒 Bonito (MS)</text>

      <rect x="0" y="120" width="196" height="26" rx="5" fill="url(#scratchSilver)" />
      <text x="8" y="137" fill="#111827" font-size="11" font-weight="bold">🔒 Jalapão (TO)</text>

      <rect x="0" y="150" width="196" height="26" rx="5" fill="url(#scratchSilver)" />
      <text x="8" y="167" fill="#111827" font-size="11" font-weight="bold">🔒 Inhotim (MG)</text>

      <rect x="0" y="180" width="196" height="26" rx="5" fill="url(#scratchSilver)" />
      <text x="8" y="197" fill="#111827" font-size="11" font-weight="bold">🔒 Monte Roraima</text>

      <rect x="0" y="210" width="196" height="26" rx="5" fill="url(#scratchSilver)" />
      <text x="8" y="227" fill="#111827" font-size="11" font-weight="bold">🔒 Chapada dos Veadeiros</text>

      <rect x="0" y="240" width="196" height="26" rx="5" fill="url(#scratchSilver)" />
      <text x="8" y="257" fill="#111827" font-size="11" font-weight="bold">🔒 Pantanal</text>
    </g>
  </g>

  <!-- ============================================== -->
  <!-- REAL GEOGRAPHIC BRAZIL MAP (IBGE SHAPES)       -->
  <!-- ============================================== -->
  <g id="brazil-map-layer">
"""]

    # Render each state SVG path
    for uf, sdata in states_geometry.items():
        fill_val = sdata['color'] if sdata['is_unlocked'] else "url(#scratchSilver)"
        stroke_val = "#1e293b" if sdata['is_unlocked'] else "#4b5563"
        stroke_w = "1.5" if sdata['is_unlocked'] else "1"
        
        path_strs = []
        for poly in sdata['polys']:
            for ring in poly:
                if not ring: continue
                d_str = "M " + " L ".join(f"{x},{y}" for x, y in ring) + " Z"
                path_strs.append(d_str)
        
        full_d = " ".join(path_strs)
        svg_parts.append(f'    <path id="state-{uf}" d="{full_d}" fill="{fill_val}" stroke="{stroke_val}" stroke-width="{stroke_w}" filter="url(#shadow)">')
        svg_parts.append(f'      <title>{sdata["name"]} ({uf}) - {"Desbloqueado" if sdata["is_unlocked"] else "Bloqueado (Raspadinha)"}</title>')
        svg_parts.append(f'    </path>')

    # State Labels & Checkmarks
    svg_parts.append('    <!-- State Code Labels -->')
    for uf, sdata in states_geometry.items():
        cx, cy = sdata['center']
        txt_fill = "#ffffff" if sdata['is_unlocked'] else "#111827"
        font_size = "11"
        if uf in {'AM', 'PA', 'MT', 'BA', 'MG'}: font_size = "13"
        if uf in {'SE', 'AL', 'PB', 'RN', 'ES', 'DF'}: font_size = "9"
        
        status_symbol = "✓" if sdata['is_unlocked'] else ""
        label_text = f"{uf} {status_symbol}".strip()
        
        svg_parts.append(f'    <text x="{cx}" y="{cy}" fill="{txt_fill}" font-size="{font_size}" font-weight="bold" text-anchor="middle" pointer-events="none">{label_text}</text>')

    # Coastal Callout pins & beaches
    svg_parts.append("""
    <!-- Callout Connection lines from real coast to beach labels -->
    <g stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="3,3" opacity="0.8">
      <!-- Ceará / Jericoacoara -->
      <line x1="740" y1="990" x2="810" y2="920" />
      <circle cx="740" cy="990" r="4" fill="#38bdf8" />

      <!-- Fernando de Noronha -->
      <line x1="785" y1="1005" x2="810" y2="875" />
      <circle cx="785" cy="1005" r="4" fill="#10b981" />

      <!-- Bahia / Praia do Espelho -->
      <line x1="745" y1="1170" x2="810" y2="1010" />
      <circle cx="745" cy="1170" r="4" fill="#ef4444" />

      <!-- Rio de Janeiro / Copacabana -->
      <line x1="695" y1="1235" x2="810" y2="1145" />
      <circle cx="695" cy="1235" r="4" fill="#ea580c" />

      <!-- Santa Catarina / Praia do Rosa -->
      <line x1="605" y1="1310" x2="810" y2="1280" />
      <circle cx="605" cy="1310" r="4" fill="#38bdf8" />
    </g>
  </g>
""")

    # Right Column: PRINCIPAIS PRAIAS
    svg_parts.append("""
  <g transform="translate(810, 800)">
    <rect x="0" y="0" width="220" height="730" rx="12" fill="#18202f" stroke="#1e293b" stroke-width="1" />
    <text x="16" y="24" fill="#38bdf8" font-size="12" font-weight="bold" letter-spacing="1">PRINCIPAIS PRAIAS</text>
    <g transform="translate(12, 36)">
      <!-- Unlocked Sancho with + button -->
      <rect x="0" y="0" width="196" height="28" rx="5" fill="#047857" />
      <text x="8" y="18" fill="#ffffff" font-size="11" font-weight="bold">✓ Baía do Sancho (PE)</text>
      <rect x="166" y="4" width="24" height="20" rx="4" fill="#065f46" stroke="#34d399" stroke-width="1"/>
      <text x="178" y="19" fill="#ffffff" font-size="14" font-weight="bold" text-anchor="middle">+</text>

      <!-- Unlocked Copacabana with + button -->
      <rect x="0" y="34" width="196" height="28" rx="5" fill="#ea580c" />
      <text x="8" y="52" fill="#ffffff" font-size="11" font-weight="bold">✓ Copacabana / Ipanema</text>
      <rect x="166" y="38" width="24" height="20" rx="4" fill="#9a3412" stroke="#fdba74" stroke-width="1"/>
      <text x="178" y="53" fill="#ffffff" font-size="14" font-weight="bold" text-anchor="middle">+</text>

      <rect x="0" y="68" width="196" height="28" rx="5" fill="url(#scratchSilver)" />
      <text x="8" y="86" fill="#111827" font-size="11" font-weight="bold">🔒 Jericoacoara (CE)</text>

      <rect x="0" y="102" width="196" height="28" rx="5" fill="url(#scratchSilver)" />
      <text x="8" y="120" fill="#111827" font-size="11" font-weight="bold">🔒 Praia do Espelho (BA)</text>

      <rect x="0" y="136" width="196" height="28" rx="5" fill="url(#scratchSilver)" />
      <text x="8" y="154" fill="#111827" font-size="11" font-weight="bold">🔒 Praia dos Carneiros (PE)</text>

      <rect x="0" y="170" width="196" height="28" rx="5" fill="url(#scratchSilver)" />
      <text x="8" y="188" fill="#111827" font-size="11" font-weight="bold">🔒 Pipa (RN)</text>

      <rect x="0" y="204" width="196" height="28" rx="5" fill="url(#scratchSilver)" />
      <text x="8" y="222" fill="#111827" font-size="11" font-weight="bold">🔒 Maragogi (AL)</text>

      <rect x="0" y="238" width="196" height="28" rx="5" fill="url(#scratchSilver)" />
      <text x="8" y="256" fill="#111827" font-size="11" font-weight="bold">🔒 Taipu de Fora (BA)</text>

      <rect x="0" y="272" width="196" height="28" rx="5" fill="url(#scratchSilver)" />
      <text x="8" y="290" fill="#111827" font-size="11" font-weight="bold">🔒 Arraial do Cabo (RJ)</text>

      <rect x="0" y="306" width="196" height="28" rx="5" fill="url(#scratchSilver)" />
      <text x="8" y="324" fill="#111827" font-size="11" font-weight="bold">🔒 Ilhabela (SP)</text>

      <rect x="0" y="340" width="196" height="28" rx="5" fill="url(#scratchSilver)" />
      <text x="8" y="358" fill="#111827" font-size="11" font-weight="bold">🔒 Guarda do Embaú (SC)</text>

      <rect x="0" y="374" width="196" height="28" rx="5" fill="url(#scratchSilver)" />
      <text x="8" y="392" fill="#111827" font-size="11" font-weight="bold">🔒 Praia do Rosa (SC)</text>

      <rect x="0" y="408" width="196" height="28" rx="5" fill="url(#scratchSilver)" />
      <text x="8" y="426" fill="#111827" font-size="11" font-weight="bold">🔒 Ilha do Mel (PR)</text>

      <rect x="0" y="442" width="196" height="28" rx="5" fill="url(#scratchSilver)" />
      <text x="8" y="460" fill="#111827" font-size="11" font-weight="bold">🔒 Morro de SP (BA)</text>

      <rect x="0" y="476" width="196" height="28" rx="5" fill="url(#scratchSilver)" />
      <text x="8" y="494" fill="#111827" font-size="11" font-weight="bold">🔒 Canoa Quebrada (CE)</text>

      <rect x="0" y="510" width="196" height="28" rx="5" fill="url(#scratchSilver)" />
      <text x="8" y="528" fill="#111827" font-size="11" font-weight="bold">🔒 Torres (RS)</text>

      <rect x="0" y="544" width="196" height="28" rx="5" fill="url(#scratchSilver)" />
      <text x="8" y="562" fill="#111827" font-size="11" font-weight="bold">🔒 Ponta Negra (RN)</text>
    </g>
  </g>
""")

    # Bottom Section: STATE FLAGS
    svg_parts.append("""
  <g transform="translate(48, 1560)">
    <rect x="0" y="0" width="984" height="70" rx="10" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
    <text x="15" y="22" fill="#94a3b8" font-size="12" font-weight="bold" letter-spacing="1">BANDEIRAS DOS ESTADOS (RASPADINHA):</text>
    <g transform="translate(15, 30)">
      <!-- Unlocked flags -->
      <rect x="0" y="0" width="32" height="28" rx="4" fill="#059669" /><text x="9" y="19" fill="#ffffff" font-size="10" font-weight="bold">AM</text>
      <rect x="36" y="0" width="32" height="28" rx="4" fill="#dc2626" /><text x="45" y="19" fill="#ffffff" font-size="10" font-weight="bold">MA</text>
      <rect x="72" y="0" width="32" height="28" rx="4" fill="#ef4444" /><text x="81" y="19" fill="#ffffff" font-size="10" font-weight="bold">BA</text>
      <rect x="108" y="0" width="32" height="28" rx="4" fill="#f87171" /><text x="117" y="19" fill="#ffffff" font-size="10" font-weight="bold">PE</text>
      <rect x="144" y="0" width="32" height="28" rx="4" fill="#ea580c" /><text x="153" y="19" fill="#ffffff" font-size="10" font-weight="bold">RJ</text>
      <rect x="180" y="0" width="32" height="28" rx="4" fill="#0284c7" /><text x="189" y="19" fill="#ffffff" font-size="10" font-weight="bold">PR</text>
      <!-- Locked flags (Scratch-off silver) -->
      <g fill="url(#scratchSilver)">
        <rect x="216" y="0" width="32" height="28" rx="4" /><text x="225" y="19" fill="#111827" font-size="10" font-weight="bold">AC</text>
        <rect x="252" y="0" width="32" height="28" rx="4" /><text x="261" y="19" fill="#111827" font-size="10" font-weight="bold">AL</text>
        <rect x="288" y="0" width="32" height="28" rx="4" /><text x="297" y="19" fill="#111827" font-size="10" font-weight="bold">AP</text>
        <rect x="324" y="0" width="32" height="28" rx="4" /><text x="333" y="19" fill="#111827" font-size="10" font-weight="bold">CE</text>
        <rect x="360" y="0" width="32" height="28" rx="4" /><text x="369" y="19" fill="#111827" font-size="10" font-weight="bold">DF</text>
        <rect x="396" y="0" width="32" height="28" rx="4" /><text x="405" y="19" fill="#111827" font-size="10" font-weight="bold">ES</text>
        <rect x="432" y="0" width="32" height="28" rx="4" /><text x="441" y="19" fill="#111827" font-size="10" font-weight="bold">GO</text>
        <rect x="468" y="0" width="32" height="28" rx="4" /><text x="477" y="19" fill="#111827" font-size="10" font-weight="bold">MG</text>
        <rect x="504" y="0" width="32" height="28" rx="4" /><text x="513" y="19" fill="#111827" font-size="10" font-weight="bold">MS</text>
        <rect x="540" y="0" width="32" height="28" rx="4" /><text x="549" y="19" fill="#111827" font-size="10" font-weight="bold">MT</text>
        <rect x="576" y="0" width="32" height="28" rx="4" /><text x="585" y="19" fill="#111827" font-size="10" font-weight="bold">PA</text>
        <rect x="612" y="0" width="32" height="28" rx="4" /><text x="621" y="19" fill="#111827" font-size="10" font-weight="bold">PB</text>
        <rect x="648" y="0" width="32" height="28" rx="4" /><text x="657" y="19" fill="#111827" font-size="10" font-weight="bold">PI</text>
        <rect x="684" y="0" width="32" height="28" rx="4" /><text x="693" y="19" fill="#111827" font-size="10" font-weight="bold">RN</text>
        <rect x="720" y="0" width="32" height="28" rx="4" /><text x="729" y="19" fill="#111827" font-size="10" font-weight="bold">RO</text>
        <rect x="756" y="0" width="32" height="28" rx="4" /><text x="765" y="19" fill="#111827" font-size="10" font-weight="bold">RR</text>
        <rect x="792" y="0" width="32" height="28" rx="4" /><text x="801" y="19" fill="#111827" font-size="10" font-weight="bold">RS</text>
        <rect x="828" y="0" width="32" height="28" rx="4" /><text x="837" y="19" fill="#111827" font-size="10" font-weight="bold">SC</text>
        <rect x="864" y="0" width="32" height="28" rx="4" /><text x="873" y="19" fill="#111827" font-size="10" font-weight="bold">SE</text>
        <rect x="900" y="0" width="32" height="28" rx="4" /><text x="909" y="19" fill="#111827" font-size="10" font-weight="bold">SP</text>
        <rect x="936" y="0" width="32" height="28" rx="4" /><text x="945" y="19" fill="#111827" font-size="10" font-weight="bold">TO</text>
      </g>
    </g>
  </g>
""")

    # Simple Confirmation Modal Requested by User (Positioned cleanly at bottom)
    svg_parts.append("""
  <g transform="translate(48, 1645)" filter="url(#shadow)">
    <!-- Modal Container -->
    <rect x="0" y="0" width="984" height="225" rx="16" fill="#1e293b" stroke="#38bdf8" stroke-width="2" />
    <rect x="0" y="0" width="984" height="45" rx="16" fill="#0f172a" />
    <circle cx="28" cy="22" r="9" fill="#38bdf8" />
    <text x="48" y="27" fill="#f8fafc" font-size="15" font-weight="bold">MODAL DE LIBERAÇÃO SIMPLES (CLIQUE NO PONTO OU NO ESTADO)</text>
    
    <g transform="translate(30, 65)">
      <!-- Prompt & Target Destination Name -->
      <text x="0" y="20" fill="#94a3b8" font-size="16" font-weight="600">CONFIRMAÇÃO:</text>
      <text x="0" y="55" fill="#f8fafc" font-size="28" font-weight="900">Deseja realmente liberar este destino?</text>
      <text x="0" y="90" fill="#38bdf8" font-size="22" font-weight="bold">📍 Jericoacoara (CE)</text>
      <text x="0" y="118" fill="#94a3b8" font-size="13">✦ Regra Cascata: Ao liberar este ponto, o Estado do Ceará (CE) também será liberado no mapa e o botão '+' aparecerá no card para anexar fotos.</text>

      <!-- Minimal Buttons: Cancelar & Confirmar -->
      <g transform="translate(620, 20)">
        <rect x="0" y="0" width="150" height="75" rx="10" fill="#334155" />
        <text x="75" y="44" fill="#f8fafc" font-size="16" font-weight="bold" text-anchor="middle">Cancelar</text>

        <rect x="170" y="0" width="160" height="75" rx="10" fill="#0284c7" />
        <text x="250" y="44" fill="#ffffff" font-size="16" font-weight="bold" text-anchor="middle">✓ Confirmar</text>
      </g>
    </g>
  </g>

  <text x="540" y="1900" fill="#64748b" font-size="13" text-anchor="middle">Laterais dinâmicas: Mostra liberados ou pontos do estado clicado • Botão '+' para fotos pós-liberação</text>
</svg>
""")

    with open("ui-mockup.svg", "w", encoding="utf-8") as f:
        f.write("\n".join(svg_parts))
    print("Generated authentic ui-mockup.svg successfully.")

def generate_png():
    width = 1080
    height = 1920
    im = Image.new("RGB", (width, height), "#0f141c")
    draw = ImageDraw.Draw(im)

    try:
        font_huge = ImageFont.truetype("arialbd.ttf", 30)
        font_large = ImageFont.truetype("arialbd.ttf", 22)
        font_medium = ImageFont.truetype("arialbd.ttf", 16)
        font_regular = ImageFont.truetype("arial.ttf", 15)
        font_small = ImageFont.truetype("arial.ttf", 12)
        font_small_bold = ImageFont.truetype("arialbd.ttf", 11)
        font_tiny_bold = ImageFont.truetype("arialbd.ttf", 10)
    except IOError:
        font_huge = ImageFont.load_default()
        font_large = ImageFont.load_default()
        font_medium = ImageFont.load_default()
        font_regular = ImageFont.load_default()
        font_small = ImageFont.load_default()
        font_small_bold = ImageFont.load_default()
        font_tiny_bold = ImageFont.load_default()

    # Top Section: Slideshow
    draw.rounded_rectangle([24, 24, 1056, 654], radius=20, fill="#131b29", outline="#1e293b", width=2)
    draw.ellipse([60, 52, 76, 68], fill="#10b981")
    draw.text((86, 52), "TRAVEL MEMORIES - MEMORIAS DE VIAGEM", fill="#94a3b8", font=font_small_bold)
    draw.text((60, 85), "Slideshow das Viagens Desbloqueadas", fill="#f8fafc", font=font_huge)
    
    draw.rounded_rectangle([790, 48, 1010, 88], radius=20, fill="#1e293b", outline="#334155", width=1)
    draw.text((820, 58), "6 Destinos Registrados", fill="#38bdf8", font=font_medium)

    # Hero Photo Card
    draw.rounded_rectangle([60, 150, 680, 570], radius=16, fill="#1e293b", outline="#334155", width=1)
    draw.rounded_rectangle([72, 162, 668, 480], radius=12, fill="#0369a1")
    draw.ellipse([540, 200, 620, 280], fill="#fbbf24")
    draw.polygon([(72, 480), (220, 360), (400, 480)], fill="#047857")
    draw.polygon([(300, 480), (480, 340), (668, 480)], fill="#0284c7")
    
    draw.rounded_rectangle([90, 180, 320, 216], radius=6, fill="#000000")
    draw.text((105, 190), "DESTINO DESBLOQUEADO", fill="#34d399", font=font_small_bold)

    draw.text((85, 498), "Praia do Sancho - Fernando de Noronha, PE", fill="#f8fafc", font=font_large)
    draw.text((85, 532), "Viagem realizada em Outubro/2026 - Foto por Lucas & Familia", fill="#94a3b8", font=font_small)

    # Thumbnails
    thumb_titles = [
        ("Lencois Maranhenses", "Maranhao - 3 fotos", "#047857", True),
        ("Cristo Redentor", "Rio de Janeiro - 2 fotos", "#ea580c", False),
        ("Cataratas do Iguacu", "Parana - 4 fotos", "#0284c7", False),
        ("+ Desbloqueie mais", "Clique no mapa abaixo", "#334155", False),
    ]
    for idx, (title, sub, color, is_active) in enumerate(thumb_titles):
        y_off = 150 + idx * 105
        outline_c = "#38bdf8" if is_active else "#1e293b"
        draw.rounded_rectangle([705, y_off, 1010, y_off + 95], radius=12, fill="#0f172a", outline=outline_c, width=2 if is_active else 1)
        draw.rounded_rectangle([715, y_off + 10, 795, y_off + 85], radius=8, fill=color)
        draw.text((810, y_off + 24), title, fill="#f8fafc", font=font_medium)
        draw.text((810, y_off + 52), sub, fill="#94a3b8", font=font_small)

    # Bottom Section: Brazil Map Poster
    draw.rounded_rectangle([24, 680, 1056, 1895], radius=20, fill="#12161f", outline="#1e293b", width=2)
    draw.text((60, 715), "MAPA DO BRASIL - ESTILO RASPAGEM", fill="#f8fafc", font=font_huge)
    draw.text((60, 760), "Fronteiras Geograficas Oficiais (IBGE) - Clique para raspar e revelar cores", fill="#94a3b8", font=font_regular)
    
    draw.rounded_rectangle([730, 715, 1010, 765], radius=12, fill="#1e293b", outline="#334155", width=1)
    draw.text((750, 730), "Progresso: 6 / 27 (22%)", fill="#f8fafc", font=font_medium)

    # Left Column
    draw.rounded_rectangle([48, 800, 268, 910], radius=12, fill="#18202f", outline="#1e293b", width=1)
    draw.text((64, 815), "ILHAS", fill="#38bdf8", font=font_small_bold)
    # Unlocked with + button
    draw.rounded_rectangle([60, 836, 256, 864], radius=5, fill="#047857")
    draw.text((68, 842), "[v] F. de Noronha", fill="#ffffff", font=font_small_bold)
    draw.rounded_rectangle([226, 838, 252, 862], radius=4, fill="#065f46", outline="#34d399", width=1)
    draw.text((234, 842), "+", fill="#ffffff", font=font_small_bold)

    draw.rounded_rectangle([60, 870, 256, 898], radius=5, fill="#9ca3af")
    draw.text((68, 876), "[ ] Ilha Grande (RJ)", fill="#111827", font=font_small_bold)

    draw.rounded_rectangle([48, 925, 268, 1235], radius=12, fill="#18202f", outline="#1e293b", width=1)
    draw.text((64, 940), "CIDADES FAMOSAS", fill="#38bdf8", font=font_small_bold)
    cities = [
        ("[v] Rio de Janeiro", "#ea580c", "#ffffff", True),
        ("[v] Salvador", "#ef4444", "#ffffff", True),
        ("[ ] Sao Paulo", "#9ca3af", "#111827", False),
        ("[ ] Florianopolis", "#9ca3af", "#111827", False),
        ("[ ] Manaus", "#9ca3af", "#111827", False),
        ("[ ] Ouro Preto", "#9ca3af", "#111827", False),
        ("[ ] Gramado", "#9ca3af", "#111827", False),
        ("[ ] Brasilia (DF)", "#9ca3af", "#111827", False),
        ("[ ] Curitiba", "#9ca3af", "#111827", False),
    ]
    for i, (name, bg, fg, is_unlocked) in enumerate(cities):
        cy = 960 + i * 29
        draw.rounded_rectangle([60, cy, 256, cy + 25], radius=4, fill=bg)
        draw.text((68, cy + 5), name, fill=fg, font=font_small_bold)
        if is_unlocked:
            draw.rounded_rectangle([226, cy + 2, 252, cy + 23], radius=4, fill="#1e293b", outline="#ffffff", width=1)
            draw.text((234, cy + 5), "+", fill="#ffffff", font=font_small_bold)

    draw.rounded_rectangle([48, 1250, 268, 1545], radius=12, fill="#18202f", outline="#1e293b", width=1)
    draw.text((64, 1265), "PONTOS TURISTICOS", fill="#38bdf8", font=font_small_bold)
    spots = [
        ("[v] Lencois Maranhenses", "#047857", "#ffffff", True),
        ("[v] Cataratas do Iguacu", "#0284c7", "#ffffff", True),
        ("[ ] Chapada Diamantina", "#9ca3af", "#111827", False),
        ("[ ] Bonito (MS)", "#9ca3af", "#111827", False),
        ("[ ] Jalapao (TO)", "#9ca3af", "#111827", False),
        ("[ ] Inhotim (MG)", "#9ca3af", "#111827", False),
        ("[ ] Monte Roraima", "#9ca3af", "#111827", False),
        ("[ ] Chapada dos Veadeiros", "#9ca3af", "#111827", False),
        ("[ ] Pantanal", "#9ca3af", "#111827", False),
    ]
    for i, (name, bg, fg, is_unlocked) in enumerate(spots):
        sy = 1285 + i * 28
        draw.rounded_rectangle([60, sy, 256, sy + 25], radius=4, fill=bg)
        draw.text((68, sy + 5), name, fill=fg, font=font_small_bold)
        if is_unlocked:
            draw.rounded_rectangle([226, sy + 2, 252, sy + 23], radius=4, fill="#1e293b", outline="#ffffff", width=1)
            draw.text((234, sy + 5), "+", fill="#ffffff", font=font_small_bold)

    # DRAW REAL BRAZIL MAP GEOMETRY
    for uf, sdata in states_geometry.items():
        fill_c = sdata['color'] if sdata['is_unlocked'] else "#9ca3af"
        outline_c = "#1e293b" if sdata['is_unlocked'] else "#4b5563"
        for poly in sdata['polys']:
            for ring in poly:
                if len(ring) > 2:
                    draw.polygon(ring, fill=fill_c, outline=outline_c)

    # DRAW LABELS
    for uf, sdata in states_geometry.items():
        cx, cy = sdata['center']
        txt_c = "#ffffff" if sdata['is_unlocked'] else "#111827"
        lbl = f"{uf} [v]" if sdata['is_unlocked'] else uf
        f = font_small_bold if uf in {'AM', 'PA', 'MT', 'BA', 'MG'} else font_tiny_bold
        draw.text((cx - 10, cy - 6), lbl, fill=txt_c, font=f)

    # Right Column: Beaches
    draw.rounded_rectangle([810, 800, 1032, 1545], radius=12, fill="#18202f", outline="#1e293b", width=1)
    draw.text((826, 815), "PRINCIPAIS PRAIAS", fill="#38bdf8", font=font_small_bold)
    beaches = [
        ("[v] Baia do Sancho (PE)", "#047857", "#ffffff", True),
        ("[v] Copacabana / Ipanema", "#ea580c", "#ffffff", True),
        ("[ ] Jericoacoara (CE)", "#9ca3af", "#111827", False),
        ("[ ] Praia do Espelho (BA)", "#9ca3af", "#111827", False),
        ("[ ] Praia dos Carneiros", "#9ca3af", "#111827", False),
        ("[ ] Pipa (RN)", "#9ca3af", "#111827", False),
        ("[ ] Maragogi (AL)", "#9ca3af", "#111827", False),
        ("[ ] Taipu de Fora (BA)", "#9ca3af", "#111827", False),
        ("[ ] Arraial do Cabo (RJ)", "#9ca3af", "#111827", False),
        ("[ ] Ilhabela (SP)", "#9ca3af", "#111827", False),
        ("[ ] Guarda do Embau (SC)", "#9ca3af", "#111827", False),
        ("[ ] Praia do Rosa (SC)", "#9ca3af", "#111827", False),
        ("[ ] Ilha do Mel (PR)", "#9ca3af", "#111827", False),
        ("[ ] Morro de SP (BA)", "#9ca3af", "#111827", False),
        ("[ ] Canoa Quebrada (CE)", "#9ca3af", "#111827", False),
        ("[ ] Torres (RS)", "#9ca3af", "#111827", False),
        ("[ ] Ponta Negra (RN)", "#9ca3af", "#111827", False),
    ]
    for i, (name, bg, fg, is_unlocked) in enumerate(beaches):
        by = 838 + i * 41
        draw.rounded_rectangle([824, by, 1018, by + 34], radius=5, fill=bg)
        draw.text((832, by + 9), name, fill=fg, font=font_small_bold)
        if is_unlocked:
            draw.rounded_rectangle([986, by + 5, 1012, by + 29], radius=4, fill="#1e293b", outline="#ffffff", width=1)
            draw.text((994, by + 7), "+", fill="#ffffff", font=font_small_bold)

    # State Flags Bar
    draw.rounded_rectangle([48, 1560, 1032, 1630], radius=10, fill="#0f172a", outline="#1e293b", width=1)
    draw.text((64, 1572), "BANDEIRAS DOS ESTADOS (RASPADINHA):", fill="#94a3b8", font=font_tiny_bold)
    
    flag_states = ["AM", "MA", "BA", "PE", "RJ", "PR", "AC", "AL", "AP", "CE", "DF", "ES", "GO", "MG", "MS", "MT", "PA", "PB", "PI", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO"]
    for idx, fs in enumerate(flag_states):
        fx = 64 + idx * 35
        is_un = fs in UNLOCKED_STATES
        fc = STATE_COLORS.get(fs, "#9ca3af") if is_un else "#9ca3af"
        tc = "#ffffff" if is_un else "#111827"
        if fx + 32 <= 1025:
            draw.rounded_rectangle([fx, 1590, fx + 31, 1618], radius=4, fill=fc)
            draw.text((fx + 5, 1596), fs, fill=tc, font=font_tiny_bold)

    # SIMPLE CONFIRMATION MODAL REQUESTED BY USER
    draw.rounded_rectangle([48, 1645, 1032, 1865], radius=16, fill="#1e293b", outline="#38bdf8", width=2)
    draw.rounded_rectangle([48, 1645, 1032, 1690], radius=16, fill="#0f172a")
    draw.ellipse([70, 1660, 86, 1676], fill="#38bdf8")
    draw.text((100, 1658), "MODAL DE LIBERACAO SIMPLES (CLIQUE NO PONTO OU NO ESTADO)", fill="#f8fafc", font=font_medium)

    draw.text((70, 1705), "CONFIRMACAO:", fill="#94a3b8", font=font_small_bold)
    draw.text((70, 1728), "Deseja realmente liberar este destino?", fill="#f8fafc", font=font_large)
    draw.text((70, 1762), "Jericoacoara (CE)", fill="#38bdf8", font=font_huge)
    draw.text((70, 1810), "* Regra Cascata: Ao confirmar, o Estado do Ceara (CE) tambem e liberado no mapa e o botao '+' aparece no ponto para fotos.", fill="#94a3b8", font=font_small)

    # Minimal buttons
    draw.rounded_rectangle([680, 1725, 830, 1795], radius=10, fill="#334155")
    draw.text((720, 1750), "Cancelar", fill="#f8fafc", font=font_large)

    draw.rounded_rectangle([850, 1725, 1010, 1795], radius=10, fill="#0284c7")
    draw.text((885, 1750), "Confirmar", fill="#ffffff", font=font_large)

    draw.text((220, 1878), "Laterais dinamicas: Mostra liberados ou pontos do estado clicado - Botao '+' para fotos pos-liberacao", fill="#64748b", font=font_small)

    im.save("ui-mockup.png", quality=95)
    print("Generated authentic ui-mockup.png successfully.")

if __name__ == "__main__":
    generate_svg()
    generate_png()

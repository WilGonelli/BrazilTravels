"""
Script to generate UI mockup diagram and visual layout image for Brazil Travel Scratch Map.
Outputs:
- ui-mockup.svg: High-resolution scalable vector mockup.
- ui-mockup.png: Raster preview for universal display.
"""
import os
from PIL import Image, ImageDraw, ImageFont

def generate_svg():
    svg_content = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920" style="background:#0e1117; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <defs>
    <!-- Gradients -->
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e2638" />
      <stop offset="100%" stop-color="#111622" />
    </linearGradient>
    <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#9ca3af" />
      <stop offset="50%" stop-color="#d1d5db" />
      <stop offset="100%" stop-color="#6b7280" />
    </linearGradient>
    <linearGradient id="greenRegion" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#047857" />
    </linearGradient>
    <linearGradient id="redRegion" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ef4444" />
      <stop offset="100%" stop-color="#b91c1c" />
    </linearGradient>
    <linearGradient id="purpleRegion" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8b5cf6" />
      <stop offset="100%" stop-color="#6d28d9" />
    </linearGradient>
    <linearGradient id="orangeRegion" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f97316" />
      <stop offset="100%" stop-color="#c2410c" />
    </linearGradient>
    <linearGradient id="blueRegion" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06b6d4" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- BACKGROUND -->
  <rect width="1080" height="1920" fill="#0f141c" />

  <!-- ========================================== -->
  <!-- TOP SECTION: PHOTO SLIDESHOW (H: 640px)    -->
  <!-- ========================================== -->
  <rect x="24" y="24" width="1032" height="630" rx="20" fill="url(#headerGrad)" stroke="#1e293b" stroke-width="2" filter="url(#shadow)" />

  <!-- Slideshow Header -->
  <g transform="translate(60, 60)">
    <circle cx="16" cy="16" r="8" fill="#10b981" />
    <text x="36" y="22" fill="#94a3b8" font-size="16" font-weight="600" letter-spacing="2">TRAVEL MEMORIES • MEMÓRIAS DE VIAGEM</text>
    <text x="0" y="65" fill="#f8fafc" font-size="32" font-weight="bold">Slideshow das Viagens Desbloqueadas</text>
    <rect x="740" y="8" width="170" height="38" rx="19" fill="#1e293b" stroke="#334155" stroke-width="1"/>
    <text x="825" y="33" fill="#38bdf8" font-size="15" font-weight="bold" text-anchor="middle">5 Destinos Registrados</text>
  </g>

  <!-- Photo Presentation Card (Hero Polaroid Style) -->
  <g transform="translate(60, 150)">
    <!-- Main Photo Container -->
    <rect x="0" y="0" width="620" height="420" rx="16" fill="#1e293b" stroke="#334155" stroke-width="1" filter="url(#shadow)" />
    <!-- Photo Graphic Placeholder: Fernando de Noronha / Beach sunset -->
    <rect x="12" y="12" width="596" height="320" rx="12" fill="#0369a1" />
    <path d="M 12 260 Q 180 180 320 250 T 608 230 L 608 332 L 12 332 Z" fill="#0284c7" />
    <path d="M 12 280 Q 200 230 400 300 T 608 270 L 608 332 L 12 332 Z" fill="#f59e0b" opacity="0.8" />
    <circle cx="510" cy="80" r="38" fill="#fbbf24" opacity="0.9" filter="url(#glow)" />
    <!-- Destination Badge on photo -->
    <rect x="30" y="30" width="220" height="36" rx="8" fill="#000000" opacity="0.75" />
    <text x="42" y="54" fill="#34d399" font-size="14" font-weight="bold">★ DESTINO DESBLOQUEADO</text>
    
    <!-- Photo Info -->
    <text x="24" y="365" fill="#f8fafc" font-size="22" font-weight="bold">Praia do Sancho - Fernando de Noronha, PE</text>
    <text x="24" y="395" fill="#94a3b8" font-size="15">Viagem realizada em Outubro/2026 • Foto por Lucas &amp; Família</text>

    <!-- Side Carousel Preview / Thumbnails -->
    <g transform="translate(645, 0)">
      <!-- Thumbnail 1 (Active) -->
      <rect x="0" y="0" width="285" height="95" rx="12" fill="#0f172a" stroke="#38bdf8" stroke-width="2" />
      <rect x="10" y="10" width="80" height="75" rx="8" fill="#047857" />
      <text x="102" y="38" fill="#f8fafc" font-size="15" font-weight="bold">Lençóis Maranhenses</text>
      <text x="102" y="60" fill="#94a3b8" font-size="13">Maranhão • 3 fotos</text>
      <circle cx="265" cy="48" r="6" fill="#38bdf8" />

      <!-- Thumbnail 2 -->
      <rect x="0" y="108" width="285" height="95" rx="12" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
      <rect x="10" y="118" width="80" height="75" rx="8" fill="#c2410c" />
      <text x="102" y="146" fill="#f8fafc" font-size="15" font-weight="bold">Cristo Redentor</text>
      <text x="102" y="168" fill="#94a3b8" font-size="13">Rio de Janeiro • 2 fotos</text>

      <!-- Thumbnail 3 -->
      <rect x="0" y="216" width="285" height="95" rx="12" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
      <rect x="10" y="226" width="80" height="75" rx="8" fill="#0284c7" />
      <text x="102" y="254" fill="#f8fafc" font-size="15" font-weight="bold">Cataratas do Iguaçu</text>
      <text x="102" y="276" fill="#94a3b8" font-size="13">Paraná • 4 fotos</text>

      <!-- Thumbnail 4 (Empty/Add) -->
      <rect x="0" y="324" width="285" height="95" rx="12" fill="#0f172a" stroke="#334155" stroke-dasharray="6,6" stroke-width="1" />
      <text x="142" y="378" fill="#64748b" font-size="14" text-anchor="middle">+ Desbloqueie mais destinos no mapa</text>
    </g>
  </g>

  <!-- ========================================== -->
  <!-- BOTTOM SECTION: SCRATCH-OFF BRAZIL MAP     -->
  <!-- ========================================== -->
  <rect x="24" y="680" width="1032" height="1215" rx="20" fill="#12161f" stroke="#1e293b" stroke-width="2" filter="url(#shadow)" />

  <!-- Map Section Header -->
  <g transform="translate(60, 720)">
    <text x="0" y="35" fill="#f8fafc" font-size="34" font-weight="900" letter-spacing="1">MAPA DO BRASIL • ESTILO RASPAGEM</text>
    <text x="0" y="68" fill="#94a3b8" font-size="16">Interativo: Clique no estado ou ponto turístico para desbloquear e colorir</text>
    
    <!-- Progress Indicator Badge -->
    <rect x="680" y="10" width="280" height="50" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1" />
    <text x="700" y="42" fill="#f8fafc" font-size="15" font-weight="bold">Progresso: 5 / 27 Estados (18%)</text>
  </g>

  <!-- Left Sidebar inside Map: Categorias / Listas -->
  <g transform="translate(60, 810)">
    <!-- ILHAS -->
    <rect x="0" y="0" width="240" height="130" rx="12" fill="#18202f" stroke="#1e293b" stroke-width="1" />
    <text x="20" y="28" fill="#38bdf8" font-size="14" font-weight="bold" letter-spacing="1">ILHAS</text>
    <!-- Item 1: Unlocked -->
    <rect x="20" y="42" width="200" height="28" rx="6" fill="#047857" />
    <text x="30" y="61" fill="#ffffff" font-size="12" font-weight="bold">✓ Fernando de Noronha (PE)</text>
    <!-- Item 2: Locked (Scratch-off Gray) -->
    <rect x="20" y="76" width="200" height="28" rx="6" fill="url(#silverGrad)" />
    <text x="30" y="95" fill="#111827" font-size="12" font-weight="bold">🔒 Ilha Grande (RJ)</text>

    <!-- CIDADES FAMOSAS -->
    <rect x="0" y="150" width="240" height="340" rx="12" fill="#18202f" stroke="#1e293b" stroke-width="1" />
    <text x="20" y="178" fill="#38bdf8" font-size="14" font-weight="bold" letter-spacing="1">CIDADES FAMOSAS</text>
    
    <!-- City Items -->
    <g transform="translate(20, 195)">
      <!-- Unlocked -->
      <rect x="0" y="0" width="200" height="26" rx="5" fill="#c2410c" />
      <text x="10" y="18" fill="#ffffff" font-size="12" font-weight="bold">✓ Rio de Janeiro</text>

      <rect x="0" y="32" width="200" height="26" rx="5" fill="#f59e0b" />
      <text x="10" y="50" fill="#ffffff" font-size="12" font-weight="bold">✓ Salvador</text>

      <!-- Locked Silver -->
      <rect x="0" y="64" width="200" height="26" rx="5" fill="url(#silverGrad)" />
      <text x="10" y="82" fill="#111827" font-size="12" font-weight="bold">🔒 São Paulo</text>

      <rect x="0" y="96" width="200" height="26" rx="5" fill="url(#silverGrad)" />
      <text x="10" y="114" fill="#111827" font-size="12" font-weight="bold">🔒 Florianópolis</text>

      <rect x="0" y="128" width="200" height="26" rx="5" fill="url(#silverGrad)" />
      <text x="10" y="146" fill="#111827" font-size="12" font-weight="bold">🔒 Manaus</text>

      <rect x="0" y="160" width="200" height="26" rx="5" fill="url(#silverGrad)" />
      <text x="10" y="178" fill="#111827" font-size="12" font-weight="bold">🔒 Ouro Preto</text>

      <rect x="0" y="192" width="200" height="26" rx="5" fill="url(#silverGrad)" />
      <text x="10" y="210" fill="#111827" font-size="12" font-weight="bold">🔒 Gramado</text>

      <rect x="0" y="224" width="200" height="26" rx="5" fill="url(#silverGrad)" />
      <text x="10" y="242" fill="#111827" font-size="12" font-weight="bold">🔒 Brasília</text>
    </g>

    <!-- PONTOS TURÍSTICOS -->
    <rect x="0" y="510" width="240" height="340" rx="12" fill="#18202f" stroke="#1e293b" stroke-width="1" />
    <text x="20" y="538" fill="#38bdf8" font-size="14" font-weight="bold" letter-spacing="1">PONTOS TURÍSTICOS</text>

    <g transform="translate(20, 555)">
      <rect x="0" y="0" width="200" height="26" rx="5" fill="#047857" />
      <text x="10" y="18" fill="#ffffff" font-size="12" font-weight="bold">✓ Lençóis Maranhenses</text>

      <rect x="0" y="32" width="200" height="26" rx="5" fill="#0284c7" />
      <text x="10" y="50" fill="#ffffff" font-size="12" font-weight="bold">✓ Cataratas do Iguaçu</text>

      <rect x="0" y="64" width="200" height="26" rx="5" fill="url(#silverGrad)" />
      <text x="10" y="82" fill="#111827" font-size="12" font-weight="bold">🔒 Chapada Diamantina</text>

      <rect x="0" y="96" width="200" height="26" rx="5" fill="url(#silverGrad)" />
      <text x="10" y="114" fill="#111827" font-size="12" font-weight="bold">🔒 Bonito (MS)</text>

      <rect x="0" y="128" width="200" height="26" rx="5" fill="url(#silverGrad)" />
      <text x="10" y="146" fill="#111827" font-size="12" font-weight="bold">🔒 Jalapão (TO)</text>

      <rect x="0" y="160" width="200" height="26" rx="5" fill="url(#silverGrad)" />
      <text x="10" y="178" fill="#111827" font-size="12" font-weight="bold">🔒 Inhotim (MG)</text>

      <rect x="0" y="192" width="200" height="26" rx="5" fill="url(#silverGrad)" />
      <text x="10" y="210" fill="#111827" font-size="12" font-weight="bold">🔒 Monte Roraima</text>

      <rect x="0" y="224" width="200" height="26" rx="5" fill="url(#silverGrad)" />
      <text x="10" y="242" fill="#111827" font-size="12" font-weight="bold">🔒 Chapada dos Veadeiros</text>
    </g>
  </g>

  <!-- CENTRAL MAP OF BRAZIL -->
  <g transform="translate(320, 810)">
    <!-- Stylized Brazil Map Shapes -->

    <!-- NORTH REGION -->
    <!-- Amazonas (Unlocked: Green) -->
    <path d="M 40 180 L 120 120 L 180 140 L 220 220 L 160 290 L 80 270 L 20 220 Z" fill="url(#greenRegion)" stroke="#1e293b" stroke-width="2" />
    <text x="105" y="210" fill="#ffffff" font-size="14" font-weight="bold">AM</text>
    <text x="105" y="228" fill="#d1fae5" font-size="11">Amazonas</text>

    <!-- Pará (Locked: Scratch-off Silver) -->
    <path d="M 180 140 L 290 100 L 330 180 L 280 270 L 220 220 Z" fill="url(#silverGrad)" stroke="#374151" stroke-width="2" />
    <text x="250" y="180" fill="#111827" font-size="14" font-weight="bold">PA</text>
    <text x="250" y="198" fill="#374151" font-size="11">Pará</text>

    <!-- Acre, Roraima, Amapá, Rondônia, Tocantins (Locked) -->
    <path d="M 0 220 L 40 180 L 50 250 L 0 240 Z" fill="url(#silverGrad)" stroke="#374151" stroke-width="1.5" />
    <text x="18" y="235" fill="#111827" font-size="10" font-weight="bold">AC</text>

    <path d="M 100 80 L 160 70 L 150 130 L 90 110 Z" fill="url(#silverGrad)" stroke="#374151" stroke-width="1.5" />
    <text x="118" y="105" fill="#111827" font-size="10" font-weight="bold">RR</text>

    <path d="M 270 50 L 310 60 L 290 110 L 260 90 Z" fill="url(#silverGrad)" stroke="#374151" stroke-width="1.5" />
    <text x="278" y="85" fill="#111827" font-size="10" font-weight="bold">AP</text>

    <path d="M 60 270 L 120 270 L 100 340 L 50 310 Z" fill="url(#silverGrad)" stroke="#374151" stroke-width="1.5" />
    <text x="75" y="305" fill="#111827" font-size="10" font-weight="bold">RO</text>

    <path d="M 270 250 L 310 240 L 300 370 L 260 340 Z" fill="url(#silverGrad)" stroke="#374151" stroke-width="1.5" />
    <text x="275" y="300" fill="#111827" font-size="11" font-weight="bold">TO</text>

    <!-- NORTHEAST REGION -->
    <!-- Maranhão (Unlocked: Red/Coral) -->
    <path d="M 310 160 L 370 140 L 390 220 L 320 240 Z" fill="url(#redRegion)" stroke="#1e293b" stroke-width="2" />
    <text x="340" y="190" fill="#ffffff" font-size="12" font-weight="bold">MA</text>

    <!-- Ceará (Locked) -->
    <path d="M 370 140 L 430 150 L 410 200 L 380 190 Z" fill="url(#silverGrad)" stroke="#374151" stroke-width="1.5" />
    <text x="390" y="172" fill="#111827" font-size="11" font-weight="bold">CE</text>

    <!-- RN, PB, PE (PE Unlocked), AL, SE -->
    <path d="M 430 150 L 465 160 L 440 185 L 415 175 Z" fill="url(#silverGrad)" stroke="#374151" stroke-width="1.5" />
    <text x="435" y="170" fill="#111827" font-size="9" font-weight="bold">RN</text>

    <path d="M 418 185 L 465 180 L 460 205 L 420 200 Z" fill="url(#silverGrad)" stroke="#374151" stroke-width="1.5" />
    <text x="435" y="196" fill="#111827" font-size="9" font-weight="bold">PB</text>

    <!-- Pernambuco (Unlocked) -->
    <path d="M 390 205 L 465 205 L 450 230 L 380 220 Z" fill="url(#redRegion)" stroke="#1e293b" stroke-width="2" />
    <text x="415" y="222" fill="#ffffff" font-size="10" font-weight="bold">PE ✓</text>

    <!-- Bahia (Unlocked) -->
    <path d="M 320 240 L 420 230 L 440 370 L 350 400 L 310 320 Z" fill="url(#redRegion)" stroke="#1e293b" stroke-width="2" />
    <text x="370" y="310" fill="#ffffff" font-size="16" font-weight="bold">BA</text>
    <text x="370" y="328" fill="#fee2e2" font-size="12">Bahia ✓</text>

    <!-- Piauí, Alagoas, Sergipe (Locked) -->
    <path d="M 330 200 L 380 190 L 380 260 L 330 250 Z" fill="url(#silverGrad)" stroke="#374151" stroke-width="1.5" />
    <text x="345" y="230" fill="#111827" font-size="10" font-weight="bold">PI</text>

    <!-- CENTER-WEST REGION -->
    <!-- Mato Grosso (Locked) -->
    <path d="M 120 270 L 240 250 L 260 410 L 160 430 L 110 350 Z" fill="url(#silverGrad)" stroke="#374151" stroke-width="2" />
    <text x="180" y="340" fill="#111827" font-size="14" font-weight="bold">MT</text>
    <text x="180" y="358" fill="#374151" font-size="11">Mato Grosso</text>

    <!-- Goiás & DF (Locked) -->
    <path d="M 240 340 L 320 320 L 310 440 L 250 430 Z" fill="url(#silverGrad)" stroke="#374151" stroke-width="2" />
    <text x="270" y="380" fill="#111827" font-size="13" font-weight="bold">GO</text>
    <circle cx="295" cy="370" r="5" fill="#facc15" />
    <text x="305" y="374" fill="#111827" font-size="9" font-weight="bold">DF</text>

    <!-- Mato Grosso do Sul (Locked) -->
    <path d="M 160 430 L 240 430 L 230 540 L 170 520 Z" fill="url(#silverGrad)" stroke="#374151" stroke-width="2" />
    <text x="190" y="480" fill="#111827" font-size="12" font-weight="bold">MS</text>

    <!-- SOUTHEAST REGION -->
    <!-- Minas Gerais (Locked) -->
    <path d="M 280 410 L 370 390 L 400 480 L 330 520 L 270 470 Z" fill="url(#silverGrad)" stroke="#374151" stroke-width="2" />
    <text x="330" y="455" fill="#111827" font-size="14" font-weight="bold">MG</text>
    <text x="330" y="473" fill="#374151" font-size="11">Minas Gerais</text>

    <!-- Espírito Santo (Locked) -->
    <path d="M 390 440 L 420 445 L 410 495 L 385 485 Z" fill="url(#silverGrad)" stroke="#374151" stroke-width="1.5" />
    <text x="395" y="470" fill="#111827" font-size="9" font-weight="bold">ES</text>

    <!-- Rio de Janeiro (Unlocked: Orange) -->
    <path d="M 345 500 L 405 490 L 390 530 L 340 520 Z" fill="url(#orangeRegion)" stroke="#1e293b" stroke-width="2" />
    <text x="365" y="515" fill="#ffffff" font-size="11" font-weight="bold">RJ ✓</text>

    <!-- São Paulo (Locked) -->
    <path d="M 230 490 L 335 480 L 330 560 L 240 560 Z" fill="url(#silverGrad)" stroke="#374151" stroke-width="2" />
    <text x="275" y="525" fill="#111827" font-size="13" font-weight="bold">SP</text>
    <text x="275" y="542" fill="#374151" font-size="11">São Paulo</text>

    <!-- SOUTH REGION -->
    <!-- Paraná (Unlocked: Cyan/Blue) -->
    <path d="M 220 560 L 310 560 L 290 625 L 210 610 Z" fill="url(#blueRegion)" stroke="#1e293b" stroke-width="2" />
    <text x="250" y="595" fill="#ffffff" font-size="12" font-weight="bold">PR ✓</text>

    <!-- Santa Catarina (Locked) -->
    <path d="M 215 615 L 285 625 L 275 675 L 210 660 Z" fill="url(#silverGrad)" stroke="#374151" stroke-width="2" />
    <text x="240" y="645" fill="#111827" font-size="11" font-weight="bold">SC</text>

    <!-- Rio Grande do Sul (Locked) -->
    <path d="M 200 665 L 270 675 L 250 760 L 180 730 Z" fill="url(#silverGrad)" stroke="#374151" stroke-width="2" />
    <text x="215" y="715" fill="#111827" font-size="12" font-weight="bold">RS</text>

    <!-- CALLOUT PINS TO UNLOCKED POINTS -->
    <!-- Pin Fernando de Noronha -->
    <circle cx="490" cy="180" r="6" fill="#38bdf8" stroke="#ffffff" stroke-width="2" />
    <line x1="490" y1="180" x2="520" y2="150" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4,4" />

    <!-- Pin Lençóis -->
    <circle cx="360" cy="160" r="6" fill="#10b981" stroke="#ffffff" stroke-width="2" />

    <!-- Pin Cristo Redentor -->
    <circle cx="380" cy="510" r="6" fill="#f97316" stroke="#ffffff" stroke-width="2" />
    
    <!-- Pin Cataratas do Iguaçu -->
    <circle cx="225" cy="600" r="6" fill="#06b6d4" stroke="#ffffff" stroke-width="2" />
  </g>

  <!-- Right Sidebar inside Map: PRINCIPAIS PRAIAS (Callout Tags) -->
  <g transform="translate(790, 810)">
    <rect x="0" y="0" width="230" height="840" rx="12" fill="#18202f" stroke="#1e293b" stroke-width="1" />
    <text x="18" y="28" fill="#38bdf8" font-size="14" font-weight="bold" letter-spacing="1">PRINCIPAIS PRAIAS</text>
    
    <g transform="translate(15, 45)">
      <!-- Unlocked Beach 1 -->
      <rect x="0" y="0" width="200" height="34" rx="6" fill="#047857" />
      <text x="10" y="22" fill="#ffffff" font-size="11" font-weight="bold">✓ Baía do Sancho (PE)</text>

      <!-- Unlocked Beach 2 -->
      <rect x="0" y="42" width="200" height="34" rx="6" fill="#c2410c" />
      <text x="10" y="64" fill="#ffffff" font-size="11" font-weight="bold">✓ Copacabana &amp; Ipanema (RJ)</text>

      <!-- Locked Beaches -->
      <rect x="0" y="84" width="200" height="34" rx="6" fill="url(#silverGrad)" />
      <text x="10" y="106" fill="#111827" font-size="11" font-weight="bold">🔒 Jericoacoara (CE)</text>

      <rect x="0" y="126" width="200" height="34" rx="6" fill="url(#silverGrad)" />
      <text x="10" y="148" fill="#111827" font-size="11" font-weight="bold">🔒 Praia do Espelho (BA)</text>

      <rect x="0" y="168" width="200" height="34" rx="6" fill="url(#silverGrad)" />
      <text x="10" y="190" fill="#111827" font-size="11" font-weight="bold">🔒 Praia dos Carneiros (PE)</text>

      <rect x="0" y="210" width="200" height="34" rx="6" fill="url(#silverGrad)" />
      <text x="10" y="232" fill="#111827" font-size="11" font-weight="bold">🔒 Pipa (RN)</text>

      <rect x="0" y="252" width="200" height="34" rx="6" fill="url(#silverGrad)" />
      <text x="10" y="274" fill="#111827" font-size="11" font-weight="bold">🔒 Maragogi (AL)</text>

      <rect x="0" y="294" width="200" height="34" rx="6" fill="url(#silverGrad)" />
      <text x="10" y="316" fill="#111827" font-size="11" font-weight="bold">🔒 Taipu de Fora (BA)</text>

      <rect x="0" y="336" width="200" height="34" rx="6" fill="url(#silverGrad)" />
      <text x="10" y="358" fill="#111827" font-size="11" font-weight="bold">🔒 Arraial do Cabo (RJ)</text>

      <rect x="0" y="378" width="200" height="34" rx="6" fill="url(#silverGrad)" />
      <text x="10" y="400" fill="#111827" font-size="11" font-weight="bold">🔒 Ilhabela (SP)</text>

      <rect x="0" y="420" width="200" height="34" rx="6" fill="url(#silverGrad)" />
      <text x="10" y="442" fill="#111827" font-size="11" font-weight="bold">🔒 Guarda do Embaú (SC)</text>

      <rect x="0" y="462" width="200" height="34" rx="6" fill="url(#silverGrad)" />
      <text x="10" y="484" fill="#111827" font-size="11" font-weight="bold">🔒 Praia do Rosa (SC)</text>

      <rect x="0" y="504" width="200" height="34" rx="6" fill="url(#silverGrad)" />
      <text x="10" y="526" fill="#111827" font-size="11" font-weight="bold">🔒 Ilha do Mel (PR)</text>

      <rect x="0" y="546" width="200" height="34" rx="6" fill="url(#silverGrad)" />
      <text x="10" y="568" fill="#111827" font-size="11" font-weight="bold">🔒 Morro de São Paulo (BA)</text>

      <rect x="0" y="588" width="200" height="34" rx="6" fill="url(#silverGrad)" />
      <text x="10" y="610" fill="#111827" font-size="11" font-weight="bold">🔒 Canoa Quebrada (CE)</text>

      <rect x="0" y="630" width="200" height="34" rx="6" fill="url(#silverGrad)" />
      <text x="10" y="652" fill="#111827" font-size="11" font-weight="bold">🔒 Torres (RS)</text>

      <rect x="0" y="672" width="200" height="34" rx="6" fill="url(#silverGrad)" />
      <text x="10" y="694" fill="#111827" font-size="11" font-weight="bold">🔒 Ponta Negra (RN)</text>

      <rect x="0" y="714" width="200" height="34" rx="6" fill="url(#silverGrad)" />
      <text x="10" y="736" fill="#111827" font-size="11" font-weight="bold">🔒 Praia dos Carneiros (PE)</text>
    </g>
  </g>

  <!-- BOTTOM BAR: STATE FLAGS (Unlocked colored, Locked silver) -->
  <g transform="translate(60, 1690)">
    <rect x="0" y="0" width="960" height="80" rx="10" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
    <text x="15" y="24" fill="#94a3b8" font-size="12" font-weight="bold" letter-spacing="1">BANDEIRAS DOS ESTADOS (RASPADINHA):</text>
    
    <!-- Flag chips row -->
    <g transform="translate(15, 34)">
      <!-- Unlocked flags -->
      <rect x="0" y="0" width="31" height="30" rx="4" fill="#10b981" /><text x="8" y="20" fill="#ffffff" font-size="10" font-weight="bold">AM</text>
      <rect x="35" y="0" width="31" height="30" rx="4" fill="#ef4444" /><text x="43" y="20" fill="#ffffff" font-size="10" font-weight="bold">BA</text>
      <rect x="70" y="0" width="31" height="30" rx="4" fill="#ef4444" /><text x="78" y="20" fill="#ffffff" font-size="10" font-weight="bold">MA</text>
      <rect x="105" y="0" width="31" height="30" rx="4" fill="#ef4444" /><text x="113" y="20" fill="#ffffff" font-size="10" font-weight="bold">PE</text>
      <rect x="140" y="0" width="31" height="30" rx="4" fill="#f97316" /><text x="148" y="20" fill="#ffffff" font-size="10" font-weight="bold">RJ</text>
      <rect x="175" y="0" width="31" height="30" rx="4" fill="#06b6d4" /><text x="183" y="20" fill="#ffffff" font-size="10" font-weight="bold">PR</text>

      <!-- Locked flags (Silver Scratch-off) -->
      <g fill="url(#silverGrad)">
        <rect x="210" y="0" width="31" height="30" rx="4" />
        <rect x="245" y="0" width="31" height="30" rx="4" />
        <rect x="280" y="0" width="31" height="30" rx="4" />
        <rect x="315" y="0" width="31" height="30" rx="4" />
        <rect x="350" y="0" width="31" height="30" rx="4" />
        <rect x="385" y="0" width="31" height="30" rx="4" />
        <rect x="420" y="0" width="31" height="30" rx="4" />
        <rect x="455" y="0" width="31" height="30" rx="4" />
        <rect x="490" y="0" width="31" height="30" rx="4" />
        <rect x="525" y="0" width="31" height="30" rx="4" />
        <rect x="560" y="0" width="31" height="30" rx="4" />
        <rect x="595" y="0" width="31" height="30" rx="4" />
        <rect x="630" y="0" width="31" height="30" rx="4" />
        <rect x="665" y="0" width="31" height="30" rx="4" />
        <rect x="700" y="0" width="31" height="30" rx="4" />
        <rect x="735" y="0" width="31" height="30" rx="4" />
        <rect x="770" y="0" width="31" height="30" rx="4" />
        <rect x="805" y="0" width="31" height="30" rx="4" />
        <rect x="840" y="0" width="31" height="30" rx="4" />
        <rect x="875" y="0" width="31" height="30" rx="4" />
      </g>
    </g>
  </g>

  <!-- ========================================== -->
  <!-- MODAL DIALOG PREVIEW OVERLAY (ON CLICK)    -->
  <!-- ========================================== -->
  <g transform="translate(250, 1020)" filter="url(#shadow)">
    <!-- Backdrop Dimmer simulation -->
    <rect x="-250" y="-1020" width="1080" height="1920" fill="#000000" opacity="0.45" />

    <!-- Dialog Box -->
    <rect x="0" y="0" width="580" height="420" rx="16" fill="#1e293b" stroke="#38bdf8" stroke-width="2" />
    
    <!-- Modal Header -->
    <rect x="0" y="0" width="580" height="70" rx="16" fill="#0f172a" />
    <circle cx="36" cy="35" r="14" fill="#38bdf8" />
    <text x="31" y="40" fill="#0f172a" font-size="16" font-weight="bold">✦</text>
    <text x="65" y="42" fill="#f8fafc" font-size="20" font-weight="bold">Desbloquear Destino: Ceará (CE)?</text>
    <text x="540" y="42" fill="#94a3b8" font-size="20" font-weight="bold">✕</text>

    <!-- Modal Body -->
    <text x="35" y="110" fill="#cbd5e1" font-size="16">Você visitou este estado ou ponto turístico recentemente?</text>
    <text x="35" y="135" fill="#94a3b8" font-size="14">Ao confirmar, o estado deixará de ser cinza e exibirá sua cor oficial!</text>

    <!-- Upload Photo Dropzone in Modal -->
    <rect x="35" y="160" width="510" height="150" rx="12" fill="#0f172a" stroke="#475569" stroke-dasharray="6,6" stroke-width="2" />
    <circle cx="290" cy="215" r="24" fill="#334155" />
    <text x="290" y="222" fill="#38bdf8" font-size="20" text-anchor="middle">📷</text>
    <text x="290" y="260" fill="#f8fafc" font-size="15" font-weight="bold" text-anchor="middle">Clique ou arraste uma foto da sua viagem</text>
    <text x="290" y="285" fill="#64748b" font-size="13" text-anchor="middle">Formatos aceitos: JPG, PNG, WEBP (Aparecerá no Slideshow superior)</text>

    <!-- Modal Action Buttons -->
    <rect x="35" y="340" width="240" height="48" rx="10" fill="#334155" />
    <text x="155" y="370" fill="#f8fafc" font-size="15" font-weight="bold" text-anchor="middle">Cancelar</text>

    <rect x="305" y="340" width="240" height="48" rx="10" fill="#0284c7" />
    <text x="425" y="370" fill="#ffffff" font-size="15" font-weight="bold" text-anchor="middle">✓ Confirmar e Liberar</text>
  </g>

  <!-- Watermark / Footer note -->
  <text x="540" y="1890" fill="#64748b" font-size="13" text-anchor="middle">Layout planejado para Monitor Vertical (1080x1920) • Slideshow no Topo + Mapa Interativo na Base</text>
</svg>
"""
    with open("ui-mockup.svg", "w", encoding="utf-8") as f:
        f.write(svg_content)
    print("Generated ui-mockup.svg successfully.")

def generate_png():
    # Render a high quality raster image using PIL
    width = 1080
    height = 1920
    im = Image.new("RGB", (width, height), "#0f141c")
    draw = ImageDraw.Draw(im)

    try:
        font_huge = ImageFont.truetype("arialbd.ttf", 32)
        font_large = ImageFont.truetype("arialbd.ttf", 24)
        font_medium = ImageFont.truetype("arialbd.ttf", 18)
        font_regular = ImageFont.truetype("arial.ttf", 16)
        font_small = ImageFont.truetype("arial.ttf", 13)
        font_small_bold = ImageFont.truetype("arialbd.ttf", 13)
    except IOError:
        font_huge = ImageFont.load_default()
        font_large = ImageFont.load_default()
        font_medium = ImageFont.load_default()
        font_regular = ImageFont.load_default()
        font_small = ImageFont.load_default()
        font_small_bold = ImageFont.load_default()

    # Top Section Card: Slideshow
    draw.rounded_rectangle([24, 24, 1056, 654], radius=20, fill="#131b29", outline="#1e293b", width=2)
    draw.ellipse([60, 52, 76, 68], fill="#10b981")
    draw.text((86, 52), "TRAVEL MEMORIES • MEMÓRIAS DE VIAGEM", fill="#94a3b8", font=font_small_bold)
    draw.text((60, 85), "Slideshow das Viagens Desbloqueadas", fill="#f8fafc", font=font_huge)
    
    # Progress counter tag top right
    draw.rounded_rectangle([790, 48, 1010, 88], radius=20, fill="#1e293b", outline="#334155", width=1)
    draw.text((820, 58), "5 Destinos Registrados", fill="#38bdf8", font=font_medium)

    # Hero Photo Card
    draw.rounded_rectangle([60, 150, 680, 570], radius=16, fill="#1e293b", outline="#334155", width=1)
    # Photo image simulation
    draw.rounded_rectangle([72, 162, 668, 480], radius=12, fill="#0369a1")
    # Sun / mountain simulation
    draw.ellipse([540, 200, 620, 280], fill="#fbbf24")
    draw.polygon([(72, 480), (220, 360), (400, 480)], fill="#047857")
    draw.polygon([(300, 480), (480, 340), (668, 480)], fill="#0284c7")
    
    # Photo Badge
    draw.rounded_rectangle([90, 180, 320, 216], radius=6, fill="#000000")
    draw.text((105, 190), "DESTINO DESBLOQUEADO", fill="#34d399", font=font_small_bold)

    # Caption
    draw.text((85, 498), "Praia do Sancho - Fernando de Noronha, PE", fill="#f8fafc", font=font_large)
    draw.text((85, 532), "Viagem realizada em Outubro/2026 - Foto por Lucas & Familia", fill="#94a3b8", font=font_small)

    # Thumbnails strip
    thumb_titles = [
        ("Lencois Maranhenses", "Maranhao - 3 fotos", "#047857", True),
        ("Cristo Redentor", "Rio de Janeiro - 2 fotos", "#c2410c", False),
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

    # Bottom Section Card: Brazil Scratch Map
    draw.rounded_rectangle([24, 680, 1056, 1895], radius=20, fill="#12161f", outline="#1e293b", width=2)
    draw.text((60, 715), "MAPA DO BRASIL - ESTILO RASPAGEM", fill="#f8fafc", font=font_huge)
    draw.text((60, 760), "Interativo: Clique no estado ou ponto turistico para desbloquear e colorir", fill="#94a3b8", font=font_regular)
    
    draw.rounded_rectangle([730, 715, 1010, 765], radius=12, fill="#1e293b", outline="#334155", width=1)
    draw.text((750, 730), "Progresso: 5 / 27 (18%)", fill="#f8fafc", font=font_medium)

    # Left Column: List of Categories
    draw.rounded_rectangle([60, 810, 300, 940], radius=12, fill="#18202f", outline="#1e293b", width=1)
    draw.text((80, 830), "ILHAS", fill="#38bdf8", font=font_medium)
    draw.rounded_rectangle([80, 860, 280, 890], radius=6, fill="#047857")
    draw.text((90, 870), "[v] Fernando de Noronha", fill="#ffffff", font=font_small_bold)
    draw.rounded_rectangle([80, 898, 280, 928], radius=6, fill="#9ca3af")
    draw.text((90, 908), "[ ] Ilha Grande (RJ)", fill="#111827", font=font_small_bold)

    draw.rounded_rectangle([60, 960, 300, 1310], radius=12, fill="#18202f", outline="#1e293b", width=1)
    draw.text((80, 980), "CIDADES FAMOSAS", fill="#38bdf8", font=font_medium)
    cities = [
        ("[v] Rio de Janeiro", "#c2410c", "#ffffff"),
        ("[v] Salvador", "#f59e0b", "#ffffff"),
        ("[ ] Sao Paulo", "#9ca3af", "#111827"),
        ("[ ] Florianopolis", "#9ca3af", "#111827"),
        ("[ ] Manaus", "#9ca3af", "#111827"),
        ("[ ] Ouro Preto", "#9ca3af", "#111827"),
        ("[ ] Gramado", "#9ca3af", "#111827"),
        ("[ ] Brasilia", "#9ca3af", "#111827"),
    ]
    for i, (name, bg, fg) in enumerate(cities):
        cy = 1010 + i * 36
        draw.rounded_rectangle([80, cy, 280, cy + 30], radius=5, fill=bg)
        draw.text((90, cy + 7), name, fill=fg, font=font_small_bold)

    draw.rounded_rectangle([60, 1330, 300, 1680], radius=12, fill="#18202f", outline="#1e293b", width=1)
    draw.text((80, 1350), "PONTOS TURISTICOS", fill="#38bdf8", font=font_medium)
    spots = [
        ("[v] Lencois Maranhenses", "#047857", "#ffffff"),
        ("[v] Cataratas do Iguacu", "#0284c7", "#ffffff"),
        ("[ ] Chapada Diamantina", "#9ca3af", "#111827"),
        ("[ ] Bonito (MS)", "#9ca3af", "#111827"),
        ("[ ] Jalapao (TO)", "#9ca3af", "#111827"),
        ("[ ] Inhotim (MG)", "#9ca3af", "#111827"),
        ("[ ] Monte Roraima", "#9ca3af", "#111827"),
        ("[ ] Chapada dos Veadeiros", "#9ca3af", "#111827"),
    ]
    for i, (name, bg, fg) in enumerate(spots):
        sy = 1380 + i * 36
        draw.rounded_rectangle([80, sy, 280, sy + 30], radius=5, fill=bg)
        draw.text((90, sy + 7), name, fill=fg, font=font_small_bold)

    # Stylized Brazil Map in center
    # Draw states outline / polygons
    # Unlocked Amazonas (Green)
    draw.polygon([(360, 990), (440, 930), (500, 950), (540, 1030), (480, 1100), (400, 1080)], fill="#059669", outline="#1e293b", width=2)
    draw.text((430, 1010), "AM [v]", fill="#ffffff", font=font_medium)
    draw.text((415, 1032), "Amazonas", fill="#d1fae5", font=font_small)

    # Para (Locked Silver)
    draw.polygon([(500, 950), (610, 910), (650, 990), (600, 1080), (540, 1030)], fill="#9ca3af", outline="#374151", width=2)
    draw.text((560, 990), "PA", fill="#111827", font=font_medium)

    # Maranhao (Unlocked Red)
    draw.polygon([(630, 970), (690, 950), (710, 1030), (640, 1050)], fill="#dc2626", outline="#1e293b", width=2)
    draw.text((655, 995), "MA [v]", fill="#ffffff", font=font_small_bold)

    # Bahia (Unlocked Red/Coral)
    draw.polygon([(640, 1050), (740, 1040), (760, 1180), (670, 1210), (630, 1130)], fill="#ef4444", outline="#1e293b", width=2)
    draw.text((680, 1110), "BA [v]", fill="#ffffff", font=font_large)
    draw.text((670, 1138), "Bahia", fill="#fee2e2", font=font_small)

    # Mato Grosso (Locked Silver)
    draw.polygon([(440, 1080), (560, 1060), (580, 1220), (480, 1240), (430, 1160)], fill="#9ca3af", outline="#374151", width=2)
    draw.text((490, 1140), "MT", fill="#111827", font=font_large)

    # Goias & DF (Locked Silver)
    draw.polygon([(560, 1150), (640, 1130), (630, 1250), (570, 1240)], fill="#9ca3af", outline="#374151", width=2)
    draw.text((585, 1185), "GO", fill="#111827", font=font_medium)

    # Minas Gerais (Locked Silver)
    draw.polygon([(600, 1220), (690, 1200), (720, 1290), (650, 1330), (590, 1280)], fill="#9ca3af", outline="#374151", width=2)
    draw.text((640, 1260), "MG", fill="#111827", font=font_large)

    # Rio de Janeiro (Unlocked Orange)
    draw.polygon([(665, 1310), (725, 1300), (710, 1340), (660, 1330)], fill="#f97316", outline="#1e293b", width=2)
    draw.text((675, 1315), "RJ [v]", fill="#ffffff", font=font_small_bold)

    # Sao Paulo (Locked Silver)
    draw.polygon([(550, 1300), (655, 1290), (650, 1370), (560, 1370)], fill="#9ca3af", outline="#374151", width=2)
    draw.text((595, 1325), "SP", fill="#111827", font=font_medium)

    # Parana (Unlocked Cyan)
    draw.polygon([(540, 1370), (630, 1370), (610, 1435), (530, 1420)], fill="#06b6d4", outline="#1e293b", width=2)
    draw.text((565, 1395), "PR [v]", fill="#ffffff", font=font_small_bold)

    # Santa Catarina & RS (Locked Silver)
    draw.polygon([(535, 1425), (605, 1435), (595, 1485), (530, 1470)], fill="#9ca3af", outline="#374151", width=2)
    draw.text((555, 1450), "SC", fill="#111827", font=font_small_bold)

    draw.polygon([(520, 1475), (590, 1485), (570, 1570), (500, 1540)], fill="#9ca3af", outline="#374151", width=2)
    draw.text((535, 1515), "RS", fill="#111827", font=font_medium)

    # Right Column: PRINCIPAIS PRAIAS
    draw.rounded_rectangle([780, 810, 1020, 1680], radius=12, fill="#18202f", outline="#1e293b", width=1)
    draw.text((800, 830), "PRINCIPAIS PRAIAS", fill="#38bdf8", font=font_medium)
    beaches = [
        ("[v] Baia do Sancho (PE)", "#047857", "#ffffff"),
        ("[v] Copacabana / Ipanema", "#c2410c", "#ffffff"),
        ("[ ] Jericoacoara (CE)", "#9ca3af", "#111827"),
        ("[ ] Praia do Espelho (BA)", "#9ca3af", "#111827"),
        ("[ ] Praia dos Carneiros", "#9ca3af", "#111827"),
        ("[ ] Pipa (RN)", "#9ca3af", "#111827"),
        ("[ ] Maragogi (AL)", "#9ca3af", "#111827"),
        ("[ ] Taipu de Fora (BA)", "#9ca3af", "#111827"),
        ("[ ] Arraial do Cabo (RJ)", "#9ca3af", "#111827"),
        ("[ ] Ilhabela (SP)", "#9ca3af", "#111827"),
        ("[ ] Guarda do Embau (SC)", "#9ca3af", "#111827"),
        ("[ ] Praia do Rosa (SC)", "#9ca3af", "#111827"),
        ("[ ] Ilha do Mel (PR)", "#9ca3af", "#111827"),
        ("[ ] Morro de SP (BA)", "#9ca3af", "#111827"),
        ("[ ] Canoa Quebrada (CE)", "#9ca3af", "#111827"),
        ("[ ] Torres (RS)", "#9ca3af", "#111827"),
        ("[ ] Ponta Negra (RN)", "#9ca3af", "#111827"),
    ]
    for i, (name, bg, fg) in enumerate(beaches):
        by = 865 + i * 47
        draw.rounded_rectangle([800, by, 1000, by + 40], radius=6, fill=bg)
        draw.text((810, by + 12), name, fill=fg, font=font_small_bold)

    # Bottom bar: Flags
    draw.rounded_rectangle([60, 1710, 1020, 1790], radius=10, fill="#0f172a", outline="#1e293b", width=1)
    draw.text((80, 1725), "BANDEIRAS DOS ESTADOS (RASPADINHA):", fill="#94a3b8", font=font_small_bold)
    flag_colors = ["#10b981", "#ef4444", "#ef4444", "#ef4444", "#f97316", "#06b6d4"] + ["#9ca3af"] * 20
    flag_names = ["AM", "BA", "MA", "PE", "RJ", "PR"] + [""] * 20
    for idx, (fc, fn) in enumerate(zip(flag_colors, flag_names)):
        fx = 80 + idx * 35
        if fx + 30 <= 1000:
            draw.rounded_rectangle([fx, 1745, fx + 30, 1775], radius=4, fill=fc)
            if fn:
                draw.text((fx + 5, 1752), fn, fill="#ffffff", font=font_small_bold)

    # Pop-up / Modal Simulation in bottom right/center
    draw.rounded_rectangle([250, 1140, 830, 1560], radius=16, fill="#1e293b", outline="#38bdf8", width=3)
    draw.rounded_rectangle([250, 1140, 830, 1210], radius=16, fill="#0f172a")
    draw.ellipse([275, 1162, 305, 1192], fill="#38bdf8")
    draw.text((320, 1165), "Desbloquear Destino: Ceara (CE)?", fill="#f8fafc", font=font_large)
    draw.text((790, 1165), "X", fill="#94a3b8", font=font_large)

    draw.text((280, 1230), "Voce visitou este estado ou ponto turistico recentemente?", fill="#cbd5e1", font=font_medium)
    draw.text((280, 1260), "Ao confirmar, o mapa revelara a cor vibrante deste destino!", fill="#94a3b8", font=font_small)

    # Dropzone in modal
    draw.rounded_rectangle([280, 1295, 800, 1435], radius=12, fill="#0f172a", outline="#475569", width=2)
    draw.text((390, 1340), "[Foto] Clique ou arraste uma foto da viagem", fill="#f8fafc", font=font_medium)
    draw.text((410, 1375), "Formatos: JPG, PNG, WEBP (ira para o Slideshow)", fill="#64748b", font=font_small)

    # Buttons
    draw.rounded_rectangle([280, 1465, 520, 1520], radius=10, fill="#334155")
    draw.text((365, 1485), "Cancelar", fill="#f8fafc", font=font_medium)

    draw.rounded_rectangle([550, 1465, 800, 1520], radius=10, fill="#0284c7")
    draw.text((585, 1485), "[OK] Confirmar & Liberar", fill="#ffffff", font=font_medium)

    # Footer label
    draw.text((260, 1860), "Layout Portrait (Monitor em Pe 1080x1920) - Slideshow no Topo + Mapa Interativo na Base", fill="#64748b", font=font_small)

    im.save("ui-mockup.png", quality=95)
    print("Generated ui-mockup.png successfully.")

if __name__ == "__main__":
    generate_svg()
    generate_png()

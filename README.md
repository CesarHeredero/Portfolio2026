# Portfolio2026 — César Heredero Herranz

Portfolio profesional de César Heredero, Senior Product Owner & UX Strategist.
Web pública en **cesarheredero.com** · Panel de gestión en **cesarheredero.com/admin**

---

## ¿Qué es este proyecto?

Portfolio personal con panel de administración propio (intranet) para gestionar todo el contenido desde el navegador, sin tocar código. Incluye:

- Web pública bilingüe (español / inglés)
- Admin con 7 secciones de contenido editables
- Generador de casos de estudio con IA (Claude)
- CV en PDF generado automáticamente desde los datos del portfolio
- Traducción automática ES→EN en los campos del admin

**Coste total: 0 €/mes** (VPS propio, sin servicios de pago)

---

## Stack técnico

| Tecnología | Uso |
|---|---|
| Next.js 15 (App Router) | Framework principal, SSG + ISR |
| React 19 + TypeScript strict | UI y lógica |
| next-intl | Internacionalización (ES/EN) |
| CSS custom properties | Estilos (sin Tailwind), dark mode, 5 colores |
| `content/*.json` | "Base de datos" del contenido |
| `content/cases/*.mdx` | Contenido largo de cada caso |
| @react-pdf/renderer | Generación de CV en PDF |
| @anthropic-ai/sdk | IA para generar casos (Claude Sonnet 5) |
| MyMemory API | Traducción automática ES→EN (gratis) |
| Docker + docker compose | Contenedor en VPS |
| Nginx Proxy Manager | SSL, proxy reverso |

**No hay base de datos externa.** Todo el contenido vive en archivos JSON/MDX dentro de `content/`.

---

## Estructura clave del proyecto

```
Portfolio2026/
├── content/                    ← "Base de datos" del portfolio
│   ├── site.json               ← Todos los textos editables (hero, nav, about, etc.)
│   ├── cv.json                 ← Experiencia, habilidades, formación
│   ├── cases.json              ← Lista de casos (metadatos)
│   ├── cases/                  ← Contenido MDX de cada caso (ES + EN)
│   ├── profile.es.mdx          ← Bio larga en español
│   └── profile.en.mdx          ← Bio larga en inglés
│
├── messages/                   ← Traducciones base (textos por defecto)
│   ├── es.json
│   └── en.json
│
├── src/
│   ├── app/
│   │   ├── [locale]/           ← Páginas públicas (/es y /en)
│   │   │   ├── layout.tsx      ← Layout con Nav y StatusBar
│   │   │   ├── page.tsx        ← Home (todas las secciones)
│   │   │   └── trabajo/[slug]  ← Detalle de cada caso
│   │   ├── admin/              ← Panel de administración
│   │   │   ├── page.tsx        ← App del admin (sin next-intl)
│   │   │   └── login/          ← Login del admin
│   │   └── api/
│   │       ├── admin/
│   │       │   ├── site/       ← PUT/GET de site.json
│   │       │   ├── cases/      ← CRUD de casos
│   │       │   ├── cv/         ← GET/PUT de cv.json
│   │       │   ├── translate/  ← POST → MyMemory API
│   │       │   └── ai/generate-case/ ← POST → Claude API
│   │       └── cv/pdf/         ← GET → genera PDF del CV
│   │
│   ├── components/
│   │   ├── nav.tsx             ← Navbar con tema, acento, idioma
│   │   ├── hero.tsx            ← Sección principal
│   │   ├── bento-grid.tsx      ← Grid de métricas
│   │   ├── about-section.tsx   ← Sección "Sobre mí"
│   │   ├── process-section.tsx ← Hasta 8 pasos, filtra vacíos
│   │   ├── cv-section.tsx      ← CV con experiencia, skills, formación
│   │   ├── contact-section.tsx ← Contacto (email, LinkedIn, cal, CV PDF)
│   │   └── admin/sections/
│   │       ├── profile.tsx     ← 7 tabs editables (Hero, Bento, Sobre mí, Proceso, CV, Contacto, Footer)
│   │       ├── cases.tsx       ← Listado + editor + botón IA
│   │       └── case-wizard.tsx ← Wizard de 3 pasos con Claude
│   │
│   ├── lib/
│   │   ├── content.ts          ← Tipos TypeScript y datos estáticos de casos
│   │   └── cv-pdf.tsx          ← Componente React PDF (solo servidor)
│   │
│   └── i18n/
│       └── request.ts          ← Carga mensajes + sobreescribe con site.json
│
├── .env                        ← Variables de entorno (NO está en git)
├── .env.example                ← Plantilla de variables
├── CLAUDE.md                   ← Instrucciones para el asistente IA
└── docker-compose.yml          ← Config Docker para el VPS
```

---

## Sistema de contenidos

### Cómo funciona

1. Los textos por defecto están en `messages/es.json` y `messages/en.json`
2. El admin guarda sobreescrituras en `content/site.json` (solo los campos modificados)
3. `src/i18n/request.ts` mezcla ambos en cada petición: base + sobreescrituras
4. Si un campo está vacío en `site.json`, se usa el texto por defecto de `messages/`
5. Después de cada guardado, se llama a `revalidatePath` para que la web se actualice

### Archivos de contenido

**`content/site.json`** — todos los textos del portfolio (hero, bento, about, process, contact, footer, statusBar). Si un campo está en blanco, se usa el valor por defecto del código.

**`content/cv.json`** — experiencia profesional, habilidades, formación. Editable desde admin → Perfil → CV.

**`content/cases.json`** — lista de todos los casos con metadatos (título, categoría, KPIs, PIA, etc.). Los casos con `"published": false` no aparecen en la web pública. Editable desde admin → Casos.

**`content/cases/*.mdx`** — contenido largo (contexto, problema, acción, impacto con markdown). Un archivo ES y otro EN por caso.

---

## Panel de administración

**URL**: `cesarheredero.com/admin`
**Credenciales**: usuario `cesar` / contraseña `flexicar2026`

### Secciones del admin

| Sección | Qué hace |
|---|---|
| Dashboard | Resumen de casos y estado |
| Casos | Listado, editor y generador con IA |
| Perfil | 7 tabs con todo el contenido editable |
| Analytics | Estadísticas (placeholder) |
| Configuración | Config general |

### Tabs de Perfil

1. **Hero** — cargo (sincroniza con el nav), pretítulo, título ES/EN, subtítulo ES/EN, botones, tarjeta de identidad. Botón "→ EN" para traducir automáticamente.
2. **Bento** — métricas del grid: rol, empresa, roles buscados, KPI, clientes, premio, capacidades.
3. **Sobre mí** — nombre, rol, bio ES/EN (con traducción automática), 4 cualidades.
4. **Proceso** — hasta 8 pasos. Los que dejes vacíos no se muestran en la web.
5. **CV** — experiencia profesional con botones "✕ Eliminar" y "+ Añadir experiencia".
6. **Contacto** — título, intro, email, LinkedIn, cal.com.
7. **Footer** — frase del footer.

### Generador de casos con IA

En admin → Casos → botón **"✨ Generar con IA"**:

1. Cuéntale el proyecto con palabras normales (título, empresa, rol, fecha, descripción libre)
2. Si la IA necesita más información (métricas, problema concreto) te pregunta exactamente qué le falta
3. Genera el caso completo en ES y EN: título, teaser, PIA, KPIs, categoría, tags
4. Revisas y editas antes de guardar. Puedes guardar como borrador o publicar directamente

**Requiere**: `ANTHROPIC_API_KEY` en el `.env` del VPS (ver sección de variables).

---

## CV en PDF

El botón "CV PDF" del hero y del contacto genera el PDF al momento desde los datos actuales del portfolio. No hay ningún archivo PDF estático. Si actualizas el CV en el admin, el PDF cambia automáticamente.

**Endpoint**: `GET /api/cv/pdf`

---

## VPS y despliegue

### Datos del servidor

- **IP**: 135.125.102.63
- **SO**: Debian 12 | Usuario: `debian`
- **Dominio**: cesarheredero.com → puerto 3000
- **Directorio**: `~/portfolio2026`

### ⚡ Actualizar el portfolio tras un push

```bash
cd ~/portfolio2026 && git pull origin claude/design-handoff-lAbGI && sudo docker compose up -d --build app
```

### Ver si está funcionando

```bash
sudo docker compose ps
```

### Ver errores si algo falla

```bash
sudo docker logs -f portfolio2026-app-1 --tail=50
```

### Si hay error 502 o la web no carga

```bash
free -h && sudo docker compose down && sudo docker compose up -d --build app
```

### Primer despliegue (si hay que hacerlo desde cero)

```bash
git clone https://github.com/CesarHeredero/Portfolio2026.git ~/portfolio2026
cd ~/portfolio2026
cp .env.example .env
nano .env
sudo docker compose up -d --build
```

---

## Variables de entorno (.env)

El archivo `.env` vive en `~/portfolio2026/.env` en el VPS y **no está en git**.

```env
# Anthropic — para el generador de casos con IA
# Obtener en: https://console.anthropic.com → API Keys
ANTHROPIC_API_KEY=sk-ant-...

# Admin — credenciales del panel /admin
ADMIN_USER=cesar
ADMIN_PASSWORD=flexicar2026

# Auth (si se usa magic link — opcional)
AUTH_SECRET=...
RESEND_API_KEY=...
AUTH_EMAIL_FROM=hola@cesarheredero.com

# GitHub (si se usa Git-as-CMS)
GITHUB_TOKEN=...
GITHUB_OWNER=CesarHeredero
GITHUB_REPO=Portfolio2026
GITHUB_BRANCH=main
```

---

## Rama git activa

La rama de desarrollo es `claude/design-handoff-lAbGI`. Todos los cambios van ahí. Cuando se quiera pasar a producción definitivamente, se hace merge a `main`.

---

## Estado actual del proyecto

### ✅ Funcionando

- Web pública bilingüe (ES/EN) con todas las secciones
- Nav con cargo correcto, tema claro/oscuro, 5 colores de acento, selector de idioma
- Hero, Bento, About, Process (hasta 8 pasos), CV, Contact, Footer
- Admin completo con 7 tabs de contenido editables
- Traducción automática ES→EN en todos los campos bilingües
- Generador de casos con IA (wizard de 3 pasos con Claude)
- CV en PDF generado al vuelo desde los datos del portfolio
- Publicar/despublicar casos desde el admin
- Añadir y eliminar entradas de experiencia en el CV

### ⚠️ Pendiente o por mejorar

- **Casos sin publicar**: los 8 casos tienen `published: false`. Ir a admin → Casos → publicar los que se quieran mostrar
- **Playground**: la sección muestra "Próximamente". O se rellena con algo real o se oculta
- **Formulario de contacto**: actualmente solo hay enlaces. Se podría añadir un formulario con Resend (gratis hasta 100 emails/día)
- **Foto/avatar**: no hay imagen personal en el portfolio
- **OG image dinámica**: la previsualización en LinkedIn/Slack usa la imagen por defecto de Next.js
- **Traducción del CV completo**: los campos `yearEn`, `roleEn`, `companyEn` y `descriptionEn` del CV no tienen botón "→ EN" en el admin
- **Despliegue automático**: cada push requiere ejecutar el comando de actualización manualmente en el VPS

---

## Reglas para el asistente IA (cómo trabajar en este proyecto)

1. **Siempre en español** — César no entiende el inglés
2. **Siempre incluir comandos VPS** al final de cada respuesta cuando se haga push, numerados y listos para copiar y pegar, sin explicaciones técnicas
3. **Sin servicios de pago** — el coste mensual debe ser 0 €. Sin Directus, sin Vercel Pro, sin bases de datos externas
4. **TypeScript strict** — sin `any`, sin errores de compilación
5. **CSS custom properties** — sin Tailwind, sin librerías de componentes externas
6. **El contenido está en `/content/`** — los JSONs son la "base de datos"
7. **Rama activa**: `claude/design-handoff-lAbGI`
8. **Después de todo push**, crear PR en draft si no existe ya
9. **No inventar URLs** de servicios externos sin estar seguro de que existen
10. Los modelos Claude a usar: Haiku `claude-haiku-4-5-20251001` para tareas rápidas, Sonnet `claude-sonnet-5` para generación de contenido

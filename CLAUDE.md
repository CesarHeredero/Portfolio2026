# CLAUDE.md — Portfolio2026

## Regla de comunicación con el usuario

**César no sabe programación.** Siempre que se haga un push con cambios, incluir al final de la respuesta los comandos VPS para aplicarlos, numerados y listos para copiar y pegar. Sin explicaciones técnicas innecesarias. Responder siempre en español.

---

## Infraestructura del servidor

### Ficha técnica
- **IP pública**: 135.125.102.63
- **SO**: Debian 12 (`vps-6b426220`) | Usuario: `debian`
- **Dominio maestro**: `cesarheredero.com`
- **Gestor de tráfico**: Nginx Proxy Manager — puertos 80, 81 (panel), 443

### Servicios activos en el VPS
| Servicio | Directorio | URL / Puerto |
|---|---|---|
| Nginx Proxy Manager | — | :80, :81 (panel), :443 |
| n8n Profesional | `~/n8n-docker` | n8n.cesarheredero.com:5678 |
| Python runner (distroless + Selenium) | `~/selenium` | interno |
| selenium-chrome v4.41+ | contenedor | http://selenium-chrome:4444 |
| Portfolio2026 (este proyecto) | `~/portfolio2026` | cesarheredero.com → :3000 |
| Intranet frontend | — | :4000 |
| Sistema de deploys | — | :8000 |

### Reglas críticas de operación
1. **RAM limitada**: scripts Selenium/Python deben incluir `driver.quit()` en `try/finally`.
2. **Errores 502**: revisar primero `sudo docker compose up -d` y `free -h`.
3. **Nuevos subdominios**: flujo = DNS registro A → panel NPM (puerto 81) → proxy host.
4. **Redes Docker**: NPM gestiona SSL y tráfico. Los servicios se exponen en `127.0.0.1:<puerto>` para que NPM los alcance.

---

## Stack del proyecto
- Next.js 15 App Router + SSG/ISR, React 19, TypeScript strict
- next-intl i18n: rutas /es/* y /en/*, español por defecto
- CSS custom properties (sin Tailwind), dark mode, 5 acentos de color
- Sistema de contenidos: `content/site.json` (textos), `content/cv.json`, `content/cases.json`
- MDX en `content/cases/` para el contenido largo de cada caso
- @react-pdf/renderer para generación de CV en PDF (servidor)
- @anthropic-ai/sdk para generador de casos con IA (claude-haiku-4-5-20251001 + claude-sonnet-5)
- MyMemory API para traducción automática ES→EN (gratis, sin clave)
- Sin Directus, sin servicios de pago — 0 €/mes

---

## Cómo funciona el sistema de contenidos

1. Textos base en `messages/es.json` y `messages/en.json`
2. El admin guarda sobreescrituras en `content/site.json` (solo campos no vacíos)
3. `src/i18n/request.ts` mezcla ambos: base + sobreescrituras de site.json
4. Después de cada PUT a `/api/admin/site`, se llama `revalidatePath` para actualizar la web
5. Los casos están en `content/cases.json` (metadatos) + `content/cases/*.mdx` (contenido largo)

---

## Modelos de IA a usar (Anthropic)

- **Análisis rápido / clasificación**: `claude-haiku-4-5-20251001`
- **Generación de contenido / calidad**: `claude-sonnet-5`
- NO usar modelos más antiguos (claude-3-*). Los IDs exactos son los de arriba.

---

## Rama git activa

`claude/design-handoff-lAbGI` — todos los cambios van a esta rama.

---

## ⚡ Despliegue en el VPS

### Actualizar el portfolio (copiar y pegar tal cual)
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

### Primer despliegue (desde cero)
```bash
git clone https://github.com/CesarHeredero/Portfolio2026.git ~/portfolio2026
cd ~/portfolio2026
cp .env.example .env
nano .env
sudo docker compose up -d --build
```

### Configurar Nginx Proxy Manager (panel :81)
1. Add Proxy Host → Domain: `cesarheredero.com`
2. Forward Hostname: `172.17.0.1` · Forward Port: `3000`
3. SSL → Request Let's Encrypt · Force SSL, HTTP/2, HSTS

---

## Variables de entorno necesarias (.env en el VPS)

```env
ANTHROPIC_API_KEY=sk-ant-...        # console.anthropic.com — para el generador IA
ADMIN_USER=cesar
ADMIN_PASSWORD=flexicar2026
AUTH_SECRET=...                     # openssl rand -base64 32
RESEND_API_KEY=re_...               # opcional, para magic link
AUTH_EMAIL_FROM=hola@cesarheredero.com
GITHUB_TOKEN=github_pat_...         # opcional, para Git-as-CMS
GITHUB_OWNER=CesarHeredero
GITHUB_REPO=Portfolio2026
GITHUB_BRANCH=main
```

---

## Funcionalidades implementadas

### Panel de admin (/admin)
- Credenciales: cesar / flexicar2026
- **Perfil → 7 tabs**: Hero, Bento, Sobre mí, Proceso (hasta 8 pasos), CV (añadir/eliminar entradas), Contacto, Footer
- **Casos**: listado, editor, toggle publicado/borrador, eliminar
- **"✨ Generar con IA"**: wizard de 3 pasos — datos iniciales → preguntas de la IA → revisión y guardado
- **Botón "→ EN"**: traducción automática ES→EN en todos los campos bilingües (hero, bio, contacto, proceso)

### Web pública
- Bilingüe ES/EN con rutas `/es` y `/en`
- Nav con tema, 5 acentos de color, selector de idioma
- CV PDF generado al vuelo en `/api/cv/pdf` desde cv.json + site.json
- Process section: muestra solo pasos con título (filtra vacíos)

---

## Estado actual y pendientes

### Crítico (rompe cosas)
- Los 8 casos tienen `published: false` en cases.json → la sección de casos está vacía en la web

### Importante
- Playground section es un placeholder ("Próximamente") — considera ocultarla o rellenarla
- No hay foto del autor en el portfolio
- OG image usa la genérica de Next.js

### Mejoras futuras
- Despliegue automático al hacer push (GitHub Actions con SSH)
- Formulario de contacto real (Resend, gratis 100 emails/día)
- Botón "→ EN" en el tab CV para traducir yearEn, roleEn, companyEn
- OG image dinámica (opengraph-image.tsx)

---

## Reglas de desarrollo

1. **Siempre TypeScript strict** — sin `any`, los errores de `tsc --noEmit` deben ser cero antes de hacer commit
2. **Sin Tailwind** — solo CSS custom properties y clases definidas en globals.css
3. **Sin servicios de pago** — 0 €/mes
4. **Sin Directus** ni bases de datos externas — el contenido va en JSON/MDX en `content/`
5. **ISR**: después de cada escritura en content/, llamar `revalidatePath` para las rutas afectadas
6. **API routes de admin**: verificar siempre `ch_admin=authenticated` cookie antes de operar
7. **Commits**: mensajes descriptivos en inglés (convención del repo)
8. **PR**: siempre crear en draft después de cada push si no existe ya

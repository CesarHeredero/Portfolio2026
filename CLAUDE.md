# CLAUDE.md — Portfolio2026

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

### Comandos habituales
```bash
sudo docker compose up -d          # reiniciar servicios
sudo docker logs -f [nombre]       # logs en tiempo real
free -h                            # salud de memoria
```

## Regla de comunicación con el usuario

César no sabe programación. Siempre que se haga un push con cambios, incluir al final de la respuesta los comandos VPS para aplicarlos, numerados y listos para copiar y pegar. Sin explicaciones técnicas innecesarias, solo los comandos en orden.

## Stack del proyecto
- Next.js 15 App Router + SSG, React 19, TypeScript strict
- next-intl i18n: rutas /es/* y /en/*, español por defecto
- CSS custom properties (sin Tailwind), dark mode, 5 acentos
- Git-as-CMS: contenido en /content/ (MDX/JSON), edición vía Octokit
- Auth.js + Resend magic link (free tier)
- Sin Directus, sin servicios de pago — 0 €/mes

## Despliegue en el VPS

### Primer despliegue
```bash
git clone https://github.com/CesarHeredero/Portfolio2026.git ~/portfolio2026
cd ~/portfolio2026
cp .env.example .env
nano .env                          # rellena los valores reales
sudo docker compose up -d --build
```

### ⚡ Actualizar el portfolio (copiar y pegar tal cual)
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

### Actualizaciones (rama main, cuando se mergee)
```bash
cd ~/portfolio2026
git pull origin main
sudo docker compose up -d --build app
```

### Configurar en Nginx Proxy Manager (panel :81)
1. Add Proxy Host → Domain: `cesarheredero.com`
2. Forward Hostname: `172.17.0.1` · Forward Port: `3000` (NPM está en Docker, no usar 127.0.0.1)
3. Pestaña SSL → Request Let's Encrypt certificate
4. Activar: Force SSL, HTTP/2, HSTS

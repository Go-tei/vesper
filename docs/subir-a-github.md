# Publicar la entrega en GitHub

El proyecto quedó implementado y verificado en la rama local `feat/entrega-2-react`. La conexión de GitHub de esta sesión permitió leer `Go-tei/vesper`, pero rechazó tanto `git push` como la creación de rama por API con HTTP 403 (`Resource not accessible by integration`). Por eso los cambios todavía no están publicados en GitHub.

## Desde esta conversación

Revisar la conexión GitHub utilizada por ChatGPT/Codex y su instalación en GitHub: autorizar el repositorio `Go-tei/vesper` y permisos de escritura de contenido. Después volver a esta conversación para publicar la rama y preparar la propuesta de cambios.

## Desde tu equipo

El archivo `vesper-entrega-2.bundle` incluido como descarga adicional conserva el historial original y el commit de la entrega. Con Git instalado, descargarlo y ejecutar:

```bash
git clone -b feat/entrega-2-react vesper-entrega-2.bundle vesper
cd vesper
git remote set-url origin https://github.com/Go-tei/vesper.git
git push -u origin feat/entrega-2-react
```

GitHub solicitará la autenticación que tengas configurada. Abrir después el repositorio y crear un pull request de `feat/entrega-2-react` hacia `main`. Revisar el proyecto antes de integrarlo.

El ZIP también contiene todo el código para ejecutar `npm ci` y `npm run dev` sin utilizar el bundle. Para el enlace público solicitado por la pauta, la rama o su pull request deben estar publicados en el repositorio público.

# Publicar y revisar la entrega en GitHub

La aplicación de GitHub ya tiene acceso autorizado a `Go-tei/vesper`; la restricción de permisos detectada inicialmente quedó resuelta. La entrega se prepara en la rama `feat/entrega-2-react`, con un pull request en borrador hacia `main` para revisar el código y los documentos antes de integrarlos.

## Flujo de publicación

1. Publicar la rama `feat/entrega-2-react` en el repositorio público [Go-tei/vesper](https://github.com/Go-tei/vesper).
2. Abrir un pull request con base `main` y origen `feat/entrega-2-react`, inicialmente en borrador. Incluir una descripción de la migración, los flujos añadidos y los resultados reales de pruebas y compilación.
3. Revisar los archivos cambiados, los documentos PDF, el checkout aprobado y rechazado, los mantenedores y el comportamiento en móvil y escritorio.
4. Ejecutar las comprobaciones del proyecto y revisar sus resultados. Cuando el equipo termine la revisión, marcar el pull request como listo y fusionarlo en `main`.
5. Confirmar que `main` contiene la entrega antes de enviar el enlace definitivo al docente. Publicar código en GitHub no publica automáticamente una página web; para alojarla se utiliza el contenido de `dist/`.

La vista de comparación para abrir o localizar la propuesta es:

https://github.com/Go-tei/vesper/compare/main...feat/entrega-2-react

## Continuar desde una copia local

Con la rama ya publicada, descargar el proyecto mediante:

```bash
git clone --branch feat/entrega-2-react https://github.com/Go-tei/vesper.git
cd vesper
npm ci
npm test
npm run build
npm run dev
```

Para enviar cambios posteriores desde esa rama:

```bash
git push -u origin feat/entrega-2-react
```

GitHub utiliza la autenticación configurada en el equipo. Los nuevos commits de la rama se incorporan al mismo pull request mientras permanezca abierto.

## Copias de entrega

El ZIP contiene las fuentes, configuración, pruebas, documentación y compilación para ejecutar el proyecto con los comandos del README. El bundle adicional conserva el historial Git y permite reconstruir la rama sin depender de la descarga inicial del repositorio:

```bash
git clone -b feat/entrega-2-react vesper-entrega-2.bundle vesper
cd vesper
git remote set-url origin https://github.com/Go-tei/vesper.git
```

El enlace público solicitado por la pauta debe apuntar al repositorio con la entrega publicada. Durante la revisión puede compartirse también el enlace del pull request; después de integrar los cambios, `main` será la referencia de la entrega.

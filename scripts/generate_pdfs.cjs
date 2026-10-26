const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { marked } = require('marked');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

function buildHtml(title, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=JetBrains+Mono:wght@400;600&display=swap');

    @page {
      size: A4;
      margin: 20mm 15mm 20mm 15mm;
      @bottom-right {
        content: counter(page);
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 9pt;
        color: #7c5641;
      }
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.55;
      color: #1c120c;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
    }

    h1, h2, h3, h4 {
      color: #1c120c;
      font-family: 'Playfair Display', Georgia, serif;
      page-break-after: avoid;
      margin-top: 1.4em;
      margin-bottom: 0.5em;
    }

    h1 {
      font-size: 22pt;
      color: #9d3c0c;
      border-bottom: 2pt solid #9d3c0c;
      padding-bottom: 6px;
      margin-top: 0;
    }

    h2 {
      font-size: 15pt;
      color: #7f2b00;
      border-bottom: 1px solid #dec0b6;
      padding-bottom: 4px;
      margin-top: 1.6em;
    }

    h3 {
      font-size: 12pt;
      color: #9d3c0c;
    }

    h4 {
      font-size: 10.5pt;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 700;
      color: #1c120c;
    }

    p {
      margin-top: 0;
      margin-bottom: 0.8em;
    }

    strong {
      color: #1c120c;
      font-weight: 700;
    }

    hr {
      border: none;
      border-top: 1px solid #dec0b6;
      margin: 1.5em 0;
    }

    ul, ol {
      margin-top: 0;
      margin-bottom: 0.8em;
      padding-left: 20px;
    }

    li {
      margin-bottom: 0.35em;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.2em 0;
      font-size: 9pt;
      page-break-inside: avoid;
    }

    th {
      background-color: #f5ede3;
      color: #7c5641;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 8pt;
      letter-spacing: 0.05em;
      padding: 8px 10px;
      border: 1px solid #dec0b6;
      text-align: left;
    }

    td {
      padding: 7px 10px;
      border: 1px solid #dec0b6;
      vertical-align: top;
    }

    tr:nth-child(even) td {
      background-color: #fffaf6;
    }

    code {
      font-family: 'JetBrains Mono', Consolas, 'Courier New', monospace;
      font-size: 8.5pt;
      background-color: #f5ede3;
      color: #9d3c0c;
      padding: 2px 5px;
      border-radius: 4px;
      border: 1px solid #dec0b6;
    }

    pre {
      background-color: #1c120c;
      color: #fff8f2;
      padding: 12px 14px;
      border-radius: 8px;
      overflow-x: auto;
      font-family: 'JetBrains Mono', Consolas, monospace;
      font-size: 8pt;
      line-height: 1.45;
      page-break-inside: avoid;
      margin: 1em 0;
    }

    pre code {
      background: none;
      color: inherit;
      padding: 0;
      border: none;
      font-size: inherit;
    }

    blockquote {
      border-left: 4px solid #9d3c0c;
      background-color: #fff8f2;
      margin: 1em 0;
      padding: 8px 14px;
      color: #57423a;
      border-radius: 0 8px 8px 0;
    }

    .badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 8pt;
      font-weight: 700;
    }

    .footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 20px;
      font-size: 8pt;
      color: #7c5641;
      border-top: 1px solid #dec0b6;
      padding-top: 4px;
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>
  ${bodyHtml}
</body>
</html>`;
}

async function convert(mdFile, pdfFile, title) {
  const mdPath = path.resolve(mdFile);
  const pdfPath = path.resolve(pdfFile);
  const tempHtmlPath = path.resolve(pdfFile.replace('.pdf', '_temp.html'));

  console.log(`Leyendo ${mdFile}...`);
  const mdContent = fs.readFileSync(mdPath, 'utf8');

  // Convertir mermaid fences a pre bloques legibles para PDF
  const sanitizedMd = mdContent.replace(/```mermaid([\s\S]*?)```/g, (match, p1) => {
    return '```text [Diagrama de Arquitectura / Modelo de Datos]\n' + p1.trim() + '\n```';
  });

  const parsedHtml = marked.parse(sanitizedMd);
  const fullHtml = buildHtml(title, parsedHtml);

  fs.writeFileSync(tempHtmlPath, fullHtml, 'utf8');

  console.log(`Generando PDF con Edge Headless hacia ${pdfFile}...`);
  const fileUrl = 'file:///' + tempHtmlPath.replace(/\\/g, '/');
  const cmd = `"${edgePath}" --headless --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf="${pdfPath}" --print-to-pdf-no-header "${fileUrl}"`;

  execSync(cmd, { stdio: 'pipe' });

  if (fs.existsSync(tempHtmlPath)) {
    fs.unlinkSync(tempHtmlPath);
  }

  const stats = fs.statSync(pdfPath);
  console.log(`✓ Creado: ${pdfFile} (${(stats.size / 1024).toFixed(1)} KB)`);
}

(async () => {
  try {
    await convert('docs/MEMORIA_TECNICA.md', 'docs/MEMORIA_TECNICA.pdf', 'Dulce Taller - Memoria Técnica IFTS 29');
    await convert('docs/MANUAL_DE_USUARIO.md', 'docs/MANUAL_DE_USUARIO.pdf', 'Dulce Taller - Manual de Usuario');
    console.log('\n¡Todos los PDFs fueron generados exitosamente en la carpeta docs/!');
  } catch (err) {
    console.error('Error generando PDFs:', err);
    process.exit(1);
  }
})();

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const { marked } = require('marked');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

/**
 * Plantilla HTML formal y académica de Ingeniería de Software para MEMORIA_TECNICA.pdf
 */
function buildAcademicHtml(title, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');

    @page {
      size: A4;
      margin: 18mm 16mm 18mm 16mm;
      @bottom-right {
        content: "Página " counter(page);
        font-family: 'Inter', sans-serif;
        font-size: 8.5pt;
        color: #64748b;
      }
      @bottom-left {
        content: "IFTS 29 - Memoria Técnica: Dulce Taller POS";
        font-family: 'Inter', sans-serif;
        font-size: 8.5pt;
        color: #64748b;
      }
    }

    * {
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 9.5pt;
      line-height: 1.55;
      color: #1e293b;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
    }

    /* ================= PORTADA ACADÉMICA INSTITUCIONAL ================= */
    .cover-page {
      page-break-after: always;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 250mm;
      padding: 10mm 5mm;
    }

    .cover-header {
      border-bottom: 2.5pt solid #0f172a;
      padding-bottom: 15px;
    }

    .cover-inst {
      font-size: 13pt;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin: 0 0 4px 0;
    }

    .cover-carrera {
      font-size: 10.5pt;
      font-weight: 600;
      color: #1e3a8a;
      margin: 0 0 2px 0;
    }

    .cover-materia {
      font-size: 9.5pt;
      color: #64748b;
      font-weight: 500;
      margin: 0;
    }

    .cover-body {
      margin: 35mm 0;
    }

    .cover-badge {
      display: inline-block;
      padding: 4px 12px;
      background-color: #eff6ff;
      color: #1d4ed8;
      border: 1px solid #bfdbfe;
      border-radius: 9999px;
      font-size: 8.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 14px;
    }

    .cover-title {
      font-size: 28pt;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.15;
      margin: 0 0 12px 0;
      letter-spacing: -0.5px;
    }

    .cover-subtitle {
      font-size: 13pt;
      font-weight: 400;
      color: #475569;
      line-height: 1.45;
      margin: 0 0 25px 0;
    }

    .cover-meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 18px 20px;
      margin-top: 25px;
    }

    .meta-item {
      display: flex;
      flex-direction: column;
    }

    .meta-label {
      font-size: 8pt;
      text-transform: uppercase;
      color: #64748b;
      font-weight: 700;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }

    .meta-val {
      font-size: 9.5pt;
      font-weight: 600;
      color: #0f172a;
    }

    .cover-footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9pt;
      color: #64748b;
    }

    /* ================= TIPOGRAFÍA & CONTENIDO ================= */
    h1, h2, h3, h4 {
      color: #0f172a;
      page-break-after: avoid;
      font-weight: 800;
      letter-spacing: -0.2px;
    }

    h1 {
      font-size: 18pt;
      color: #0f172a;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 6px;
      margin-top: 28px;
      margin-bottom: 14px;
    }

    h2 {
      font-size: 13.5pt;
      color: #1e3a8a;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 4px;
      margin-top: 24px;
      margin-bottom: 10px;
    }

    h3 {
      font-size: 11pt;
      color: #1e293b;
      margin-top: 18px;
      margin-bottom: 6px;
    }

    h4 {
      font-size: 10pt;
      color: #334155;
      font-weight: 700;
      margin-top: 14px;
      margin-bottom: 4px;
    }

    p {
      margin-top: 0;
      margin-bottom: 8px;
      text-align: justify;
      hyphens: auto;
    }

    strong {
      color: #0f172a;
      font-weight: 700;
    }

    hr {
      border: none;
      border-top: 1px solid #e2e8f0;
      margin: 18px 0;
    }

    ul, ol {
      margin-top: 0;
      margin-bottom: 10px;
      padding-left: 20px;
    }

    li {
      margin-bottom: 3px;
    }

    /* ================= TABLAS TÉCNICAS PROFESIONALES ================= */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 14px 0;
      font-size: 8.5pt;
      page-break-inside: avoid;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      overflow: hidden;
    }

    th {
      background-color: #0f172a;
      color: #ffffff;
      font-weight: 700;
      font-size: 8pt;
      letter-spacing: 0.4px;
      text-transform: uppercase;
      padding: 8px 10px;
      border: 1px solid #1e293b;
      text-align: left;
    }

    td {
      padding: 6.5px 10px;
      border: 1px solid #e2e8f0;
      vertical-align: top;
      color: #334155;
    }

    tr:nth-child(even) td {
      background-color: #f8fafc;
    }

    /* ================= CÓDIGO & CALLOUTS ================= */
    code {
      font-family: 'JetBrains Mono', Consolas, 'Courier New', monospace;
      font-size: 8.2pt;
      background-color: #f1f5f9;
      color: #0f172a;
      padding: 2px 4px;
      border-radius: 4px;
      border: 1px solid #cbd5e1;
    }

    pre {
      background-color: #0f172a;
      color: #f8fafc;
      padding: 12px 14px;
      border-radius: 6px;
      overflow-x: auto;
      font-family: 'JetBrains Mono', Consolas, monospace;
      font-size: 8pt;
      line-height: 1.45;
      page-break-inside: avoid;
      margin: 12px 0;
      border: 1px solid #1e293b;
    }

    pre code {
      background: none;
      color: inherit;
      padding: 0;
      border: none;
      font-size: inherit;
    }

    blockquote {
      border-left: 3.5px solid #2563eb;
      background-color: #f8fafc;
      margin: 12px 0;
      padding: 8px 14px;
      color: #334155;
      border-radius: 0 6px 6px 0;
      font-style: italic;
    }

    /* ================= IMÁGENES & GRÁFICOS SVG ================= */
    .diagram-container {
      margin: 20px 0;
      text-align: center;
      page-break-inside: avoid;
    }

    .diagram-container svg {
      width: 100%;
      max-width: 900px;
      height: auto;
      display: block;
      margin: 0 auto;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
      border: 1px solid #cbd5e1;
    }

    .diagram-caption {
      font-size: 8.5pt;
      font-weight: 600;
      color: #64748b;
      margin-top: 6px;
      text-align: center;
      font-style: italic;
    }

    img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 16px auto;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e8f0;
      page-break-inside: avoid;
    }
  </style>
</head>
<body>
  <!-- PORTADA ACADÉMICA OFICIAL -->
  <div class="cover-page">
    <div class="cover-header">
      <div class="cover-inst">INSTITUTO DE FORMACIÓN TÉCNICA SUPERIOR N° 29 (IFTS 29)</div>
      <div class="cover-carrera">Tecnicatura Superior en Desarrollo de Software</div>
      <div class="cover-materia">Espacio Curricular: Práctica Profesionalizante II</div>
    </div>

    <div class="cover-body">
      <div class="cover-badge">Documento de Arquitectura de Software</div>
      <div class="cover-title">DULCE TALLER</div>
      <div class="cover-subtitle">Sistema POS Táctil de Comandas, Control de Producción y Gestión de Stock Transaccional</div>

      <div class="cover-meta-grid">
        <div class="meta-item">
          <span class="meta-label">Tipo de Documento</span>
          <span class="meta-val">Memoria Técnica &amp; Arquitectura</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Versión / Estado</span>
          <span class="meta-val">v1.0 (Release Candidate / Producción)</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Motor de Base de Datos</span>
          <span class="meta-val">PostgreSQL 15+ (Transaccional ACID via Supabase)</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Fecha de Entrega</span>
          <span class="meta-val">Octubre 2026</span>
        </div>
      </div>
    </div>

    <div class="cover-footer">
      <span>Prototipo Funcional de Arquitectura Senior</span>
      <span>Buenos Aires, Argentina</span>
    </div>
  </div>

  <!-- CONTENIDO TÉCNICO -->
  ${bodyHtml}
</body>
</html>`;
}

/**
 * Plantilla HTML moderna para MANUAL_DE_USUARIO.pdf
 */
function buildUserManualHtml(title, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&family=JetBrains+Mono:wght@400;600&display=swap');

    @page {
      size: A4;
      margin: 18mm 16mm 18mm 16mm;
      @bottom-right {
        content: "Página " counter(page);
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 8.5pt;
        color: #7c5641;
      }
      @bottom-left {
        content: "Dulce Taller - Manual de Operaciones";
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 8.5pt;
        color: #7c5641;
      }
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 9.5pt;
      line-height: 1.55;
      color: #1c120c;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
    }

    h1, h2, h3, h4 {
      color: #1c120c;
      page-break-after: avoid;
    }

    h1 {
      font-size: 20pt;
      font-family: 'Playfair Display', Georgia, serif;
      color: #9d3c0c;
      border-bottom: 2pt solid #9d3c0c;
      padding-bottom: 6px;
      margin-top: 0;
      margin-bottom: 12px;
    }

    h2 {
      font-size: 13.5pt;
      font-family: 'Playfair Display', Georgia, serif;
      color: #7f2b00;
      border-bottom: 1px solid #dec0b6;
      padding-bottom: 4px;
      margin-top: 22px;
      margin-bottom: 8px;
    }

    h3 {
      font-size: 11pt;
      color: #9d3c0c;
      margin-top: 14px;
      margin-bottom: 6px;
    }

    h4 {
      font-size: 9.5pt;
      font-weight: 700;
      color: #1c120c;
    }

    p {
      margin-top: 0;
      margin-bottom: 8px;
    }

    strong {
      color: #1c120c;
      font-weight: 700;
    }

    hr {
      border: none;
      border-top: 1px solid #dec0b6;
      margin: 16px 0;
    }

    ul, ol {
      margin-top: 0;
      margin-bottom: 8px;
      padding-left: 20px;
    }

    li {
      margin-bottom: 3px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
      font-size: 8.5pt;
      page-break-inside: avoid;
    }

    th {
      background-color: #f5ede3;
      color: #7c5641;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 8pt;
      padding: 7px 9px;
      border: 1px solid #dec0b6;
      text-align: left;
    }

    td {
      padding: 6px 9px;
      border: 1px solid #dec0b6;
      vertical-align: top;
    }

    tr:nth-child(even) td {
      background-color: #fffbf8;
    }

    code {
      font-family: 'JetBrains Mono', Consolas, monospace;
      font-size: 8.2pt;
      background-color: #f5ede3;
      color: #9d3c0c;
      padding: 2px 4px;
      border-radius: 4px;
      border: 1px solid #dec0b6;
    }
  </style>
</head>
<body>
  ${bodyHtml}
</body>
</html>`;
}

async function convert(mdFile, pdfFile, title, isAcademic = false) {
  const mdPath = path.resolve(mdFile);
  const pdfPath = path.resolve(pdfFile);
  const tempHtmlPath = path.resolve(pdfFile.replace('.pdf', '_temp.html'));

  console.log(`Leyendo ${mdFile}...`);
  let mdContent = fs.readFileSync(mdPath, 'utf8');

  // Si es la memoria técnica, reemplazar cabeceras iniciales ya contenidas en la portada
  if (isAcademic) {
    mdContent = mdContent.replace(/^# DULCE TALLER[\s\S]*?\*\*Fecha:\*\* [^\n]*\n+/i, '');
  }

  // Inyectar SVGs directamente como elementos HTML vectoriales nativos (evita problemas de rutas relativas y espacios)
  mdContent = mdContent.replace(/!\[(.*?)\]\((.*?\.svg)\)/gi, (match, alt, src) => {
    let cleanSrc = decodeURIComponent(src).replace(/^file:\/\/\//i, '').replace(/^\/+/, '');
    let svgFile = path.isAbsolute(cleanSrc) ? cleanSrc : path.resolve('docs', cleanSrc);
    if (!fs.existsSync(svgFile)) {
      const baseName = path.basename(cleanSrc);
      const fallback = path.resolve('docs/assets', baseName);
      if (fs.existsSync(fallback)) {
        svgFile = fallback;
      }
    }
    if (fs.existsSync(svgFile)) {
      let svgContent = fs.readFileSync(svgFile, 'utf8')
        .replace(/<\?xml[\s\S]*?\?>/i, '')
        .trim();
      return `\n\n<figure class="diagram-container">\n${svgContent}\n<figcaption class="diagram-caption">${alt}</figcaption>\n</figure>\n\n`;
    }
    return match;
  });

  const parsedHtml = marked.parse(mdContent);
  const fullHtml = isAcademic 
    ? buildAcademicHtml(title, parsedHtml) 
    : buildUserManualHtml(title, parsedHtml);

  fs.writeFileSync(tempHtmlPath, fullHtml, 'utf8');

  console.log(`Generando PDF con Edge Headless hacia ${pdfFile}...`);
  const fileUrl = 'file:///' + tempHtmlPath.replace(/\\/g, '/');
  const tempTargetPdf = path.join(os.tmpdir(), `edge_pdf_${Date.now()}_${path.basename(pdfFile)}`);
  const cmd = `"${edgePath}" --headless --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf="${tempTargetPdf}" --print-to-pdf-no-header "${fileUrl}"`;

  execSync(cmd, { stdio: 'pipe' });

  if (fs.existsSync(tempHtmlPath)) {
    fs.unlinkSync(tempHtmlPath);
  }

  let finalPath = pdfPath;
  try {
    fs.copyFileSync(tempTargetPdf, pdfPath);
    fs.unlinkSync(tempTargetPdf);
    const stats = fs.statSync(pdfPath);
    console.log(`✓ Creado / Actualizado: ${pdfFile} (${(stats.size / 1024).toFixed(1)} KB)`);
  } catch (err) {
    finalPath = pdfPath.replace('.pdf', '_PROFESIONAL.pdf');
    try {
      fs.copyFileSync(tempTargetPdf, finalPath);
      fs.unlinkSync(tempTargetPdf);
      const stats = fs.statSync(finalPath);
      console.log(`⚠️ El archivo original está abierto en tu lector de PDF. Se generó: ${path.basename(finalPath)} (${(stats.size / 1024).toFixed(1)} KB)`);
    } catch (innerErr) {
      console.error(`Error guardando PDF: ${innerErr.message}`);
    }
  }
}

(async () => {
  try {
    await convert('docs/MEMORIA_TECNICA.md', 'docs/MEMORIA_TECNICA.pdf', 'Dulce Taller - Memoria Técnica IFTS 29', true);
    await convert('docs/MANUAL_DE_USUARIO.md', 'docs/MANUAL_DE_USUARIO.pdf', 'Dulce Taller - Manual de Usuario', false);
    console.log('\n¡PDFs generados y formateados con éxito!');
  } catch (err) {
    console.error('Error generando PDFs:', err);
    process.exit(1);
  }
})();

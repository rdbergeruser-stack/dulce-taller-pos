const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const docsDir = path.resolve(__dirname, '../docs');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}
const pdfPath = path.resolve(docsDir, 'GUION_DEMOSTRACION_EN_VIVO.pdf');
const mdPath = path.resolve(docsDir, 'GUION_DEMOSTRACION_EN_VIVO.md');

const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>BackForge - Guión de Demostración en Vivo (Rodrigo)</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700&display=swap');

    @page {
      size: A4;
      margin: 11mm 13mm 11mm 13mm;
    }

    * { box-sizing: border-box; }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 8.8pt;
      line-height: 1.38;
      color: #1c120c;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
    }

    .header-box {
      border-bottom: 2.5px solid #9d3c0c;
      padding-bottom: 8px;
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }

    .brand-title {
      font-family: 'Playfair Display', serif;
      font-size: 18pt;
      font-weight: 700;
      color: #1c120c;
      margin: 0;
      line-height: 1.1;
    }

    .brand-subtitle {
      font-size: 9.5pt;
      font-weight: 700;
      color: #9d3c0c;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-top: 2px;
    }

    .meta-box {
      text-align: right;
      font-size: 8pt;
      color: #7c5641;
    }

    .meta-tag {
      display: inline-block;
      background: #f5ede3;
      color: #9d3c0c;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 6px;
      border: 1px solid #dec0b6;
      margin-top: 2px;
    }

    .sync-banner {
      background-color: #fff8f2;
      border: 1px solid #dec0b6;
      border-left: 4px solid #9d3c0c;
      padding: 7px 10px;
      border-radius: 6px;
      margin-bottom: 10px;
      font-size: 8.2pt;
      color: #57423a;
    }

    .timing-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
      font-size: 7.8pt;
    }

    .timing-table th {
      background: #f5ede3;
      color: #7c5641;
      text-align: left;
      padding: 4px 6px;
      border: 1px solid #dec0b6;
      font-weight: 700;
      text-transform: uppercase;
    }

    .timing-table td {
      padding: 3.5px 6px;
      border: 1px solid #dec0b6;
    }

    .timing-table tr.highlight-row {
      background: #fff1eb;
      font-weight: 700;
      color: #9d3c0c;
    }

    .act-card {
      background: #ffffff;
      border: 1px solid #dec0b6;
      border-radius: 8px;
      margin-bottom: 9px;
      overflow: hidden;
      page-break-inside: avoid;
      box-shadow: 0 1px 2px rgba(0,0,0,0.02);
    }

    .act-header {
      padding: 5px 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #dec0b6;
    }

    .act-header-1 { background: #eff6ff; }
    .act-header-2 { background: #fff1eb; }
    .act-header-3 { background: #fef7ed; }
    .act-header-4 { background: #fdf2f8; }

    .act-title {
      font-family: 'Playfair Display', serif;
      font-size: 10.8pt;
      font-weight: 700;
      color: #1c120c;
      margin: 0;
    }

    .role-badge {
      font-size: 7.2pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 2px 7px;
      border-radius: 14px;
    }

    .badge-web { background: #2563eb; color: #ffffff; }
    .badge-mozo { background: #9d3c0c; color: #ffffff; }
    .badge-cocina { background: #d97706; color: #ffffff; }
    .badge-admin { background: #1c120c; color: #ffffff; }

    .act-body {
      padding: 7px 10px 8px 10px;
    }

    .action-row {
      font-size: 8.2pt;
      color: #1c120c;
      margin-bottom: 4px;
    }

    .action-row strong {
      color: #9d3c0c;
    }

    .speech-box {
      background: #fdf8f4;
      border-left: 3px solid #9d3c0c;
      padding: 4px 8px;
      margin: 3px 0 4px 0;
      font-size: 8.1pt;
      color: #1c120c;
      font-style: italic;
      border-radius: 0 5px 5px 0;
    }

    .speech-box span {
      font-weight: 800;
      color: #9d3c0c;
      font-style: normal;
    }

    .closure-box {
      background: #1c120c;
      color: #ffffff;
      border-radius: 7px;
      padding: 7px 11px;
      margin-top: 8px;
      page-break-inside: avoid;
    }

    .closure-box-title {
      color: #dec0b6;
      font-size: 7.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }

    .closure-quote {
      font-family: 'Playfair Display', serif;
      font-size: 9.2pt;
      font-style: italic;
      margin-top: 2px;
      line-height: 1.35;
      color: #fff8f2;
    }

    .tips-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 7px;
      margin-top: 8px;
      page-break-inside: avoid;
    }

    .tip-box {
      background: #fff8f2;
      border: 1px solid #dec0b6;
      border-radius: 6px;
      padding: 6px 8px;
      font-size: 7.7pt;
    }

    .tip-box-title {
      font-weight: 800;
      color: #9d3c0c;
      margin-bottom: 2px;
    }
  </style>
</head>
<body>

  <!-- CABECERA PRINCIPAL -->
  <div class="header-box">
    <div>
      <h1 class="brand-title">BackForge • Dulce Taller</h1>
      <div class="brand-subtitle">Guión de Demostración del Software en Video (Rodrigo)</div>
    </div>
    <div class="meta-box">
      <div>Duración Demo: <strong>2:45 a 3:00 min</strong></div>
      <div>Tope Video Global: <strong>10:00 min máx.</strong></div>
      <div class="meta-tag">Alcance: Web • Comandas • Stock</div>
    </div>
  </div>

  <div class="sync-banner">
    <strong>Sincronización con el Guión General del Equipo:</strong><br>
    Tu intervención técnica ocurre <strong>entre la Diapositiva 5 (Tomás) y la Diapositiva 6 (Alejandra)</strong>. Tomás cierra diciendo: <em>"...Verificaremos el registro y cambios de estado de comandas, stock, producción, alertas y el sitio web..."</em> $\rightarrow$ <strong>¡Aquí entrás vos en vivo!</strong>
  </div>

  <!-- TABLA DE CONTROL DE TIEMPO DEL VIDEO -->
  <table class="timing-table">
    <thead>
      <tr>
        <th>Bloque</th>
        <th>Responsable</th>
        <th>Contenido Principal</th>
        <th>Tiempo Estimado</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1. Introducción & 2. Problema</td>
        <td>Gimena / Tomás</td>
        <td>Diapositivas 1 y 2: Propuesta BackForge y necesidades</td>
        <td>1:35 min</td>
      </tr>
      <tr>
        <td>3. Solución & 4. Diferenciación</td>
        <td>Mariana / Rodrigo</td>
        <td>Diapositivas 3 y 4: 3 módulos y gestión de riesgos (Rodrigo)</td>
        <td>1:40 min</td>
      </tr>
      <tr>
        <td>5. Pruebas y Validación</td>
        <td>Tomás</td>
        <td>Diapositiva 5: Criterios de aceptación (da el pie a Rodrigo)</td>
        <td>0:35 min</td>
      </tr>
      <tr class="highlight-row">
        <td>DEMO EN VIVO SOFTWARE</td>
        <td>RODRIGO</td>
        <td>Sitio Web + Comandas (Salón/Cocina) + Stock & Producción</td>
        <td>2:45 a 3:00 min</td>
      </tr>
      <tr>
        <td>6. Inversión & 7. Cierre</td>
        <td>Alejandra / Gimena</td>
        <td>Diapositivas 6 y 7: Presupuesto ($1.404.000) y cierre comercial</td>
        <td>2:00 min</td>
      </tr>
      <tr style="background:#f5ede3; font-weight:800;">
        <td colspan="3">TIEMPO TOTAL DEL VIDEO (Con margen de seguridad)</td>
        <td>~8:35 a 8:50 min</td>
      </tr>
    </tbody>
  </table>

  <!-- BLOQUE 1: SITIO WEB -->
  <div class="act-card">
    <div class="act-header act-header-1">
      <h2 class="act-title">1. Sitio Web Institucional (20 segundos)</h2>
      <span class="role-badge badge-web">Pestaña Web Pública</span>
    </div>
    <div class="act-body">
      <div class="action-row"><strong>Acción en pantalla:</strong> Mostrar el sitio web institucional navegando la carta digital responsive.</div>
      <div class="speech-box">
        <span>Qué decir:</span> "Gracias, Tomás. Comenzamos por el <strong>Sitio Web Institucional</strong>, desarrollado para que las familias conozcan la propuesta sensorial de Dulce Taller, exploren la carta artesanal y consulten horarios desde cualquier celular o computadora, con diseño adaptable y carga ágil."
      </div>
    </div>
  </div>

  <!-- BLOQUE 2: COMANDAS SALON -->
  <div class="act-card">
    <div class="act-header act-header-2">
      <h2 class="act-title">2. Módulo de Comandas y Salón (45 segundos)</h2>
      <span class="role-badge badge-mozo">App POS • Rol: Mozo</span>
    </div>
    <div class="act-body">
      <div class="action-row"><strong>Acción en pantalla:</strong> Entrar como Mozo $\rightarrow$ señalar barra de vitrina $\rightarrow$ <em>"+ Nueva Comanda"</em> (Mesa 3: 1 Latte, 1 Lemon Pie) $\rightarrow$ Mostrar bloqueo al intentar pedir de más $\rightarrow$ <em>"Crear Comanda"</em>.</div>
      <div class="speech-box">
        <span>Qué decir:</span> "Pasamos a la tablet del salón: el mozo monitorea en la franja superior la <strong>disponibilidad en vitrina en tiempo real</strong>. Al cargar la comanda de la Mesa 3, si intentamos pedir más de lo existente, el sistema valida y <strong>bloquea la orden</strong> para evitar quiebres de stock. Confirmamos y la comanda viaja al instante a preparación."
      </div>
    </div>
  </div>

  <!-- BLOQUE 3: COCINA -->
  <div class="act-card">
    <div class="act-header act-header-3">
      <h2 class="act-title">3. Pantalla de Cocina y Despacho (35 segundos)</h2>
      <span class="role-badge badge-cocina">App POS • Rol: Cocinero</span>
    </div>
    <div class="act-body">
      <div class="action-row"><strong>Acción en pantalla:</strong> Vista de Cocinero $\rightarrow$ Tomar comanda Mesa 3 $\rightarrow$ <em>"Empezar Preparación"</em> $\rightarrow$ Al instante tocar <em>"Marcar Lista"</em> (suena campana).</div>
      <div class="speech-box">
        <span>Qué decir:</span> "En cocina, el cocinero recibe la comanda sin papeles ni gritos. Con un toque inicia la preparación y, al finalizarla, presiona <strong>Marcar Lista</strong>: el sistema emite un aviso sonoro notificando al salón para su retiro inmediato."
      </div>
    </div>
  </div>

  <!-- BLOQUE 4: STOCK Y PRODUCCION -->
  <div class="act-card">
    <div class="act-header act-header-4">
      <h2 class="act-title">4. Control de Stock, Fraccionamiento y Producción (50 segundos)</h2>
      <span class="role-badge badge-admin">App POS • Rol: Administrador</span>
    </div>
    <div class="act-body">
      <div class="action-row"><strong>Acción en pantalla:</strong>
        1. <em>Inventario > Vitrina:</em> Presionar <em>"Cortar 1 Torta (+16 porc.)"</em> (descuenta 1 entera y suma 16 porciones).<br>
        2. <em>Producción:</em> Selector <strong>[-] [1] [+]</strong> $\rightarrow$ mostrar semáforo de insumos $\rightarrow$ <em>"Confirmar Producción"</em> (descuenta harina, manteca, chocolate).<br>
        3. <em>Compras:</em> Mostrar reposición automática bajo mínimo.
      </div>
      <div class="speech-box">
        <span>Qué decir:</span> "En el backoffice, el módulo de <strong>Stock y Producción</strong> centraliza el inventario: permite <strong>fraccionar tortas enteras en porciones</strong> con un toque, costea las recetas y, al cocinar en Producción, <strong>descuenta de forma atómica</strong> los gramos de materia prima del depósito. Si algún insumo alcanza el umbral mínimo, se incorpora automáticamente a la lista sugerida de compras."
      </div>
    </div>
  </div>

  <!-- PIE DE CIERRE Y PASE A ALEJANDRA -->
  <div class="closure-box">
    <div class="closure-box-title">5. Pase a Alejandra (Diapositiva 6 - Inversión) • 10 segundos:</div>
    <div class="closure-quote">
      "De esta manera, Comandas, Stock y Sitio Web operan de forma 100% integrada. Ahora le doy la palabra a Alejandra para presentar la propuesta comercial y de inversión."
    </div>
  </div>

  <!-- TIPS RAPIDOS -->
  <div class="tips-grid">
    <div class="tip-box">
      <div class="tip-box-title">⏱️ Regla de Oro del Tiempo</div>
      No explicar código ni botones secundarios. Cada bloque tiene una sola frase y una acción concreta. En 2 minutos y medio mostrás todo con soltura.
    </div>
    <div class="tip-box">
      <div class="tip-box-title">💻 Pestañas Preparadas</div>
      Tener abiertas 3 pestañas: 1. Sitio Web, 2. POS como Mozo (con comanda lista para cargar), 3. POS como Admin en Producción.
    </div>
  </div>

</body>
</html>
`;

// 1. Guardar Markdown complementario
const mdContent = `# BackForge • Dulce Taller POS - Guión de Demostración en Vivo
**Orador:** Rodrigo  
**Duración objetivo:** 2:45 a 3:00 minutos  
**Ubicación en el video:** Entre Diapositiva 5 (Tomás) y Diapositiva 6 (Alejandra)  
**Alcance formal:** Sitio Web Institucional • Módulo de Comandas • Control de Stock y Producción

---

## ⏱️ Cronograma General del Video (Tope: 10:00 min)
1. **Diapositivas 1 y 2 (Gimena / Tomás):** Intro y Problema (~1:35 min)
2. **Diapositivas 3 y 4 (Mariana / Rodrigo):** Solución y Riesgos (~1:40 min)
3. **Diapositiva 5 (Tomás):** Pruebas y Validación (da el pie) (~0:35 min)
4. **DEMO EN VIVO (Rodrigo):** Web + Comandas + Stock (**2:45 a 3:00 min**)
5. **Diapositivas 6 y 7 (Alejandra / Gimena):** Inversión ($1.404.000) y Cierre (~2:00 min)
* **TOTAL ESTIMADO:** ~8:35 a 8:50 min (Margen seguro de más de 1 minuto).

---

## 🎬 Guión de la Demo (Paso a Paso de Rodrigo)

### 1. Sitio Web Institucional (20 segundos)
- **Acción:** Pestaña con el sitio web responsive de Dulce Taller.
- **Voz:** *"Gracias, Tomás. Comenzamos por el **Sitio Web Institucional**, desarrollado para que las familias conozcan la propuesta sensorial de Dulce Taller, exploren la carta artesanal y consulten horarios desde cualquier celular o computadora, con diseño adaptable y carga ágil."*

### 2. Módulo de Comandas y Salón (45 segundos)
- **Acción:** Entrar como Mozo $\rightarrow$ señalar barra de vitrina $\rightarrow$ *+ Nueva Comanda* (Mesa 3: 1 Latte, 1 Lemon Pie) $\rightarrow$ Intentar pedir de más (bloqueo) $\rightarrow$ *Crear Comanda*.
- **Voz:** *"Pasamos a la tablet del salón: el mozo monitorea en la franja superior la **disponibilidad en vitrina en tiempo real**. Al cargar la comanda de la Mesa 3, si intentamos pedir más de lo existente, el sistema valida y **bloquea la orden** para evitar quiebres de stock. Confirmamos y la comanda viaja al instante a preparación."*

### 3. Pantalla de Cocina y Despacho (35 segundos)
- **Acción:** Pestaña de Cocinero $\rightarrow$ Tomar comanda Mesa 3 $\rightarrow$ *Empezar Preparación* $\rightarrow$ *Marcar Lista* (aviso sonoro chime).
- **Voz:** *"En cocina, el cocinero recibe la comanda sin papeles ni gritos. Con un toque inicia la preparación y, al finalizarla, presiona **Marcar Lista**: el sistema emite un aviso sonoro notificando al salón para su retiro inmediato."*

### 4. Control de Stock, Fraccionamiento y Producción (50 segundos)
- **Acción:**
  - *Inventario > Vitrina:* Clic en *Cortar 1 Torta (+16 porc.)* (descuenta 1 entera y suma 16 porciones).
  - *Producción:* Selector *[-] [ 1 ] [+]* $\rightarrow$ semáforo $\rightarrow$ *Confirmar Producción* (descuenta harina, manteca, etc.).
  - *Compras:* Mostrar lista automática de reposición bajo mínimo.
- **Voz:** *"En el backoffice, el módulo de **Stock y Producción** centraliza el inventario: permite **fraccionar tortas enteras en porciones** con un toque, costea las recetas y, al cocinar en Producción, **descuenta de forma atómica** los gramos de materia prima del depósito. Si algún insumo alcanza el umbral mínimo, se incorpora automáticamente a la lista sugerida de compras."*

### 5. Pase a Alejandra (10 segundos)
- **Voz:** *"De esta manera, Comandas, Stock y Sitio Web operan de forma 100% integrada. Ahora le doy la palabra a Alejandra para presentar la propuesta comercial y de inversión."*
`;

fs.writeFileSync(mdPath, mdContent, 'utf8');
console.log('Markdown guardado en:', mdPath);

// 2. Generar PDF usando Edge Headless
const tempHtmlPath = path.join(os.tmpdir(), 'guion_demo.html');
fs.writeFileSync(tempHtmlPath, htmlContent, 'utf8');

try {
  const cmd = `"${edgePath}" --headless --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf="${pdfPath}" --print-to-pdf-no-header "${tempHtmlPath}"`;
  execSync(cmd, { stdio: 'pipe' });
  console.log('PDF generado exitosamente en:', pdfPath);
} catch (err) {
  console.error('Error generando PDF con Edge:', err);
} finally {
  if (fs.existsSync(tempHtmlPath)) {
    fs.unlinkSync(tempHtmlPath);
  }
}

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const pdfPath = path.resolve(__dirname, '../docs/FEEDBACK_REVISION_BASE_DE_DATOS.pdf');

const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Dulce Taller POS - Revisión Técnica de Base de Datos</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');

    @page {
      size: A4;
      margin: 16mm 15mm 16mm 15mm;
      @bottom-right {
        content: "Página " counter(page);
        font-family: 'Inter', sans-serif;
        font-size: 8pt;
        color: #64748b;
      }
      @bottom-left {
        content: "Dulce Taller POS - Informe de Revisión y Feedback de Base de Datos";
        font-family: 'Inter', sans-serif;
        font-size: 8pt;
        color: #64748b;
      }
    }

    * { box-sizing: border-box; }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 9.2pt;
      line-height: 1.5;
      color: #1e293b;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
    }

    .header-box {
      border-bottom: 2.5px solid #9d3c0c;
      padding-bottom: 12px;
      margin-bottom: 18px;
    }

    .badge {
      display: inline-block;
      padding: 3px 9px;
      border-radius: 9999px;
      font-size: 7.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background-color: #ffedd5;
      color: #9a3412;
      border: 1px solid #fed7aa;
      margin-bottom: 6px;
    }

    h1 {
      font-size: 16pt;
      color: #0f172a;
      margin: 4px 0 6px 0;
      font-weight: 800;
      letter-spacing: -0.3px;
    }

    .subtitle {
      font-size: 9.5pt;
      color: #475569;
      margin: 0 0 8px 0;
      font-weight: 500;
    }

    .meta-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-top: 10px;
      font-size: 8pt;
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px 12px;
    }

    .meta-item strong {
      color: #0f172a;
    }

    h2 {
      font-size: 11.5pt;
      color: #9d3c0c;
      border-bottom: 1px solid #fed7aa;
      padding-bottom: 3px;
      margin-top: 20px;
      margin-bottom: 8px;
      font-weight: 800;
      page-break-after: avoid;
    }

    h3 {
      font-size: 9.8pt;
      color: #0f172a;
      margin-top: 14px;
      margin-bottom: 4px;
      font-weight: 700;
      page-break-after: avoid;
    }

    p {
      margin-top: 0;
      margin-bottom: 8px;
      text-align: justify;
    }

    ul, ol {
      margin-top: 0;
      margin-bottom: 8px;
      padding-left: 18px;
    }

    li {
      margin-bottom: 3px;
    }

    strong {
      color: #0f172a;
      font-weight: 700;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
      font-size: 8pt;
      page-break-inside: avoid;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      overflow: hidden;
    }

    th {
      background-color: #1c120c;
      color: #ffffff;
      font-weight: 700;
      font-size: 7.5pt;
      letter-spacing: 0.3px;
      text-transform: uppercase;
      padding: 6px 8px;
      border: 1px solid #1c120c;
      text-align: left;
    }

    td {
      padding: 5px 8px;
      border: 1px solid #e2e8f0;
      vertical-align: top;
      color: #334155;
    }

    tr:nth-child(even) td {
      background-color: #fffaf5;
    }

    .callout {
      background-color: #fff7ed;
      border-left: 4px solid #ea580c;
      padding: 8px 12px;
      margin: 10px 0;
      border-radius: 0 6px 6px 0;
      font-size: 8.5pt;
      color: #9a3412;
    }

    .callout p {
      margin: 0;
      text-align: left;
    }

    .callout-success {
      background-color: #f0fdf4;
      border-left: 4px solid #16a34a;
      color: #166534;
    }

    code {
      font-family: 'JetBrains Mono', Consolas, monospace;
      font-size: 7.8pt;
      background-color: #f1f5f9;
      color: #0f172a;
      padding: 1.5px 3.5px;
      border-radius: 3px;
      border: 1px solid #cbd5e1;
    }

    pre {
      background-color: #1c120c;
      color: #f8fafc;
      padding: 8px 12px;
      border-radius: 5px;
      overflow-x: auto;
      font-family: 'JetBrains Mono', Consolas, monospace;
      font-size: 7.5pt;
      line-height: 1.4;
      page-break-inside: avoid;
      margin: 8px 0;
    }

    .checklist {
      list-style: none;
      padding-left: 0;
    }

    .checklist li {
      position: relative;
      padding-left: 22px;
      margin-bottom: 6px;
    }

    .checklist li::before {
      content: "✔";
      position: absolute;
      left: 0;
      top: 0;
      color: #16a34a;
      font-weight: 800;
    }
  </style>
</head>
<body>

  <div class="header-box">
    <div class="badge">Revisión Técnica de Arquitectura</div>
    <h1>INFORME DE REVISIÓN Y FEEDBACK: BASE DE DATOS</h1>
    <div class="subtitle">Evaluación técnica del Manual Técnico, Modelo Relacional en Supabase (PostgreSQL) y Pruebas Automatizadas</div>
    
    <div class="meta-grid">
      <div class="meta-item"><strong>Proyecto:</strong> Dulce Taller POS</div>
      <div class="meta-item"><strong>Destino:</strong> Compañera de Equipo / BackForge</div>
      <div class="meta-item"><strong>Dictamen:</strong> Aprobado con Recomendaciones</div>
    </div>
  </div>

  <h2>1. Valoración General del Trabajo</h2>
  <p>
    El material elaborado en el <strong>Manual Técnico</strong> y el <strong>Informe de Etapa 4 / CRUD</strong> es de una calidad sobresaliente. Presenta una estructura pedagógica clara, un tono formal riguroso y capturas de pantalla auténticas obtenidas directamente del sistema en ejecución.
  </p>
  <p>
    Se destaca especialmente la <strong>honestidad técnica y transparencia metodológica</strong> con la que se documentó la doble arquitectura del sistema:
  </p>
  <ul>
    <li><strong>Modo Producción Conectado:</strong> Persistencia relacional ACID en PostgreSQL a través de la infraestructura cloud de Supabase.</li>
    <li><strong>Modo Demostración Local:</strong> Simulación en memoria mediante <code>MockData</code>, lo que garantiza el testeo seguro de la interfaz sin riesgo de corrupción de datos.</li>
  </ul>

  <h2>2. Validación de la Estructura de la Base de Datos</h2>

  <h3>2.1. Correspondencia Exacta de las 9 Tablas del Sistema</h3>
  <p>
    Se verificó contra el esquema SQL físico implementado en <code>supabase/migrations/20261023_001_initial_schema.sql</code> que las 9 tablas descritas coinciden en un 100% con la base de datos real:
  </p>

  <table>
    <thead>
      <tr>
        <th style="width: 25%;">Tabla Física (SQL)</th>
        <th style="width: 25%;">Entidad Conceptual (ER)</th>
        <th>Propósito e Integridad Referencial Clave</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>profiles</code></td>
        <td>PERFILES</td>
        <td>Almacena usuarios vinculados a <code>auth.users</code> con roles estrictos (<code>admin</code>, <code>mozo</code>, <code>cocinero</code>).</td>
      </tr>
      <tr>
        <td><code>raw_materials</code></td>
        <td>MATERIAS_PRIMAS</td>
        <td>Insumos de pastelería/cafetería, unidades (<code>gr</code>, <code>ml</code>, <code>un</code>), costos y umbral de stock mínimo.</td>
      </tr>
      <tr>
        <td><code>preparations</code></td>
        <td>PREPARACIONES</td>
        <td>Catálogo de productos terminados, precios, categoría y rendimiento de fraccionamiento (<code>portion_yield</code>).</td>
      </tr>
      <tr>
        <td><code>preparation_ingredients</code></td>
        <td>INGREDIENTES_RECETA</td>
        <td>Tabla asociativa ($N:M$) entre preparaciones e insumos. Resuelve la ficha técnica de cada receta.</td>
      </tr>
      <tr>
        <td><code>production_records</code></td>
        <td>REGISTROS_PRODUCCION</td>
        <td>Auditoría de lotes cocinados (<code>batch_code</code>), cantidades producidas y usuario responsable.</td>
      </tr>
      <tr>
        <td><code>stock_movements</code></td>
        <td>MOVIMIENTOS_STOCK</td>
        <td>Kardex integral de movimientos (entradas, consumos por cocción, mermas y despachos).</td>
      </tr>
      <tr>
        <td><code>orders</code></td>
        <td>COMANDAS</td>
        <td>Comandas de salón y take away, numeración correlativa, total y trazabilidad de estados.</td>
      </tr>
      <tr>
        <td><code>order_items</code></td>
        <td>DETALLES_COMANDA</td>
        <td>Renglones de pedido ($N:M$ entre Comandas y Preparaciones), precios congelados al momento de venta.</td>
      </tr>
      <tr>
        <td><code>purchase_list_items</code></td>
        <td>LISTA_COMPRAS</td>
        <td>Sugerencias inteligentes de abastecimiento basadas en faltantes críticos de stock.</td>
      </tr>
    </tbody>
  </table>

  <h3>2.2. Diagrama Entidad–Relación (Figura 7)</h3>
  <p>
    El diagrama modela con gran precisión las cardinalidades del dominio:
  </p>
  <ul>
    <li><strong>Relaciones 1 a N:</strong> Un perfil crea muchas comandas y producciones; una comanda contiene múltiples renglones de detalle.</li>
    <li><strong>Relaciones N a M:</strong> Perfectamente normalizadas a través de las tablas intermedias <code>preparation_ingredients</code> y <code>order_items</code>.</li>
    <li><strong>Auditoría Polimórfica en Kardex:</strong> La tabla <code>stock_movements</code> cuenta con una restricción CHECK que garantiza que un movimiento afecte o bien a un insumo o a una preparación, pero nunca a ambos simultáneamente ni a ninguno.</li>
  </ul>

  <div class="callout">
    <p><strong>Sugerencia de ajuste (Figura 7):</strong> En el gráfico del Diagrama ER, las cajas tienen títulos en español (<code>PERFILES</code>, <code>PREPARACIONES</code>, <code>MATERIAS_PRIMAS</code>), mientras que en el código SQL físico y en las tablas del reporte están en inglés (<code>profiles</code>, <code>preparations</code>, <code>raw_materials</code>). Conviene sumar una breve nota al pie en la Figura 7 indicando que los nombres en español se utilizan a título conceptual-didáctico.</p>
  </div>

  <h2>3. Aspectos Clave para Enriquecer la Documentación</h2>

  <p>Para que la entrega alcance el nivel de distinción técnica, se sugiere sumar estas 4 precisiones sobre PostgreSQL:</p>

  <h3>3.1. Procedimientos Almacenados Transaccionales (Supabase RPC)</h3>
  <p>
    El informe actual no menciona que la aplicación delega la lógica crítica a funciones atómicas en PostgreSQL (<code>supabase/migrations/20261023_002_production_rpc.sql</code>):
  </p>
  <ul>
    <li><strong><code>confirm_production_batch</code>:</strong> Ejecuta una transacción ACID que bloquea las filas de insumos mediante <code>FOR UPDATE</code> para prevenir condiciones de carrera (Race Conditions), valida que el stock sea suficiente, descuenta las materias primas, suma el producto a la vitrina y asienta el movimiento en el Kardex.</li>
    <li><strong><code>process_order_production_and_sale</code>:</strong> Gestiona atómicamente el cobro y entrega de pedidos.</li>
  </ul>

  <h3>3.2. Reglas de Integridad Referencial (ON DELETE)</h3>
  <p>
    Conviene detallar cómo el motor SQL previene registros huérfanos o inconsistencias contables:
  </p>
  <ul>
    <li><code>ON DELETE CASCADE</code>: En <code>order_items</code> y <code>preparation_ingredients</code> para limpiar detalles al anular una cabecera.</li>
    <li><code>ON DELETE RESTRICT</code>: En <code>preparations</code> hacia <code>production_records</code> y <code>order_items</code>. PostgreSQL impide borrar físicamente una receta si ya tiene ventas o producciones pasadas, obligando a usar borrado lógico (<code>is_active: false</code>).</li>
    <li><code>ON DELETE SET NULL</code>: En claves de usuarios (<code>created_by</code>) para preservar los registros contables históricos aunque se dé de baja un empleado.</li>
  </ul>

  <h3>3.3. Seguridad Implementada: Row Level Security (RLS)</h3>
  <p>
    En la página 4 del manual se menciona que las políticas de seguridad están "a revisar". En realidad, <strong>las políticas RLS ya están 100% implementadas y activas</strong> en las 9 tablas (en <code>20261023_001_initial_schema.sql</code>), garantizando que solo los administradores puedan alterar recetas y materias primas, mientras que mozos y cocineros operan bajo permisos controlados.
  </p>

  <h3>3.4. Índice Condicional Antiduplicados en Lista de Compras</h3>
  <p>
    En el punto 4.4 se elogia la prevención de duplicados en compras. Técnicamente esto se implementó con un <strong>índice único parcial en PostgreSQL</strong> (migración 006):
  </p>
  <pre><code>CREATE UNIQUE INDEX idx_purchase_list_unpurchased_mat 
ON public.purchase_list_items (raw_material_id) 
WHERE is_purchased = false;</code></pre>
  <p>Esto permite registrar compras históricas recurrentes de un mismo ingrediente, impidiendo únicamente que se agregue dos veces el mismo insumo pendiente de compra al carrito.</p>

  <h2>4. Validación de Pruebas Automatizadas y CRUD</h2>
  <div class="callout callout-success">
    <p><strong>Resultado Verificado:</strong> Se confirmaron las <strong>14 pruebas automatizadas con 100% de éxito</strong> (9 unitarias PU01-PU09 en <code>businessRules.test.ts</code> y 5 de integración PI01-PI05 en <code>productionIntegration.test.ts</code>). Las evidencias fotográficas de Vitest y de la compilación de producción con Vite son 100% fidedignas.</p>
  </div>
  <p>
    La prueba controlada de eliminación (Delete) sobre la preparación <code>PREP-009</code> con advertencia previa y posterior verificación del catálogo en 8 productos cumple a la perfección el estándar de evaluación.
  </p>

  <h2>5. Checklist para la Versión Definitiva</h2>
  <ul class="checklist">
    <li><strong>Figura 7 (Diagrama ER):</strong> Agregar nota aclaratoria de equivalencia conceptual (Español) vs física (Inglés en PostgreSQL).</li>
    <li><strong>Sección Base de Datos:</strong> Incorporar mención a los procedimientos almacenados RPC (<code>confirm_production_batch</code> con <code>FOR UPDATE</code>).</li>
    <li><strong>Sección Integridad:</strong> Mencionar la protección de borrado <code>ON DELETE RESTRICT</code> para recetas con historial.</li>
    <li><strong>Sección Seguridad:</strong> Destacar que las 9 tablas ya operan con <strong>Row Level Security (RLS)</strong> activo.</li>
    <li><strong>Roles:</strong> Mantener la mención a los 3 roles actuales (<code>admin</code>, <code>mozo</code>, <code>cocinero</code>).</li>
  </ul>

  <p style="margin-top: 15px; text-align: center; font-size: 8.5pt; color: #64748b;">
    <em>Documento generado para el equipo de desarrollo de Dulce Taller POS • Noviembre 2026</em>
  </p>

</body>
</html>
`;

async function run() {
  const tempHtmlPath = path.join(os.tmpdir(), `temp_feedback_${Date.now()}.html`);
  fs.writeFileSync(tempHtmlPath, htmlContent, 'utf8');

  console.log('Generando PDF profesional con Microsoft Edge...');
  const fileUrl = 'file:///' + tempHtmlPath.replace(/\\/g, '/');
  const tempTargetPdf = path.join(os.tmpdir(), `edge_pdf_${Date.now()}_feedback.pdf`);
  const cmd = `"${edgePath}" --headless --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf="${tempTargetPdf}" --print-to-pdf-no-header "${fileUrl}"`;

  execSync(cmd, { stdio: 'pipe' });

  if (fs.existsSync(tempHtmlPath)) {
    fs.unlinkSync(tempHtmlPath);
  }

  fs.copyFileSync(tempTargetPdf, pdfPath);
  fs.unlinkSync(tempTargetPdf);

  const stats = fs.statSync(pdfPath);
  console.log(`✓ PDF generado con éxito: ${pdfPath} (${(stats.size / 1024).toFixed(1)} KB)`);
}

run().catch(err => {
  console.error('Error generando PDF:', err);
  process.exit(1);
});

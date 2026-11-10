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
  <title>Dulce Taller POS - Guión de Demostración en Vivo</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700&display=swap');

    @page {
      size: A4;
      margin: 13mm 14mm 13mm 14mm;
    }

    * { box-sizing: border-box; }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 9pt;
      line-height: 1.42;
      color: #1c120c;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
    }

    .header-box {
      border-bottom: 2.5px solid #9d3c0c;
      padding-bottom: 9px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }

    .brand-title {
      font-family: 'Playfair Display', serif;
      font-size: 20pt;
      font-weight: 700;
      color: #1c120c;
      margin: 0;
      line-height: 1.1;
    }

    .brand-subtitle {
      font-size: 10pt;
      font-weight: 700;
      color: #9d3c0c;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-top: 2px;
    }

    .meta-box {
      text-align: right;
      font-size: 8.2pt;
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

    .intro-banner {
      background-color: #fff8f2;
      border: 1px solid #dec0b6;
      border-left: 4px solid #9d3c0c;
      padding: 8px 11px;
      border-radius: 8px;
      margin-bottom: 12px;
      font-size: 8.5pt;
      color: #57423a;
    }

    .scope-pills {
      display: flex;
      gap: 6px;
      margin-top: 4px;
    }

    .scope-pill {
      background: #ffffff;
      border: 1px solid #dec0b6;
      border-radius: 4px;
      padding: 1px 6px;
      font-size: 7.8pt;
      font-weight: 700;
      color: #1c120c;
    }

    .act-card {
      background: #ffffff;
      border: 1px solid #dec0b6;
      border-radius: 9px;
      margin-bottom: 10px;
      overflow: hidden;
      page-break-inside: avoid;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }

    .act-header {
      padding: 6px 11px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #dec0b6;
    }

    .act-header-web { background: #eff6ff; }
    .act-header-mozo { background: #fff1eb; }
    .act-header-cocina { background: #fef7ed; }
    .act-header-admin { background: #fdf2f8; }

    .act-title {
      font-family: 'Playfair Display', serif;
      font-size: 11.5pt;
      font-weight: 700;
      color: #1c120c;
      margin: 0;
    }

    .role-badge {
      font-size: 7.5pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 2px 7px;
      border-radius: 16px;
    }

    .badge-web { background: #2563eb; color: #ffffff; }
    .badge-mozo { background: #9d3c0c; color: #ffffff; }
    .badge-cocina { background: #d97706; color: #ffffff; }
    .badge-admin { background: #1c120c; color: #ffffff; }

    .act-body {
      padding: 8px 11px 9px 11px;
    }

    .objective-tag {
      font-size: 8pt;
      font-style: italic;
      color: #7c5641;
      margin-bottom: 6px;
    }

    .steps-list {
      margin: 0;
      padding-left: 16px;
    }

    .steps-list li {
      margin-bottom: 4px;
      font-size: 8.5pt;
    }

    .steps-list li strong {
      color: #1c120c;
    }

    .speech-box {
      background: #fdf8f4;
      border-left: 3px solid #dec0b6;
      padding: 4px 8px;
      margin: 3px 0 5px 0;
      font-size: 8pt;
      color: #7c5641;
      border-radius: 0 5px 5px 0;
    }

    .speech-box span {
      font-weight: 700;
      color: #9d3c0c;
    }

    .tips-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 9px;
      page-break-inside: avoid;
    }

    .tip-box {
      background: #fff8f2;
      border: 1px solid #dec0b6;
      border-radius: 8px;
      padding: 7px 9px;
      font-size: 8pt;
    }

    .tip-box-title {
      font-weight: 800;
      color: #9d3c0c;
      margin-bottom: 2px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .closure-box {
      background: #1c120c;
      color: #ffffff;
      border-radius: 8px;
      padding: 8px 12px;
      margin-top: 9px;
      page-break-inside: avoid;
    }

    .closure-box-title {
      color: #dec0b6;
      font-size: 7.8pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }

    .closure-quote {
      font-family: 'Playfair Display', serif;
      font-size: 9.5pt;
      font-style: italic;
      margin-top: 2px;
      line-height: 1.35;
      color: #fff8f2;
    }

    .page-break {
      page-break-after: always;
    }
  </style>
</head>
<body>

  <!-- CABECERA PRINCIPAL -->
  <div class="header-box">
    <div>
      <h1 class="brand-title">Dulce Taller POS</h1>
      <div class="brand-subtitle">Guión Oficial de Demostración en Video</div>
    </div>
    <div class="meta-box">
      <div>Duración estimada: <strong>6 a 7 minutos</strong></div>
      <div>Tope máximo permitido: <strong>10 minutos</strong></div>
      <div class="meta-tag">Alcance Académico Acordado</div>
    </div>
  </div>

  <div class="intro-banner">
    <strong>Alcance oficial del sistema:</strong>
    <div class="scope-pills">
      <span class="scope-pill">1. Sitio Web Funcional (Clientes)</span>
      <span class="scope-pill">2. Gestión de Comandas (Salón & Cocina)</span>
      <span class="scope-pill">3. Control de Stock & Producción (Depósito)</span>
    </div>
    <div style="margin-top: 4px; font-size: 7.8pt; color: #7c5641;">
      * Nota: La gestión de cobros y facturación queda fuera del alcance evaluado, enfocando el 100% del video en la operación gastronómica y el stock.
    </div>
  </div>

  <!-- ACTO 1: SITIO WEB Y SALÓN -->
  <div class="act-card">
    <div class="act-header act-header-mozo">
      <h2 class="act-title">ACTO 1: Sitio Web Público y Salón (Mozo)</h2>
      <span class="role-badge badge-mozo">Rol: Mozo de Salón (1:30 min)</span>
    </div>
    <div class="act-body">
      <div class="objective-tag"><strong>Objetivo:</strong> Conectar la presencia web para clientes con la toma de comandas y el control de vitrina en tiempo real.</div>
      <ol class="steps-list">
        <li>
          <strong>Presentación del Sitio Web (15 seg):</strong> Mostrar brevemente la página web pública de Dulce Taller:
          <div class="speech-box"><span>Decir al público:</span> "El sistema cuenta con un sitio web funcional donde los clientes exploran nuestra pastelería y cafetería artesanal en línea."</div>
        </li>
        <li>
          <strong>Ingreso al POS de Salón (15 seg):</strong> Iniciar sesión en la app seleccionando <em>Mozo de Salón</em>. Señalar la interfaz táctil adaptada para tablets.
        </li>
        <li>
          <strong>Franja de Vitrina Inteligente (20 seg):</strong> Mostrar la barra superior de disponibilidad en vivo. Los mozos ven en verde lo disponible y en amarillo/rojo lo que escasea antes de acercarse a la mesa.
        </li>
        <li>
          <strong>Carga de Comanda (Mesa 3) (30 seg):</strong> Tocar <em>"+ Nueva Comanda"</em>, seleccionar Mesa 3 y agregar:
          <ul>
            <li><strong>1x Café Latte</strong> ($3.900)</li>
            <li><strong>1x Porción Lemon Pie</strong> ($3.800) con nota rápida: <em>"bien fría"</em></li>
            <li><strong>1x Cookie Americana</strong> ($2.400)</li>
          </ul>
        </li>
        <li>
          <strong>Validación de Stock en Tiempo Real (10 seg):</strong> Intentar agregar más porciones de las que hay en vitrina.
          <div class="speech-box"><span>Punto clave:</span> "El sistema valida al instante y bloquea la venta si supera el stock real disponible, evitando decepcionar al cliente."</div>
        </li>
        <li>
          <strong>Envío a Cocina:</strong> Presionar <em>"Crear Comanda"</em>. Aparece de inmediato en <em>"Pendientes"</em> con su cronómetro en vivo.
        </li>
      </ol>
    </div>
  </div>

  <!-- ACTO 2: COCINA EN ACCIÓN -->
  <div class="act-card">
    <div class="act-header act-header-cocina">
      <h2 class="act-title">ACTO 2: Pantalla de Cocina y Despacho</h2>
      <span class="role-badge badge-cocina">Rol: Cocinero (1:15 min)</span>
    </div>
    <div class="act-body">
      <div class="objective-tag"><strong>Objetivo:</strong> Demostrar la comunicación inmediata entre salón y cocina sin papeles ni órdenes extraviadas.</div>
      <ol class="steps-list">
        <li>
          <strong>Acceso de Cocina:</strong> Cambiar usuario o rol a <em>Cocinero</em>.
          <div class="speech-box"><span>Decir al público:</span> "El cocinero cuenta con su pantalla operativa donde visualiza exclusivamente pedidos pendientes, notas de mesa y tiempos de espera."</div>
        </li>
        <li>
          <strong>Iniciar Preparación:</strong> Identificar la comanda de la Mesa 3 y presionar <em>"Empezar Preparación"</em>. La tarjeta se traslada a la columna <em>"En Preparación"</em>.
        </li>
        <li>
          <strong>Finalización con Aviso Sonoro:</strong> Al terminar la elaboración, tocar <em>"Marcar Lista"</em>. El sistema emite el sonido chime de campana alertando al salón que el pedido está listo para retirar.
        </li>
      </ol>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- CABECERA PÁGINA 2 -->
  <div class="header-box" style="margin-top: 5px;">
    <div>
      <h1 class="brand-title" style="font-size: 16pt;">Dulce Taller POS</h1>
      <div class="brand-subtitle" style="font-size: 9pt;">Parte 2: Despacho, Stock & Producción</div>
    </div>
    <div class="meta-box">
      <div>Control de Stock & Backoffice</div>
    </div>
  </div>

  <!-- ACTO 3: ENTREGA Y FRACCIONAMIENTO -->
  <div class="act-card">
    <div class="act-header act-header-mozo">
      <h2 class="act-title">ACTO 3: Despacho de Comanda y Fraccionamiento en Vitrina</h2>
      <span class="role-badge badge-mozo">Rol: Mozo & Stock (1:30 min)</span>
    </div>
    <div class="act-body">
      <div class="objective-tag"><strong>Objetivo:</strong> Mostrar el descuento automático de vitrina al entregar y la reposición mediante fraccionamiento de tortas madre.</div>
      <ol class="steps-list">
        <li>
          <strong>Entrega al Cliente (20 seg):</strong> Volver a la sesión de <em>Mozo</em>, ubicar la comanda en <em>"Listas"</em> y presionar <strong>"Marcar Entregada"</strong>.
          <div class="speech-box"><span>Explicar:</span> "Al despachar la comanda, el sistema descuenta automáticamente los productos terminados del stock de vitrina."</div>
        </li>
        <li>
          <strong>Fraccionamiento de Torta Entera en Porciones (Inventario) (50 seg):</strong>
          Ir a <em>Inventario $\rightarrow$ Vitrina</em>. Observar cómo bajó el stock de la porción y presionar:
          <br><strong>"Cortar 1 Torta en Porciones (+16 porc.)"</strong> (en Brownie) o <strong>(+8 porc.)</strong> (en Lemon Pie).
          <div class="speech-box"><span>Punto clave:</span> "Con un solo toque, el sistema descuenta 1 torta entera madre y genera las porciones listas para la venta."</div>
        </li>
      </ol>
    </div>
  </div>

  <!-- ACTO 4: PRODUCCIÓN, RECETAS Y COMPRAS -->
  <div class="act-card">
    <div class="act-header act-header-admin">
      <h2 class="act-title">ACTO 4: Fichas Técnicas, Producción y Compras</h2>
      <span class="role-badge badge-admin">Rol: Administrador / Dueño (2:00 min)</span>
    </div>
    <div class="act-body">
      <div class="objective-tag"><strong>Objetivo:</strong> Exhibir la explosión de ingredientes de las recetas, el consumo de materia prima y las sugerencias automáticas de compra.</div>
      <ol class="steps-list">
        <li>
          <strong>Fichas Técnicas y Costeo (Recetas) (35 seg):</strong>
          Abrir la pestaña <em>Recetas</em>. Seleccionar una receta (ej. Brownie Húmedo de Chocolate o Lemon Pie):
          mostrar la lista de materias primas con sus cantidades exactas, costo total de la tanda y margen de ganancia.
        </li>
        <li>
          <strong>Cocción en Producción con Consumo Atómico (50 seg):</strong>
          Ir a <em>Producción</em>. Usar el selector táctil <strong>[-] [ 1 ] [+]</strong> para definir la cantidad a elaborar.
          Mostrar el semáforo de insumos (harina, manteca, azúcar, chocolate) y tocar <strong>"Confirmar Producción"</strong>.
          <div class="speech-box"><span>Punto clave:</span> "El sistema descuenta de forma atómica los gramos e insumos del depósito e incrementa el producto elaborado listo para vitrina."</div>
        </li>
        <li>
          <strong>Sugerencias Inteligentes de Compra (35 seg):</strong>
          Ir a <em>Compras</em>. Mostrar cómo los insumos que quedaron por debajo de su umbral mínimo de alerta se incorporaron automáticamente a la lista de compras del proveedor.
        </li>
      </ol>
    </div>
  </div>

  <!-- CONSEJOS PRÁCTICOS -->
  <div class="tips-grid">
    <div class="tip-box">
      <div class="tip-box-title">⏱️ Control del Tiempo (6-7 min)</div>
      No detenerse en detalles secundarios; seguir el hilo conductor del pedido desde que entra hasta que se reponen los insumos. Esto garantiza terminar con comodidad antes de los 10 minutos.
    </div>
    <div class="tip-box">
      <div class="tip-box-title">💻 Demostración en 2 Ventanas</div>
      Tener una pestaña normal con <strong>Mozo</strong> y otra en incógnito con <strong>Cocinero</strong> para mostrar la sincronización instantánea sin perder tiempo cerrando sesión.
    </div>
  </div>

  <!-- FRASE DE CIERRE -->
  <div class="closure-box">
    <div class="closure-box-title">Frase de Cierre (15 seg):</div>
    <div class="closure-quote">
      "Como pudieron apreciar, Dulce Taller integra en un solo ecosistema el sitio web para clientes, la gestión ágil de comandas en salón y cocina, y el control automatizado del stock desde la receta hasta la compra de insumos."
    </div>
  </div>

</body>
</html>
`;

// 1. Guardar Markdown complementario
const mdContent = `# Dulce Taller POS - Guión de Demostración en Video
**Duración objetivo:** 6 a 7 minutos (Límite máximo permitido: 10 minutos)  
**Alcance oficial del sistema:**
1. **Sitio Web Funcional:** Catálogo y presencia pública para clientes.
2. **Gestión de Comandas:** Flujo ágil de salón (Mozo) y cocina (Cocinero).
3. **Control de Stock & Producción:** Inventario de vitrina, materias primas, fichas técnicas y compras automáticas.

*(Nota: La parte de cobros queda excluida de la demo por definición de alcance del proyecto).*

---

## 🎬 ACTO 1: Sitio Web Público y Salón (Rol: Mozo de Salón ~ 1:30 min)
- **Sitio Web (15 seg):** Mostrar brevemente la web pública donde los clientes exploran el menú.
- **Acceso al POS (15 seg):** Ingresar como *Mozo de Salón* en la tablet.
- **Vitrina Inteligente (20 seg):** Mostrar la franja superior de disponibilidad cocinada en tiempo real.
- **Carga de Comanda (Mesa 3) (30 seg):**
  - 1x Café Latte ($3.900)
  - 1x Porción Lemon Pie ($3.800) [Nota: "bien fría"]
  - 1x Cookie Americana ($2.400)
- **Validación de Stock (10 seg):** Intentar pedir más de lo que hay en vitrina; el sistema bloquea pedidos sin stock.
- **Envío a Cocina:** Presionar *Crear Comanda* y verla en la columna *Pendientes* con su cronómetro activo.

---

## 🎬 ACTO 2: Pantalla de Cocina y Despacho (Rol: Cocinero ~ 1:15 min)
- **Ingreso de Cocina:** Cambiar usuario a *Cocinero*.
- **Inicio de Preparación:** Tomar la comanda de Mesa 3 y presionar *Empezar Preparación* (pasa a *En Preparación*).
- **Despacho con Aviso Sonoro:** Al finalizar, presionar *Marcar Lista* (emite sonido chime alertando al salón).

---

## 🎬 ACTO 3: Despacho y Fraccionamiento en Vitrina (Rol: Mozo & Stock ~ 1:30 min)
- **Entrega de Comanda (20 seg):** Volver a *Mozo*, ubicar la comanda en *Listas* y presionar *Marcar Entregada* (descuenta automáticamente el stock de vitrina).
- **Fraccionamiento Inteligente (50 seg):**
  - Ir a *Inventario $\rightarrow$ Vitrina*.
  - Observar el stock y presionar *Cortar 1 Torta en Porciones (+16 porc.)* o *(+8 porc.)*.
  - Explicar cómo descuenta 1 torta entera madre y suma porciones listas al mostrador.

---

## 🎬 ACTO 4: Fichas Técnicas, Producción y Compras (Rol: Administrador ~ 2:00 min)
- **Fichas Técnicas y Costeo (35 seg):**
  - En *Recetas*, abrir Brownie o Lemon Pie: mostrar materias primas, costo total de tanda y margen comercial.
- **Cocción en Producción (50 seg):**
  - En *Producción*, usar el selector *[-] [ 1 ] [+]* y el semáforo de insumos.
  - Tocar *Confirmar Producción*: se descuentan las materias primas del depósito y se incrementa el producto terminado.
- **Sugerencias Inteligentes de Compra (35 seg):**
  - En *Compras*, mostrar cómo los insumos bajo mínimo se incorporan solos a la lista de reposición.

---

## 💡 Consejos de Filmación:
1. **Duración estricta:** Al no incluir el cobro, el video fluye en ~6 minutos y medio, dando un margen de seguridad de más de 3 minutos respecto al tope de 10 min.
2. **Dos navegadores:** Usar ventana normal para Mozo e incógnito para Cocinero.
3. **Frase de Cierre (15 seg):**
   > *"Dulce Taller integra en un solo ecosistema el sitio web para clientes, la gestión ágil de comandas en salón y cocina, y el control automatizado del stock desde la receta hasta la compra de insumos."*
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

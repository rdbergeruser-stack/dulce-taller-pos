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
      margin: 14mm 15mm 14mm 15mm;
    }

    * { box-sizing: border-box; }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 9.3pt;
      line-height: 1.45;
      color: #1c120c;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
    }

    .header-box {
      border-bottom: 2.5px solid #9d3c0c;
      padding-bottom: 10px;
      margin-bottom: 14px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }

    .brand-title {
      font-family: 'Playfair Display', serif;
      font-size: 21pt;
      font-weight: 700;
      color: #1c120c;
      margin: 0;
      line-height: 1.1;
    }

    .brand-subtitle {
      font-size: 10.5pt;
      font-weight: 700;
      color: #9d3c0c;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 3px;
    }

    .meta-box {
      text-align: right;
      font-size: 8.5pt;
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
      margin-top: 3px;
    }

    .intro-banner {
      background-color: #fff8f2;
      border: 1px solid #dec0b6;
      border-left: 4px solid #9d3c0c;
      padding: 9px 12px;
      border-radius: 8px;
      margin-bottom: 14px;
      font-size: 8.8pt;
      color: #57423a;
    }

    .intro-banner strong {
      color: #1c120c;
    }

    .act-card {
      background: #ffffff;
      border: 1px solid #dec0b6;
      border-radius: 10px;
      margin-bottom: 11px;
      overflow: hidden;
      page-break-inside: avoid;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
    }

    .act-header {
      padding: 7px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #dec0b6;
    }

    .act-header-mozo { background: #fff1eb; }
    .act-header-cocina { background: #fef7ed; }
    .act-header-cobro { background: #ecfdf5; }
    .act-header-admin { background: #fdf2f8; }

    .act-title {
      font-family: 'Playfair Display', serif;
      font-size: 12pt;
      font-weight: 700;
      color: #1c120c;
      margin: 0;
    }

    .role-badge {
      font-size: 7.8pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      padding: 2.5px 8px;
      border-radius: 20px;
    }

    .badge-mozo { background: #9d3c0c; color: #ffffff; }
    .badge-cocina { background: #d97706; color: #ffffff; }
    .badge-cobro { background: #059669; color: #ffffff; }
    .badge-admin { background: #1c120c; color: #ffffff; }

    .act-body {
      padding: 9px 12px 10px 12px;
    }

    .objective-tag {
      font-size: 8.2pt;
      font-style: italic;
      color: #7c5641;
      margin-bottom: 7px;
    }

    .steps-list {
      margin: 0;
      padding-left: 17px;
    }

    .steps-list li {
      margin-bottom: 5px;
      font-size: 8.8pt;
    }

    .steps-list li strong {
      color: #1c120c;
    }

    .speech-box {
      background: #fdf8f4;
      border-left: 3px solid #dec0b6;
      padding: 5px 9px;
      margin: 4px 0 6px 0;
      font-size: 8.3pt;
      color: #7c5641;
      border-radius: 0 6px 6px 0;
    }

    .speech-box span {
      font-weight: 700;
      color: #9d3c0c;
    }

    .tips-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 9px;
      margin-top: 10px;
      page-break-inside: avoid;
    }

    .tip-box {
      background: #fff8f2;
      border: 1px solid #dec0b6;
      border-radius: 8px;
      padding: 8px 10px;
      font-size: 8.2pt;
    }

    .tip-box-title {
      font-weight: 800;
      color: #9d3c0c;
      margin-bottom: 3px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .closure-box {
      background: #1c120c;
      color: #ffffff;
      border-radius: 8px;
      padding: 9px 13px;
      margin-top: 10px;
      page-break-inside: avoid;
    }

    .closure-box-title {
      color: #dec0b6;
      font-size: 8.2pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }

    .closure-quote {
      font-family: 'Playfair Display', serif;
      font-size: 10pt;
      font-style: italic;
      margin-top: 3px;
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
      <div class="brand-subtitle">Guión Oficial de Demostración en Vivo</div>
    </div>
    <div class="meta-box">
      <div>Duración estimada: <strong>8 a 10 min</strong></div>
      <div>Estrategia: <strong>Storytelling Operativo</strong></div>
      <div class="meta-tag">Versión Tablet & Web 2026</div>
    </div>
  </div>

  <div class="intro-banner">
    <strong>Enfoque de la presentación:</strong> En lugar de describir pantallas estáticas, mostramos el <em>ciclo de vida real del negocio</em>: desde que el cliente pide en la mesa, pasando por la cocina, el cobro multicanal con envío por WhatsApp, hasta el fraccionamiento de vitrina, recetas y compras automáticas.
  </div>

  <!-- ACTO 1 -->
  <div class="act-card">
    <div class="act-header act-header-mozo">
      <h2 class="act-title">ACTO 1: El Salón y la Comanda Táctil</h2>
      <span class="role-badge badge-mozo">Rol: Mozo de Salón</span>
    </div>
    <div class="act-body">
      <div class="objective-tag"><strong>Objetivo:</strong> Demostrar agilidad táctil, visualización de vitrina en tiempo real y bloqueo preventivo de quiebres de stock.</div>
      <ol class="steps-list">
        <li>
          <strong>Ingreso y Bienvenida:</strong> En el login seleccionar <em>Mozo de Salón</em>.
          <div class="speech-box"><span>Decir al público:</span> "El mozo accede a una pantalla limpia y 100% táctil, diseñada para tablet, enfocada únicamente en comandas y disponibilidad."</div>
        </li>
        <li>
          <strong>Franja de Vitrina Inteligente:</strong> Señalar la franja superior de disponibilidad cocinada. Mostrar cómo los ítems agotados o bajos se alertan en amarillo/rojo antes de ir a las mesas.
        </li>
        <li>
          <strong>Carga de Comanda (Mesa 3):</strong> Presionar <em>"+ Nueva Comanda"</em>, elegir Salón $\rightarrow$ Mesa 3. Agregar:
          <ul>
            <li><strong>1x Café Latte</strong> ($3.900)</li>
            <li><strong>1x Porción Lemon Pie</strong> ($3.800) con nota: <em>"bien fría"</em></li>
            <li><strong>1x Cookie Americana</strong> ($2.400)</li>
          </ul>
        </li>
        <li>
          <strong>Momento Clave (Bloqueo de Stock):</strong> Intentar subir la cantidad de porciones por encima del stock de vitrina.
          <div class="speech-box"><span>Punto de impacto:</span> "El sistema valida en tiempo real y no permite prometer al cliente productos que no están en el mostrador."</div>
        </li>
        <li>
          <strong>Envío a Cocina:</strong> Tocar <em>"Crear Comanda"</em>. Mostrar cómo se posiciona en la columna <em>"Pendientes"</em> con su cronómetro en vivo.
        </li>
      </ol>
    </div>
  </div>

  <!-- ACTO 2 -->
  <div class="act-card">
    <div class="act-header act-header-cocina">
      <h2 class="act-title">ACTO 2: La Cocina en Tiempo Real</h2>
      <span class="role-badge badge-cocina">Rol: Cocinero</span>
    </div>
    <div class="act-body">
      <div class="objective-tag"><strong>Objetivo:</strong> Demostrar la sincronización instantánea entre salón y cocina sin papeles ni gritos.</div>
      <ol class="steps-list">
        <li>
          <strong>Ingreso de Cocina:</strong> Cambiar usuario o rol a <em>Cocinero</em>.
          <div class="speech-box"><span>Decir al público:</span> "El cocinero cuenta con su pantalla de despacho donde solo ve lo pendiente de elaboración, tiempos de espera y notas especiales."</div>
        </li>
        <li>
          <strong>Iniciar Elaboración:</strong> Identificar la comanda de la Mesa 3 y tocar <em>"Empezar Preparación"</em>. La tarjeta pasa automáticamente a la columna <em>"En Preparación"</em>.
        </li>
        <li>
          <strong>Despacho y Aviso Sonoro:</strong> Al terminar, presionar <em>"Marcar Lista"</em>. El sistema emite el sonido chime de campana y avisa al salón que el pedido está listo para servir.
        </li>
      </ol>
    </div>
  </div>

  <!-- ACTO 3 -->
  <div class="act-card">
    <div class="act-header act-header-cobro">
      <h2 class="act-title">ACTO 3: Entrega, Cobro Multicanal y WhatsApp</h2>
      <span class="role-badge badge-cobro">Rol: Mozo / Cajero</span>
    </div>
    <div class="act-body">
      <div class="objective-tag"><strong>Objetivo:</strong> Exhibir la versatilidad de pagos (QR, Transferencia, POSNET) y el envío digital del comprobante.</div>
      <ol class="steps-list">
        <li>
          <strong>Entrega de Comanda:</strong> Regresar al rol <em>Mozo</em>, ubicar la comanda en <em>"Listas"</em> y presionar <em>"Marcar Entregada"</em> (aquí se descuenta el stock de vitrina).
        </li>
        <li>
          <strong>Apertura del Modal de Cobro:</strong> Tocar <em>"Cobrar Cuenta"</em>. Mostrar el detalle a cobrar y recorrer rápidamente las opciones:
          <ul>
            <li><strong>Cobro QR:</strong> Exhibir el código QR dinámico con el logo de Transferencias 3.0 y estado de espera.</li>
            <li><strong>Transferencia:</strong> Mostrar los datos bancarios con el botón de <em>"Copiar Alias"</em> y campo de referencia.</li>
            <li><strong>Tarjeta POSNET:</strong> Mostrar la simulación de terminal, tocar <em>"Simular Contactless"</em> (onda parpadeante de lectura) y el cupón editable.</li>
            <li><strong>Efectivo:</strong> Mostrar el cálculo automático de vuelto con los botones de billetes rápidos.</li>
          </ul>
        </li>
        <li>
          <strong>Confirmación y Comprobante:</strong> Confirmar el pago. Se emite el ticket con su código único de auditoría.
        </li>
        <li>
          <strong>Envío de Ticket por WhatsApp:</strong> Presionar <em>"Enviar Ticket por WhatsApp"</em>, ingresar un celular y mostrar cómo abre WhatsApp con el mensaje estructurado con emojis y detalle del consumo.
        </li>
      </ol>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- CABECERA PÁGINA 2 -->
  <div class="header-box" style="margin-top: 5px;">
    <div>
      <h1 class="brand-title" style="font-size: 16pt;">Dulce Taller POS</h1>
      <div class="brand-subtitle" style="font-size: 9pt;">Parte 2: Gestión Integral, Producción & Stock</div>
    </div>
    <div class="meta-box">
      <div>Administración & Backoffice</div>
    </div>
  </div>

  <!-- ACTO 4 -->
  <div class="act-card">
    <div class="act-header act-header-admin">
      <h2 class="act-title">ACTO 4: El Corazón del Negocio y Backoffice</h2>
      <span class="role-badge badge-admin">Rol: Administrador / Dueño</span>
    </div>
    <div class="act-body">
      <div class="objective-tag"><strong>Objetivo:</strong> Mostrar cómo las ventas impactan automáticamente en inventario, costos de recetas y sugerencias de compra.</div>
      <ol class="steps-list">
        <li>
          <strong>Centro de Notificaciones en Vivo:</strong> Ingresar como <em>Administrador</em>. Hacer clic en la campana de alertas 🔔 del Header para ver el resumen consolidado de faltantes de vitrina e insumos.
        </li>
        <li>
          <strong>Vitrina y Fraccionamiento Inteligente (Inventario):</strong>
          Ir a <em>Inventario $\rightarrow$ Vitrina</em>. Ubicar las porciones vendidas y hacer clic en:
          <br><strong>"Cortar 1 Torta en Porciones (+16 porc.)"</strong> (en Brownie) o <strong>(+8 porc.)</strong> (en Lemon Pie).
          <div class="speech-box"><span>Explicar:</span> "El sistema descuenta atómicamente 1 torta entera madre y suma las porciones cortadas listas para vender en mostrador."</div>
        </li>
        <li>
          <strong>Fichas Técnicas y Rentabilidad (Recetas):</strong>
          Abrir la pestaña <em>Recetas</em>. Seleccionar una receta (ej. Brownie Húmedo):
          mostrar la lista de ingredientes, costos unitarios, costo total por tanda y el margen comercial calculado.
        </li>
        <li>
          <strong>Cocción en Producción y Consumo de Insumos:</strong>
          Ir a <em>Producción</em>. Usar el nuevo selector táctil <strong>[-] [ 1 ] [+]</strong> para definir la tanda.
          Mostrar el semáforo de insumos (harina, manteca, chocolate) y tocar <em>"Confirmar Producción"</em>.
          Verificar cómo se descuentan los gramos exactos del stock de materias primas y se suma la torta terminada.
        </li>
        <li>
          <strong>Compras Inteligentes Automáticas:</strong>
          Ir a la pestaña <em>Compras</em>. Mostrar cómo los insumos que cayeron por debajo del stock mínimo se agregaron solos a la lista sugerida de reposición, listos para marcar como comprados.
        </li>
      </ol>
    </div>
  </div>

  <!-- CONSEJOS PRÁCTICOS -->
  <div class="tips-grid">
    <div class="tip-box">
      <div class="tip-box-title">💡 Tip 1: Efecto Dos Pantallas</div>
      Abrir una ventana normal como <strong>Mozo</strong> y otra en incógnito como <strong>Cocinero</strong>. Cargar una comanda en una y verla aparecer de inmediato en la otra genera un impacto visual insuperable.
    </div>
    <div class="tip-box">
      <div class="tip-box-title">💡 Tip 2: Dejar Alertas Previas</div>
      Antes de empezar, dejar un producto o insumo en stock bajo adrede. Así, al abrir la campanita de notificaciones, la audiencia ve el sistema alertando proactivamente.
    </div>
  </div>

  <!-- FRASE DE CIERRE -->
  <div class="closure-box">
    <div class="closure-box-title">Cierre Magistral Recomendado:</div>
    <div class="closure-quote">
      "Como pudieron ver, Dulce Taller POS no es solo una pantalla de cobro: es un ecosistema que conecta al mozo, al cocinero y al dueño, eliminando errores de stock, automatizando recetas y facilitando el cobro en segundos."
    </div>
  </div>

</body>
</html>
`;

// 1. Guardar Markdown complementario
const mdContent = `# Dulce Taller POS - Guión de Demostración en Vivo
**Duración estimada:** 8 a 10 minutos  
**Estrategia:** Storytelling Operativo (Ciclo de Vida Real)

---

## 🎬 ACTO 1: El Salón y la Comanda Táctil (Rol: Mozo de Salón)
- **Ingreso:** Iniciar sesión con rol *Mozo de Salón*.
- **Vitrina Inteligente:** Revisar la franja superior de stock cocinado en tiempo real.
- **Creación de Comanda (Mesa 3):**
  - 1x Café Latte ($3.900)
  - 1x Porción Lemon Pie ($3.800) [Nota: "bien fría"]
  - 1x Cookie Americana ($2.400)
- **Validación de Stock:** Intentar pedir más porciones que las disponibles; el sistema bloquea pedidos sin stock.
- **Envío a Cocina:** Presionar *Crear Comanda* y verla en columna *Pendientes* con cronómetro activo.

---

## 🎬 ACTO 2: La Cocina en Tiempo Real (Rol: Cocinero)
- **Ingreso de Cocina:** Cambiar usuario a *Cocinero*.
- **Inicio de Preparación:** Tomar la comanda de Mesa 3 y presionar *Empezar Preparación*.
- **Despacho con Aviso Sonoro:** Al finalizar, presionar *Marcar Lista* (emite sonido chime de campana).

---

## 🎬 ACTO 3: Entrega, Cobro Multicanal y WhatsApp (Rol: Mozo / Cajero)
- **Entrega:** Volver a *Mozo*, ubicar la comanda lista y tocar *Marcar Entregada* (descuenta vitrina).
- **Simulador de Cobro:** Tocar *Cobrar Cuenta* y recorrer:
  - **QR:** Código QR dinámico interoperable.
  - **Transferencia:** Tarjeta de datos bancarios con botón de copiar alias y referencia.
  - **Tarjeta (POSNET):** Simulación de terminal con lectura contactless y cupón.
  - **Efectivo:** Cálculo de vuelto con billetes rápidos.
- **Ticket por WhatsApp:** Presionar *Enviar Ticket por WhatsApp*, ingresar celular y abrir el chat pre-formateado.

---

## 🎬 ACTO 4: Gestión Integral, Producción y Stock (Rol: Administrador)
- **Campana de Alertas:** Abrir el centro de notificaciones consolidadas en el Header.
- **Fraccionamiento en Vitrina:** En *Inventario $\rightarrow$ Vitrina*, presionar *Cortar 1 Torta (+16 porc.)*.
- **Fichas Técnicas:** En *Recetas*, mostrar ingredientes, costos por tanda y margen comercial.
- **Producción con Selector Táctil:** En *Producción*, usar *[-] [ 1 ] [+]* y autorizar tanda descontando insumos.
- **Compras Inteligentes:** En *Compras*, mostrar la reposición automática de insumos bajo mínimo.

---

## 💡 Consejos para la Presentación:
1. Usar dos ventanas (normal para Mozo, incógnito para Cocinero).
2. Dejar un insumo bajo antes de empezar para mostrar las alertas.
3. **Cierre:** *"Dulce Taller POS conecta al mozo, al cocinero y al dueño, eliminando errores de stock y agilizando el local."*
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

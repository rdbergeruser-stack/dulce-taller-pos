# DULCE TALLER - SISTEMA POS & CONTROL DE PRODUCCIÓN
## MANUAL OPERATIVO DE USUARIO
**Aplicación:** Dulce Taller Tablet POS  
**Destinatarios:** Personal de Salón (Mozos / Cajeros) y Personal de Cocina / Administración  
**Versión:** 1.0  
**Fecha:** Octubre 2026  

---

## ☕ 1. INICIO DE TURNO Y ACCESO AL SISTEMA

Al encender la tablet o ingresar a la aplicación, se presenta la **Pantalla Táctil de Inicio de Turno**:

1. Selecciona tu perfil de trabajo:
   * **Lucas Rodríguez (Mozo / Personal de Salón):** Acceso directo y exclusivo a la toma de comandas, seguimiento de pedidos (KDS), vitrina en tiempo real y cobros.
   * **Martina González (Administradora / Encargada):** Acceso total a todas las solapas del sistema (Comandas, Inventario, Recetas, Producción y Compras).
2. La cabecera superior reflejará permanentemente quién está operando la terminal, su rol activo y el reloj en tiempo real.
3. Para cambiar de turno o cerrar sesión, presiona el botón **"Cambiar Turno"** en la esquina superior derecha.

---

## 🍽️ 2. GESTIÓN DE COMANDAS & KDS (SALÓN Y MOSTRADOR)

### 2.1 Cómo Crear una Nueva Comanda
1. En la solapa **Comandas**, pulsa el botón terracota **`+ Nueva Comanda`**.
2. **Selecciona el Origen:**
   * **Salón:** Se despliega el selector rápido de mesas (`Mesa 01`, `Mesa 02`, `Mesa 03`, `Mesa 04`).
   * **Take Away:** Se asigna automáticamente para despacho por mostrador.
   * **Taller:** Para comanda de participantes de workshops.
3. **Agrega los Productos:**
   * Toca cualquier tarjeta de producto para sumarlo a la comanda.
   * Si tocas más veces o usas los botones `+` y `-`, aumentas o disminuyes la cantidad.
   * **Nota para cocina:** Puedes escribir observaciones específicas por producto (ej. *"Leche descremada"*, *"Bien caliente"*, *"Porción merengue extra dorado"*).
4. **Verifica el Total y Confirma:** Presiona **`Confirmar Comanda`**. La comanda ingresa de inmediato al tablero KDS con su número identificador (`#101`, `#102`, etc.).

### 2.2 Estados de una Comanda en Cocina y Salón
Cada tarjeta en el tablero KDS cambia de color y muestra botones de acción rápida:
* **Pendiente (Amarillo):** La comanda acaba de ingresar. El botón **`Iniciar Preparación`** avisa a la cocina que se está elaborando.
* **En Preparación (Naranja):** Cocina la está preparando. Al finalizar, se pulsa **`Marcar como Lista`**.
* **Lista para Servir (Verde con Pulso):** El mozo sabe que el pedido está terminado en la barra o mostrador y listo para llevar a la mesa.
* **Entregada (Marrón):** El pedido ya fue servido en la mesa o entregado al cliente en mano. Al entregarlo, el sistema descuenta automáticamente el producto terminado del stock de vitrina.

---

## 💰 3. COBRO DE COMANDAS Y EMISIÓN DE COMPROBANTES

### 3.1 Pestaña "Entregadas / Por Cobrar" vs. "Cobradas"
* **Entregadas / Por Cobrar:** Muestra **únicamente las mesas que ya recibieron su pedido pero aún no pagaron la cuenta**. De esta forma, el mozo tiene siempre visible qué mesas están ocupadas con saldo pendiente.
* **Cobradas:** En cuanto se efectúa el cobro, la comanda sale de la vista de pendientes y se archiva en **"Cobradas"** y en el **"Historial Completo"** con el sello verde *"Cuenta Cobrada • Comprobante Emitido"*.

### 3.2 Pasos para Cobrar una Mesa
1. En la comanda entregada, pulsa el botón **`Cobrar Cuenta`**. Se abrirá el **Modal Táctil de Cobro**.
2. **Elige el Medio de Pago:**
   * **Efectivo:** 
     - Ingresa el importe recibido o utiliza los **botones táctiles de billetes rápidos** (`+$1.000`, `+$2.000`, `+$5.000`, `+$10.000`, `+$20.000` o `Pago Exacto`).
     - El sistema calcula y resalta en verde el **Vuelto exacto a entregar** al cliente.
   * **Tarjeta de Débito / Crédito:** Registra el cobro posnet.
   * **QR Interoperable:** Registra el cobro por billetera virtual (Mercado Pago, MODO, etc.).
   * **Voucher / Taller:** Para consumos incluidos en workshops.
3. Presiona **`Confirmar Cobro & Emitir Comprobante`**.
4. El sistema emite el comprobante digital con número de ticket fiscal interno, fecha, hora, detalle de ítems y vuelto entregado.

---

## 🍰 4. STOCK DE VITRINA Y FRACCIONAMIENTO DE TORTAS

El sistema de Dulce Taller utiliza un modelo inteligente para que nunca se trabe la venta de tortas:

### 4.1 Lectura de la Franja de Vitrina
En la parte superior de las comandas y en la solapa de Inventario, verás el stock cocinado en tiempo real con alertas semafóricas:
* 🟢 **Óptimo:** Hay stock suficiente en mostrador.
* 🟡 **Poco Stock:** Quedan 3 o menos porciones, o 1 torta entera.
* 🔴 **Agotado:** No hay stock en el local.
* 🟠 **0 cortadas (X tortas disp.):** Significa que no hay porciones ya rebanadas en la heladera exhibidora, pero **sí hay tortas enteras en la cámara listas para abrir**.

### 4.2 Corte Manual de Tortas
Si por la mañana el pastelero o el mozo deciden abrir una torta entera para exhibirla en porciones:
1. Ve a la solapa **Inventario** &rarr; Subsolapa **Productos Elaborados (Vitrina)**.
2. En la tarjeta de la porción (ej. *Porción Lemon Pie*), presiona el botón:
   **`🍰 Cortar 1 Torta (+8 porc.)`**.
3. El sistema automáticamente:
   - Descuenta 1 torta entera de la cámara.
   - Suma 8 porciones a la vitrina.
   - Registra el movimiento auditado en el Kardex.

### 4.3 Apertura Automática Asistida
Si el mozo toma un pedido de salón por 1 porción y en vitrina había 0 porciones cortadas pero quedaban tortas enteras:
* El mozo **puede agregar la porción sin problemas** (la tarjeta indica *"Abrir torta"*).
* Al despachar la comanda, el sistema abre la torta en cámara, suma las 8 porciones, descuenta la porción consumida y deja 7 porciones listas en vitrina.

---

## 👨‍🍳 5. COCINA: REGISTRO DE PRODUCCIÓN DE LOTES

Cuando la cocina hornea productos con materias primas:

1. Ingresa a la solapa **Producción**.
2. **Selecciona la Preparación:** Solo aparecen tortas enteras y cafetería (las porciones individuales no se cocinan por separado).
3. **Elige la Cantidad a Producir:** Selecciona con los botones rápidos `1`, `2`, `4` u `8` unidades.
4. **Previsualización de Requerimientos:**
   - La columna derecha muestra la lista exacta de ingredientes requeridos según la receta estándar.
   - Si tienes stock de todo, el panel se pondrá verde: *"Insumos suficientes para producir"*.
   - Si falta harina, manteca, huevos o frutillas, el panel se bloqueará en rojo indicando qué insumo falta y cuántos gramos necesitas reponer.
5. **Confirmar Lote:** Pulsa **`Confirmar Producción Terminada`**.
   - El sistema descuenta atómicamente las materias primas del depósito.
   - Suma las tortas terminadas a la vitrina.
   - Genera un código de lote único (ej. `LOTE-20261026-1230-PREP`) para trazabilidad bromatológica.

---

## 📖 6. GESTIÓN DE RECETAS Y FICHAS TÉCNICAS

En la solapa **Recetas**:

### 6.1 Costeo y Margen en Tiempo Real
Al hacer clic en cualquier receta (ej. *Lemon Pie*, *Torta Frutillas*, *Capuccino*), verás:
* **Costo Insumos:** Calculado automáticamente según los gramos/mililitros de cada ingrediente multiplicados por su costo de compra actual.
* **Precio Venta:** El precio al público configurado.
* **Margen Teórico:** Porcentaje de ganancia bruta sobre la preparación.

### 6.2 Edición de Recetas (Nombre, Precio y Porciones)
Para actualizar cualquier dato de una receta existente:
1. Haz clic en el **icono de lápiz ✏️** junto al nombre de la receta o en el botón **`✏️ Editar Ficha`**.
2. Se abrirá el modal donde puedes modificar:
   * **Nombre de la preparación** (ej. *Torta de Frutillas con Crema*).
   * **Precio de venta al público ($)**.
   * **Rendimiento en porciones** (ej. 8 porciones por torta).
   * **Categoría y tipo de unidad**.
   * **Descripción artesanal**.
3. Presiona **`Guardar Cambios`**. Se actualiza inmediatamente en el sistema y se recalculan los márgenes.

### 6.3 Creación de una Nueva Receta
1. Presiona el botón superior **`+ Nueva Receta / Preparación`**.
2. Ingresa código (ej. `PREP-005`), nombre, categoría, precio y porciones.
3. Asigna los ingredientes iniciales con sus cantidades y pulsa **`Guardar Receta Completa`**.

---

## 📦 7. INVENTARIO DE MATERIAS PRIMAS & KARDEX

En la solapa **Inventario**:

### 7.1 Semáforo de Stock de Materias Primas
* 🟢 **ÓPTIMO:** Stock holgado por encima del mínimo.
* 🟡 **BAJO MÍNIMO:** Stock igual o inferior al punto de reposición. Dispara automáticamente una sugerencia en la Lista de Compras.
* 🔴 **AGOTADO:** Stock en cero. Impide confirmar producciones en cocina para evitar platos incompletos.

### 7.2 Ajuste de Mermas y Diferencias de Inventario
Si se rompió un maple de huevos o se derramó leche:
1. En la tabla de insumos, pulsa **`Ajustar Stock`**.
2. Ingresa la cantidad real que hay en el estante/depósito.
3. Escribe el motivo obligatorio (ej. *"Rotura accidental en cocina"* o *"Conteo físico fin de mes"*).
4. El ajuste impacta en el stock y queda registrado en la pestaña **Kardex / Movimientos** con fecha, hora y usuario.

---

## 🛒 8. LISTA DE COMPRAS SUGERIDAS

En la solapa **Compras**:
1. **Sugerencias Automáticas:** El sistema evalúa todas las materias primas cuyo stock actual sea $\le$ stock mínimo y calcula cuántos kilos, litros o unidades comprar para volver al nivel óptimo.
2. **Agregar Insumo Manual:** Puedes pulsar **`+ Agregar Insumo a la Lista`** para agregar compras extraordinarias.
3. **Recepción de Mercadería:** Al comprar y recibir el pedido del proveedor, pulsa **`Marcar como Comprado`**. El insumo se elimina de la lista pendiente y sus unidades se acreditan de inmediato al stock disponible.

---

## ❓ 9. PREGUNTAS FRECUENTES (FAQ) OPERATIVAS

**¿Qué hago si un cliente pide una porción y en la tarjeta dice "0 cortadas"?**  
Puedes tomar la comanda con total tranquilidad. El sistema sabe que hay tortas enteras en la cámara y abrirá una automáticamente al entregar el pedido.

**¿Qué pasa si me equivoco al ingresar el vuelto de un cliente?**  
El modal de cobro te muestra el vuelto sugerido antes de confirmar. Si necesitas reimprimir o verificar qué cobraste, ve a la pestaña **Historial Completo** en Comandas para consultar el detalle del comprobante emitido.

**¿Se pueden eliminar recetas viejas que ya no se comercializan?**  
Sí, desde la solapa **Recetas**, seleccionando la preparación y pulsando **`Eliminar Receta`**. El sistema solicitará una confirmación de seguridad para evitar borrados accidentales.


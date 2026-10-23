# BackForge --- Plan de desarrollo y prompt para Antigravity

## Objetivo

Crear desde cero una aplicación web interna, adaptable a tablet, para
que el personal de Dulce Taller gestione comandas, materias primas,
recetas y producción.

**No modificar la página web pública:** ya funciona y es un producto
separado para clientes. Las pantallas de Stitch son solo referencias
visuales, no código existente ni requisitos obligatorios.

## Alcance inicial

-   Acceso de usuarios autorizados.
-   Crear, consultar, editar y actualizar el estado de las comandas;
    agregar preparaciones, cantidades y observaciones.
-   CRUD de materias primas: nombre, unidad, cantidad disponible y stock
    mínimo.
-   CRUD de preparaciones y recetas: ingredientes y cantidad requerida
    por unidad.
-   Registrar producción terminada.
-   Descontar materias primas una sola vez al confirmar la producción
    terminada, según la receta cargada.
-   Registrar movimientos de stock, mostrar alertas de mínimos y ofrecer
    una lista de compras editable.
-   Interfaz simple, legible y cómoda para tablet.
-   Validar campos, cantidades y stock; confirmar eliminaciones y
    mostrar errores comprensibles.

## Fuera del alcance inicial

No reconstruir la web pública ni conectar automáticamente las reservas
con las comandas. No incluir pagos electrónicos, facturación, vouchers,
WhatsApp, biometría, posnet, cajón de dinero, compras automáticas ni
funciones complejas de caja/mesas sin confirmación del equipo.

## Flujo clave

1.  El empleado autorizado inicia sesión.
2.  Crea una comanda y agrega ítems.
3.  El personal de preparación consulta las comandas y actualiza su
    estado.
4.  Al finalizar una producción, registra la preparación y la cantidad
    producida.
5.  El sistema calcula los ingredientes según la receta, valida que
    alcance el stock y, al confirmar, descuenta las materias primas y
    registra los movimientos.
6.  Se muestran alertas de stock bajo y una lista de compras editable.

**Importante:** crear una comanda no descuenta stock. El descuento
ocurre al confirmar la producción terminada para evitar descontar dos
veces.

## Tecnología propuesta

-   React + TypeScript + Vite.
-   Tailwind CSS o CSS simple y consistente.
-   Supabase + PostgreSQL para persistencia y Supabase Auth para acceso.
-   Vitest y React Testing Library para pruebas.
-   Git para control de versiones.

Si el equipo ya eligió otra tecnología o existe un repositorio interno,
revisar eso antes de cambiarlo. No trabajar dentro del proyecto de la
web pública. No poner secretos en el código; usar `.env.example`. Nunca
exponer la clave `service_role` en el navegador. Si faltan credenciales
de Supabase, explicar cómo configurarlas; no fingir una conexión ni
sustituirla silenciosamente por `localStorage`.

## Modelo de datos orientativo

-   `profiles`: usuario, nombre visible y rol básico.
-   `raw_materials`: nombre, unidad, cantidad, mínimo, activo y fechas.
-   `preparations`: nombre, descripción opcional y activo.
-   `preparation_ingredients`: preparación, materia prima y cantidad por
    unidad.
-   `orders`: fecha, origen (salón/para llevar si aplica),
    observaciones, estado y creador.
-   `order_items`: comanda, preparación, cantidad y observaciones.
-   `production_records`: preparación, cantidad producida, fecha,
    usuario y confirmación.
-   `stock_movements`: materia prima, tipo (entrada/ajuste/consumo),
    cantidad, motivo, referencia, usuario y fecha.
-   `purchase_list_items`: descripción o materia prima, cantidad
    editable y estado.

Usar claves foráneas, restricciones, índices útiles y políticas RLS para
proteger los datos. No inventar recetas ni cantidades: deben cargarse a
partir de información confirmada por Dulce Taller. Si faltan, permitir
configurarlas antes de registrar producción.

## Reglas técnicas obligatorias

-   Los datos deben persistir realmente en PostgreSQL.
-   Validar datos en la interfaz y en la base cuando corresponda.
-   El descuento de varios ingredientes debe ser transaccional: se
    descuentan todos y se registra la producción, o no se modifica nada.
-   Crear una función SQL/RPC para confirmar producción, validar stock,
    descontar ingredientes y registrar movimientos.
-   Impedir stock negativo y doble confirmación accidental.
-   Todo cambio de stock debe generar un movimiento.
-   Confirmar antes de eliminar y mostrar mensajes claros.
-   Los botones visibles deben funcionar; no dejar controles
    decorativos.
-   No afirmar que build, pruebas o despliegue funcionan sin ejecutarlos
    y verificarlos.

## Pantallas mínimas

1.  Inicio de sesión.
2.  Panel con accesos a Comandas, Preparaciones/Recetas, Stock,
    Producción y Lista de compras.
3.  Listado, detalle y formulario de comandas.
4.  CRUD de preparaciones y recetas.
5.  Listado y edición de materias primas, con mínimos y alertas.
6.  Registro de producción con vista previa del consumo y confirmación.
7.  Movimientos de stock.
8.  Lista de compras editable.

Diseño cálido y actual, relacionado con pastelería, pero no infantil ni
apagado. Priorizar contraste, botones amplios, tipografía legible y
navegación sencilla en tablet. No copiar Stitch a ciegas.

## Plan de trabajo incremental

**A. Preparación:** inspeccionar carpeta/repo; confirmar que no sea el
sitio público; crear proyecto interno; configurar TypeScript, estilos,
lint y pruebas.

**B. Base de datos y acceso:** crear SQL de tablas, relaciones,
restricciones, RLS y función transaccional; configurar Supabase Auth y
conexión real.

**C. Stock y recetas:** CRUD de materias primas, preparaciones y
recetas; movimientos, mínimos y alertas; verificar persistencia tras
recargar.

**D. Producción:** validar ingredientes y stock; registrar producción y
descontar de forma atómica y una sola vez; probar falta de stock y doble
confirmación.

**E. Comandas:** crear/editar pedidos e ítems, consultar detalle y
cambiar estado; no agregar cobros ni integraciones externas.

**F. Entrega:** ejecutar build y pruebas, corregir errores, crear
README, scripts de base de datos, manual técnico, manual de usuario y
evidencias reales.

## Pruebas mínimas

**Unitarias (2--3):** validación de campos/cantidades; cálculo de
consumo de receta; alerta de stock igual o inferior al mínimo.

**Integración (1--2):** crear materia prima y comprobar persistencia;
confirmar producción con stock suficiente y comprobar registro,
descuento y movimientos. Añadir pruebas de rechazo por stock
insuficiente y prevención de doble descuento.

Documentar para cada prueba qué se probó, resultado esperado y resultado
real. Adjuntar capturas o logs de ejecuciones reales.

## Prompt inicial para Antigravity

Trabajá como desarrollador full-stack y avanzá en forma incremental.
Primero inspeccioná la carpeta de trabajo y confirmá que no contiene el
código de la web pública de Dulce Taller. Esta es una aplicación interna
nueva para tablet, separada del sitio público.

Usá este documento como alcance. No copies automáticamente Stitch ni
agregues pagos, facturación, vouchers, biometría o integraciones
externas. Antes de escribir código, mostrame un resumen breve de
arquitectura, árbol inicial de archivos y credenciales/datos
indispensables que falten. Luego implementá una etapa por vez.

Al terminar cada etapa, indicá los archivos creados/modificados, ejecutá
las comprobaciones y pruebas correspondientes e informá los resultados
reales y lo que falta. No avances si el build está roto o falla una
prueba crítica. No inventes recetas, cantidades, credenciales ni datos
del negocio. Mantené intacta la web pública.

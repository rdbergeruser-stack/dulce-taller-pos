# Dulce Taller - Sistema POS de Comandas & Control de Producción

Aplicación web táctil para tablet orientada a cafetería y pastelería artesanal **Dulce Taller**. Permite al personal de salón y cocina gestionar comandas en tiempo real, inventario de materias primas con control de mermas, fichas técnicas de recetas estándar con costeo dinámico, fraccionamiento de tortas en vitrina, registro de producción y compras sugeridas.

Desarrollado como prototipo funcional de arquitectura senior para el Trabajo Final de Práctica Profesionalizante II (IFTS 29).

---

## ☕ Estética y Experiencia de Usuario (Warm Tactile)

Inspirado en la calidez y precisión de una pastelería artesanal europea:
- **Paleta de Colores:** Fondo crema cálido (`#fff8f2`), terracota / caramelo (`#9d3c0c`), espresso tostado (`#1c120c`) y verde salvia (`#446147`).
- **Tipografía:** *Playfair Display* (elegancia artesanal para encabezados) + *Plus Jakarta Sans* (lectura limpia y ágil en pantallas táctiles).
- **Diseñado para Tablet:** Botones amplios (mínimo 44–48 px de altura táctil), accesos directos de alta rotación, sin gestos que disparen zoom involuntario.

---

## 👥 Modelo de Roles y Control de Acceso (RBAC)

El sistema implementa una matriz de roles pensada para la dinámica de turnos reales de gastronomía:

### 🛡️ 1. Administrador / Encargada de Turno
- **Gestión de Usuarios & Roles:** Modal exclusivo para ver el personal registrado, dar de alta nuevos usuarios con nombre y correo, y asignarles rol (`admin`, `mozo` o `cocinero`).
- **Indicación de Producción a Cocina:** El Administrador es quien planifica qué preparaciones y cuántas unidades debe elaborar el cocinero en su turno (ej. *2 Lemon Pie enteras para reposición de vitrina*), pudiendo también registrar producción directa.
- **Control Total:** Acceso a stock de insumos, auditoría Kardex, altas/bajas/edición de recetas estándar y lista inteligente de compras a proveedores.

### ☕ 2. Mozo de Salón
- **Toma de Comandas:** Crea pedidos con selector táctil rápido de mesas (`Salón`) o `Take Away` con notas de personalización.
- **Flujo de Cocina Protegido:** El mozo **no** inicia la preparación de los platos: ve el estado *"En espera de Cocina"* y luego *"En Preparación por Cocina"*.
- **Despacho y Cobro:** Cuando la cocina marca la comanda como lista, al mozo se le habilitan los botones de **`Entregar`** y **`Cobrar`**.
- **Cobro Multimedio Realista:** Simuladores interactivos de QR dinámico, Posnet para tarjetas, Transferencia con copiado de CBU y envío de comprobante por **WhatsApp** al cliente.

### 👨‍🍳 3. Cocinero / Maestro Pastelero
- **Pantalla de Cocina / Comandas:** Visualiza todas las comandas en tiempo real. **No puede crear comandas ni cobrar**.
- **Gestión del Fuego/Horno:** El cocinero es el responsable exclusivo de presionar **`Iniciar Preparación`** y, al finalizar la cocción, marcar **`Listo para Entrega`**.
- **Elaboración Indicada:** Accede a la pestaña de producción para ver las órdenes de elaboración asignadas por el Administrador. Al confirmar la cocción, los insumos se descuentan de forma atómica y los productos elaborados ingresan a vitrina con su código de lote. **No modifica stocks de inventario manualmente**.
- **Notificaciones en Vivo:** Alerta sonora (chime web sintetizado) y banner destacado en la pantalla de comandas cada vez que un mozo registra un nuevo pedido.

---

## 🧩 Modelo de Dos Niveles de Stock & Fraccionamiento

1. **Stock de Materias Primas (Insumos):** Harina 0000, Manteca, Huevos frescos, Café en grano, Leche, etc.
   - **Descuento Atómico en Cocina:** Se descuentan **únicamente al confirmar la producción terminada**, según la receta estándar del lote (impide doble descuento y garantiza trazabilidad).
2. **Stock de Productos Terminados / Vitrina:** Lemon Pie entero (1 un), Porciones (8 porciones por torta), Capuccino, etc.
   - **Descuento al Despachar:** Al entregar una comanda de salón o take-away, se descuenta de las unidades elaboradas disponibles en vitrina.
3. **Fraccionamiento Inteligente de Tortas:**
   - **Corte Manual en Vitrina:** Desde la tarjeta de cualquier torta entera o porción, el pastelero o encargado puede presionar **`Cortar 1 Torta en Porciones (+8)`**, descontando 1 torta entera e incrementando +8 porciones listas para servir con auditoría en Kardex.
   - **Corte Automático en Comandas:** Si se piden porciones de salón y hay 0 cortadas en vitrina pero quedan tortas enteras disponibles (`0 cortadas (X tortas)`), el sistema fracciona la torta automáticamente al despachar el pedido para no trabar la venta.

---

## 🏗️ Estructura del Proyecto

```text
dulce-taller-pos/
├── public/                 # Assets estáticos y favicon
├── src/
│   ├── assets/             # Logos y recursos gráficos
│   ├── components/
│   │   ├── auth/           # LoginView y UsersManagementModal (Gestión de Roles)
│   │   ├── database/       # Modal y guías de configuración Supabase
│   │   ├── inventory/      # Vitrina, materias primas, auditoría Kardex
│   │   ├── layout/         # Header interactivo y Navegación táctil
│   │   ├── notifications/  # Centro de Notificaciones y alertas de cocina
│   │   ├── orders/         # OrdersView (Comandas), NewOrderModal, PaymentModal con WhatsApp
│   │   ├── production/     # Registro y asignación de órdenes de cocina
│   │   ├── purchases/      # Lista sugerida y compras manuales
│   │   └── recipes/        # Fichas técnicas, edición y eliminación de recetas
│   ├── contexts/           # AuthContext (Sesión de turno y usuarios dinámicos)
│   ├── data/               # Mock data artesanal representativa
│   ├── lib/                # Cliente tipado de Supabase
│   ├── services/           # Servicios transaccionales (order, inventory, production, etc.)
│   ├── test/               # Pruebas unitarias y de integración (Vitest)
│   └── types/              # Interfaces TypeScript y esquemas del sistema
├── supabase/
│   └── migrations/         # Esquemas SQL, RPC transaccionales y migraciones
├── package.json
└── README.md
```

---

## 🚀 Puesta en Marcha

1. Clonar el repositorio e instalar dependencias:
   ```bash
   npm install
   ```
2. Iniciar servidor de desarrollo:
   ```bash
   npm run dev
   ```
3. Ejecutar suite de pruebas:
   ```bash
   npm test
   ```
4. Compilar para producción:
   ```bash
   npm run build
   ```

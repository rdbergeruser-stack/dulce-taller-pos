# Dulce Taller - Sistema POS de Comandas & Control de Producción

Aplicación web táctil para tablet orientada a cafetería y pastelería artesanal **Dulce Taller**. Permite al personal de salón y cocina gestionar comandas en tiempo real (KDS), inventario de materias primas con control de mermas, fichas técnicas de recetas estándar con costeo dinámico, fraccionamiento de tortas en vitrina, registro de producción y compras sugeridas.

Desarrollado como prototipo funcional de arquitectura senior para el Trabajo Final de Práctica Profesionalizante II (IFTS 29).

---

## ☕ Estética y Experiencia de Usuario (Warm Tactile)

Inspirado en la calidez y precisión de una pastelería artesanal europea:
- **Paleta de Colores:** Fondo crema cálido (`#fff8f2`), terracota / caramelo (`#9d3c0c`), espresso tostado (`#1c120c`) y verde salvia (`#446147`).
- **Tipografía:** *Playfair Display* (elegancia artesanal para encabezados) + *Plus Jakarta Sans* (lectura limpia y ágil en pantallas táctiles).
- **Diseñado para Tablet:** Botones amplios (mínimo 44–48 px de altura táctil), accesos directos de alta rotación, sin gestos que disparen zoom involuntario.

---

## 🧩 Modelo de Dos Niveles de Stock & Fraccionamiento

1. **Stock de Materias Primas (Insumos):** Harina 0000, Manteca, Huevos frescos, Café en grano, Leche, etc.
   - **Descuento Atómico en Cocina:** Se descuentan **únicamente al confirmar la producción terminada**, según la receta estándar del lote (impide doble descuento y garantiza trazabilidad).
2. **Stock de Productos Terminados / Vitrina:** Lemon Pie entero (1 un), Porciones (8 porciones por torta), Capuccino, etc.
   - **Descuento al Despachar:** Al entregar una comanda de salón o take-away, se descuenta de las unidades elaboradas disponibles en vitrina.
3. **Fraccionamiento Inteligente de Tortas:**
   - **Corte Manual en Vitrina:** Desde la tarjeta de cualquier torta entera o porción, el pastelero o encargado puede presionar **`Cortar 1 Torta en Porciones (+8)`**, descontando 1 torta entera e incrementando +8 porciones listas para servir con auditoría en Kardex.
   - **Corte Automático en Comandas:** Si se piden porciones de salón y hay 0 cortadas en vitrina pero quedan tortas enteras disponibles (`0 cortadas (X tortas)`), el sistema fracciona la torta automáticamente al confirmar o despachar el pedido para no trabar la venta.

---

## 👥 Roles de Usuario y Funcionalidades

### 🍽️ Mozo (Personal de Salón / Mostrador)
- Pantalla táctil de **Inicio de Turno / Login** con identificación de usuario y perfil activo.
- Acceso directo a la pantalla de **Comandas & KDS**.
- Toma de pedidos táctil con botones de alta rotación, origen (**Salón** con selección táctil de mesa o **Take Away**) y notas personalizadas para cocina.
- Flujo de estados en KDS: *Pendiente* &rarr; *En Preparación* &rarr; *Lista para Servir* &rarr; *Entregada*.
- **Pestaña "Entregadas / Por Cobrar"**: Muestra de forma estricta sólo las comandas entregadas a la mesa que aún están pendientes de pago.
- **Cobro Táctil Integrado**: Soporte para cobro con Efectivo (con cálculo de vuelto y billetes rápidos), Tarjeta de Débito/Crédito y QR Interoperable, con emisión y sello de comprobante de pago digital.
- **Pestaña "Cobradas" & "Historial Completo"**: Archivo de comandas cobradas y registro histórico del turno con contadores en vivo.
- Visualización de stock disponible en vitrina y porciones potenciales en tiempo real con sistema de alertas semafóricas.

### 👨‍🍳 Admin / Encargado de Stock
- Acceso total a todas las funciones del sistema.
- **Materias Primas & Kardex:** Control de inventario, stock mínimo con sistema de alertas semafóricas (Óptimo, Bajo Mínimo, Agotado), ajustes manuales con motivo auditado y registro histórico de movimientos.
- **Fichas Técnicas & Recetas:** 
  - Cálculo de costo teórico de insumos vs. precio de venta y margen comercial.
  - Creación de nuevas recetas y asignación dinámica de ingredientes.
  - **Edición rápida de recetas:** Modificación de nombre, precio de venta al público, rendimiento en porciones y descripción artesanal mediante modal táctil dedicado.
  - **Eliminación de recetas/preparaciones** con confirmación de seguridad y borrado o desvinculación en cascada.
  - Catálogo artesanal precargado con *Lemon Pie*, *Torta de Frutillas con Crema*, *Café Capuccino*, etc.
- **Registrar Producción:** Validación de existencias en tiempo real con bloqueo si falta algún insumo, descuento transaccional atómico y asignación de código de lote (`LOTE-YYYYMMDD-PREP`).
- **Lista de Compras Inteligente:** Generación automática basada en alertas de stock mínimo y reposición sugerida editable.

---

## 🏗️ Estructura del Proyecto

```text
dulce-taller-pos/
├── public/                 # Assets estáticos y favicon
├── src/
│   ├── assets/             # Logo y recursos gráficos oficiales
│   ├── components/         # Componentes modulares por dominio
│   │   ├── auth/           # Login táctil y selección de rol
│   │   ├── database/       # Modal de asistencia para configuración de Supabase
│   │   ├── inventory/      # Vitrina, materias primas, kardex y ajuste de mermas
│   │   ├── layout/         # Header de navegación y perfiles
│   │   ├── orders/         # Tablero KDS, nueva comanda táctil y modal de cobro
│   │   ├── production/     # Registro de lotes y validación de stock atómico
│   │   ├── purchases/      # Lista de compras sugerida
│   │   └── recipes/        # Fichas técnicas, costeo y CRUD de preparaciones
│   ├── contexts/           # AuthContext (roles mozo/admin y sesión)
│   ├── data/               # mockData (datos iniciales de pastelería y cafetería)
│   ├── lib/                # Cliente de conexión con Supabase
│   ├── services/           # Servicios de negocio (inventory, order, portion, production, recipe)
│   ├── test/               # Pruebas unitarias e integración con Vitest
│   └── types/              # Definiciones TypeScript de entidades y base de datos
├── supabase/
│   ├── full_schema_and_seed.sql  # Script SQL completo de instalación
│   └── migrations/               # Migraciones incrementales numeradas
└── README.md
```

---

## 🚀 Puesta en Marcha en Local

### 1. Requisitos
- Node.js v18+ o superior.

### 2. Instalación de dependencias
```bash
npm install
```

### 3. Ejecutar en modo desarrollo
```bash
npm run dev
```
La aplicación abrirá en `http://localhost:5173`.

### 4. Ejecutar pruebas unitarias y de integración
```bash
npm test
```
Ejecuta la suite con **Vitest** (9 tests automatizados) validando:
- Alertas de stock mínimo y niveles semafóricos.
- Cálculo de insumos teóricos y costeo dinámico de recetas.
- Descuento transaccional atómico de producción de lotes.
- Fraccionamiento inteligente de tortas (Opción 3: corte manual y automático por porción).

### 5. Compilar para producción
```bash
npm run build
```

---

## 🗄️ Conexión con Base de Datos PostgreSQL (Supabase)

El sistema incluye persistencia completa en PostgreSQL. Para conectarlo:

1. Crea un proyecto gratuito en [supabase.com](https://supabase.com).
2. Ve a **SQL Editor** &rarr; **New Query**.
3. Copia y pega el contenido del archivo `supabase/full_schema_and_seed.sql` generado en el repositorio y haz clic en **Run**.
   - Crea las tablas con restricciones `CHECK` y políticas de seguridad RLS.
   - Crea la función transaccional `confirm_production_batch` para descuento atómico con `SELECT FOR UPDATE`.
   - Inserta los datos reales de insumos y recetas de Dulce Taller (*Lemon Pie*, *Café Capuccino*).
4. En Supabase ve a **Project Settings** &rarr; **API**, copia la `Project URL` y la `anon key`.
5. Pégalas en el archivo `.env`:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
   ```

*Nota:* Si ejecutas la aplicación sin credenciales en `.env`, el sistema funciona en modo demostrativo interactivo con los datos de pastelería reales precargados y muestra un banner en la cabecera con el instructivo para conectarlo.

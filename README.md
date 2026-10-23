# Dulce Taller - Sistema POS de Comandas & Control de Producción

Aplicación web interna táctil para tablet orientada a cafetería y pastelería artesanal **Dulce Taller**. Permite al personal de salón y cocina gestionar comandas, inventario de materias primas, fichas técnicas de recetas estándar, producción terminada y compras.

Desarrollado como prototipo funcional de arquitectura senior para el Trabajo Final de Práctica Profesionalizante II (IFTS 29).

---

## ☕ Estética y Experiencia de Usuario (Warm Tactile)

Inspirado en la calidez y precisión de una pastelería artesanal europea:
- **Paleta de Colores:** Fondo crema cálido (`#fff8f2`), terracota / caramelo (`#9d3c0c`), espresso tostado (`#1c120c`) y verde salvia (`#446147`).
- **Tipografía:** *Playfair Display* (elegancia artesanal para encabezados) + *Plus Jakarta Sans* (lectura limpia en pantallas táctiles).
- **Diseñado para Tablet:** Botones amplios (mínimo 44–48 px de altura táctil), accesos directos de alta rotación, sin gestos que disparen zoom involuntario.

---

## 🧩 Modelo de Dos Niveles de Stock

1. **Stock de Materias Primas (Insumos):** Harina 0000, Manteca, Huevos frescos, Café en grano, Leche, etc.
   - **Descuento Atómico en Cocina:** Se descuentan **únicamente al confirmar la producción terminada**, según la receta estándar del lote (impide doble descuento y garantiza trazabilidad).
2. **Stock de Productos Terminados / Vitrina:** Lemon Pie entero (1.000 un), Porciones (0.125 un), Capuccino, Kits de Taller.
   - **Descuento al Despachar:** Al entregar una comanda de salón o take-away, se descuenta de las unidades elaboradas disponibles en vitrina.

---

## 👥 Roles de Usuario

- **Mozo (Personal de Salón / Mostrador):**
  - Acceso directo a la pantalla de **Comandas & KDS**.
  - Toma de pedidos táctil con botones de alta rotación, origen (Salón, Take Away, Taller) y notas para cocina.
  - Actualización de estados: *Pendiente* &rarr; *En Preparación* &rarr; *Lista para Servir* &rarr; *Entregada*.
  - Visualización del stock disponible en vitrina en tiempo real.
- **Admin / Encargado de Stock:**
  - Acceso total a todas las funciones.
  - **Materias Primas & Kardex:** Control de inventario, stock mínimo con alertas visuales automáticas, ajustes manuales con motivo auditado.
  - **Recetas & Preparaciones:** Fichas técnicas, costo teórico de insumos vs precio de venta y margen.
  - **Registrar Producción:** Validación de existencias en tiempo real con bloqueo si falta algún insumo, descuento transaccional y asignación de código de lote (`LOTE-YYYYMMDD-PREP`).
  - **Lista de Compras Inteligente:** Generación automática basada en alertas de stock mínimo y reposición sugerida.

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
   - Inserta los datos reales de insumos y recetas de Dulce Taller (*Lemon Pie*, *Café Capuccino*, *Kit Cookies*).
4. En Supabase ve a **Project Settings** &rarr; **API**, copia la `Project URL` y la `anon key`.
5. Pégalas en el archivo `.env`:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
   ```

*Nota:* Si ejecutas la aplicación sin credenciales en `.env`, el sistema funciona en modo demostrativo interactivo con los datos de pastelería reales precargados y muestra un banner en la cabecera con el instructivo para conectarlo.


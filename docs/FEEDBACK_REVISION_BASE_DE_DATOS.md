# INFORME DE REVISIÓN TÉCNICA Y FEEDBACK
## Análisis de la Estructura de Base de Datos, Manual Técnico y Pruebas Automatizadas
**Proyecto:** Dulce Taller POS  
**Destinataria:** Compañera de Equipo / Equipo de Desarrollo  
**Fecha:** Noviembre 2026  
**Estado de la Revisión:** Aprobado con Recomendaciones de Optimización  

---

## 1. Resumen Ejecutivo y Valoración General

El material elaborado (Manual Técnico e Informe de Etapa 4 / CRUD) se encuentra en un **nivel sobresaliente**. Presenta una redacción clara, formal y bien estructurada, con capturas de pantalla auténticas de la aplicación en funcionamiento y evidencia verificable de las **14 pruebas automatizadas** y la compilación en producción.

Un mérito destacable es la **honestidad arquitectónica** con la que se documenta la dualidad del sistema:
- **Modo Producción Conectado:** Persistencia real en PostgreSQL a través de Supabase.
- **Modo Demostración Local:** Simulación en memoria mediante `MockData`, permitiendo evaluar la interfaz de forma aislada.

Este documento tiene como objetivo validar la sección de la **Base de Datos** y aportar sugerencias puntuales de ingeniería de software para elevar aún más la solidez técnica del trabajo.

---

## 2. Validación de la Estructura de la Base de Datos

### 2.1. Las 9 Tablas del Esquema Relacional
Se confirma que las nueve tablas descriptas coinciden con exactitud matemática con el esquema físico implementado en PostgreSQL (`supabase/migrations/20261023_001_initial_schema.sql`):

| Tabla SQL Física | Nombre Conceptual (ER) | Propósito y Claves Foráneas Principales |
| :--- | :--- | :--- |
| `profiles` | PERFILES | Perfiles de usuario vinculados a `auth.users(id)`. Define roles (`admin`, `mozo`, `cocinero`). |
| `raw_materials` | MATERIAS_PRIMAS | Catálogo maestro de insumos, unidades (`gr`, `ml`, `un`, `kg`, `lt`), costos y stock mínimo. |
| `preparations` | PREPARACIONES | Productos terminados de vitrina y cafetería, precios, categoría y rendimiento (`portion_yield`). |
| `preparation_ingredients` | INGREDIENTES_RECETA | Tabla intermedia ($N:M$) entre preparaciones y materias primas. Define la ficha técnica. |
| `production_records` | REGISTROS_PRODUCCION | Histórico de lotes elaborados (`batch_code`), cantidad y usuario responsable. |
| `stock_movements` | MOVIMIENTOS_STOCK | Kardex de movimientos de inventario (`entrada`, `salida`, `produccion_consumo`, `despacho`). |
| `orders` | COMANDAS | Comandas de salón o take away, número correlativo, estado y total. |
| `order_items` | DETALLES_COMANDA | Renglones de comanda ($N:M$ entre Comandas y Preparaciones), cantidad y precio unitario. |
| `purchase_list_items` | LISTA_COMPRAS | Sugerencias de abastecimiento y pedidos de compra pendientes o completados. |

---

### 2.2. Diagrama Entidad–Relación (Figura 7)
El diagrama modela con precisión las relaciones:
- **Relaciones $1:N$:** 
  - Un usuario/perfil registra muchas comandas, producciones y movimientos.
  - Una comanda posee muchos detalles de comanda.
  - Una preparación posee muchos ingredientes asociados.
  - Una preparación elaborada registra múltiples producciones.
- **Relaciones $N:M$:** 
  - Resueltas correctamente mediante `preparation_ingredients` y `order_items`.
- **Auditoría Polimórfica en `stock_movements`:** 
  - La tabla de movimientos se vincula tanto a materias primas (consumos/ingresos) como a preparaciones (vitrina), respetando la restricción de exclusividad SQL:
    ```sql
    CHECK ((raw_material_id IS NOT NULL AND preparation_id IS NULL) OR 
           (raw_material_id IS NULL AND preparation_id IS NOT NULL))
    ```

> **Sugerencia de ajuste:** En el diagrama ER gráfico las entidades tienen títulos en español (`PERFILES`, `PREPARACIONES`, `MATERIAS_PRIMAS`), mientras que en el código SQL físico y en las tablas del informe están en inglés (`profiles`, `preparations`, `raw_materials`).  
> **Recomendación:** Agregar una nota al pie en el epígrafe de la Figura 7 indicando que los nombres en español se utilizan a título didáctico-conceptual, correspondiéndose con las tablas físicas en inglés en PostgreSQL.

---

## 3. Aspectos Clave para Enriquecer la Sección de Base de Datos

Para que la sección de Base de Datos quede perfecta y demuestre un dominio avanzado de PostgreSQL, se sugiere incorporar los siguientes cuatro puntos técnicos:

### 3.1. Funciones Transaccionales Almacenadas (RPC en PostgreSQL)
El informe actual no menciona que la aplicación delega la lógica crítica a procedimientos almacenados en la base de datos (`supabase/migrations/20261023_002_production_rpc.sql`):
- **`confirm_production_batch`:** Al confirmar una producción, la base de datos ejecuta de forma atómica (ACID) la verificación previa de stock de todos los ingredientes mediante **bloqueo de filas (`FOR UPDATE`)**, descontando insumos, sumando el stock en vitrina y registrando el Kardex sin riesgo de condiciones de carrera (*Race Conditions*).
- **`process_order_production_and_sale`:** Gestiona el despacho y cobro transaccional de comandas.

*Mencionar esto demuestra que la base de datos no es un simple repositorio pasivo, sino que garantiza la integridad transaccional del negocio.*

---

### 3.2. Reglas de Integridad Referencial (`ON DELETE CASCADE` y `RESTRICT`)
En la sección de controles conviene detallar cómo se evitan datos huérfanos o pérdidas contables:
- **`ON DELETE CASCADE`:** Si se cancela o elimina una comanda, sus `order_items` asociados se limpian automáticamente. Igual criterio aplica a los ingredientes al eliminar una ficha técnica.
- **`ON DELETE RESTRICT`:** Si una preparación ya posee histórico de ventas (`order_items`) o lotes cocinados (`production_records`), PostgreSQL **rechaza su eliminación física**. Por ello, el sistema aplica borrado lógico (`is_active: false`), preservando la trazabilidad contable.
- **`ON DELETE SET NULL`:** Si un usuario es dado de baja, los comprobantes históricos de ventas y producción permanecen intactos asociando el autor como nulo.

---

### 3.3. Seguridad Activa: Políticas de Fila (Row Level Security - RLS)
En la página 4 del manual se indica que *«es necesario verificar la configuración y revisar las políticas de seguridad»*.  
**Aclaración:** Las políticas de RLS **ya se encuentran plenamente implementadas y activas** en las 9 tablas (`20261023_001_initial_schema.sql`):
- Lectura habilitada para personal autenticado (`authenticated`).
- Gestión de materias primas y recetas restringida exclusivamente a usuarios con rol `admin` (`auth.uid() = id OR role = 'admin'`).
- Inserción y actualización de comandas habilitada para mozos, cocineros y administradores.

---

### 3.4. Índice Condicional Antiduplicados en Lista de Compras
En el punto 4.4 se destaca la *«Prevención de determinados registros duplicados en la lista de compras»*.  
Técnicamente, esto se implementó en PostgreSQL mediante un **índice único parcial** (`supabase/migrations/20261105_006_purchase_list_unique.sql`):
```sql
CREATE UNIQUE INDEX idx_purchase_list_unpurchased_mat 
ON public.purchase_list_items (raw_material_id) 
WHERE is_purchased = false;
```
Esto permite realizar compras históricas recurrentes de un mismo insumo a lo largo del tiempo, pero impide que se agregue por error dos veces el mismo insumo pendiente al carrito de compras simultáneamente.

---

## 4. Revisión de las Pruebas Automatizadas y CRUD

### 4.1. Cobertura de Pruebas (Vitest)
Se corroboró la coincidencia total entre el informe y el repositorio del proyecto:
- **9 Pruebas Unitarias (`src/test/unit/businessRules.test.ts`):** Casos PU01 a PU09 (Stock mínimo, consumo de recetas, costeo teórico, fraccionamiento torta-porción, flujo de órdenes, notificaciones a cocina, permisos de roles, límite de stock y sugerencias de compra).
- **5 Pruebas de Integración (`src/test/integration/productionIntegration.test.ts`):** Casos PI01 a PI05 (Ciclo transaccional completo de materias primas, producción exitosa, rechazo por stock insuficiente, validación de cantidades positivas y fraccionamiento de torta madre en porciones).
- **Resultado:** **14 pruebas ejecutadas, 14 aprobadas (100% de éxito), 0 fallas.**

---

### 4.2. Evidencia de Operación de Eliminación (Delete de `PREP-009`)
El reporte documentó con gran acierto la creación, edición y posterior eliminación controlada de la receta `PREP-009` (*Receta de prueba*).  
La captura de pantalla de la ventana modal de confirmación (*Figura 9*) y la verificación de que el catálogo vuelve a quedar con 8 preparaciones (*Figura 10*) satisfacen por completo el requerimiento de evidencia de operaciones destructivas controladas.

---

## 5. Checklist de Ajustes Rápidos Recomendados

Para dejar el documento listo para su presentación final:

1. [ ] **Epígrafe Figura 7 (Diagrama ER):** Aclarar la correspondencia entre los nombres en español del gráfico conceptual y las tablas físicas en inglés de PostgreSQL.
2. [ ] **Sección 1.4.3 / 4.4:** Mencionar las funciones transaccionales almacenadas (RPC `confirm_production_batch`) y el uso de `FOR UPDATE` para transacciones atómicas.
3. [ ] **Sección 1.4.3 / 4.4:** Añadir una breve mención a la regla de integridad referencial `ON DELETE RESTRICT` que protege preparaciones con ventas de ser borradas físicamente.
4. [ ] **Sección 1.4.4 / Seguridad:** Reemplazar la frase de políticas "a revisar" por la afirmación de que el esquema ya cuenta con **Row Level Security (RLS)** activo en todas las entidades.
5. [ ] **Sección 1.4.1 (Roles):** Mantener tal como está la mención a los tres roles actuales: `admin`, `mozo` y `cocinero`, ya que refleja fielmente la migración 005.

---

### Conclusión
El informe elaborado por la compañera de equipo es de una calidad excelente, cuenta con un soporte gráfico real y un sustento teórico intachable. Incorporando estas precisiones técnicas sobre PostgreSQL y las funciones RPC, el trabajo alcanzará el máximo nivel académico y profesional.

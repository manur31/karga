# Auditoría Completa de Karga — Revisión de Arquitectura, Código y Producto

> **Auditor:** Staff Software Engineer / Arquitecto de Software  
> **Fecha:** Junio 2026  
> **Propósito:** Revisión objetiva para equipo de 3 desarrolladores antes de producción

---

## Tabla de Contenidos

1. [Resumen del Proyecto](#1-resumen-del-proyecto)
2. [Fortalezas](#2-fortalezas)
3. [Debilidades](#3-debilidades)
4. [Revisión de Arquitectura](#4-revisión-de-arquitectura)
5. [Revisión de Calidad de Código](#5-revisión-de-calidad-de-código)
6. [Revisión de Frontend](#6-revisión-de-frontend)
7. [Revisión de Offline-First](#7-revisión-de-offline-first)
8. [Revisión de Seguridad](#8-revisión-de-seguridad)
9. [Revisión de Performance](#9-revisión-de-performance)
10. [Revisión de Testing](#10-revisión-de-testing)
11. [Perspectiva de Contratación (Recruiter Review)](#11-perspectiva-de-contratación)
12. [Matriz de Prioridades](#12-matriz-de-prioridades)
13. [Roadmap](#13-roadmap)
14. [Scorecard Final](#14-scorecard-final)
15. [Preguntas Pendientes](#15-preguntas-pendientes)

---

## 1. Resumen del Proyecto

**Karga** es una aplicación mobile-first de seguimiento de entrenamiento de fuerza ("Peak Performance Engine") que permite a los usuarios:

- Crear y gestionar **rutinas** de ejercicios
- Registrar **series** (peso, repeticiones) durante **sesiones** cronometradas
- Ver **historial** de entrenamiento por día/mes
- Rastrear **progreso físico** (peso corporal, volumen semanal)
- Trabajar con unidades **kg o lb**
- Operar offline con **sincronización a Supabase** cuando hay conexión

### Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | React 19 (con React Compiler) |
| Build | Vite 8 |
| Routing | react-router 7 |
| Estado Global | Zustand 5 (con persist) |
| Estado Servidor | TanStack React Query 5 |
| Backend / DB | Supabase (PostgreSQL + Auth) |
| Estilos | Tailwind CSS 4 |
| Formularios | react-hook-form + Zod 4 |
| Fechas | date-fns 4 |
| Linting | ESLint 10 |
| Lenguaje | JavaScript (JSX) |

### Arquitectura Actual

```
React 19 (SPA)
  → Zustand (estado local + cola offline)
    → React Query (caché de servidor)
      → Supabase (PostgreSQL + Auth)
```

**Capas:**
1. **Páginas públicas**: Welcome → Login → Register → Onboarding
2. **Páginas protegidas**: Sets (hub de rutinas), Sessions (historial), Body (progreso), Today (calendario)
3. **Layout compartido**: TabBar (nav inferior), SessionTimer (flotante), RestTimer (flotante)
4. **15 modales** para todas las interacciones CRUD

### Flujo de Datos

```
Acción Usuario → Zustand Store (local, synced: false)
  → useSync hook → React Query Mutation
    → Supabase → Invalidación de Query → UI actualizada
```

### Confianza en el Análisis: **85%**
- ~100% de los archivos fuente fueron leídos
- Falta: políticas RLS de Supabase, schema real de BD, estado del deploy

---

## 2. Fortalezas

### 2.1 Arquitectura General
- **Separación clara de capas**: pages → components → hooks → stores → services → lib
- **Elección de stack moderna y coherente**: React 19 + Zustand + TanStack Query + Supabase es una combinación poderosa y adecuada para este tipo de app
- **Offline-first es la decisión correcta** para una app de gimnasio (los gimnasios tienen mala señal)

### 2.2 UI/UX
- **Tema oscuro consistente** y visualmente pulido
- **Animaciones suaves** (slide-in, slide-out, fade-in en modales)
- **Mobile-first** con contenedor `max-w-md` y diseño adaptado a pantallas táctiles
- **Estados vacíos y de carga** presentes en la mayoría de las pantallas
- **Bottom sheets para modales** — patrón mobile correcto

### 2.3 Estado Global
- **Zustand con persist** es la herramienta correcta para estado offline
- **Stores bien diferenciados**: setsStore, sesionStore, settingsStore, restStore, calendarStore
- `partialize` en calendarStore para solo persistir datos, no estado UI (línea 138-141)

### 2.4 Manejo de Datos
- **React Query** para estado de servidor con `staleTime: 20min` y `gcTime: 10min` — configuración razonable
- **Invalidación de queries en mutations** para mantener cache fresca
- **Manejo de unidades kg/lb** centralizado en `useWeightUnit` hook

### 2.5 Componentes Base
- `Button`, `Card`, `Input`, `Avatar` — limpios, reutilizables, con variantes ✅
- `formatSeconds`, `formatRelativeTime`, `calculateDailyMetrics` — utilidades bien factorizadas

### 2.6 Patrón de Cierre de Modales
- `handleCloseWithAnimation` con `setTimeout` consistente en todos los modales

---

## 3. Debilidades

### 3.1 Errores Graves (Bugs)

#### Auth Service: Retorna strings en lugar de lanzar errores
**Archivo:** `src/service/authService.js`

```javascript
// LÍNEAS 33-34: MAL — retorna string, no lanza error
if (error) {
    return error.message;
}

// DEBERÍA SER:
if (error) {
    throw error;
}
```

**Impacto:** Las mutations que usan estos servicios (`useLogin`, `useLogout`, etc.) esperan que los errores sean lanzados con `throw`. Al retornar un string, el `onError` de las mutations nunca se dispara correctamente y los errores se tragan silenciosamente.

**Ocurre en:** `login()` línea 33-34, `logout()` línea 50-51, `setProfile()` línea 68-69, 81-82.

#### Bug en `continueRest` — variable undefined
**Archivo:** `src/stores/restStore.js`, línea 45

```javascript
continueRest: () => {
    const { intervalId, restTime } = get();
    // ...
    if (restTime !== 0 || isRunning) {  // ← isRunning NO está destructured
```

`isRunning` no se obtiene de `get()`. Es `undefined`, por lo que la condición se evalúa como `restTime !== 0 || false`. Esto rompe la lógica de reanudación del temporizador.

#### Bug en `addSyncedSets` — contaminación del store
**Archivo:** `src/stores/setsStore.js`, líneas 11-14

```javascript
addSyncedSets: (newSets) => set((state) => ({
    newSets: newSets.filter(...),  // ← Crea propiedad 'newSets' en el store, no actualiza 'sets'
    syncedSets: [...state.syncedSets, ...newSets]
})),
```

El spread crea una propiedad `newSets` paralela en el store (que nunca se lee) y no actualiza `sets`. Además, `addSyncedSets` y `syncedSets` son **estado muerto** — no se consumen en ninguna parte del código.

#### Operaciones secuenciales en lugar de batch
**Archivo:** `src/pages/Sets.jsx`, líneas 59-66 y 83-90

```javascript
// MAL: N llamadas secuenciales a Supabase
for (const exerciseId of selectedExerciseIds) {
    await insertExercisesRoutine({
        routine_id: selectedRoutineId,
        id_exercises: exerciseId,
        rest_time: 60,
        orden: 1,
    });
}

// DEBERÍA SER: Una sola llamada batch
await insertExercisesRoutine(
    selectedExerciseIds.map((id, i) => ({
        routine_id: selectedRoutineId,
        id_exercises: id,
        rest_time: 60,
        orden: i + 1,
    }))
);
```

**Impacto:** O(N) rondas de red a Supabase. Si el usuario selecciona 10 ejercicios, son 10 llamadas HTTP en lugar de 1. Si la llamada 5 falla, los primeros 4 ya se insertaron y no hay rollback.

### 3.2 Código Muerto

| Archivo | Problema | Líneas |
|---------|----------|--------|
| `src/pages/Today.jsx` | Bloque comentado enorme (~200 líneas) | 212-410 |
| `src/stores/calendarStore.js` | Versión anterior comentada (~40 líneas) | 146-188 |
| `src/stores/uiStore.js` | Archivo completo comentado | Todo el archivo |
| `src/service/progressService.js` | Archivo vacío | 0 líneas |
| `src/stores/setsStore.js` | `syncedSets`, `setsToUpdate`, `addSyncedSets` — nunca usados | 8-14 |
| `src/pages/Sets.jsx` | `console.log` de debug | 58, 78, 94 |

**Impacto en hiring:** El código muerto es una de las primeras cosas que notan los ingenieros seniors en una code review. Transmite "este proyecto está incompleto" o "no se hizo limpieza antes de mostrar".

### 3.3 Inconsistencias de Nombres

| Ubicación | Problema |
|-----------|----------|
| `src/service/exersiseService.js` | Typo: debería ser `exerciseService.js` |
| `src/hooks/mutations/useSesionsMutation.js` | Typo: debería ser `useSessionsMutation.js` |
| `src/stores/sesionStore.js` | Typo: debería ser `sessionStore.js` (también el nombre del store) |
| `src/lib/schemas/authSchema.js` | Llamado `authSchema` pero contiene schemas de login, register y onboarding |
| `useCreateRoutines` (plural) vs otras mutations singulares | Inconsistente |
| `getSetforExercise` (f minúscula) vs `getSetforID` | Inconsistente |
| `createAt` (camelCase) vs `created_at` (snake_case) en el mismo objeto | sesionStore.js:26 |

### 3.4 Duplicación de Código

**SVGs inline duplicados en múltiples modales:**
- `HeartIcon` — definido en `WorkoutModal.jsx:10-13` Y en `RoutineModal.jsx:14-17`
- `QuestionIcon` — en `WorkoutModal.jsx:16-19`
- `MinusIcon`, `XIcon` — en `SetModal.jsx:8-18`
- `ThreeDotsIcon` — en `RoutineModal.jsx:20-24`

**Lógica de merge de ejercicios duplicada:**
- `WorkoutModal.jsx:35-56` y `RoutineModal.jsx:39-60` tienen el mismo código para combinar `exercisesMap` de ejercicios populares y favoritos. Esto debería ser un hook compartido.

### 3.5 Problemas de Estilo

```javascript
// Today.jsx:140 — estilo inline en lugar de Tailwind
style={{ backgroundColor: '#272121' }}

// Body.jsx:140 — estilo inline para altura de barra
style={{ height: `${day.value}%` }}
```

### 3.6 Google OAuth Falso

```javascript
// Login.jsx:39-44
const handleGoogleLogin = () => {
    setTimeout(() => {
        navigate("/onboarding");
    }, 2000);
};
```

No autentica con Google. Solo espera 2 segundos y navega. Si alguien prueba el botón en una demo, queda expuesto.

### 3.7 Body Page con Datos Mock

`src/pages/Body.jsx` usa datos mockeados con `setTimeout` de 800ms. No hay integración con Supabase. Las secciones de "Progreso Semanal" y "Actividad Muscular" son UI falsa.

---

## 4. Revisión de Arquitectura

### Diseño del Sistema: **Regular (6/10)**

**Bueno:**
- Separación pages → components → hooks → stores → services → lib
- Offline-first con Zustand persist
- React Query para datos de servidor
- Tema oscuro + mobile-first consistente

**Malo:**
- **Bucles secuenciales para operaciones batch** — N rondas de red
- **Sin paginación** — sets/sessions crecerán indefinidamente
- **CalendarStore carga TODOS los sets/sessions en memoria** — degradación con años de datos
- **Sin Error Boundaries** — un crash en render rompe toda la app
- **Typo en nombres de archivo** (`exersiseService`, `useSesionsMutation`)
- **Código muerto en todo el proyecto**

### Separación de Concernas: **Buena (7/10)**
Páginas orquestan, servicios hablan con Supabase, stores manejan estado local, hooks conectan todo. Líneas borrosas en `SessionTimer.jsx` que llama lógica de sync directamente.

### Escalabilidad: **Mala (3/10)**
- Sin paginación en queries de sets/sessions
- CalendarStore en memoria con todos los datos históricos
- Operaciones secuenciales N+1
- Sin índices adicionales (dependiendo de defaults de Supabase)

### Acoplamiento / Cohesión: **Regular (5/10)**
- Stores se importan implícitamente (calendarStore lee setsStore/sesionStore via `syncLocalData`)
- Componentes modales grandes (RoutineModal: 526 líneas, WorkoutModal: 262 líneas)
- icon SVGs duplicados en múltiples archivos

---

## 5. Revisión de Calidad de Código

### Estructura de Carpetas: **7/10**
Buena estructura pero:
- `components/SessionTimer.jsx` y `components/RestTimer.jsx` sueltos en la raíz — deberían estar en su propia subcarpeta
- Mezcla de granularidad: `components/calendar/` (9 archivos, bien organizado) vs componentes sueltos

### Consistencia de Nombres: **5/10**
Múltiples typos, mezcla de camelCase/snake_case, plural vs singular en mutations.

### Componentes

**Reutilizabilidad: Regular**
- Button, Card, Input, Avatar son limpios y reutilizables ✅
- SVGs inline duplicados ❌ — deberían importarse del módulo de iconos

**God Components:**
- **RoutineModal (526 líneas)** — maneja listing de ejercicios, modo selección, modo edición, historial, favoritos, creación de ejercicios personalizados. Debería dividirse.
- **WorkoutModal (262 líneas)** — lógica de ejercicio duplicada con RoutineModal.

### Hooks

**Custom hooks bien intencionados pero inconsistentes:**
- `useWeightUnit.js` — limpio, enfocado ✅
- `useSync.js` — lógica correcta pero acopla sync a mutations específicas
- Queries y mutations bien separados ✅
- `useRestStore` — bug de variable undefined (ver sección 3.1)

### Funciones

**Positivo:**
- `handleCloseWithAnimation` consistente en todos los modales ✅
- Utilidades bien factorizadas (`formatSeconds`, `formatRelativeTime`, etc.)

**Negativo:**
- Auth service retorna strings en vez de lanzar errores
- `deleteExercise` captura errores con solo `console.warn` — fallos silenciosos
- `getSessionTitle` usa comparación de timestamps para asociar sets con sesiones — frágil y propenso a errores con diferencias de reloj

---

## 6. Revisión de Frontend

### React Best Practices: **Regular (5/10)**

**Re-renders innecesarios:**
- `Today.jsx:66-69` — `useEffect` se ejecuta cada vez que `setsFromStore`/`sessionsFromStore` cambian (nuevas referencias de array en cada render)
- `RoutineModal` y `WorkoutModal` — reconstruyen `allExercises` en cada render sin `useMemo`
- `Sessions.jsx:24-47` — `groupedSessions` se recalcula en cada render sin `useMemo`

**Memoización faltante:**
- `exercisesMap` en WorkoutModal/RoutineModal
- `groupedSessions` en Sessions.jsx
- `exercises` (merged array) en Today.jsx

**Estado de animación frágil:**
- `isClosing` se maneja manualmente con `setTimeout` y callbacks en todos los modales. Falta un solo `clearTimeout` y se producen fugas de estado.

### UX: **Regular (6/10)**

| Aspecto | Estado |
|---------|--------|
| Tema oscuro | ✅ Consistente y pulido |
| Animaciones | ✅ Suaves y coherentes |
| Loading spinners | ✅ Presentes |
| Estados vacíos | ✅ Mayoría presentes |
| **Error boundaries** | ❌ Ausente — un crash rompe la app |
| **Feedback de éxito** | ❌ No hay toasts/confirmaciones al guardar |
| **Retry UI** | ❌ Errores de red se tragan o hacen console.log |
| **Body page** | ❌ Datos mock, no funcional |
| **Google OAuth** | ❌ Falso, no autentica |
| **Forgot password** | ❌ Ruta no existe, pero está linkeada |

### Accesibilidad: **Mala (2/10)**
- Sin atributos `aria-*`
- Sin navegación por teclado en modales
- Sin focus trapping en modales
- Sin `alt` text en botones de solo icono
- Indicadores solo por color (puntos de actividad) — sin texto alternativo

### Responsive Design: **Regular (6/10)**
- Mobile-first con `max-w-md` ✅
- Desktop centrado ✅
- Modales y calendario pueden romperse en tablets
- `sm:max-w-md sm:left-1/2 sm:-translate-x-1/2` — ingenioso pero frágil

---

## 7. Revisión de Offline-First

### Estado Actual: **Básico — No listo para producción**

**Lo que funciona:**
- Zustand persist con localStorage para sets, sessions, rest timer, settings, calendar
- Flag `synced` para rastrear items pendientes
- `useSyncSets` / `useSyncSessions` hooks para sincronización
- `useCalendarStore` mergea datos locales + Supabase

**Lo que falta:**

| Problema | Severidad | Detalle |
|----------|-----------|---------|
| ❌ Sin cola offline para rutinas, ejercicios, favoritos | **Crítico** | Solo sets y sessions son offline. Crear una rutina requiere Supabase |
| ❌ Sin resolución de conflictos | **Alto** | Last-write-wins sin comparación de timestamps. Dos dispositivos modificando el mismo set = pérdida de datos |
| ❌ Sin mecanismo de reintento | **Alto** | `useSync` captura errores y los logea, pero no reintenta ni notifica al usuario |
| ❌ Sin sync en segundo plano | **Medio** | Sync solo ocurre en acciones explícitas (finalizar sesión), no al reconectarse |
| ❌ Sin detección de estado de red | **Medio** | La app no sabe si está online/offline, no adapta comportamiento |
| ❌ Sin Service Worker | **Medio** | La app no es instalable como PWA ni cachea el shell |
| ❌ Sync all-or-nothing | **Medio** | Si un item falla, todo el batch falla. Sin estado por-item |
| ❌ `syncedSets`/`setsToUpdate`/`addSyncedSets` — estado muerto | **Bajo** | Store properties que no se usan |

### Rating de Offline Readiness: **4/10**

---

## 8. Revisión de Seguridad

### Crítico
- **Keys de Supabase en `.env` commiteado** — `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY` es una key pública (anon key), lo cual es normal para client-side Supabase. **Pero**: si RLS no está configurado correctamente, cualquier usuario puede leer/escribir toda la base de datos. **Hay que verificar RLS urgentemente.**

### Alto
- **Sin verificación RLS en el código** — No hay autorización a nivel de servicio más allá de filtrar por `profile_id`. Sin RLS, un usuario podría cambiar su `profile_id` y acceder a datos de otro.
- **Sin sanitización de inputs** — Nombres de ejercicios, descripciones de rutinas, notas se insertan directamente a Supabase.
- **Auth service retorna errores como strings** — Rompe el manejo de errores en mutations.

### Medio
- **Sin rate limiting** — Clicks rápidos podrían crear sets duplicados.
- **Validación Zod solo en formularios** — No hay validación en la capa de servicios.

### Rating de Seguridad: **6/10** — Depende completamente de RLS

---

## 9. Revisión de Performance

### Bundle Size
- 15 modales importados eager (sin lazy loading)
- `react-icons` importaciones específicas (tree-shakeable) ✅
- react-router v7 con rutas eager

### Quick Wins (hoy)

| Issue | Impacto | Esfuerzo |
|-------|---------|----------|
| Lazy load modales con `React.lazy()` | Medio | Bajo (20 min) |
| Eliminar código muerto | Bajo | Bajo (10 min) |
| Memoizar `exercises` merge con `useMemo` | Medio | Bajo (10 min) |
| Reemplazar SVGs inline con imports del módulo de iconos | Bajo | Bajo (15 min) |
| Arreglar bucles secuenciales → batch inserts | Alto | Bajo (20 min) |

### Mejoras Medias

| Issue | Impacto | Esfuerzo |
|-------|---------|----------|
| Paginación en queries de sets/sessions | Alto | Medio |
| Lazy loading de rutas con `React.lazy()` + `Suspense` | Medio | Medio |
| `React.memo` en list items (DayCell, SetsCard, etc.) | Medio | Medio |

### Mejoras Mayores

| Issue | Impacto | Esfuerzo |
|-------|---------|----------|
| Service Worker + PWA para offline real | Alto | Alto |
| Detección de estado de red + UI adaptativa | Medio | Alto |
| Reemplazar queries full-table con queries indexadas por rango de fechas | Alto | Alto |

---

## 10. Revisión de Testing

### Estado Actual: **CERO tests**

- 0 unit tests
- 0 integration tests
- 0 E2E tests
- 0 librerías de testing en dependencias

### Riesgo de Producción: **Crítico**
- Cualquier refactor es a ciegas
- El auth service tiene bugs que tests unitarios atraparían
- La lógica de sync offline tiene edge cases no testeables manualmente
- Sin red de seguridad para regresiones

### Roadmap de Testing

| Período | Objetivo |
|---------|----------|
| Semana 1-2 | Setup Vitest + React Testing Library. Testear servicios, utilidades, stores |
| Semana 3-4 | Tests de integración: login → onboarding → crear rutina → log set → finalizar sesión → ver historial |
| Mes 2 | E2E con Playwright para el viaje completo del usuario |
| Antes de producción | Mínimo: unit tests para todos los servicios, stores, y utilidades críticas |

---

## 11. Perspectiva de Contratación (Recruiter Review)

### Junior Developer
**¿Destacaría?** Sí, fuertemente.
- Proyecto más completo y complejo que el típico (todo apps, apps del clima)
- React Query + Zustand + Supabase + Tailwind v4 demuestra conocimiento de stack moderno
- Mobile-first muestra pensamiento de producto
- **Pero**: inconsistencias de nombres, código muerto, comentarios en español/inglés mezclados

### Mid-Level Developer
**¿Destacaría?** Moderadamente.
- Arquitectura (rutas públicas/protegidas, capa de servicios, stores, hooks) muestra pensamiento estructural
- Offline-first muestra conciencia de restricciones del mundo real
- **Pero**: reviewers seniors notarán inmediatamente: 0 tests, operaciones secuenciales, auth service roto, código muerto

### Senior Developer
**¿Destacaría?** No, pero muestra potencial.
- **Señales faltantes:** Sin testing, sin TypeScript, sin accesibilidad, sin error boundaries, sin CI/CD, sin documentación real (README es template de Vite con "karga" al final)
- **Señales positivas:** Offline-first, React 19 + Vite 8, Zustand + React Query, UI oscura pulida

### Lo que un Hiring Manager Senior busca y no encuentra aquí:
| Señal | Presente? |
|-------|-----------|
| TypeScript | ❌ |
| Tests automatizados | ❌ |
| CI/CD pipeline | ❌ |
| Documentación de arquitectura | ❌ |
| Accesibilidad básica | ❌ |
| Sin código muerto | ❌ |
| Nombres consistentes | ❌ |
| Manejo de errores robusto | ❌ |

---

## 12. Matriz de Prioridades

| Prioridad | Issue | Impacto | Esfuerzo | Por Qué |
|-----------|-------|---------|----------|---------|
| **Crítico** | Auth service retorna strings en vez de throw | Alto | 30 min | Bugs silenciosos en producción |
| **Crítico** | Bucles secuenciales en inserts de rutinas | Alto | 30 min | N+1 queries, sin rollback |
| **Crítico** | Cero tests | Alto | 2-4 semanas | No se puede refactorizar seguro |
| **Alto** | Código muerto (comentarios, archivos vacíos) | Medio | 1 hora | Señal de inexperiencia |
| **Alto** | Sin Error Boundaries | Alto | 1 hora | Crashes rompen toda la app |
| **Alto** | Bug continueRest (variable undefined) | Alto | 10 min | Timer de descanso roto |
| **Alto** | Google OAuth falso | Medio | 1 día | Feature incompleta |
| **Alto** | Body page con datos mock | Medio | 1 día | Feature incompleta |
| **Medio** | Sin lazy loading | Medio | 2 horas | Bundle grande |
| **Medio** | Sin TypeScript | Alto | 2-3 semanas | Esperado para roles seniors |
| **Medio** | Sin paginación | Alto | 2 días | Degradación con datos |
| **Medio** | Falta offline para rutinas/ejercicios | Alto | 1-2 días | Claim offline es engañoso |
| **Bajo** | Inconsistencias de nombres | Bajo | 1 hora | Calidad de código |
| **Bajo** | Sin PWA/Service Worker | Medio | 2-3 días | Diferenciador perderido |
| **Bajo** | Accesibilidad | Medio | Ongoing | Diseño inclusivo |

---

## 13. Roadmap

### Próximos 7 Días (Mayor ROI)

1. **Fix auth service** — Cambiar `return error.message` a `throw error` en `authService.js`
2. **Fix bug continueRest** — Destructurar `isRunning` de `get()` en `restStore.js`
3. **Fix batch inserts** — Cambiar `for...of` + `await` a single `Promise.all` o batch insert
4. **Eliminar código muerto** — Bloques comentados, archivos vacíos, propiedades de store no usadas
5. **Eliminar console.logs** de producción y `"descripcion de prueba"` default
6. **Eliminar `addSyncedSets` y `syncedSets`** de setsStore (muertos y con bug)
7. **Agregar Error Boundary** componente envolviendo la app

### Próximos 30 Días

8. **Setup Vitest + React Testing Library** + tests para servicios y stores
9. **Lazy loading** de modales y rutas
10. **Implementar Google OAuth real** con Supabase
11. **Agregar `useMemo`/`useCallback`** en componentes clave
12. **Reemplazar SVGs inline duplicados** con imports del módulo de iconos
13. **Extraer lógica de merge de ejercicios** a un hook compartido
14. **Agregar sistema de toasts** para feedback al usuario

### Próximos 90 Días

15. **Migrar a TypeScript** — mejora más impactful para hiring perception
16. **Paginación en queries de sets/sessions**
17. **PWA con Service Worker** para offline real
18. **Detección de estado de red** y UI adaptativa
19. **Cola de reintentos con exponential backoff** para syncs fallidos
20. **Accesibilidad** (aria, keyboard nav, focus trapping)

### Antes de Producción

21. **Verificar políticas RLS de Supabase**
22. **E2E tests** del viaje completo del usuario
23. **Validación de inputs en capa de servicios** (no solo formularios)
24. **Mover `.env` a `.gitignore** y documentar variables necesarias
25. **Integrar Body page con Supabase real**

### Antes de Aplicar a Trabajos

26. **TypeScript** — #1 señal para roles seniors
27. **Eliminar TODO el código muerto** y corregir typos
28. **Tests** — muestra rigor ingenieril
29. **README profesional** con diagrama de arquitectura, setup, decisiones técnicas
30. **CI** (GitHub Actions para lint + test)
31. **Deploy a Vercel** con URL pública en el README

---

## 14. Scorecard Final

| Categoría | Puntaje (1-10) | Notas |
|-----------|---------------|-------|
| **Arquitectura** | 6 | Buena separación de capas, pero operaciones secuenciales, sin paginación |
| **Calidad de Código** | 5 | Limpio en partes, pero lastrado por código muerto, typos, inconsistencias |
| **Escalabilidad** | 3 | Sin paginación, agregación en memoria, operaciones secuenciales |
| **Mantenibilidad** | 5 | Código muerto, typos, pero estructura de carpetas buena |
| **Seguridad** | 6 | Depende completamente de RLS de Supabase; auth service roto |
| **Performance** | 4 | Sin lazy loading, sin memoización, SVG inline duplicados |
| **Testing** | 0 | Cero tests |
| **UX** | 7 | Tema oscuro pulido, animaciones suaves, sin accesibilidad ni feedback de errores |
| **Product Thinking** | 7 | Offline-first, mobile-first, feature set bien elegido |
| **Developer Experience** | 4 | Sin TypeScript, sin testing, código muerto, sin CI |
| **Offline Readiness** | 4 | Solo sets/sessions; sin resolución de conflictos, reintentos, o detección de red |
| **Documentación** | 2 | README default de Vite con "karga" agregado |
| **Valor de Portfolio** | 6 | Impresionante para junior, decente para mid, no competitivo para senior |
| **Hiring Potential** | 5 | Atraería atención para junior/mid, sería filtrado para senior |

### Overall Engineering Score: **4.6/10**

Una base sólida con potencial real. La fundación es buena (Zustand + React Query + Supabase + mobile-first) pero está claramente incompleta — faltan tests, TypeScript, hay código muerto, y varios issues arquitectónicos impiden que sea production-ready o competitivo a nivel senior.

### Overall Product Score: **6/10**

El concepto, diseño y flujo UX son cohesivos y bien pensados. El enfoque offline-first para una app de gimnasio es apropiado. Pero features incompletas (Body mock, Google OAuth falso, rutas faltantes) y falta de polish (sin feedback de errores, sin toasts) evitan que se sienta completo.

### Overall Portfolio Score: **5.5/10**

- **Junior**: Proyecto destacado — muestra capacidad de construir full-stack con herramientas modernas
- **Mid-Level**: Muestra competencia pero necesita testing y TypeScript para ser competitivo
- **Senior**: No pasa el filtro sin TypeScript, tests, optimizaciones de performance y código mucho más limpio

### Production Readiness Score: **3/10**

Faltan demasiados fundamentos: sin tests, sin error boundaries, código muerto, operaciones secuenciales que fallarían parcialmente sin rollback, sin validación en capa de servicios, auth service con manejo de errores roto. Un incidente de pérdida de datos o caída es probable si esto fuera a producción hoy.

---

## 15. Preguntas Pendientes

Para el equipo — necesitamos respuestas para priorizar correctamente:

1. **¿Quién es el usuario objetivo?** ¿Ustedes mismos, demo para trabajos, o atletas reales?
2. **¿Hay planes de monetización?** ¿Suscripción? ¿Gratuito? (Define decisiones de seguridad y escala)
3. **¿Escala esperada de datos?** 1 usuario / 100 / 10,000?
4. **¿Google OAuth debe funcionar o queda como placeholder?**
5. **¿Deploy target?** ¿Vercel, Netlify, Docker? (Afecta config de build)
6. **¿Estrategia de testing?** ¿Es intencional que no haya tests o están pendientes?
7. **¿Es principalmente para portfolio / aplicaciones a trabajos?** (Esto cambia radicalmente las prioridades)
8. **¿Mobile-only o responsive desktop también?**
9. **¿Tienen políticas RLS configuradas en Supabase?** — **PREGUNTA CRÍTICA DE SEGURIDAD**
10. **¿Flujo de trabajo del equipo?** ¿Git flow, code reviews, CI?

---

*Documento generado como parte de una auditoría de código automatizada con revisión de Staff Engineer / Software Architect.*

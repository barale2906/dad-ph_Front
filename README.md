# Dad PH Front (UniPH)

Frontend Angular para el sistema UniPH - gestión de Propiedad Horizontal, reuniones, votaciones y quórum. Consume la API REST UniPH (Laravel + Sanctum).

## Desarrollo con Docker (recomendado)

Según la guía de prácticas Docker del proyecto:

```bash
# Primera ejecución: inicializa y levanta contenedores
make init

# Inicio del día: arrancar contenedores
make start

# Fin del día: detener sin borrar datos
make stop
```

**Acceso:** http://localhost:4200

### Comandos útiles

```bash
make npm install                    # Instalar dependencias
make npm -- run ng generate component X  # Generar componente
make angular                        # Acceder al contenedor
make logs angular                   # Ver logs del servidor
```

## Desarrollo local (sin Docker)

```bash
npm install
ng serve
```

Navega a `http://localhost:4200/`. La aplicación se recarga al modificar el código.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

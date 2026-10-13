# test-manager-library-3145556-tool

Utilidad de sembrado de datos demostrativos **a través de la API** (no inserta SQL directamente).

## Requisitos
- Node.js 18+
- API corriendo y admin disponible

## Uso
```bash
npm install
API_URL=http://localhost:8000/api/v1 ADMIN_USERNAME=admin ADMIN_PASSWORD=change-me npm run seed
```

Scripts:
- `npm run seed` → ejecuta `seed.mjs`
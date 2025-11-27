
### POST /api/greenpoint

```json
{
  "name": "Eco Punto San Juan",
  "coords": { "lat": -16.409047, "lon": -71.537451 },
  "materials": [
    { "materialId": "plastic", "quantity": 20, "unidad": "kg" },
    { "materialId": "glass", "quantity": 10, "unidad": "kg" }
  ],
  "metadata": {
    "createdBy": "1dasd11313%6322",
  }
}

```
nombre del green point
coord: [lat, lon]
objetos: materialId, quantity, unidad
metadata:
    quien lo creo

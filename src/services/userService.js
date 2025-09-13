export async function registerUser(data) {
  try {
    const res = await fetch('https://taskly-2h0c.onrender.com/api/v1/users/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      // Intenta capturar el error y parsearlo correctamente
      const error = await res.text();  // Cambié a `.text()` para evitar errores si no es JSON
      console.error('Error en el servidor:', error); // Ver qué devuelve el servidor
      throw new Error(error || 'Error en el registro');
    }

    return res.json();  // Parsear el JSON de respuesta
  } catch (err) {
    console.error('Error al registrar:', err);  // Imprimir error general
    throw err;  // Relanzar el error para que se maneje en el frontend
  }
}

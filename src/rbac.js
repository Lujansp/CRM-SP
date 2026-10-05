const db = require('./db');

// Llama a buscar_codigo_prg sin modificarla, dentro de una sesion Oracle cuyo USER
// es el empleado. Devuelve el ID_PROGRAMA o null si no tiene acceso ('X (...)').
async function codigoPrograma(username, descripcion) {
  const conn = await db.getConnectionAs(username);
  try {
    const r = await conn.execute(
      'SELECT buscar_codigo_prg(:p) AS ID FROM DUAL',
      { p: descripcion }
    );
    const id = r.rows[0].ID;
    return id && !String(id).startsWith('X (') ? id : null;
  } finally {
    await conn.close();
  }
}

// Middleware: exige que el empleado tenga el programa (pantalla) indicado.
function requirePrograma(descripcion) {
  return async (req, res, next) => {
    try {
      const id = await codigoPrograma(req.user.username, descripcion);
      if (!id) return res.status(403).json({ error: `Sin acceso a ${descripcion}` });
      req.programa = id;
      next();
    } catch (e) {
      next(e);
    }
  };
}

module.exports = { codigoPrograma, requirePrograma };

const router = require('express').Router();
const { login, authenticate } = require('../auth');
const { codigoPrograma, requirePrograma } = require('../rbac');

router.post('/auth/login', login);

router.use(authenticate);

router.get('/auth/me', (req, res) => res.json(req.user));

// El front consulta si el empleado puede ver una pantalla (equivale a la llamada de Forms).
router.get('/auth/programa/:descripcion', async (req, res, next) => {
  try {
    const id = await codigoPrograma(req.user.username, req.params.descripcion);
    res.json({ acceso: !!id, id_programa: id });
  } catch (e) {
    next(e);
  }
});

// Ejemplo de uso por modulo; los nombres reales salen de PROGRAMA.DESCRIPCION.
router.get('/cobranza/ping', requirePrograma('CRM COBRANZA'), (req, res) =>
  res.json({ ok: true, programa: req.programa })
);

module.exports = router;

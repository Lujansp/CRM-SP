const jwt = require('jsonwebtoken');
const db = require('./db');

const IDENT = /^[A-Za-z][A-Za-z0-9_$#]{0,29}$/;

async function login(req, res, next) {
  try {
    const { usuario, password } = req.body || {};
    if (!usuario || !IDENT.test(usuario)) {
      return res.status(400).json({ error: 'Usuario invalido' });
    }
    // En ambos modos se valida contra Oracle; la clave nunca se guarda ni se loguea.
    let oracleUser;
    try {
      oracleUser = await db.verifyCredentials(usuario, password || '');
    } catch (e) {
      return res.status(401).json({ error: 'Credenciales invalidas' });
    }
    const token = jwt.sign({ username: oracleUser }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    });
    res.json({ token, usuario: oracleUser });
  } catch (e) {
    next(e);
  }
}

function authenticate(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Token requerido' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token invalido o vencido' });
  }
}

module.exports = { login, authenticate };

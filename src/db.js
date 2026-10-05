require('dotenv').config();
const oracledb = require('oracledb');

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

let pool;

// Pool heterogeneo: permite abrir sesiones como otro usuario (proxy authentication).
async function init() {
  pool = await oracledb.createPool({
    user: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASSWORD,
    connectString: process.env.ORACLE_CONNECT_STRING,
    homogeneous: false,
    poolMin: 1,
    poolMax: 10,
  });
}

// Sesion con la cuenta tecnica.
function getConnection() {
  return pool.getConnection();
}

// Sesion "como" el empleado: USER en Oracle pasa a ser el empleado real.
function getConnectionAs(username) {
  return pool.getConnection({ user: username });
}

// Valida credenciales abriendo una sesion standalone con usuario/clave del empleado.
async function verifyCredentials(username, password) {
  const conn = await oracledb.getConnection({
    user: username,
    password,
    connectString: process.env.ORACLE_CONNECT_STRING,
  });
  try {
    const r = await conn.execute('SELECT USER AS U FROM DUAL');
    return r.rows[0].U;
  } finally {
    await conn.close();
  }
}

async function close() {
  if (pool) await pool.close(5);
}

module.exports = { init, getConnection, getConnectionAs, verifyCredentials, close };

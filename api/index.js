const { app, prepare } = require('../backend-aula-segura/src/app');

module.exports = async (req, res) => {
  await prepare();
  return app(req, res);
};

module.exports = {
  ping: (req, res) => res.status(200).json('Application is up'),

  notFoundHandler: (req, res) => res.status(404).json('Not Found'),

  methodNotAllowed: (req, res) => res.status(405).json('Method Not Allowed'),

  authenticateErrorHandler: (req, res) => res.status(401).json(req.error),
}
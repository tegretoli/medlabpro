const Audit = require('../models/Audit');

exports.auditLog = (action, resource) => async (req, res, next) => {
  const originalSend = res.json.bind(res);
  res.json = function(data) {
    if (res.statusCode < 400 && req.user) {
      Audit.create({
        user: req.user._id,
        action,
        resource,
        resourceId: req.params.id || data?.data?._id,
        details: { method: req.method, path: req.path, body: req.body },
        ip: req.ip,
        userAgent: req.headers['user-agent']
      }).catch(console.error);
    }
    return originalSend(data);
  };
  next();
};

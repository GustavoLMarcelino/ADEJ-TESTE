module.exports = (req, res, next) => {
    if (req.session && req.session.volunteerId) {
      next();
    } else {
      res.redirect('/login');
    }
  };
  
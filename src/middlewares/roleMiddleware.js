export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.papel !== 'ADMIN') {
    return res.status(403).json({ error: 'Acesso restrito a administradores.' });
  }

  next();
};

// Permite acesso a ADMIN ou RECEPCIONISTA
export const requireAdminOrReceptionist = (req, res, next) => {
  const papel = req.user?.papel;

  if (papel === 'ADMIN' || papel === 'RECEPTIONIST') {
    return next();
  }

  return res.status(403).json({
    error: 'Acesso negado. Somente ADMIN ou RECEPCIONISTA podem executar esta ação.'
  });
};

// Bloqueia somente PATIENT
export const requireNotPatient = (req, res, next) => {
  const papel = req.user?.papel;

  if (papel !== 'PATIENT') {
    return next();
  }

  return res.status(403).json({
    error: 'Acesso negado. Somente ADMIN ou RECEPCIONISTA podem executar esta ação.'
  });
};



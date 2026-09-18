const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(String(email).toLowerCase());
};

const validatePublicContactForm = (req, res, next) => {
  const { name, email, message, phone } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Full name is required.');
  } else if (name.trim().length > 100) {
    errors.push('Name must not exceed 100 characters.');
  }

  if (!email || !isValidEmail(email)) {
    errors.push('A valid email address is required.');
  }

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    errors.push('Message is required.');
  } else if (message.trim().length > 2000) {
    errors.push('Message must not exceed 2000 characters.');
  }

  if (phone && (typeof phone !== 'string' || phone.length > 30)) {
    errors.push('Phone number must be a valid string up to 30 characters.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

const validateStatusUpdate = (req, res, next) => {
  const { status } = req.body;
  const allowedStatuses = ['NEW', 'CONTACTED', 'IN_PROGRESS', 'CONVERTED', 'LOST'];

  if (!status || !allowedStatuses.includes(status.toUpperCase())) {
    return res.status(400).json({
      success: false,
      error: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}`
    });
  }

  req.body.status = status.toUpperCase();
  next();
};

const validateNoteAddition = (req, res, next) => {
  const { note } = req.body;

  if (!note || typeof note !== 'string' || note.trim().length === 0) {
    return res.status(400).json({ success: false, error: 'Follow-up note content is required.' });
  }

  if (note.trim().length > 1000) {
    return res.status(400).json({ success: false, error: 'Follow-up note cannot exceed 1000 characters.' });
  }

  next();
};

module.exports = {
  validatePublicContactForm,
  validateStatusUpdate,
  validateNoteAddition
};

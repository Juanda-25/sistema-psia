const usersService = require('./users.service');

const getProfile = async (req, res) => {
  try {
    const profile = await usersService.getProfile(req.user.id);
    res.json(profile);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const updated = await usersService.updateProfile(req.user.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { getProfile, updateProfile };
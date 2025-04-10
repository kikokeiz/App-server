// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Definir el esquema de usuario
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// Método para encriptar la contraseña antes de guardar
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Método para comparar la contraseña con la guardada
UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', UserSchema);

module.exports = User;

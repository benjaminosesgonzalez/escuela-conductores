import express from 'express';
import bcrypt from 'bcrypt';
import { AppDataSource } from '../config/configDb.js'; // 🔴 CAMBIO 1

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, nombre, telefono, tipo_contrato = 'full_time' } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email y password son requeridos'
      });
    }

    // Validar tipo_contrato
    const tiposValidos = ['full_time', 'part_time_morning', 'part_time_afternoon'];
    if (!tiposValidos.includes(tipo_contrato)) {
      return res.status(400).json({
        error: `tipo_contrato inválido. Debe ser: ${tiposValidos.join(', ')}`
      });
    }

    const checkEmail = await AppDataSource.query(
      'SELECT * FROM profesores WHERE email = $1',
      [email]
    );

    if (checkEmail.length > 0) {
      return res.status(400).json({
        error: 'El email ya está registrado'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await AppDataSource.query(
      'INSERT INTO profesores (email, password, nombre, telefono, tipo_contrato) VALUES ($1, $2, $3, $4, $5)',
      [email, hashedPassword, nombre || null, telefono || null, tipo_contrato]
    );

    const newProfesor = await AppDataSource.query(
      'SELECT id, email, nombre, tipo_contrato FROM profesores WHERE email = $1',
      [email]
    );

    res.status(201).json({
      success: true,
      message: 'Profesor registrado correctamente',
      profesor: {
        ...newProfesor[0],
        rol: 'profesor'
      }
    });

  } catch (error) {
    console.error('Error al registrar profesor:', error);
    res.status(500).json({
      error: 'Error al registrar profesor',
      details: error.message
    });
  }
});

export default router;
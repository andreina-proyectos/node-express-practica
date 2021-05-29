('use strict');
const { v4: uuidv4, validate } = require('uuid');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Schema, model } = mongoose;
const app = express();
const PORT = 5000;

mongoose
  .connect('mongodb://localhost:27017/usersInfo', {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: true,
  })
  .then((res) => console.log('mongo connected!!'));

const UserSchema = new Schema({
  _id: { type: String },
  nombre: { type: String },
  apellidos: { type: String },
  edad: { type: String },
  dni: { type: String },
  cumpleanos: { type: String },
  colorFavorito: { type: String },
  sexo: { type: String },
});

const genderOptions = ['hombre', 'mujer', 'otro', 'No especificado'];

const User = model('usersInfo', UserSchema);

app
  .use(cors())
  .use(express.urlencoded({ extended: true }))
  .use(express.json())
  .listen(PORT, (req, res) => {
    console.log('API is working :)!');
  });

app.get('/users', async (req, res) => {
  const userList = await User.find();
  res.json(userList);
});

app.post('/new-user', async (req, res) => {
  const newUser = new User(req.body);
  newUser._id = uuidv4();
  console.log('newUser', newUser);
  const errorList = validateUser(newUser);

  if (errorList.length > 0) {
    res.status(400).send({
      message:
        '⚠ There is an error about user information. Please read the error list and check it',
      errorList: errorList,
    });
  } else {
    await newUser.save();
    res.json({ message: 'New user created :)', userData: newUser });
  }
});

app.delete('/user/:id', async function (req, res) {
  const paramId = req.params.id;
  const userToDelete = await User.findByIdAndDelete(paramId);
  res.json({ message: `User with id ${paramId} deleted! :O` });
});

function validateUser(newUser) {
  const errorList = [];
  const { nombre, apellidos, edad, cumpleanos, dni, sexo, colorFavorito } =
    newUser;
  const onlyCharRgx = /^[a-zA-Z\s]*$/;
  console.log(onlyCharRgx.test(nombre));

  if (!nombre) {
    errorList.push('⚠ The field nombre must be present');
  }
  if (nombre && nombre.length <= 3) {
    errorList.push('⚠ The field nombre must have more than 3 characters');
  }
  if (nombre && !onlyCharRgx.test(nombre)) {
    errorList.push('⚠ The field nombre must not contain numbers');
  }
  if (!apellidos) {
    errorList.push('⚠ The field apellidos must be present');
  }
  if (apellidos && apellidos.length <= 3) {
    errorList.push('⚠ The field apellidos must have more than 3 characters');
  }
  if (apellidos && !onlyCharRgx.test(apellidos)) {
    errorList.push('⚠ The field apellidos must not contain numbers');
  }
  if (!edad) {
    errorList.push('⚠ The field edad must be present');
  }
  if (!dni) {
    errorList.push('⚠ The field dni must be present');
  }
  if (!cumpleanos) {
    errorList.push('⚠ The field cumpleanos must be present');
  }
  if (edad < 0 || edad > 125) {
    errorList.push('⚠ Your age must be greater than 0 and less than 125');
  }
  if (dni.length != 9) {
    errorList.push('⚠ Your DNI must have 9 char');
  }

  if (!colorFavorito) {
    errorList.push('⚠ The field colorFavorito must be present');
  }
  if (colorFavorito && colorFavorito.length <= 3) {
    errorList.push(
      '⚠ The field colorFavorito must have more than 3 characters'
    );
  }
  if (colorFavorito && !onlyCharRgx.test(colorFavorito)) {
    errorList.push('⚠ The field apellidos must not contain numbers');
  }

  if (!sexo) {
    errorList.push('⚠ Your gender must have a selected option');
  }

  if (
    sexo &&
    genderOptions.filter(
      (gender) => gender.toUpperCase() === sexo.toUpperCase()
    )
  ) {
    errorList.push(
      '⚠ Your gender must be: hombre, mujer, otro, No especificado'
    );
  }

  return errorList;
}
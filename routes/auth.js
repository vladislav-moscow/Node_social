const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

//регистрация
router.post("/register", async (req, res) => {
  try {
    //генерируем пароль
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    //создаем нового пользователя
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });

    //сохрняем пользователя и отправляем ответ
    const user = await newUser.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err)
  }
});

//вход
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    !user && res.status(404).json("Пользователь с таким email не найден!");

    const validPassword = await bcrypt.compare(req.body.password, user.password)
    !validPassword && res.status(400).json("Не верный пароль!")

    res.status(200).json(user)
  } catch (err) {
    res.status(500).json(err)
  }
});

module.exports = router;
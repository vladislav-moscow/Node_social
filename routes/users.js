const User = require("../models/User");
const router = require("express").Router();
const bcrypt = require("bcrypt");

//обновление данных пользователя
router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        return res.status(500).json(err);
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("Аккаунт обновлен!");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("Вы можете обновить только свой аккаунт!");
  }
});

//удаление пользователя
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json("Пользователь удален!");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("Вы можете удалить только свой аккаунт!");
  }
});

//получить данные пользователя
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
});


//follow user

router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({ $push: { followings: req.params.id } });
        res.status(200).json("Вы успешно подписались!");
      } else {
        res.status(403).json("Вы уже подписаны на этого пользователя");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    return res.status(403).json("Вы не можете подписаться на себя!");
  }
});
//unfollow user

router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { followings: req.params.id } });
        res.status(200).json("Пользователь был отписан");
      } else {
        res.status(403).json("Вы не подписаны на этого пользователя");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("Вы не можете отписаться от себя");
  }
});



module.exports = router;
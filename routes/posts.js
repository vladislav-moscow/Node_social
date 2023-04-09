const Post = require("../models/Post");
const User = require("../models/User");
const router = require("express").Router();

//создать пост

router.post("/", async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});

//обновить пост

router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("Пост успешно обновлен!");
    } else {
      res.status(403).json("Вы можете обновлять только свои посты");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//удалить пост

router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).json("Пост успешно удален");
    } else {
      res.status(403).json("Вы не можете удалить этот пост");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//поставить лайк на пост

router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json("Данный пост вам понравился");
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json("Данный пост вам не понравился");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//найти пост

router.get("/:id", async (req,res) => {
  try{
    const post = await Post.findById(req.params.id);
    res.status(200).json(post)
  }catch(err) {
    res.status(500).json(err);
  }
})

//get timeline posts

router.get("/timeline/all", async (req,res) => {
  try {
    const currentUser = await User.findById(req.body.userId);
    const userPosts = await Post.find({ userId: currentUser._id });
    const friendPosts = await Promise.all(
      currentUser.followings.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    res.json(userPosts.concat(...friendPosts))
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
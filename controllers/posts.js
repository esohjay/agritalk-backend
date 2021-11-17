const Post = require("../models/posts");
const { cloudinary } = require("../cloudinary");
module.exports.createPost = async (req, res) => {
  const { title, category, image, tags, postImages, description, isDraft } =
    req.body;
  const postTags = tags.split(" ");
  const post = new Post({
    title,
    isDraft,

    category,
    image,
    postImages,
    description,
    tags: postTags,
  });
  // postImages.map((image) => post.postImages.push(image));
  post.author = req.user;
  await post.save();
  res.send(post);
};

module.exports.allPosts = async (req, res) => {
  const postPerPage = parseInt(req.query.limit || 10);
  const page = parseInt(req.query.page || 1);
  const totalPosts = await Post.estimatedDocumentCount({});
  const posts = await Post.find({})
    .limit(postPerPage)
    .skip(postPerPage * (page - 1))
    .populate({
      path: "author",
      select: ["username", "email"],
    })
    .sort({ updatedAt: -1 });
  const totalPages = Math.ceil(totalPosts / postPerPage);
  const hasNextPage = page >= totalPages ? false : true;
  const hasPrevPage = page > 1 ? true : false;
  const nextPage = page + 1;
  const prevPage = page - 1;
  res.send({
    posts,
    totalPosts,
    totalPages,
    prevPage,
    nextPage,
    hasPrevPage,
    hasNextPage,
    page,
  });
};

module.exports.getPost = async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id)
    .populate({
      path: "author",
      select: ["username", "image", "bio", "socials"],
    })
    .populate({
      path: "comments",
      model: "Comment",
      populate: [
        {
          path: "author",
          model: "User",
          select: ["username", "image"],
        },
        {
          path: "replies",
          model: "Reply",
          populate: {
            path: "author",
            model: "User",
            select: ["username", "image"],
          },
        },
      ],
    })
    .exec();
  res.send(post);
};

module.exports.getUserPosts = async (req, res) => {
  const post = await Post.find({ author: req.user._id });

  res.send(post);
};

module.exports.editPost = async (req, res) => {
  const { id } = req.params;
  const {
    title,

    category,
    image,
    postImages,
    description,
    imageToDelete,
    isDraft,
  } = req.body;
  const post = await Post.findByIdAndUpdate(id, {
    title,

    category,
    image,
    postImages,
    description,
    isDraft,
  });
  if (imageToDelete) await cloudinary.uploader.destroy(imageToDelete);
  await post.save();

  res.send(post);
};

module.exports.likePost = async (req, res) => {
  const { id } = req.params;

  const post = await Post.findById(id);

  if (post.likes.users.includes(req.user._id)) {
    const removeLike = post.likes.users.filter((like) => {
      like !== req.user;
    });
    post.likes = {
      counts: removeLike.length,
      users: removeLike,
    };
    console.log("first");
    console.log(post.likes.counts);
  } else {
    const newLike = post.likes.users.push(req.user);
    post.likes.counts = post.likes.users.length;
    console.log("second");
    console.log(post.likes.counts);
  }
  await post.save();
  res.send(post);
};

module.exports.changePostStatus = async (req, res) => {
  const { id } = req.params;

  const post = await Post.findById(id);
  post.isDraft = req.body.isDraft;
  await post.save();
  res.send(post);
};

module.exports.deletePost = async (req, res) => {
  const { id } = req.params;
  const post = await Post.findByIdAndDelete(id);
  for (let img of post.postImages) {
    await cloudinary.uploader.destroy(img.filename);
  }
  res.send(post);
};

/*module.exports.uploadImage = async (req, res) => {
  const file = req.file;
  const myFiles = { url: file.path, filename: file.filename };

  res.send(myFiles);
};*/
module.exports.uploadImage = async (req, res) => {
  const file = req.file;
  const myFiles = { url: file.path, filename: file.filename };

  res.send(myFiles);
};

const Post = require("../models/posts");
const { cloudinary } = require("../cloudinary");
module.exports.createPost = async (req, res) => {
  const { title, category, image, tags, postImages, description, isDraft } =
    req.body;

  //make tags an array separated by quotes
  const postTags = tags.split(" ");

  //create post
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
  const category = req.query.category || "";
  const tags = req.query.tags || "";
  const title = req.query.title || "";
  //check if query fields are not empty
  const categoryFilter = category ? { category } : {};
  const tagsFilter = tags ? { tags } : {};
  const titleFilter = title ? { title: { $regex: title, $options: "i" } } : {};

  //get the total number of posts in database
  const allPosts = await Post.estimatedDocumentCount({});
  const posts = await Post.find({
    ...titleFilter,
    ...categoryFilter,
    ...tagsFilter,
  })
    .limit(postPerPage)
    .skip(postPerPage * (page - 1))
    .populate({
      path: "author",
      select: ["username", "image"],
    })
    .sort({ updatedAt: -1 });

  //find post with query parameters without skipping any doc, so as to get the total
  //number of posts result from the filter
  const searchPosts = await Post.find({
    ...titleFilter,
    ...categoryFilter,
    ...tagsFilter,
  });

  //check if te user is on search screen or just browsing through postlists
  //this will help us know if to skip documents or not, for the purpose of pagination in frontend
  const totalPosts = req.query.searchScreen ? searchPosts.length : allPosts;
  //const allPages = Math.ceil(totalPosts / postPerPage);
  //const searchPages = Math.ceil(searchPosts.length / postPerPage);
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
  const { id } = req.params;
  const post = await Post.find({ author: id });

  res.send(post);
};

module.exports.editPost = async (req, res) => {
  const { id } = req.params;

  const {
    title,

    wantedTags,
    newTags,
    category,
    image,
    postImages,
    description,
    imageToDelete,
    isDraft,
  } = req.body;

  // check if user sends more post tags, split it into array and push into existing tags
  if (newTags) {
    const postTags = newTags.split(" ");
    postTags.map((tag) => wantedTags.push(tag));
  }

  const post = await Post.findByIdAndUpdate(id, {
    title,
    tags: wantedTags,
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
  //find the post
  const post = await Post.findById(id);
  //check if the user has liked the post before by checking if user id is in post.likes array
  //to know if user wants to remove their like or like post
  if (post.likes.users.includes(req.user._id)) {
    //if it includes user id, remove the user id from the array
    //store the remaining ids in the array in removeLike variable
    const removeLike = post.likes.users.filter((like) => {
      like !== req.user;
    });

    //use the new array "removeLike", to update the post like field
    post.likes = {
      counts: removeLike.length,
      users: removeLike,
    };
  } else {
    //user id is not in the like array, that means user wants to like the post
    const newLike = post.likes.users.push(req.user);
    post.likes.counts = post.likes.users.length;
  }
  await post.save();
  res.send(id);
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

  //checking if post.postImages.length > 1 because postImages creates an empty objects which
  //automatically makes the postImages.legth to be 1
  if (post.postImages && post.postImages.length > 1) {
    for (let img of post.postImages) {
      await cloudinary.uploader.destroy(img.filename);
    }
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

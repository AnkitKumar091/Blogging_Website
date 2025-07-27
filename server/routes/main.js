const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Contact = require('../models/Contact');

/**
 * GET /
 * HOME with pagination
 */
router.get('', async (req, res) => {
  try {
    const locals = {
      title: "NodeJs Blog",
      description: "Simple Blog created with NodeJs, Express & MongoDb."
    };

    let perPage = 10;
    let page = parseInt(req.query.page) || 1;

    const data = await Post.aggregate([{ $sort: { createdAt: -1 } }])
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();

    const count = await Post.countDocuments({});
    const nextPage = page + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);

    res.render('index', {
      locals,
      data,
      current: page,
      nextPage: hasNextPage ? nextPage : null,
      currentRoute: '/'
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Something went wrong.');
  }
});

/**
 * GET /all-blogs
 * Show ALL blogs (no pagination)
 */
router.get('/all-blogs', async (req, res) => {
  try {
    const locals = {
      title: "All Blogs",
      description: "Browse all past blogs"
    };

    // ✅ Fetch ALL blogs sorted by newest first
    const data = await Post.find().sort({ createdAt: -1 });

    res.render('all-blogs', {
      locals,
      data,
      currentRoute: '/all-blogs'
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Something went wrong.');
  }
});

/**
 * GET /post/:id
 * View Single Post
 */
router.get('/post/:id', async (req, res) => {
  try {
    const slug = req.params.id;
    const data = await Post.findById(slug);

    if (!data) return res.status(404).send('Post not found');

    const locals = {
      title: data.title,
      description: "Simple Blog created with NodeJs, Express & MongoDb."
    };

    res.render('post', {
      locals,
      data,
      currentRoute: `/post/${slug}`
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Something went wrong.');
  }
});

/**
 * POST /search
 */
router.post('/search', async (req, res) => {
  try {
    const locals = {
      title: "Search",
      description: "Simple Blog created with NodeJs, Express & MongoDb."
    };

    let searchTerm = req.body.searchTerm;
    const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");

    const data = await Post.find({
      $or: [
        { title: { $regex: new RegExp(searchNoSpecialChar, 'i') } },
        { body: { $regex: new RegExp(searchNoSpecialChar, 'i') } }
      ]
    });

    res.render('search', {
      data,
      locals,
      currentRoute: '/'
    });

  } catch (error) {
    console.log(error);
    res.status(500).send('Search failed.');
  }
});

/**
 * GET /about
 */
router.get('/about', (req, res) => {
  const locals = {
    title: "About",
    description: "About this blog"
  };
  res.render('about', { locals, currentRoute: '/about' });
});

/**
 * GET /contact
 */
router.get('/contact', (req, res) => {
  const locals = {
    title: "Contact",
    description: "Contact us page"
  };
  res.render('contact', { locals, currentRoute: '/contact' });
});

/**
 * POST /contact
 */
router.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    await Contact.create({ name, email, message });
    console.log('✅ Contact form saved:', { name, email, message });
    res.redirect('/contact?success=true');
  } catch (err) {
    console.error('❌ Error submitting contact form:', err);
    res.status(500).send('Something went wrong. Please try again.');
  }
});

/**
 * GET /add-blog
 */
router.get('/add-blog', (req, res) => {
  const locals = {
    title: "Add Blog",
    description: "Create a new blog post"
  };
  res.render('add-blog', { locals, currentRoute: '/add-blog' });
});

/**
 * POST /add-blog
 */
router.post('/add-blog', async (req, res) => {
  try {
    const { title, body } = req.body;
    const newPost = new Post({ title, body });
    await newPost.save();
    console.log('✅ New blog saved:', newPost);
    res.redirect('/');
  } catch (err) {
    console.error('❌ Error saving blog:', err);
    res.status(500).send('Something went wrong');
  }
});

/**
 * GET /edit-blog/:id
 * Show Edit Blog Page
 */
router.get('/edit-blog/:id', async (req, res) => {
  try {
    const blog = await Post.findById(req.params.id);
    const locals = {
      title: "Edit Blog",
      description: "Edit your blog post"
    };
    res.render('edit-blog', { locals, blog, currentRoute: '/edit-blog' });
  } catch (err) {
    console.error('❌ Error loading blog for edit:', err);
    res.status(500).send('Something went wrong.');
  }
});

/**
 * PUT /edit-blog/:id
 * Update Blog
 */
router.put('/edit-blog/:id', async (req, res) => {
  try {
    const { title, body } = req.body;
    await Post.findByIdAndUpdate(req.params.id, { title, body, updatedAt: Date.now() });
    res.redirect('/');
  } catch (err) {
    console.error('❌ Error updating blog:', err);
    res.status(500).send('Something went wrong.');
  }
});

/**
 * DELETE /delete-blog/:id
 * Delete Blog
 */
router.delete('/delete-blog/:id', async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.redirect('/');
  } catch (err) {
    console.error('❌ Error deleting blog:', err);
    res.status(500).send('Something went wrong.');
  }
});

/**
 * Optional: Seed Post Data (only run once)
 */
function insertPostData() {
  Post.insertMany([
    { title: "Building APIs with Node.js", body: "Learn how to use Node.js to build RESTful APIs using frameworks like Express.js" },
    { title: "Deployment of Node.js applications", body: "Understand the different ways to deploy your Node.js applications..." },
    { title: "Authentication and Authorization in Node.js", body: "Learn how to add authentication and authorization..." },
    { title: "Understand how to work with MongoDB and Mongoose", body: "Understand how to work with MongoDB and Mongoose..." },
    { title: "Build real-time, event-driven applications in Node.js", body: "Socket.io: Learn how to use Socket.io..." },
    { title: "Discover how to use Express.js", body: "Discover how to use Express.js..." },
    { title: "Asynchronous Programming with Node.js", body: "Explore the asynchronous nature of Node.js..." },
    { title: "Learn the basics of Node.js and its architecture", body: "Learn the basics of Node.js and its architecture..." },
    { title: "NodeJs Limiting Network Traffic", body: "Learn how to limit network traffic." },
    { title: "Learn Morgan - HTTP Request logger for NodeJs", body: "Learn Morgan." },
  ]);
}
// insertPostData();

module.exports = router;


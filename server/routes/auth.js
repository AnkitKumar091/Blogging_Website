const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const router = express.Router();

/**
 * GET: Show register page
 */
router.get('/register', (req, res) => {
  res.render('register');
});

/**
 * POST: Handle register
 */
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    await User.create({ username, password: hashedPassword });

    // redirect to login after successful register
    res.redirect('/login');
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.send('❌ Username already exists');
    }
    res.send('❌ Something went wrong, please try again.');
  }
});

/**
 * GET: Show login page
 */
router.get('/login', (req, res) => {
  res.render('login');
});

/**
 * POST: Handle login
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.send('❌ Invalid username or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.send('❌ Invalid username or password');
    }

    // login success
    req.session.user = user; // store user in session
    res.redirect('/'); // redirect to home
  } catch (error) {
    console.error(error);
    res.send('❌ Server error');
  }
});

/**
 * GET: Logout
 */
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

/* ------------------------------------------------------------------
   ✅ Added these public routes with res.render and currentRoute
-------------------------------------------------------------------*/

/**
 * GET: Home page
 */
router.get('/', async (req, res) => {
  try {
    const locals = {
      title: "NodeJs Blog",
      description: "Simple Blog created with NodeJs, Express & MongoDb."
    };

    // If you want to fetch posts here, you can import Post model
    // and fetch them. For now, assume no posts:
    const data = [];

    res.render('index', { locals, data, currentRoute: '/' });
  } catch (error) {
    console.error(error);
  }
});

/**
 * GET: Contact page
 */
router.get('/contact', (req, res) => {
  const locals = {
    title: "Contact",
    description: "Contact us page"
  };
  res.render('contact', { locals, currentRoute: '/contact' });
});

/**
 * GET: About page
 */
router.get('/about', (req, res) => {
  const locals = {
    title: "About",
    description: "About this blog"
  };
  res.render('about', { locals, currentRoute: '/about' });
});

module.exports = router;


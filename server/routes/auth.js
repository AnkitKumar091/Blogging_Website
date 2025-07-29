const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const router = express.Router();

/**
 * GET: Register page
 */
router.get('/register', (req, res) => {
  res.render('register', { currentRoute: '/register' });
});

/**
 * POST: Handle registration
 */
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.send('❌ All fields are required.');
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.send('❌ Username already exists.');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user
    await User.create({ username, password: hashedPassword });

    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.send('❌ Registration failed. Try again.');
  }
});

/**
 * GET: Login page
 */
router.get('/login', (req, res) => {
  res.render('login', { currentRoute: '/login' });
});

/**
 * POST: Handle login
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.send('❌ Invalid username or password');
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.send('❌ Invalid username or password');
    }

    // Save user in session
    req.session.user = user;
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.send('❌ Login error');
  }
});

/**
 * GET: Logout user
 */
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

/**
 * GET: Home Page
 */
router.get('/', (req, res) => {
  const locals = {
    title: "NodeJs Blog",
    description: "Simple Blog created with NodeJs, Express & MongoDb."
  };
  res.render('index', { locals, data: [], currentRoute: '/' });
});

/**
 * GET: About Page
 */
router.get('/about', (req, res) => {
  const locals = {
    title: "About",
    description: "About this blog"
  };
  res.render('about', { locals, currentRoute: '/about' });
});

/**
 * GET: Contact Page
 */
router.get('/contact', (req, res) => {
  const locals = {
    title: "Contact",
    description: "Contact us page"
  };
  res.render('contact', { locals, currentRoute: '/contact' });
});

module.exports = router;



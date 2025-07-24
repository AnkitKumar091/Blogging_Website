const express = require('express');
const router = express.Router();

router.get('', (req,res) => {
    const locals = {
        title: "Nodejs Blog",
        description: "Simple Blog created with NodeJs, Express & Mongodb."
    }
    res.render('index',{locals});
});

router.get('/about', (req,res) => {
    res.render('about');
});

module.exports = router;
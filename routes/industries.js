const express = require("express");
const router = new express.Router();
const db = require('../db');

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(
            "SELECT i.code, i.industry c.code FROM industries AS i LEFT JOIN comp_industries AS ci ON i.code = ci.ind_code LEFT JOIN companies AS c ON ci.comp_code = c.code")
        return res.status(200).json(results.rows)
    } catch (e) {
        next(e)
    }
});

router.post('/', async (req, res, next) => {
    try {
        const { code, industry } = req.body;
        const results = await db.query("INSERT INTO industries VALUES ($1, $2) RETURNING code, industry", [code, industry])
        return res.status(201).json(results.rows[0])
    } catch (e) {
        next(e)
    }
})


module.exports = router
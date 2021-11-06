const express = require("express");
const router = new express.Router();
const db = require('../db')

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query("SELECT * FROM companies")
        return res.status(200).json({companies : results.rows})
    } catch (e) {
        return next(e)
    }
});

router.get('/:code', async (req, res, next) => {
    try {
        const company = await db.query("SELECT * FROM companies WHERE code=$1", [req.params.code])
        const invoices = await db.query("SELECT * FROM invoices WHERE comp_code=$1", [req.params.code])
        return res.status(200).json({company : company.rows[0], invoices : invoices.rows})
    } catch (e) {
        return next(e)
    }
})

router.post('/', async (req, res, next) => {
    try {
        const { code, name, description } = req.body;
        const newCompany = await db.query("INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description", [code, name, description])
        return res.status(201).json(newCompany.rows[0])
    } catch (e) {
        return next(e)
    }
});

router.put('/:code', async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const { code } = req.params;
        const results = await db.query("UPDATE companies SET name=$2, description=$3 WHERE code=$1 RETURNING code, name, description", [code, name, description])
        return res.status(201).json(results.rows[0])
    } catch (e) {
        return next(e)
    }
});

router.delete('/:code', async (req, res, next) => {
    try {
        await db.query("DELETE FROM companies WHERE code=$1", [req.params.code])
    return res.status(202).json({status : "deleted"})
    } catch (e) {
        return next(e)
    }
})

module.exports = router
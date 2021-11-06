const express = require("express");
const router = new express.Router();
const db = require('../db');
const ExpressError = require("../expressError");

router.get('/', async (req, res) => {
    try {
        const results = await db.query("SELECT * FROM invoices")
        return res.status(200).json({invoices : results.rows})
    } catch (e) {
        return next(e)
    }
})

router.get('/:id', async (req, res, next) => {
    try {
        const results = await db.query("SELECT * FROM invoices WHERE id=$1", [req.params.id])
        if (!results.rows[0]) { throw new ExpressError("Invoice not found!", 400) };
        return res.status(200).json({invoice : results.rows[0]})
    } catch (e) {
        return next(e)
    }
})

router.post('/', async (req, res, next) => {
    try {
        const { comp_code, amt } = req.body;
        const newInvoice = await db.query("INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, amt, paid, add_date, paid_date", [comp_code, amt])
        return res.status(201).json({ invoice : newInvoice.rows[0] })
    } catch (e) {
        return next(e)
    }
});

router.put('/:id', async (req, res, next) => {
    try {
        const { amt } = req.body;
        const { id } = req.params;
        const results = await db.query("UPDATE invoices SET amt=$2 WHERE id=$1 RETURNING id, comp_code, amt, paid, add_date, paid_date", [id, amt])
        return res.status(201).json(results.rows[0])
    } catch (e) {
        return next(e)
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        await db.query("DELETE FROM invoices WHERE id=$1", [req.params.id])
        return res.status(202).json({status : "deleted"})
    } catch (e) {
        return next(e)
    }
})

module.exports = router
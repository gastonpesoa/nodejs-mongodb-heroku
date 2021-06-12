const db = require('../models/db');
const express = require('express')

router = express.Router();

router.get('/', (req, res) => {
    // db.connect(() => {
    // });
    dbGaston = db.getInstance();
    dbGaston.collection("tickets")
        .find({ "cliente.numeroCliente": 1 })
        .toArray(function (err, items) {
            res.send(items);
        });
    //db.close(() => { });
})

router.get('/desperfectos', (req, res) => {
    dbGaston = db.getInstance();
    dbGaston.collection("tickets")
        .aggregate([
            {
                $group: {
                    _id: { motivo: "$motivo" }
                }
            }
        ]).toArray( (err, result) => {
            if (err) return console.log(err)
            console.log(result)
           res.send(result)
        })
})


module.exports = router;
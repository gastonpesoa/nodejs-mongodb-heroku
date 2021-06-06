const db = require('../models/db');
const express = require('express')

router = express.Router();

router.get('/', (req, res) => {
    db.connect(()=>{

        console.log(db);

    });
    dbGaston = db.getInstance();
    dbGaston.collection("tickets")
        .find({}).toArray(function (err, items) {
            res.send(items);
            db.close();
        });;
})


module.exports = router;
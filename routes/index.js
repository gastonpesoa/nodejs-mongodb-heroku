const db = require('../models/db');
const express = require('express');
const { query } = require('express');

router = express.Router();

router.get('/', (req, res) => {
    dbGaston = db.getInstance();
    dbGaston.collection("tickets")
        .find({ "cliente.numeroCliente": 1 })
        .toArray(function (err, items) {
            res.send(items);
        });
})

router.get('/desperfectos', (req, res) => {
    dbGaston = db.getInstance();
    dbGaston.collection("tickets")
        .aggregate([
            { $match: { motivo: "Desperfecto" } },
            { $project: { _id: 0, descripcion: 1 } },
            { $group: { _id: "$descripcion", cantidad: { $sum: 1 } } }
        ]).toArray((err, result) => {
            if (err) return console.log(err)
            console.log(result)
            res.send(result)
        })
})

router.get('/desperfectos-donde', (req, res) => {
    dbGaston = db.getInstance();
    dbGaston.collection("tickets")
        .aggregate([
            { $match: { motivo: "Desperfecto" } },
            {
                $group: {
                    _id: "$descripcion",
                    ubicaciones: { $push: "$cliente.zona.localidad.nombre" }
                }
            }
        ]).toArray((err, result) => {
            if (err) return console.log(err)
            console.log(result)
            res.send(result)
        })
})

router.get('/desperfectos-cada-cuanto', (req, res) => {
    dbGaston = db.getInstance();
    dbGaston.collection("tickets").aggregate([
        { $match: { motivo: "Desperfecto" } },
        { $project: { _id: 0, descripcion: 1, fecha: 1 } },
        { $sort: { fecha: 1 } }
    ]).toArray((err, result) => {
        if (err) return console.log(err)
        console.log(result)
        var previousDate = false;
        var times = result.map(d => {
            var diff = (previousDate) ? d.fecha - previousDate : 0;
            previousDate = d.fecha;
            return diff;
        })
        const sum = times.reduce((a, b) => a + b, 0);
        const avg = (sum / times.length) || 0;
        res.status(200).send({ data: `Desperfectos cada: ${msToTime(avg)} hs.` });
    });
})

router.get('/atencion-empleado', (req, res) => {
    dbGaston = db.getInstance();
    dbGaston.collection("tickets")
        .aggregate([
            { $unwind: "$derivacion" },
            { $project: { "derivacion.empleado": 1 } },
            {
                $group: {
                    _id: "$derivacion.empleado.numeroEmpleado",
                    empleadoNombre: { "$first": "$derivacion.empleado.nombreCompleto" },
                    atenciones: { $sum: 1 }
                }
            },
            { $sort: { atenciones: -1 } },
            { $limit: 1 }
        ]).toArray((err, result) => {
            if (err) return console.log(err)
            console.log(result)
            res.send(result)
        })
})

router.get('/atencion-horario', (req, res) => {
    dbGaston = db.getInstance();
    dbGaston.collection("tickets")
        .aggregate([
            { $unwind: "$derivacion" },
            { $unwind: "$derivacion.operacion" },
            { $project: { hour: { $hour: "$derivacion.operacion.fecha" } } },
            { $group: { _id: "$hour", atenciones: { $sum: 1 } } },
            { $sort: { atenciones: -1 } },
            { $limit: 1 }
        ]).toArray((err, result) => {
            if (err) return console.log(err)
            console.log(result)
            res.send(result)
        })
})

router.get('/atencion-trabajos', (req, res) => {
    dbGaston = db.getInstance();
    dbGaston.collection("tickets")
        .aggregate([
            { $unwind: "$derivacion" },
            {
                $match: {
                    "derivacion.operacion.funciono": { $nin: [true] }
                }
            },
            {
                $project: {
                    _id: 0,
                    fecha: 1,
                    motivo: 1,
                    descripcion: 1,
                    "derivacion.operacion.descripcion": 1,
                }
            }
        ]).toArray((err, result) => {
            if (err) return console.log(err)
            console.log(result)
            res.send(result)
        })
})

router.get('/zonales-desperfectos', (req, res) => {
    dbGaston = db.getInstance();
    dbGaston.collection("tickets")
        .aggregate([
            { $match: { motivo: "Desperfecto" } },
            {
                $group: {
                    _id: "$cliente.zona.localidad.nombre",
                    descripciones: { $push: "$descripcion" }
                },
            },
            { $sort: { "_id": 1 } }
        ]).toArray((err, result) => {
            if (err) return console.log(err)
            console.log(result)
            res.send(result)
        })
})

router.get('/zonales-atenciones', (req, res) => {
    dbGaston = db.getInstance();
    dbGaston.collection("tickets")
        .aggregate([
            { $unwind: "$derivacion" },
            {
                $group: {
                    _id: "$derivacion.empleado.oficina.zona.localidad.nombre",
                    motivos: {
                        $push: {
                            descripcion: "$descripcion",
                            area: "$derivacion.area"
                        }
                    }
                }
            },
            { $sort: { "_id": 1, "motivos.descripcion": 1 } }
        ]).toArray((err, result) => {
            if (err) return console.log(err)
            console.log(result)
            res.send(result)
        })
})

router.get('/clientes-consultas', (req, res) => {
    dbGaston = db.getInstance();
    dbGaston.collection("tickets")
        .aggregate([
            { $project: { cliente: 1 } },
            {
                $group: {
                    _id: "$cliente.numeroCliente",
                    cantidad: { $sum: 1 },
                    cliente: {
                        $first: {
                            numeroCliente: "$cliente.numeroCliente",
                            nombre: "$cliente.nombreCompleto"
                        }
                    }
                },
            },
            { $sort: { cantidad: -1 } },
            { $limit: 1 }
        ]).toArray((err, result) => {
            if (err) return console.log(err)
            console.log(result)
            res.send(result)
        })
})

router.get('/clientes-tickets', (req, res) => {
    dbGaston = db.getInstance();
    dbGaston.collection("tickets")
        .aggregate([
            { $unwind: "$derivacion" },
            {
                $match: {
                    "derivacion.operacion.funciono": { $nin: [true] }
                }
            },
            {
                $group: {
                    _id: "$cliente.numeroCliente",
                    cliente: {
                        $first: {
                            numeroCliente: "$cliente.numeroCliente",
                            nombre: "$cliente.nombreCompleto"
                        }
                    }
                },
            }
        ]).toArray((err, result) => {
            if (err) return console.log(err)
            console.log(result)
            res.send(result)
        })
})

router.get('/clientes-zona', (req, res) => {
    dbGaston = db.getInstance();
    dbGaston.collection("tickets")
        .aggregate([
            {
                $group: {
                    _id: "$cliente.zona.localidad.nombre",
                    cantidadDeClientes: { $sum: 1 },
                    cliente: {
                        $push: {
                            numeroCliente: "$cliente.numeroCliente",
                            nombre: "$cliente.nombreCompleto"
                        }
                    }
                },
            },
            { $sort: { "cantidadDeClientes": -1 } },
            { $limit: 1 }
        ]).toArray((err, result) => {
            if (err) return console.log(err)
            console.log(result)
            res.send(result)
        })
})

router.get('/clientes-empleados', (req, res) => {
    dbGaston = db.getInstance();
    dbGaston.collection("tickets")
        .aggregate([
            { $unwind: "$derivacion" },
            {
                $group: {
                    _id: "$derivacion.empleado.nombreCompleto",
                    empleado: {
                        $first: {
                            numeroEmpleado: "$derivacion.empleado.numeroEmpleado",
                            nombreCompleto: "$derivacion.empleado.nombreCompleto"
                        }
                    }
                },
            },
            { $sort: { "empleado.numeroEmpleado": 1 } },
            {
                $lookup: {
                    from: "clientes",
                    as: "cliente",
                    localField: "empleado.nombreCompleto",
                    foreignField: "nombreCompleto"
                }
            },
            { $project: { "empleado.nombreCompleto": 1, "cliente.nombreCompleto": 1 } },
            { $match: { cliente: { $not: { $size: 0 } } } }
        ]).toArray((err, result) => {
            if (err) return console.log(err)
            console.log(result)
            res.send(result)
        })
})


function msToTime(duration) {
    var milliseconds = Math.floor((duration % 1000) / 100),
        seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + ":" + minutes + ":" + seconds;
}

module.exports = router;
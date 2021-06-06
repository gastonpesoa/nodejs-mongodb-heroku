// Base de datos 2
// Gastón Pesoa
// Tp Ticketera

// #Debe tener los datos cargados en mongoDB.
// #Debe cargar datos geoespaciales de cada entidad u operación que lo permita.
// #El objeto ticket debe tener atributos de de tipo:
//     objeto,
//     string,
//     arrays de valores,
//     arrays de objetos,
//     objeto con arrays de atributo.


// Requerimientos solicitados

// Una empresa de video cable de argentina nos pide la siguiente funcionalidad:

// A-un cliente carga un ticket por (desperfecto, cambio de plan ,dar de baja, dar de alta).
// B-el responsable de los ticket lo deriva al personal del área que corresponda(atención al cliente, servicio técnico, servicios financieros, etc)
// C-la persona resuelve el reclamo o lo deriva y carga la solución u operación sobre ese
// ticket.

// ese ticket se puede resolver en un solo paso o puede tener varias derivaciones y varias
// personas a las que fue derivado , como así varias soluciones planteadas y que no
// funcionaron.
// Los clientes tienen una posición de gps, las oficinas de atención personal también y los
// centro de servicio técnico.
// se almacena de los clientes sus tipo de planes( normal , SuperPack1, SuperPackFull)
// estos planes van cambiando en su composición(cantidad de canales y que canales) , pero
// le respetamos el pack que compró el cliente cuando lo compro.

// Las cosas que nos interesa saber son:

// control sobre incidentes o desperfectos:
//      (que desperfecto ocurre, donde , cada cuanto ,etc)
// control de atención:
//      (quien atiende más ticket, a que hora hay más trabajo, que trabajo está sin resolver,etc).
// datos zonales:
//      (desperfectos por zona, atención hecha por zona, etc)
// datos de clientes:
//      (quien hace más ticket, quien tiene ticket sin resolver, en qué zona tenemos más
//       clientes, que cliente es además empleado y género ticket).

// a tener en cuenta:
// los empleados también pueden ser usuarios .
// la localidad es un objeto con código postal y descripción.
// se pueden crear los objetos que sean necesario.

// ticket
//      cliente
//      empleado
//      atenciones
//      motivo (desperfecto, cambio de plan, alta, baja)

ticket : {
    cliente: { 
        numeroCliente : 0,
        nombre : "",
        zona : {
            location : GeoJsonTypePoint,
            localidad : "",
            codigoPostal : 0
        },
        plan : {
            tipo : "",
            cantidadCanales : 0,
            canales : [""],
        }
    },
    fecha : Date,
    motivo: "",
    responsable : [{ }],
    estado : "",
    derivacion : [{
        fecha: Date,
        empleado : {
            numeroEmpleado : 0,
            nombre : "",
            area : "",
            oficina : {
                nombre : "",
                zona : {
                    location : GeoJsonTypePoint,
                    localidad : "",
                    codigoPostal : 0
                }
            },
            centroTecnico : {
                nombre : "",
                zona : {
                    location : GeoJsonTypePoint,
                    localidad : "",
                    codigoPostal : 0
                }
            }
        }
        area : "",
        operacion : [{
            fecha: Date,
            descripcion : "",
            funciono : false
        }]
    }]
}

// empleado
{
    numeroEmpleado : 0,
    nombre : "",
    area : "",
    oficina : {
        location : GeoJson
    }
    centroTecnico : {
        location : GeoJson
    }
}


// cliente
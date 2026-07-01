export interface Empleado {
    idEmpleado: number;
    idCiudad: number;
    nombreCompleto: string;
    correo: string;
    sueldo: number;
    fechaContrato: string;
    accion?: string;
}
//representa la respuesta que se tiene en la lista y para obtener 
//estructura de datos que maneja la api
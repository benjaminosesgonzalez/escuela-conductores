import { ZodError } from "zod";

export const validateSchema = (schema) => async (req, res, next) => {
    try {
        //evaluamos el body, query y params del request con el schema de zod
        await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });

        //si todo es valido, avanza al controllador
        return next();
    } catch (error) {
        //si Zod lanza un error, lo atrapamos y devolvemos un 400 con el mensaje de error
        if (error instanceof ZodError) {
            //mapeamos los errores para que el front reciba el formato
            const erroresFormateados = (error.errors || []).map((err) => ({
                campo: err.path.join("."),
                mensaje: err.message
            }));

            return res.status(400).json({
                success: false,
                message: "Error de validación en los datos enviados.",
                errores: erroresFormateados });
        }
        //si es otro error raro
        console.error("Error en validación:", error);
        return res.status(500).json({
            success: false,
            message: "Error interno del servidor."
        });
    }
};
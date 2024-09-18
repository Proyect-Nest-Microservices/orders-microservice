import 'dotenv/config'
import * as joi from 'joi';


interface EnvVars{
    PORT: number;
    PRODUCTS_MICROSERVICE_PORT: number;
    PRODUCTS_MICROSERVICE_HOST: string;
}

const envsSchema = joi.object({
    PORT: joi.number().required(),
    PRODUCTS_MICROSERVICE_PORT: joi.number().required(),
    PRODUCTS_MICROSERVICE_HOST: joi.string().required(),
}).unknown(true)

const {error, value} = envsSchema.validate(process.env)

if (error) {
    throw new Error(`Config validation Error ${error.message}`)
}

const envsVars: EnvVars = value;


export const envs = {
    PORT: envsVars.PORT,
    PRODUCTS_MICROSERVICE_PORT: envsVars.PRODUCTS_MICROSERVICE_PORT,
    PRODUCTS_MICROSERVICE_HOST: envsVars.PRODUCTS_MICROSERVICE_HOST
}
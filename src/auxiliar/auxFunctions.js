import axios from "axios";
import { getBCV } from "../services/BCVService";

export async function getBsToUsd(montoBs) {
    const bcv = await getBCV();

    return (montoBs / (bcv * 1.08).toFixed(4)).toFixed(2);
}

export async function getUsdToBs(montoUsd) {
    const bcv = await getBCV();

    return (montoUsd * (bcv * 1.08).toFixed(4)).toFixed(2);
}

export async function getClient(str, api) {
    try {
        const response = await axios.get(`${api}/clientByIdentity/${str}`);

        if (!response.data) {
            return {
                url: "",
                data: [],
            };
        }

        return {
            url: api,
            data: response.data,
        };
    } catch (error) {
        console.error("Error al buscar cliente:", error);
        throw error;
    }
}

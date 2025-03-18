import axios from "axios";
import { getBCV } from "../services/BCVService";
import { HOST_API } from "../env";

export async function getBsToUsd(montoBs) {
    const bcv = await getBCV();

    return (montoBs / (bcv * 1.08).toFixed(4)).toFixed(2);
}

export async function getUsdToBs(montoUsd) {
    const bcv = await getBCV();

    return (montoUsd * (bcv * 1.08).toFixed(4)).toFixed(2);
}

export async function getClient(str) {
    try {
        const response = await axios.get(`${HOST_API}/clientByIdentity/${str}`);

        if (!response.data) {
            return [];
        }

        return response.data;
    } catch (error) {
        console.error("Error al buscar cliente:", error);
        throw error;
    }
}

export async function getInvoices(id) {
    try {
        const response = await axios.get(`${HOST_API}/clients/${id}/bills`);
        return response.data;
    } catch (error) {
        console.error("Error al buscar facturas:", error);
        throw error;
    }
}

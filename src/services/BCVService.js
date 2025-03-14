import { HOST_BCV } from "../../env";

export const getBCV = async () => {
 const res = await fetch(`${HOST_BCV}`);
 const data = await res.json();
 return data.bcv;
}
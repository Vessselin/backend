import Web3 from "web3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Necesario para manejar rutas con ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// RPC local de Ganache
const RPC_SERVER = "HTTP://127.0.0.1:7545";

// Conexión con Ganache
const web3 = new Web3(new Web3.providers.HttpProvider(RPC_SERVER));

// Clave privada (¡solo para pruebas locales!)
const PRIVATE_KEY = "0x0b814737bcaab9a2e62b6219928b3a6c0b767c88d95cffa7cbe46deeda57345e";

// Obtiene la cuenta asociada
const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;

console.log("🔗 Conectado a Ganache con la cuenta:", account.address);

export { web3, account };

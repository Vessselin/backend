import fs from "fs";
import path from "path";
import solc from "solc";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta al contrato .sol
const contratoPath = path.resolve(__dirname, "../contracts/TransporteContrato.sol");
const source = fs.readFileSync(contratoPath, "utf8");

// Configuración del compilador
const input = {
  language: "Solidity",
  sources: {
    "TransporteContrato.sol": { content: source },
  },
  settings: {
    outputSelection: {
      "*": {
        "*": ["abi", "evm.bytecode"],
      },
    },
  },
};

// Compilar
const output = JSON.parse(solc.compile(JSON.stringify(input)));

// Extraer info
const contrato = output.contracts["TransporteContrato.sol"]["TransporteContrato"];

const buildDir = path.resolve(__dirname, "../contracts/build");
if (!fs.existsSync(buildDir)) fs.mkdirSync(buildDir, { recursive: true });

// Guardar ABI y bytecode en formato compatible con Web3
fs.writeFileSync(
  path.join(buildDir, "TransporteContrato.json"),
  JSON.stringify(
    {
      abi: contrato.abi,
      bytecode: contrato.evm.bytecode.object,
    },
    null,
    2
  )
);

console.log("Contrato compilado correctamente y guardado en build/TransporteContrato.json");

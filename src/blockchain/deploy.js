// src/blockchain/deploy.js
import fs from "fs";
import path from "path";
import solc from "solc";
import Web3 from "web3";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 📦 Inicializar conexión con Ganache
const web3 = new Web3("http://127.0.0.1:7545");

(async () => {
  try {
    // 🧾 Obtener cuenta disponible
    const accounts = await web3.eth.getAccounts();
    const deployer = accounts[0];
    console.log("🔗 Conectado a Ganache con la cuenta:", deployer);

    // 📁 Ruta del contrato fuente
    const contratoPath = path.resolve(__dirname, "../contracts/TransporteContrato.sol");
    const source = fs.readFileSync(contratoPath, "utf8");

    // ⚙️ Compilar contrato con solc
    console.log("📄 Compilando contrato...");
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

    const compiled = JSON.parse(solc.compile(JSON.stringify(input)));

    // 🧠 Acceder al contrato dentro del resultado
    const contractFile = compiled.contracts["TransporteContrato.sol"]["TransporteContrato"];
    const abi = contractFile.abi;
    const bytecode = contractFile.evm.bytecode.object;

    if (!bytecode || bytecode.length === 0) {
      throw new Error("❌ Error: El bytecode está vacío. Verifica el contrato o la compilación.");
    }

    console.log("🔢 Bytecode length:", bytecode.length);

    // 🚀 Desplegar contrato
    console.log("🚀 Desplegando contrato...");
    const contrato = new web3.eth.Contract(abi);

    const deployed = await contrato
      .deploy({ data: "0x" + bytecode })
      .send({ from: deployer, gas: 3000000 });

    console.log("✅ Contrato desplegado exitosamente.");
    console.log("📍 Dirección del contrato:", deployed.options.address);

    // 📁 Crear carpeta build si no existe
    const buildDir = path.resolve(__dirname, "../contracts/build");
    if (!fs.existsSync(buildDir)) fs.mkdirSync(buildDir, { recursive: true });

    // 💾 Guardar ABI, dirección y bytecode en JSON
    const contractData = {
      address: deployed.options.address,
      abi: abi,
      bytecode: bytecode,
    };

    const outputPath = path.join(buildDir, "TransporteContrato.json");
    fs.writeFileSync(outputPath, JSON.stringify(contractData, null, 2));

    console.log(`💾 ABI y dirección guardadas en: ${outputPath}`);
    console.log("🏁 Deploy completado con éxito ✅");

  } catch (err) {
    console.error("❌ Error durante el deploy:", err);
  }
})();

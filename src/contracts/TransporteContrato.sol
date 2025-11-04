// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TransporteContrato {
    struct ContratoTransporte {
        uint idContrato;
        uint idCliente;          // ID interno del cliente (base de datos)
        uint idTransportista;    // ID interno del transportista (base de datos)
        string origen;
        string destino;
        uint distancia;          // en kilómetros
        uint costo;              // costo pactado (en centavos o la unidad que definas)
        string fechaInicio;
        string fechaEntrega;
        string condiciones;
        bool completado;
    }

    mapping(uint => ContratoTransporte) public contratos;
    uint public contadorContratos;

    event ContratoCreado(
        uint idContrato,
        uint idCliente,
        uint idTransportista,
        uint costo,
        string origen,
        string destino
    );

    event ContratoCompletado(uint idContrato);

    // Crear un nuevo contrato
    function crearContrato(
        uint _idCliente,
        uint _idTransportista,
        string memory _origen,
        string memory _destino,
        uint _distancia,
        uint _costo,
        string memory _fechaInicio,
        string memory _fechaEntrega,
        string memory _condiciones
    ) public {
        contadorContratos++;

        contratos[contadorContratos] = ContratoTransporte({
            idContrato: contadorContratos,
            idCliente: _idCliente,
            idTransportista: _idTransportista,
            origen: _origen,
            destino: _destino,
            distancia: _distancia,
            costo: _costo,
            fechaInicio: _fechaInicio,
            fechaEntrega: _fechaEntrega,
            condiciones: _condiciones,
            completado: false
        });

        emit ContratoCreado(contadorContratos, _idCliente, _idTransportista, _costo, _origen, _destino);
    }

    // Marcar el contrato como completado
    function completarContrato(uint _idContrato) public {
        require(_idContrato > 0 && _idContrato <= contadorContratos, "Contrato inexistente");
        contratos[_idContrato].completado = true;
        emit ContratoCompletado(_idContrato);
    }

    // Obtener información del contrato
    function obtenerContrato(uint _idContrato) public view returns (
        uint, uint, uint, string memory, string memory, uint, uint, string memory, string memory, string memory, bool
    ) {
        ContratoTransporte memory c = contratos[_idContrato];
        return (
            c.idContrato,
            c.idCliente,
            c.idTransportista,
            c.origen,
            c.destino,
            c.distancia,
            c.costo,
            c.fechaInicio,
            c.fechaEntrega,
            c.condiciones,
            c.completado
        );
    }
}

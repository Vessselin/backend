pragma solidity ^0.8.0;

contract TransporteContrato {
    struct Contrato {
        address cliente;
        address transportista;
        string descripcion;
        uint peso;
        uint fechaInicio;
        uint fechaEntrega;
        bool completado;
    }

    mapping(uint => Contrato) public contratos;
    uint public contador;

    function crearContrato(
        address _cliente,
        address _transportista,
        string memory _descripcion,
        uint _peso,
        uint _fechaInicio,
        uint _fechaEntrega
    ) public {
        contratos[contador] = Contrato(
            _cliente,
            _transportista,
            _descripcion,
            _peso,
            _fechaInicio,
            _fechaEntrega,
            false
        );
        contador++;
    }

    function marcarCompletado(uint _id) public {
        contratos[_id].completado = true;
    }
}

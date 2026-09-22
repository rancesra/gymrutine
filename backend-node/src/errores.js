// Error con el formato del contrato: estado HTTP, código estable, mensaje y, si aplica, campos.
export class ErrorApi extends Error {
  constructor(estado, codigo, mensaje, campos) {
    super(mensaje)
    this.estado = estado
    this.codigo = codigo
    this.campos = campos
  }
}

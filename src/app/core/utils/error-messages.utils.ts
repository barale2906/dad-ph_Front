/** Mensajes de error amigables por código HTTP */
export function getHttpErrorMessage(status: number, defaultMsg?: string): string {
  const messages: Record<number, string> = {
    400: 'Solicitud incorrecta. Verifique los datos.',
    401: 'Sesión expirada. Inicie sesión nuevamente.',
    403: 'No tiene permisos para realizar esta acción.',
    404: 'El recurso solicitado no existe.',
    409: 'Conflicto: el recurso pudo haber sido modificado por otro usuario.',
    422: 'Hay errores en los datos ingresados. Revise el formulario.',
    429: 'Demasiadas peticiones. Espere un momento e intente de nuevo.',
    500: 'Error del servidor. Intente más tarde.',
  };
  return messages[status] ?? defaultMsg ?? 'Ha ocurrido un error. Intente nuevamente.';
}

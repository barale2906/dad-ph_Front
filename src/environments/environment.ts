export const environment = {
  production: false,
  /** En desarrollo usamos proxy: las peticiones van a /api y el proxy reenvía al backend */
  apiUrl: '',
  /** WebSockets (Soketi/Pusher). Opcional; si no se define, se usa polling. */
  wsUrl: '',
  pusherKey: '',
};

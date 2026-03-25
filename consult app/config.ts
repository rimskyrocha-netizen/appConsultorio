// URL da API: usa o mesmo host do navegador, porta 8080 (backend)
// Funciona tanto em localhost quanto ao acessar de outro computador na rede
const API_HOST = window.location.hostname;
export const API_BASE_URL = `http://${API_HOST}:8080`;

import { Platform } from 'react-native';

// Emulador Android usa 10.0.2.2 para acessar o localhost da máquina host
// Simulador iOS usa localhost normalmente
// Para dispositivo físico, use o IP da sua máquina (ex: 192.168.x.x)
// Se estiver testando no dispositivo físico, troque 'http://10.0.2.2:5000' pelo seu IP local
const API_URL = Platform.OS === 'android'
    ? 'http://10.0.2.2:5000'
    : 'http://localhost:5000';

export default API_URL;
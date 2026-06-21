const os = require('os');
const fs = require('fs');
const path = require('path');

function getLocalIp() {
  const interfaces = os.networkInterfaces();

  // Nomi di interfacce virtuali da escludere (Docker, WSL, Hyper-V, VPN, ecc.)
  const excludePatterns = /vEthernet|WSL|Loopback|Docker|Hyper-V|VirtualBox|VMware|Tailscale|ZeroTier|Radmin/i;

  const candidates = [];

  for (const name of Object.keys(interfaces)) {
    if (excludePatterns.test(name)) continue;

    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        candidates.push({ name, address: iface.address });
      }
    }
  }

  if (candidates.length === 0) return '127.0.0.1';

  // Preferisci interfacce Wi-Fi/Ethernet reali e range IP domestici tipici (192.168.x.x, 10.x.x.x)
  const preferred = candidates.find(c =>
    /Wi-?Fi|Wireless|Ethernet/i.test(c.name) &&
    /^(192\.168\.|10\.)/.test(c.address)
  );

  return (preferred || candidates[0]).address;
}

const ip = getLocalIp();
const envPath = path.join(__dirname, '..', '.env.local');

let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';

content = content.replace(
  /^(EXPO_PUBLIC_\w+_MOBILE=http:\/\/)[\d.]+(:\d+)$/gm,
  `$1${ip}$2`
);

fs.writeFileSync(envPath, content);
console.log(`✅ .env aggiornato: tutti gli IP _MOBILE impostati su ${ip} (interfaccia: ${Object.keys(os.networkInterfaces()).find(n => os.networkInterfaces()[n].some(i => i.address === ip))})`);
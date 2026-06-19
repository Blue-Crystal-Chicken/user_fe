# BCC User Frontend - Expo Mobile Application

Questo è il frontend per i clienti del progetto **Blue Crystal Kitchen (BCC)**, sviluppato in **React Native** utilizzando **Expo** ed **Expo Router**.
L'applicazione è stilizzata con **Tailwind CSS** (via **NativeWind**) e utilizza componenti di **React Native Reusables**.

---

## 🚀 Requisiti

- **Node.js** (versione 18 o superiore)
- **Expo Go** installato sul proprio dispositivo fisico (disponibile su App Store e Google Play Store) per test rapidi, oppure emulatori configurati (Android Studio / Xcode).
- **pnpm** (consigliato) o **npm**.

---

## ⚙️ Configurazione & Variabili d'Ambiente

Crea o modifica il file `.env.local` all'interno della cartella `user_fe` per configurare gli endpoint delle API.

Esempio di `.env.local`:
```env
EXPO_PUBLIC_API_URL_WEB=http://localhost:8080
EXPO_PUBLIC_API_URL_MOBILE=http://192.168.1.100:8080

EXPO_PUBLIC_NOTIFICATION_URL_WEB=http://localhost:8085
EXPO_PUBLIC_NOTIFICATION_URL_MOBILE=http://192.168.1.100:8085
```

### ⚠️ Importante per i Test su Dispositivo Fisico (Expo Go)
- **Web**: Usa `localhost`.
- **Mobile (iOS/Android)**: **Non puoi usare `localhost` o `127.0.0.1`** perché il tuo telefono non risiede all'interno della macchina di sviluppo. Devi inserire **l'indirizzo IP locale del tuo computer** (es. `http://192.168.1.100:8080`) o un URL di **ngrok** (es. `https://xxxx.ngrok-free.app`). 
- Assicurati che il telefono e il computer siano connessi alla **stessa rete Wi-Fi**.

---

## 🔥 Notifiche Push (Firebase Cloud Messaging)

L'applicazione integra le notifiche push.
1. Il file `google-services.json` per Android deve essere posizionato nella root di `user_fe/`.
2. All'interno di `app.json`, è configurato il pacchetto di riferimento (es. `com.giuseppe_matteo.bcc`).
3. Quando l'utente effettua il login e concede i permessi di notifica su un dispositivo fisico, il token FCM viene recuperato e inviato automaticamente al servizio di notifica (`bcc_notification`) all'endpoint `/user-devices` per associarlo al suo account.

---

## 🛠️ Come Avviare l'Applicazione

### 1. Installazione delle dipendenze
Dalla cartella `user_fe`, esegui:
```bash
pnpm install
# oppure
npm install
```

### 2. Avvio del Server Expo
Avvia il server di sviluppo di Expo pulendo la cache (`-c`):
```bash
pnpm dev
# oppure
npm run dev
```

Una volta avviato il server, comparirà un QR code nel terminale:
- **Dispositivo Fisico**: Inquadra il QR code con la fotocamera del tuo telefono (iOS) o tramite l'app Expo Go (Android).
- **Emulatore Android**: Premi `a` nel terminale.
- **Simulatore iOS**: Premi `i` nel terminale.
- **Web**: Premi `w` nel terminale per avviarlo nel browser.

---

## 🏗️ Aggiungere Componenti Reusables

Se hai bisogno di installare nuovi componenti di React Native Reusables, puoi usare la loro CLI:
```bash
npx react-native-reusables/cli@latest add [nome-componente]
```
Esempio: `npx react-native-reusables/cli@latest add button dialog`

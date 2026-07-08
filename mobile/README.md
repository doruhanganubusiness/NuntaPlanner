# NuntaPlanner — aplicație mobilă (miri)

Aplicație React Native (Expo SDK 57 + Expo Router) care conține **doar
planificatorul pentru miri**. Se conectează la **același proiect Supabase** ca
site-ul, deci mirii folosesc același cont și aceleași date.

## Ce conține

Bară de tab-uri jos, 5 secțiuni:

1. **Panou** — progres planificare, zile rămase, invitați, buget, recomandări.
2. **Detalii** — nume, dată, status dată, regiune, tip nuntă, stil.
3. **Buget** — buget total, mod băutură, muzică (+ buget recomandat automat).
4. **Plan** — calcule automate (băutură, dulciuri, sală, muzică, defalcare buget),
   folosind **exact același motor pur** ca site-ul (`src/lib/engine`).
5. **General** = tab de **profil** + la bază **linkuri către paginile de pe site**
   (Pentru miri, Furnizori, Zone, Blog, Termeni, Confidențialitate, Cookies) +
   deconectare.

Bara de status a telefonului e forțată pe **fundal alb** cu **text/iconițe negre**
(vezi `src/app/_layout.tsx` — spacer alb de înălțimea inset-ului + `StatusBar
style="dark"`; aplicația rulează forțat în mod light).

## Configurare

Cheile Supabase sunt în `src/lib/supabase.ts` (proiectul live), dar pot fi
suprascrise prin variabile de mediu la build:

```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

## Dezvoltare

```bash
npm install
npx expo start        # rulează pe Expo Go / emulator
```

## Build APK (local, fără cont Expo)

Necesită Android SDK + JDK 17 (ANDROID_HOME setat).

```bash
npx expo prebuild --platform android --clean
cd android
./gradlew assembleRelease
# => android/app/build/outputs/apk/release/app-release.apk
```

APK-ul de `release` e semnat cu keystore-ul de debug generat de prebuild, deci se
poate instala direct (sideload) pentru testare. Pentru publicare în Google Play
generează un keystore propriu (vezi `android/app/build.gradle`).

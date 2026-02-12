# AdMob Integration Guide for NeuroFlow

## 📱 Preparação para Monetização Futura

**Status:** Planejado para v1.2+  
**Estratégia:** Grátis com anúncios não-intrusivos

---

## 🎯 Estratégia de Monetização

### Modelo Freemium Sugerido

**Versão Gratuita (v1.1):**
- ✅ Todas as funcionalidades principais
- ✅ Sessões ilimitadas
- ✅ Todos os sons
- ✅ Histórico de 30 dias
- ⚠️ **Banner ad** na tela de onboarding/home (futuro)
- ⚠️ **Interstitial ad** após 3 sessões (futuro)

**Versão Premium ($2.99/mês ou $19.99/ano):**
- ✅ Sem anúncios
- ✅ Histórico ilimitado
- ✅ Backup na nuvem
- ✅ Sons exclusivos premium
- ✅ Temas customizados
- ✅ Widgets iOS/Android

---

## 📋 Implementação AdMob (Para v1.2)

### 1. Instalação

```bash
# Quando estiver pronto (NÃO AGORA)
npx expo install expo-ads-admob

# ou

npm install react-native-google-mobile-ads
npx react-native setup-ads
```

### 2. Configuração

**app.json:**
```json
{
  "expo": {
    "plugins": [
      [
        "expo-ads-admob",
        {
          "userTrackingPermission": "Este app usa ads para se manter gratuito."
        }
      ]
    ],
    "ios": {
      "config": {
        "googleMobileAdsAppId": "ca-app-pub-XXXXXXXX~XXXXXXXX"
      }
    },
    "android": {
      "config": {
        "googleMobileAdsAppId": "ca-app-pub-XXXXXXXX~XXXXXXXX"
      }
    }
  }
}
```

### 3. Componente Banner Ad (Exemplo)

```javascript
// components/AdBanner.js (criar no futuro)
import { AdMobBanner } from 'expo-ads-admob';
import { Platform } from 'react-native';

const AD_UNIT_ID = Platform.select({
  ios: 'ca-app-pub-XXXXXXXX/XXXXXXXX',
  android: 'ca-app-pub-XXXXXXXX/XXXXXXXX',
});

export function AdBanner() {
  return (
    <AdMobBanner
      bannerSize="smartBanner"
      adUnitID={AD_UNIT_ID}
      servePersonalizedAds={false} // GDPR compliant
      onDidFailToReceiveAdWithError={(error) => 
        console.log('Ad failed:', error)
      }
    />
  );
}
```

### 4. Onde Colocar Ads (Sugestões)

**✅ BOM (Não-intrusivo):**
- Banner pequeno na tela de home/dashboard
- Banner no rodapé da tela de histórico
- Interstitial APÓS completar sessão (celebração)
- Rewarded ad para desbloquear feature premium temporária

**❌ RUIM (Intrusivo):**
- Durante sessão ativa (NUNCA!)
- Pop-up no meio de configuração
- Video ads obrigatórios
- Ads com som

---

## 🔐 Checklist Pré-AdMob

Antes de implementar ads:

- [ ] App tem base de usuários ativa (100+ usuários)
- [ ] Todas features principais funcionam perfeitamente
- [ ] Privacy Policy atualizada mencionando ads
- [ ] Conta Google AdMob criada
- [ ] AD_UNIT_IDs gerados
- [ ] Versão premium planejada (opção sem ads)
- [ ] Compliance com GDPR/CCPA (consent form)

---

## 💰 Estimativa de Receita

**Premissas:**
- 1000 usuários ativos/mês
- 50% usam app diariamente
- 2 ad impressions/dia por usuário
- CPM médio: $2 (Brasil)

**Cálculo:**
```
1000 usuários × 50% × 30 dias × 2 impressions = 30,000 impressions/mês
30,000 / 1000 × $2 CPM = $60/mês
```

**Realidade:** Espere $20-100/mês nos primeiros 6 meses.

**Premium Subscriptions (10% conversion):**
```
1000 usuários × 10% × $2.99 = $299/mês
```

**Total Potencial:** $320/mês com 1000 usuários

---

## 🎨 Design de Telas com Espaço para Ads

### Home Screen (Futuro)

```
┌─────────────────────────┐
│  NeuroFlow             │
│  Olá, Rubens!          │
├─────────────────────────┤
│                         │
│   Quick Start Widget    │
│                         │
├─────────────────────────┤
│   Recent Sessions       │
│   • 10min - Focus      │
│   • 15min - Sleep      │
├─────────────────────────┤
│  [  350x50 Banner Ad ] │ ← Aqui
└─────────────────────────┘
```

### Post-Session (Interstitial)

```
Sessão Completa! ✓
20 minutos de foco

[5s interstitial ad]
↓
Estatísticas da sessão
```

---

## 🚀 Roadmap de Monetização

### v1.1 (Atual)
- ✅ App 100% grátis
- ✅ Sem ads
- ✅ Foco em crescimento

### v1.2 (1-2 meses)
- Banner ads sutis
- Privacy policy atualizada
- Analytics básico

### v1.3 (3-4 meses)
- Plano premium launch
- In-app purchase setup
- Remove ads option

### v2.0 (6+ meses)
- Subscriptions established
- Advanced premium features
- Possible lifetime unlock option

---

## 📝 NOTA IMPORTANTE

**NÃO implemente ads na v1.1!**

Motivos:
1. Foco em user experience primeiro
2. Construir base de usuários leais
3. Reviews melhores sem ads
4. Compliance mais simples

**Quando implementar:**
- Após 500+ usuários ativos
- 4.5+ stars de review
- Features estáveis
- Premium tier pronto

---

## 🔗 Recursos

- AdMob: https://admob.google.com
- Expo Ads: https://docs.expo.dev/versions/latest/sdk/admob/
- Privacy Policy Generator: https://www.privacypolicygenerator.info/
- GDPR Compliance: https://gdpr.eu/

---

**Conclusão:** A estrutura está preparada para ads no futuro, mas v1.1 será 100% grátis e sem ads para melhor user experience e growth inicial.

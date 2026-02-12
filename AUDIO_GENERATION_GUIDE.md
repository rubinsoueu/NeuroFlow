# 🎵 Guia de Geração de Áudio para NeuroFlow

## 🏆 MELHORES FERRAMENTAS GRATUITAS (2026)

### ✅ RECOMENDADAS PARA NEUROFLOW

#### 1. **ZENmix.io** (MELHOR OPÇÃO)
- ✅ **100% Grátis** e royalty-free
- ✅ Gerador online de binaural beats
- ✅ Export direto em MP3/WAV
- ✅ Sem login necessário
- ✅ Uso comercial permitido
- 🎯 **Uso:** Gerar todos os binaural beats (Delta, Theta, Alpha, Beta, Gamma)
- 📍 Link: https://zenmix.io/binaural-beat-generator

**Como usar:**
1. Acesse https://zenmix.io/binaural-beat-generator
2. Configure:
   - Base Frequency: 200Hz (carrier)
   - Binaural Beat: 2Hz (para Delta), 6Hz (Theta), etc.
   - Duration: 60 segundos
3. Clique "Generate" e download MP3
4. Repita para cada frequência

---

#### 2. **MusicHero.ai** (IA GENERATIVA)
- ✅ Grátis com IA
- ✅ Converte texto em música binaural
- ✅ Focado em meditação/relaxamento
- 🎯 **Uso:** Criar sons ambiente únicos com IA
- 📍 Link: https://musichero.ai/tools/binaural-music-generator

**Prompts sugeridos:**
- "Calm ocean waves with 10Hz alpha binaural beats for focus"
- "Deep sleep soundscape with 2Hz delta waves"
- "Energizing ambient music with 15Hz beta waves"

---

#### 3. **Soundverse.ai** (MELHOR IA GERAL)
- ✅ Grátis (limite mensal)
- ✅ Gera loops, beats, ambient
- ✅ Qualidade profissional
- 🎯 **Uso:** Criar sons ambiente complexos (chuva, floresta, café)
- 📍 Link: https://soundverse.ai

**Prompts sugeridos:**
- "Looping rain sounds for meditation, 60 seconds, seamless"
- "Soft forest ambiance with birds, calming, 1 minute loop"
- "Coffee shop background noise, subtle, relaxing"

---

#### 4. **Mubert** (ROYALTY-FREE AMBIENT)
- ✅ Plano grátis: 25 tracks/mês
- ✅ Geração infinita de ambient music
- ✅ Royalty-free com atribuição
- 🎯 **Uso:** Backup/alternativa para ambient sounds
- 📍 Link: https://mubert.com

---

### 🎨 SONS NECESSÁRIOS PARA NEUROFLOW

#### A) BINAURAL BEATS (Prioridade 1)
Gerar com **ZENmix.io**:

| Frequência | Estado Mental | Configuração ZENmix |
|------------|---------------|---------------------|
| 2 Hz | Delta - Sono Profundo | Base: 200Hz, Beat: 2Hz |
| 4 Hz | Delta/Theta - Relaxamento Profundo | Base: 200Hz, Beat: 4Hz |
| 6 Hz | Theta - Meditação | Base: 200Hz, Beat: 6Hz |
| 8 Hz | Alpha - Relaxamento | Base: 200Hz, Beat: 8Hz |
| 10 Hz | Alpha - Foco Calmo | Base: 200Hz, Beat: 10Hz |
| 12 Hz | Alpha/Beta - Alerta Relaxado | Base: 200Hz, Beat: 12Hz |
| 15 Hz | Beta - Concentração | Base: 200Hz, Beat: 15Hz |
| 20 Hz | Beta - Energia Alta | Base: 200Hz, Beat: 20Hz |
| 30 Hz | Gamma - Processamento Cognitivo | Base: 200Hz, Beat: 30Hz |

**Duração:** 60 segundos cada (loop perfeito)  
**Formato:** MP3 ou WAV  
**Total:** ~9 arquivos

---

#### B) SONS AMBIENTE (Prioridade 2)
Gerar com **Soundverse.ai** ou **MusicHero.ai**:

| Som | Uso | Prompt Sugerido |
|-----|-----|-----------------|
| White Noise | Foco/Sono | "White noise, pure, 60 seconds seamless loop" |
| Pink Noise | Relaxamento | "Pink noise ambiance, soft, 1 minute loop" |
| Rain | Meditação/Sono | "Gentle rain sounds, calming, perfect loop 60s" |
| Ocean Waves | Relaxamento | "Calm ocean waves, peaceful beach, 1 min loop" |
| Forest | Meditação | "Forest ambiance with birds, nature, 60s loop" |
| Coffee Shop | Foco | "Coffee shop background, subtle conversations, 1 min" |

**Duração:** 60 segundos cada  
**Total:** ~6 arquivos

---

### 📋 PLANO DE AÇÃO

#### Fase 1: Gerar Binaural Beats (1-2 horas)
```bash
1. Abrir ZENmix.io
2. Para cada frequência (2Hz, 4Hz, 6Hz, 8Hz, 10Hz, 12Hz, 15Hz, 20Hz, 30Hz):
   - Base: 200Hz
   - Binaural: [frequência]Hz
   - Duration: 60s
   - Generate → Download
3. Salvar como: delta_2hz.mp3, theta_6hz.mp3, etc.
```

#### Fase 2: Gerar Sons Ambiente (1-2 horas)
```bash
1. Usar MusicHero.ai ou Soundverse.ai
2. Inserir prompts listados acima
3. Generate → Download
4. Salvar como: white_noise.mp3, rain.mp3, ocean.mp3, etc.
```

#### Fase 3: Organizar Assets (30 min)
```bash
mkdir -p assets/audio/binaural
mkdir -p assets/audio/ambient

# Mover arquivos:
assets/audio/binaural/
  - delta_2hz.mp3
  - theta_4hz.mp3
  - theta_6hz.mp3
  - alpha_8hz.mp3
  - alpha_10hz.mp3
  - alpha_12hz.mp3
  - beta_15hz.mp3
  - beta_20hz.mp3
  - gamma_30hz.mp3

assets/audio/ambient/
  - white_noise.mp3
  - pink_noise.mp3
  - rain.mp3
  - ocean.mp3
  - forest.mp3
  - coffee_shop.mp3
```

---

### 🔧 ALTERNATIVAS SE PRECISAR

#### Fallback 1: Tone-Generator (NPM)
Se as ferramentas online falharem:
```bash
npm install tone-generator
```

```javascript
// Script Node.js para gerar tons
const ToneGenerator = require('tone-generator');
const fs = require('fs');

// Gerar binaural beat de 10Hz
ToneGenerator({
  freq: 200,      // Carrier frequency
  lengthInSecs: 60,
  volume: 0.5,
  channel: 'left'
}).then(tone1 => {
  ToneGenerator({
    freq: 210,    // 200 + 10Hz difference
    lengthInSecs: 60,
    volume: 0.5,
    channel: 'right'
  }).then(tone2 => {
    // Combinar canais e salvar
  });
});
```

#### Fallback 2: Freesound.org
- Buscar por "binaural beats", "white noise", "rain"
- Filtrar por CC0 (Creative Commons Zero)
- Download direto

---

### 📝 CHECKLIST

- [ ] Gerar 9 binaural beats (ZENmix)
- [ ] Gerar 6 sons ambiente (Soundverse/MusicHero)
- [ ] Testar loops (sem gaps)
- [ ] Organizar em pastas
- [ ] Atualizar AudioUrls.js
- [ ] Testar no app

---

### 💡 DICAS IMPORTANTES

1. **Loop Perfeito:** Configure para 60s exatos para garantir loop sem gaps
2. **Formato:** MP3 é melhor (menor tamanho, compatibilidade)
3. **Bitrate:** 128kbps é suficiente para binaural beats
4. **Normalização:** Todos os arquivos devem ter volume similar
5. **Teste:** Sempre escute com fones antes de usar

---

### 🚀 PRÓXIMO PASSO

Após gerar os arquivos, executar:
```bash
# Criar estrutura
mkdir assets
mkdir assets/audio
mkdir assets/audio/binaural
mkdir assets/audio/ambient

# Implementar em AudioUrls.js
# Testar no app
# Ajustar volumes conforme necessário
```

---

## 🎯 RECOMENDAÇÃO FINAL

**Use esta combinação:**
1. **ZENmix.io** → Todos os binaural beats (9 arquivos)
2. **MusicHero.ai** → Sons ambiente com IA (3-4 arquivos)
3. **Soundverse.ai** → Sons ambiente complexos (2-3 arquivos)

**Total:** ~15 arquivos MP3  
**Tamanho estimado:** 15-20 MB  
**Tempo de geração:** 2-3 horas  
**Custo:** R$ 0,00 ✅

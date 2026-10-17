# Caminhos de combate (decisões de implementação)

Inspiração: sistema de classes do Rucoy Online, adaptado ao GDD v0.3 (Fases 2 e 3).

- **Caminho da Espada**: ataque básico corpo a corpo (arco da espada) + Moon Slash.
- **Caminho do Cultivo**: ataque básico à distância (projétil de Qi que persegue o lobo mais próximo dentro de 220 px) + Onda de Qi.
- **Troca**: botão CAMINHO ou tecla Q, livre a qualquer momento (decisão do usuário).
- **Habilidades presas ao caminho**: Moon Slash só no Caminho da Espada; Onda de Qi só no Caminho do Cultivo.
- **Maestria**: uma por caminho; cresce com acertos do ataque básico (+1) e das habilidades (+3 por alvo); aumenta o dano apenas do próprio caminho (+5% por nível). Limiares em `paths-config.mjs`.
- Valores em `src/client/game/combat/paths-config.mjs`; regras puras em `paths-rules.mjs`.

## Pendente / desvios registrados
- Seleção de alvo por clique ainda não existe: o projétil escolhe o lobo mais próximo no alcance.
- Maestria não tem limite de nível por enquanto além dos limiares; efeitos além de dano (recarga, alcance) ficam para depois.
- Seleção de ponto no chão da Onda de Qi continua pendente (v1 usa ponto à frente).

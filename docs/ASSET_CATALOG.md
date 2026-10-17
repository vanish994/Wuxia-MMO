# Catálogo de assets para o desenvolvimento

## Resumo

Os pacotes já presentes em `docs/` complementam diretamente a primeira fatia do jogo. A integração deve ser feita por camadas: primeiro combate e interface usando os assets já preparados; depois props/tiles de natureza e vila em regiões específicas. Os ZIPs originais permanecem como fonte e referência de procedência.

| Pacote | Conteúdo útil | Licença declarada | Decisão |
|---|---|---|---|
| `tinyRPG_manaSoulGUI_v_1_0.zip` | Molduras 9-slice, barras, tabs, botões, cursores, inventário, retrato e bússola | CC0 1.0; autor: Gabriel “tiopalada” Lima | Aprovado como camada visual do HUD, sem substituir a lógica de interface |
| `assets/characters/samurai/samurai-all-animations-pack.zip` | Caminhada/idle em 8 direções, ataque de espada, ataque de orbe de energia azul e morte | Metadados e proveniência no próprio pacote; origem interna da entrega atual | Usar imediatamente no combate prototipal |

Os assets legados de natureza e vila foram removidos. A composição atual usa o kit wuxia e o Mega Pack Feudal Japan/Harmonious Seasons como fontes futuras de integração.


## Mapeamento para o GDD

O GDD v0.3 define uma espada e um caminho de cultivo. Os assets abaixo são os efeitos visuais das duas habilidades ativas iniciais do mesmo protagonista; eles não representam duas classes separadas:

- **Moon Slash / Corte da Meia-Lua:** habilidade ativa corpo a corpo de espada; usa a animação técnica `sword-attack`, com fases de preparação, golpe, seguimento e recuperação.
- **Onda de Qi:** habilidade ativa de Qi/cultivo à distância; usa a animação técnica `energy-orb-attack`, com preparação, carga, liberação e recuperação.

Ambos têm 8 direções, 4 frames de 64×64 px e QA de sprites aprovado. O próximo incremento deve usar esses metadados para sincronizar a animação visual com cooldown, alcance e dano, mantendo as regras fora da cena Phaser.

## Integração planejada

### Combate e habilidades

Extrair para `assets/characters/samurai/runtime/` os frames de `sword-attack` e `energy-orb-attack`, criar animações não-loop no Phaser e ligar os efeitos a ações de teste. O ataque de espada será corpo a corpo; o orbe será um projétil com alcance máximo. A camada de domínio definirá custo, cooldown e dano antes de a cena disparar qualquer animação.

### HUD

**Implementado na primeira versão profissional do HUD.** As folhas do `tinyRPG` foram copiadas para `assets/external/tiny-rpg-mana-soul-gui/` e integradas sem redimensionar sprites individuais: painel 9-slice, cabeçalho, moldura de retrato, barras HP/Qi, bússola, slots da hotbar e botão de interação. O HUD continua responsivo em landscape e não cobre o joystick nem o botão principal; folhas são apenas visuais, enquanto valores e estados continuam no código.

### Mundo

Usar os elementos de natureza do Mega Pack/Harmonious Seasons como props de regiões de bambu, Qinghe e áreas de água. Antes de substituir tiles existentes, fazer uma região de demonstração isolada e revisar colisão, escala e contraste com o personagem 64×64.

### Regra de escala da vila

O personagem é a referência: frame nativo de 64×64 px, ocupando aproximadamente 2×2 células de 32 px. Uma construção principal deve ter, no mínimo, 3 células de largura e altura visual suficiente para que portas/janelas leiam como arquitetura — nunca aumentar um sprite pequeno por escala de runtime. Peças do Mega Pack Feudal Japan serão montadas em resolução nativa; isso reorganiza pixels existentes e não cria arte nova.

## Restrições de procedência

Não declarar todos os arquivos do ZIP de vila como utilizáveis automaticamente: o próprio pacote contém um aviso para evitar tiles de pastas de origem incerta. Os novos assets devem manter seus arquivos de licença e uma referência ao ZIP de origem. Não redistribuir os ZIPs como produto independente.

## Adições do ciclo 1 (combate na vila)

| Asset | Origem | Uso | Licença / procedência |
|---|---|---|---|
| Samurai `idle/` (4 quadros × 8 direções) | `assets/characters/samurai/samurai-all-animations-pack.zip` | Animação de repouso em `assets/characters/samurai/runtime/idle/` | Mesma do pacote do samurai (sem licença explícita no pacote; tratar como procedência do projeto) |
| Samurai `sword-attack/` (4 quadros × 8 direções) | Mesmo pacote | Ataque com espada em `assets/characters/samurai/runtime/sword-attack/` | Idem |
| Lobo Feroz estilo wuxia (spritesheet 512×64, 8 rotações) | `docs/Lobo_Feroz_estilo_wuxia-Idle.zip` | Mob de nível 1 em `assets/characters/wolf/runtime/` | O ZIP não contém arquivo de licença. **Confirmar direitos antes de redistribuir publicamente** |

Os ZIPs originais permanecem em `docs/` e no pacote do samurai como fonte de procedência. O lobo não possui frames de caminhada ou ataque próprios; o movimento usa a orientação do idle e o golpe é um avanço curto.

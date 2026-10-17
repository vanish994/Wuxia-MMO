# Instruções para agentes de IA — Wuxia-MMO

Antes de executar qualquer tarefa:
1. Leia `README.md` e os documentos diretamente relacionados à tarefa.
2. Confirme o estado real do repositório; não presuma que documentação antiga descreve perfeitamente o código atual.
3. Preserve arquitetura, assets e funcionalidades existentes. Faça alterações pequenas e verificáveis.
4. Não invente arquivos, APIs, recursos ou resultados de testes.
5. Execute as verificações relevantes e informe honestamente o que foi e o que não foi validado.

## Trabalho com mapas, mundo e tilesets
É obrigatório ler e seguir `docs/GUIA_PRODUCAO_MAPAS_PIXEL_ART.md` antes de planejar, criar, revisar ou integrar mapas, terrenos, tilesets, colisões ou elementos de cenário.

Esse guia define o fluxo de auditoria de assets, blockout, composição, tile grid 32×32, Dual Grid, paleta, contraste, navegação, testes e critérios de aceitação. Em caso de conflito, confira a implementação real e os documentos técnicos do projeto antes de modificar o sistema.

## Relatório de entrega
Ao concluir, liste os arquivos alterados, descreva as decisões relevantes, informe os testes realmente executados, apresente preview/evidências quando disponíveis e declare as limitações ainda não verificadas.

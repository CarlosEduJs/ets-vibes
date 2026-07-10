# ETS Vibes

## Conceito

- É uma aplicação desktop escrita em Tauri 2, cross-platform, para jogadores de ETS2 (futuramente também pra ATS). Seu objetivo é trazer uma experiência mais completa de customização e gerenciamento do jogo.

## Filosofias

- Ser uma alternativa forte a ferramentas consolidadas como TS SaveEditor Tool, com uma interface moderna, intuitiva e com recursos avançados.

- Foco em performance nativa (Tauri + Rust).

- Prioridade total em segurança (backups automaticos, validações, read-only por padrão, etc).

- Experiência estilo 'Vibes' - visual minimalista, com animações suaves e responsivas, e com uma interface que se adapta ao gosto do usuário.

## Objetivo PRINCIPAl:

- Ser a ferramenta definitiva para editar configurações, saves, otimização da jogatina, tudo em um só lugar.

## Core Features (MVP - v1.0):

- Gerenciador de Perfis e Saves
    - Detecção automática de pastas (Steam + Local).
    - Listagem de perfis com preview (nome, level, dinheiro, km rodados, caminhão atual, etc).
    - Renomear, clonar, deletar e criar backup automático.

- Editor de Configurações do Jogo
    - Editor de configurações do jogo (config.cfg) com validação de valores.
    - Categorias: Graphics, Performance, Sound, Input, Multimon, Developer.
    - Presets prontos (Performance, Realismo, Ultra Graphics, Low-end, etc).
    - Busca e filtro de opções.

- Editor de Saves
    - Editar Dinheiro (Empresa e Motorista), XP, Level, Pontos de Habilidade, Caminhões, Garagens, Contratos, etc.
    - Reparar / Reabastecer Truck e Trailer.
    - Desbloquear cidades visitadas.
    - Visualizar e editar dados básicos de trucks/trailers (placa, odômetro, etc).

- Segurança
    - Backup automático antes de quaisquer alterações.
    - Modo Read-Only por padrão, com opção de habilitar edição.
    - Logs de alterações feitas no save, com opção de desfazer alterações.

## Features PÓS-MVP (v2.0):

- Criação de Jobs customizados.
- Scanner de mods instalados + integração (lista de trucks/trailers disponiveis).
- Telemetria e Stats Visuais (graficos de progresso de carreira).
- Editor avançado de controls.sii (curvas de freio, binds completos)
- Customização de UI do tema e cores do app.
- Atualizações automáticas do app (auto-update).
- Export de Saves editados (com hash de integridade).

## Futuro (v3.0+):

- Suporte ao ATS.
- Modo "God Mode" com presets rápidos (dinheiro infinito, XP infinito, desbloqueio de todas as cidades, etc).


## Princípios

- Nunca modificar arquivos sem backup.
- Nunca salvar valores inválidos.
- Detectar automaticamente instalações do jogo.
- Interface rápida e intuitiva.
- Funcionar offline.

## Stack

- Front: React + Vite + Tailwind + Typescript + Shadcn UI + Framer Motion
- Back: Rust + Tauri + SQLite + Serde + Anyhow + Log + Tracing
- Parsing: Rust Crates (serd, parser custom para .sii)

## Considerações

- O projeto é open-source e está em constante evolução. Contribuições da comunidade são bem-vindas.

- Alterações em saves podem causar incompatibilidades com o TruckersMP ou outros modos multiplayer. O ETS Vibes não incentiva nem oferece recursos destinados a cheating ou obtenção de vantagens em ambientes multiplayer.

- A compatibilidade será mantida prioritariamente com a versão mais recente do Euro Truck Simulator 2 e, futuramente, do American Truck Simulator. Versões antigas do jogo não são um objetivo do projeto.

## Não Objetivos

- Burlar sistemas anticheat.
- Contornar restrições do TruckersMP.
- Modificar arquivos do jogo de forma insegura.
- Incentivar trapaças em modos multiplayer.
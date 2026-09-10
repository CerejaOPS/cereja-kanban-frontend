# Guia de Uso da IA (Cursor/Windsurf)

Para extrair o melhor da Inteligência Artificial sem quebrar as regras de arquitetura (e sem pedir para a IA escrever o código por você), siga o nosso fluxo padrão de comunicação com a ferramenta:

## 1. Como iniciar uma Task (Comando de Contexto)
Quando você pegar uma task nova no Jira, abra o chat da IA e digite EXATAMENTE o seguinte modelo:

> **Comando de Prompt:**
> "INICIAR TASK: Peguei a Task [CÓDIGO DA TASK] (ex: F1 - Modal). Por favor, leia o arquivo `docs/CONTEXTO_SISTEMA.md` para entender onde essa task se encaixa, avalie o código que foi feito na task anterior e me dê o passo-a-passo inicial lógico do que eu preciso criar agora, mas **não escreva o código da implementação final**."

A IA lerá o contexto, analisará as pastas (app, features, entities) e te dará um "norte" estruturado do que fazer.

## 2. A Regra das 5 Tentativas
Não peça à IA: *"Escreva o Componente pra mim"*. A IA é instruída a recusar.
Você deve TENTAR escrever. Se der erro (ex: Tailwind não aplicando a cor ou TypeScript reclamando do Hook), cole o código com o erro na IA:
*"Tentei fazer o componente mas o type do Props está quebrando. Veja meu código:"*
Apenas quando você estiver travado de verdade a IA fornecerá o código de resgate.

## 3. O Que a IA vai Vigiar
A IA foi configurada como "Guardiã da Arquitetura FSD". Se você pedir algo que quebre as regras (como importar um componente de `features` dentro de `entities`), ela vai dar um alerta informando que a operação viola o guia FSD. Escute a IA, ela tem acesso aos nossos padrões!

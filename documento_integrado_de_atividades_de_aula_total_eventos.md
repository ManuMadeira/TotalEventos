# Relatório de Atividades Práticas de Aula — Total Eventos

**Sistema Analisado:** Total Eventos  
**Data:** 22 de Setembro de 2026  
**Contexto:** Compilação das Dinâmicas e Exercícios Práticos de Modelagem DDD (Domain-Driven Design)

---

## 01. Invariantes do Domínio

A partir das Regras de Negócio (RNs) mapeadas no modelo conceitual do sistema, identificamos as três regras mais críticas cuja violação levaria o sistema a um estado completamente inválido no mundo real.

### Quadro de Invariantes e Estados Inválidos

| Regra | Conceito Protegido | Estado Inválido Possível (O que ficaria inválido?) | Evidência |
| :--- | :--- | :--- | :--- |
| **RN02:** Trava por Limite Físico Legal de Lotação | **Espaço Físico / Sala** | **Superlotação e Violação Legal do Alvará:** O total de pessoas credenciadas e presentes no recinto ultrapassaria a `capacidadeMaxima`. Isso violaria a norma legal de segurança contra incêndios e colocaria em risco a integridade física dos participantes. | Alvará de segurança física contra incêndios, Secção 09 (RN02) e Secção 10 do documento conceitual. |
| **RN01:** Validação de Duplicidade de Acesso | **Reserva / Ingresso** | **Acesso Duplicado / Fraude de Credencial:** A mesma reserva/ingresso transitaria para o estado `Utilizada` mais de uma vez na mesma sessão. Isso causaria contagem fraudulenta de público na catraca e ocupação indevida por réplicas de QR Code (ex: print-screens compartilhados). | Requisito Antifraude de Credenciamento, Secção 09 (RN01) e Secção 10 do documento conceitual. |
| **RN03:** Elegibilidade para Certificação | **Certificado** | **Emissão Indevida de Documento Oficial:** Um certificado seria gerado, assinado digitalmente com hash SHA-256 e emitido para um participante com percentual de frequência inferior a 75% da carga horária. Isso comprometeria a idoneidade jurídica e a auditabilidade dos comprovantes do evento. | Regra de Certificação e Auditoria de Carga Horária, Secção 09 (RN03) e Secção 10 do documento conceitual. |

### O Pior Estado Inválido do Sistema

O **pior estado inválido** que o sistema poderia permitir é a **superlotação física de uma sala acima da sua capacidade máxima legal (violação da RN02)**.
* **Impacto no Mundo Real:** Diferente de uma falha de software comum que gera apenas inconsistência de dados em banco, ultrapassar a capacidade da sala fere o alvará de incêndio, colocando vidas em risco e sujeitando o evento à interdição legal.
* **Vulnerabilidade Técnica:** Ocorre devido à operação *Offline-First* dos totens, onde múltiplos leitores operando desconectados simultaneamente poderiam estourar a lotação presencial caso as regras de contenção (como a Margem Offline) falhem.

---

## 02. Primeiro Candidato a Agregado

Com base nas invariantes e nas fronteiras de consistência necessárias, desenhou-se o primeiro Agregado do sistema, focado na gestão do espaço e controle de acesso presencial.

```
+-------------------------------------------------------------------+
| SESSÃO / PALESTRA (Aggregate Root)                               |
|                                                                   |
| [Entidades Internas / Referências]                                |
|  - EspaçoFísicoSala (ID da Sala e Capacidade Máxima Legal)        |
|  - Coleção de RegistroPresenca (Check-ins validados na sessão)    |
|                                                                   |
| [Objetos de Valor Internos]                                       |
|  - QRCodeAssinado (Payload criptográfico lido)                   |
|  - MargemSegurançaOffline (Parâmetros de contenção local)        |
+-------------------------------------------------------------------+
```

* **Modelo:** Total Eventos
* **Agregado Candidato:** Gestão de Lotação e Acesso da Sessão (`SessaoPalestra`)
* **Aggregate Root provável:** `SessaoPalestra`
* **Objetos Internos:**
  * `EspacoFisicoSala` (Entidade interna / Referência que dita a `capacidadeMaxima`).
  * `RegistroPresenca` (Coleção de entidades internas representando os check-ins da sessão).
  * `QRCodeAssinado` (Objeto de Valor com os dados da credencial lida).
  * `MargemSegurancaOffline` (Objeto de Valor com parâmetros de contingência local).
* **Invariantes Protegidas:**
  1. *RN02 (Trava de Lotação):* `count(RegistroPresenca) <= EspacoFisicoSala.capacidadeMaxima`.
  2. *RN01 (Duplicidade):* Impossibilidade de inserir dois `RegistroPresenca` idênticos para o mesmo token.
  3. *RN05 (Contenção Offline):* Validação do teto local alocado ao totem sem sincronização.
* **Operações Importantes na Raiz:**
  * `registrarCheckIn(tokenQRCode, idTotem, timestamp)`: Ponto de entrada obrigatório para validação e gravação da presença.
  * `verificarDisponibilidadeVagas()`: Consulta o saldo disponível em tempo real.
  * `encerrarSessao()`: Fecha a captação de acessos e consolida presenças para certificação.

---

## 03. Eventos do Domínio (Acontecimentos Relevantes)

Identificou-se os fatos já ocorridos no domínio (escritos no passado, indicando eventos de negócio e não ordens/comandos):

| Evento | O que aconteceu? | Quem poderia se interessar por isso? |
| :--- | :--- | :--- |
| **`CheckInRealizado`** | Um participante apresentou seu token no totem e teve sua entrada presencial validada e gravada na palestra. | * **Módulo de Lotação:** para decrementar a contagem de vagas em tempo real.<br>* **Módulo de Frequência:** para acumular carga horária do participante.<br>* **Painel do Operador:** para monitorar o fluxo da portaria. |
| **`SobrepopulacaoDetectada`** | A ocupação física da sala atingiu 100% da capacidade máxima legal declarada no alvará. | * **Totens Leitores:** para bloquear imediatamente novas entradas.<br>* **Comissão Organizadora / Segurança:** para efetuar o fechamento manual das portas. |
| **`CertificadoElegivel`** | O participante concluiu as sessões atingindo a frequência mínima exigida ($\ge 75\%$). | * **Serviço de Certificados:** para gerar a chave SHA-256 e assinar o documento.<br>* **Serviço de Notificação:** para enviar o e-mail com link de download. |

### Análise da Fronteira do Agregado

> **Pergunta:** *Esse acontecimento exigiria que todos os interessados estivessem dentro do mesmo Agregado?*

**Não.** Os Eventos de Domínio representam fatos consumados. O Agregado `SessaoPalestra` processa a entrada e emite o evento `CheckInRealizado`. Módulos externos (como a emissão de certificados ou notificações) reagem de forma **assíncrona** (*Consistência Eventual*). Isso evita criar um único "super-agregado" monolítico e garante que a validação nos totens mantenha a performance exigida de **< 150ms**.
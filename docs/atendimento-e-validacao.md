# Site institucional e atendimento técnico

## Fluxo de trabalho

1. A equipe entra em `/admin/login.html` e seleciona **Nova ordem de serviço**.
2. Para abrir o registro, informa cliente, categoria e serviço. Data, status e prioridade já têm sugestões; o número é gerado pelo servidor ao salvar.
3. Os grupos expansíveis permitem registrar contato, equipamento, diagnóstico, execução, materiais, conclusão, garantia e próxima manutenção.
4. Ao salvar, o banco gera um código de consulta aleatório. Os detalhes da OS exibem o código e a situação da consulta pública.
5. Para disponibilizar a consulta, marque **Disponibilizar esta ordem de serviço no Portal do Cliente**.
6. Nos detalhes da OS salva, a equipe pode copiar o link, gerar relatório/PDF e imprimir a etiqueta preenchida.
7. O QR da etiqueta abre `/atendimentos/`. O cliente informa o código de consulta. O número sequencial da OS não permite consultar o registro.

O administrador gerencia a equipe. Técnicos podem cadastrar OS, consultar somente as próprias e editar as próprias enquanto estiverem em aberto. Registros encerrados permanecem disponíveis para leitura do autor. Autoria e última alteração são registradas pelo banco, separadas do campo técnico responsável.

Orçamentos são vinculados a OS em aberto. O técnico só pode usar as próprias OS. Os totais são recalculados no servidor. A proposta pode ser impressa ou salva em PDF; seu layout será validado pelo proprietário posteriormente.

O formulário Equipe cria um técnico e gera um link privado de uso único. Não envia e-mail automaticamente. O destinatário valida o convite e define a própria senha. O administrador pode gerar outra ativação na lista da equipe. Nunca registre links de ativação em arquivos, commits ou chamados públicos.

## Etiquetas e documentos

- Etiqueta em branco: `/assets/labels/etiqueta-manutencao-18x12cm.pdf`.
- Etiqueta preenchida: janela **Imprimir etiqueta** de uma OS salva, com código e publicação no portal habilitados.
- Tamanho: 18 × 12 cm; imprimir a 100%, sem cabeçalhos/rodapés do navegador, com gráficos de fundo habilitados.
- O QR estático aponta diretamente para o domínio da empresa, sem serviço intermediário.
- O código e o link dão acesso às informações liberadas da OS. Eles devem ser entregues ao cliente correspondente.
- A etiqueta limita o espaço das observações; o relatório preserva o conteúdo completo.
- Relatórios individuais usam os dados já salvos. Salve alterações antes de emitir nova versão.
- Resumo em PDF e exportação CSV consideram os filtros da tabela de OS.

## Validação em 24/10/2026

- Verificação de sintaxe JavaScript e `git diff --check`.
- `node tests/verify-site.cjs`: referências locais, âncoras, IDs, arquivos de documentos e configuração Vercel.
- `node tests/verify-documents.cjs`: HTML seguro, relatório individual, resumo, etiqueta, QR, datas, link e bloqueio de etiqueta privada.
- `node tests/verify-portal.cjs`: validação de código, consulta, falhas de rede, datas, limpeza de URL e recuperação da interface.
- Revisão visual em desktop e 390 px; cadastro e consulta com dados fictícios em um servidor de testes local. O servidor e seus mocks ficam fora do repositório e não são publicados.
- Banco real reativado. Teste transacional de cadastro/edição pelo administrador, consulta anônima por código, rejeição por número de OS, ocultação de OS privada e bloqueio de outro usuário. Transação revertida; nenhum registro de teste mantido.
- API HTTPS real: RPC pública responde; SELECT anônimo direto à tabela retorna 401.
- PDF em branco verificado em 18 × 12 cm; QR decodificado a partir da imagem renderizada.

### Estado para liberação

O proprietário confirmou o login com a conta real na prévia. O teste físico de leitura e tamanho da etiqueta será feito pelo proprietário após a conclusão do site. A validação local não representa um teste de credenciais reais nem impressão física.

### Segurança do banco

A migração `20261024121723_secure_service_order_public_lookup.sql` já foi aplicada no Supabase conectado. Mantém as políticas existentes da conta administradora, restringe consulta ao código e à visibilidade, aumenta novos códigos para 24 caracteres e remove permissões de TRUNCATE/REFERENCES/TRIGGER do papel de aplicação.

A RPC pública usa SECURITY DEFINER intencionalmente: visitantes não têm SELECT na tabela e recebem apenas campos de atendimento de um registro liberado cujo código conhecem. Não retorna endereço, telefone ou e-mail do cliente. O aviso genérico correspondente dos advisors é esperado para esse desenho.

A proteção do Supabase contra senhas vazadas está desativada na configuração existente e não foi alterada. Referência: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection.

## Imagens

Os banners são imagens conceituais geradas por IA e estão identificados como ilustrativos. O portfólio usa registros reais do repositório. As fontes originais foram preservadas; as versões WebP são usadas no carregamento da página.

## Equipe e orçamentos

Migrações adicionais aplicadas: equipe/autoria/orçamentos, numeração de OS pelo servidor e preservação de sequências maiores que quatro dígitos. A função create-technician verifica o token com Auth e exige perfil administrador ativo; a chave privilegiada permanece no ambiente da função. As tabelas de equipe e orçamentos usam RLS. A consulta pública não expõe dados de autoria.

`node tests/verify-quotes.cjs` confere precisão decimal, arredondamento, limites e entradas inválidas.

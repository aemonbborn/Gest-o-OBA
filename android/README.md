# Aplicativo Android

O instalador está em [downloads/gestao-emergencia-adulto.apk](../downloads/gestao-emergencia-adulto.apk). Android 8 ou superior; APK sem bibliotecas nativas, compatível com ARM e x86.

## Instalar e usar

1. Baixe o APK no celular e abra o arquivo. Quando o Android solicitar, permita instalar arquivos pelo navegador usado para baixar.
2. Abra **Gestão Emergência Adulto**. Cole uma vez a URL do aplicativo Google Apps Script que termina em `/exec` e toque em **Salvar e abrir gestão**.
3. Use no Google a mesma conta com permissão na planilha. Nas próximas aberturas pelo ícone, a conexão salva abre automaticamente. **Alterar conexão** permite trocar a implantação.

O APK possui tela nativa de configuração e um ícone próprio. A gestão é aberta usando Chrome Custom Tabs ou o navegador padrão, preservando o login e a autorização Google da integração já existente. Esta primeira versão pode mostrar controles do navegador. Não incorpora o calendário e os formulários como telas nativas, não substitui o backend Apps Script e precisa de internet para a planilha. O APK não recebe senhas nem tokens Google. A instalação não publica nem inclui os nomes dos profissionais.

O link `/exec` é configurado no aparelho; o APK público vem sem link pessoal. Os plantões da planilha são os mesmos acessados no computador. Cadastros que existem apenas no navegador do Windows precisam de **Backup e restauração** no programa para serem transferidos.

## Compilação no ambiente Linux

Sem Gradle ou dependências AndroidX. Usa Java com o módulo `jdk.compiler`, Python 3 e SDK oficial Android 35. O ambiente já oferece Java 21; o compilador está disponível via `java com.sun.tools.javac.Main`, mesmo sem executável `javac` no PATH.

```sh
cd /workspace/Gest-o-OBA
python3 scripts/setup_android.py --emulator
python3 scripts/build_android.py --with-tests
python3 scripts/start_android_emulator.py
python3 scripts/test_android.py
```

O instalador verifica os checksums do catálogo oficial Google e mantém verificação TLS. SDK e arquivos baixados ficam fora do checkout em `/workspace/.tools/android-sdk` e `/workspace/.gestao-android/downloads`. O emulador usa Android 8 x86_64 e renderização de software quando não há KVM. Os scripts de inicialização e teste precisam poder criar processos e sockets locais.

Para validar em tarefas de setup sem modificar o APK publicado, use `python3 scripts/build_android.py --with-tests --output android/build/validation.apk` e `python3 scripts/test_android.py --apk android/build/validation.apk`.

A chave de assinatura e sua senha ficam em `/workspace/.gestao-android/signing`, com permissões restritas, fora do repositório. Preserve essa pasta para assinar futuras atualizações com a mesma identidade. `android/build` contém apenas arquivos gerados e não é publicado. O checksum SHA-256 do APK está ao lado do instalador. Para uma nova versão, incremente `versionCode` e `versionName` no manifesto.

## Verificação

Compilação, assinatura APK v2/v3 e alinhamento verificados. Testes de URL recusam o link da planilha, HTTP, hosts indevidos, portas e rotas erradas. O teste de instrumentação instala o APK em um Android real emulado e exerce primeira abertura, colagem, mensagem de link inválido, conexão salva, edição e abertura automática. A navegação externa é interceptada no teste: ele não entra em contas Google nem altera a planilha. A autorização e o acesso real à planilha precisam ser conferidos no celular do usuário.

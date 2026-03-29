# Instruções para Execução Local Automática

Este documento explica como utilizar o script de inicialização para rodar todo o sistema sem precisar de ferramentas externas.

## Como Iniciar o Sistema

Basta clicar duas vezes no arquivo **`iniciar_sistema.bat`** na raiz da pasta do projeto.

### O que o script faz:
1. **Banco de Dados**: Verifica se o MySQL está rodando na porta 3306. Se não estiver, ele tenta iniciar o servidor em segundo plano.
2. **Backend**: Abre uma janela de comando preta e inicia o servidor Java Spring Boot (`port 8080`).
3. **Frontend**: Abre outra janela de comando e inicia o servidor React/Vite (`port 5173`).
4. **Navegador**: Após 10 segundos, ele abre automaticamente o seu navegador em `http://localhost:5173`.

---

## Recomendação: Banco de Dados Automático

Para que o banco de dados funcione ainda melhor e inicie junto com o Windows, siga estes passos (necessário apenas uma vez):

1. Clique no Menu Iniciar, digite **PowerShell**, clique com o botão direito e escolha **Executar como Administrador**.
2. Copie e cole o comando abaixo:
   ```powershell
   & "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe" --install MySQL --defaults-file="C:\consultorio_mysql_data\my.ini"
   ```
3. Em seguida, digite:
   ```powershell
   net start MySQL
   ```

---

## Solução de Problemas

- **Erro de Porta 8080 ou 5173 já em uso**: Verifique se não há outras janelas do sistema já abertas. Feche-as e tente novamente.
- **Frontend não carrega**: Certifique-se de que rodou `npm install` na primeira vez que configurou o projeto.

# Rodando o projeto no Docker

Passo a passo para subir o **Sistema ONG** (backend Django + PostgreSQL) usando Docker e Docker Compose. Ideal para desenvolvimento em equipe: todos usam o mesmo ambiente.

---

## Pré-requisitos

- **Docker Desktop** instalado e em execução (Windows/Mac) ou Docker Engine + Docker Compose (Linux)
- Git (para clonar o repositório, se for o caso)

Verifique se o Docker está rodando:

```powershell
docker --version
docker compose version
```

---

## Estrutura criada para Docker

O projeto já inclui:

| Arquivo / Pasta      | Descrição |
|----------------------|-----------|
| `docker-compose.yml` | Orquestra os serviços **db** (PostgreSQL) e **backend** (Django). O backend só sobe depois que o banco está "healthy". |
| `backend/Dockerfile` | Imagem do backend: Python 3.12, instala dependências do `requirements.txt` e expõe a porta 8000. |
| `backend/requirements.txt` | Dependências Python (Django, psycopg2-binary, Pillow, etc.). |
| `backend/.dockerignore` | Evita copiar `venv/`, `__pycache__/`, etc. para a imagem. |
| `.env.example`       | Exemplo de variáveis de ambiente. Copie para `.env` se quiser customizar. |
| `.gitignore`         | Inclui `.env`, `venv/`, `db.sqlite3`, etc. |

O `config/settings.py` do Django lê credenciais e configurações via variáveis de ambiente (POSTGRES_*, DJANGO_*), então o mesmo código funciona local e no Docker.

---

## Passo 1 — Clonar o repositório (se ainda não tiver)

```powershell
git clone <url-do-repositorio>
cd Sistema-ONG
```

---

## Passo 2 — (Opcional) Configurar variáveis de ambiente

Se quiser mudar senha do banco, porta ou outras opções:

1. Copie o exemplo:
   ```powershell
   copy .env.example .env
   ```
2. Edite o `.env` com os valores desejados. Exemplo:

   ```env
   POSTGRES_DB=sistema-ong
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=jkl1010rt
   POSTGRES_PORT=5432

   DJANGO_DEBUG=1
   DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
   DJANGO_SECRET_KEY=dev-secret-key
   ```

Se não criar `.env`, o `docker-compose.yml` usa os valores padrão (indicados no `.env.example`).

---

## Passo 3 — Subir o projeto

Na **raiz do projeto** (pasta onde está o `docker-compose.yml`):

```powershell
docker compose up --build
```

- **`--build`**: monta/atualiza a imagem do backend na primeira vez ou quando o `Dockerfile`/`requirements.txt` mudar.
- O Compose sobe o **PostgreSQL** primeiro, espera ficar "healthy" e depois sobe o **backend**, que roda `migrate` e em seguida `runserver 0.0.0.0:8000`.

Para rodar em segundo plano (sem travar o terminal):

```powershell
docker compose up --build -d
```

---

## Passo 4 — Acessar a aplicação

- **Backend (Django):** [http://localhost:8000/](http://localhost:8000/)
- **Admin (após criar superusuário):** [http://localhost:8000/admin/](http://localhost:8000/admin/)

Para criar um superusuário (com os containers rodando):

```powershell
docker compose exec backend python manage.py createsuperuser
```

---

## Comandos úteis

| Ação | Comando |
|------|--------|
| Parar os containers | `docker compose down` |
| Parar e remover volumes (apaga dados do banco) | `docker compose down -v` |
| Ver logs | `docker compose logs -f` |
| Rebuildar só o backend | `docker compose build backend` |
| Entrar no shell do backend | `docker compose exec backend sh` |
| Rodar migrações à mão | `docker compose exec backend python manage.py migrate` |
| Criar superusuário | `docker compose exec backend python manage.py createsuperuser` |

---

## Resumo rápido para outro dev

1. Ter Docker instalado e aberto.
2. Clonar o repositório e entrar na pasta do projeto.
3. (Opcional) Copiar `.env.example` para `.env` e ajustar se precisar.
4. Na raiz do projeto: `docker compose up --build`.
5. Acessar [http://localhost:8000/](http://localhost:8000/).

Pronto: backend e banco rodando no Docker, sem precisar instalar Python nem PostgreSQL na máquina.

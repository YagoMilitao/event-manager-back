# 📦 Backend - Gerenciamento de Eventos

Este é o backend da aplicação de gerenciamento de eventos. Ele é uma API REST criada com Node.js, Express e MongoDB, com autenticação via Firebase.

---

## 🚀 Conexão com outros projetos

### ✅ Frontend (React.ts)
- O frontend deve consumir as rotas da API (`http://localhost:3000/api`)
- Ao fazer login com Firebase, envie o **ID Token** em cada requisição protegida:

### ✅ Aplicativo Mobile (Kotlin)
- Mesmo esquema: gere o token no app ao logar com Firebase
- Envie esse token no header `Authorization` nas requisições protegidas

---

## 🔐 Autenticação

As rotas protegidas requerem um token Firebase válido. O backend valida o token via `firebase-admin`.

Rotas públicas:
- `GET /api/events` — lista todos os eventos

Rotas privadas (requerem token):
- `POST /api/events`
- `PUT /api/events/:id`
- `DELETE /api/events/:id`

---

## 📄 Variáveis de ambiente (.env)

Veja o arquivo `.env.example` para os valores necessários.

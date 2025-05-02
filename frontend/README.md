# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```


http://localhost:8787/api/v1/auth/signup
{
    "message": "signed up successfull",
    "user": {
        "id": "f31df544-840c-4aee-914d-a5cc207e9338",
        "emai": "gopi1@gmail.com",
        "username": "gopiyadav1",
        "name": "gopi yadav1"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImYzMWRmNTQ0LTg0MGMtNGFlZS05MTRkLWE1Y2MyMDdlOTMzOCIsInVzZXJuYW1lIjoiZ29waXlhZGF2MSIsImVtYWlsIjoiZ29waTFAZ21haWwuY29tIn0.skJ1CAvQ0frY80FRFBo-Ltc3lcaesolc4RETGwwjuUE"
}


http://localhost:8787/api/v1/blog
{
  "title": "How AI is Reshaping Web Development",
  "content": "Artificial Intelligence is revolutionizing the way we build web applications. From code generation to user personalization, it's redefining productivity.",
  "excerpt": "A quick dive into AI's impact on web dev.",
  "featuredImage": "https://example.com/images/ai-webdev.png",
  "published": true
}


{
  "title": "Scaling PostgreSQL for Side Projects",
  "content": "PostgreSQL can handle more than most developers think. With the right indexes, connection pooling, and read replicas, even modest setups scale surprisingly well.",
  "excerpt": "Tips on squeezing performance out of your Postgres DB.",
  "featuredImage": "https://example.com/images/postgres-scale.jpg",
  "published": false
}
{
    "message": "blog created successfully",
    "blog": {
        "id": "3a6968b4-5355-4dc0-9d29-92f39e1e2db9",
        "slug": "scaling-postgresql-for-side-projects-1745935573786",
        "title": "Scaling PostgreSQL for Side Projects",
        "content": "PostgreSQL can handle more than most developers think. With the right indexes, connection pooling, and read replicas, even modest setups scale surprisingly well.",
        "excerpt": "Tips on squeezing performance out of your Postgres DB.",
        "featuredImage": "https://example.com/images/postgres-scale.jpg",
        "published": false,
        "createdAt": "2025-04-29T14:06:15.332Z",
        "updatedAt": "2025-04-29T14:06:15.332Z",
        "publishedAt": null,
        "authorId": "f31df544-840c-4aee-914d-a5cc207e9338"
    }
}
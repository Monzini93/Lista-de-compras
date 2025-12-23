# 🛒 Lista de Compras - Supermercado

Aplicativo web para gerenciar lista de compras de supermercado e comparar preços de produtos.

## ✨ Funcionalidades

### 📝 Lista de Compras
- Adicionar produtos com nome, quantidade e unidade (Litro, Unidade, Quilograma ou Grama)
- Editar produtos existentes
- Remover produtos individuais
- Marcar produtos como comprados
- Limpar lista completa
- Contador de itens pendentes
- Persistência automática no LocalStorage

### 💰 Comparação de Preços
- Adicionar produtos para comparação com preço, quantidade e unidade
- Comparar produtos por litro ou por peso (Kg/g)
- Conversão automática de unidades (g → Kg)
- Ordenação automática por melhor custo-benefício
- Destaque visual para o melhor valor
- Persistência automática no LocalStorage

## 🚀 Como Usar

### Instalação

```bash
npm install
```

### Desenvolvimento

```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:5173`

### Build para Produção

```bash
npm run build
```

## 🛠️ Tecnologias

- **React 18** - Biblioteca JavaScript para construção de interfaces
- **TypeScript** - Superset do JavaScript com tipagem estática
- **Vite** - Build tool e dev server rápido
- **React Router** - Roteamento para navegação entre páginas
- **LocalStorage** - Armazenamento local dos dados

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ProductForm.tsx
│   ├── ProductList.tsx
│   ├── ProductItem.tsx
│   ├── PriceComparisonForm.tsx
│   ├── PriceComparisonTable.tsx
│   └── Navigation.tsx
├── pages/              # Páginas da aplicação
│   ├── ShoppingList.tsx
│   └── PriceComparison.tsx
├── hooks/              # Custom hooks
│   ├── useShoppingList.ts
│   └── usePriceComparison.ts
├── utils/              # Funções utilitárias
│   ├── storage.ts
│   └── conversions.ts
├── types/              # Definições de tipos TypeScript
│   └── index.ts
├── App.tsx             # Componente principal
└── main.tsx            # Entry point
```

## 🎨 Design

Interface moderna e responsiva com:
- Gradientes suaves e cores agradáveis
- Layout mobile-first
- Feedback visual para ações do usuário
- Animações suaves e transições

## 📱 Responsividade

O aplicativo é totalmente responsivo e funciona bem em:
- 📱 Dispositivos móveis
- 💻 Tablets
- 🖥️ Desktops

## 💾 Armazenamento

Os dados são salvos automaticamente no LocalStorage do navegador, permitindo:
- Persistência entre sessões
- Dados locais (não são enviados para servidor)
- Funcionamento offline

## 📄 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.


# 📇 Contact Manager

A modern, enterprise-grade contact management application built with React, TypeScript, and Trie data structures for lightning-fast search capabilities.

## ✨ Features

### 🚀 Core Functionality
- **Complete CRUD Operations**: Add, edit, delete, and view contacts
- **Lightning-Fast Search**: Trie-based search with O(k) complexity
- **Bulk Operations**: Multi-select and bulk delete contacts
- **Import/Export**: CSV import/export with field mapping
- **Favorites System**: Mark and filter favorite contacts
- **Tag Management**: Organize contacts with custom tags

### 🎓 Educational Component
- **Interactive Trie Learning**: Built-in educational module
- **Visual Explanations**: Learn how Trie data structures work
- **Performance Analysis**: Compare search algorithms

### 📊 Analytics Dashboard
- **Contact Statistics**: Total contacts, favorites, recent additions
- **Data Insights**: Company distribution, tag analysis
- **Visual Metrics**: Professional charts and statistics

### 🎨 Modern UI/UX
- **Professional Design**: Clean, modern interface
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Tab Navigation**: Organized content with intuitive navigation
- **Toast Notifications**: User feedback for all actions
- **Loading States**: Smooth user experience

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Full type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful, consistent icons

### State Management
- **Zustand** - Lightweight, efficient state management
- **Context API** - Provider pattern for component composition

### Data & Storage
- **IndexedDB** - Browser-based persistent storage (with localStorage fallback)
- **Dexie.js** - Modern IndexedDB wrapper
- **Custom Trie Implementation** - Optimized prefix tree for search

### Development Tools
- **Vite** - Fast build tool and development server
- **ESLint** - Code linting and quality enforcement
- **Prettier** - Code formatting
- **Vitest** - Unit testing framework

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── contacts/        # Contact-related components
│   │   ├── ContactForm.tsx
│   │   └── ContactList.tsx
│   ├── modals/          # Modal components
│   │   ├── ContactDetailsModal.tsx
│   │   └── ImportExportModal.tsx
│   ├── providers/       # Context providers
│   │   └── ToastProvider.tsx
│   └── ui/              # Reusable UI components
│       ├── Button.tsx
│       ├── Checkbox.tsx
│       ├── EmptyState.tsx
│       ├── Input.tsx
│       ├── LoadingScreen.tsx
│       ├── Modal.tsx
│       ├── Toast.tsx
│       └── ToastContainer.tsx
├── hooks/               # Custom React hooks
│   └── useToast.ts
├── stores/              # Zustand stores
│   ├── contactStore.tsx # Contact management state
│   └── uiStore.tsx      # UI state management
├── types/               # TypeScript type definitions
│   └── index.ts
├── utils/               # Utility functions
│   ├── csvUtils.ts      # CSV import/export utilities
│   ├── database.ts      # IndexedDB operations
│   ├── localStorage.ts  # localStorage operations
│   ├── search.ts        # Trie-based search implementation
│   ├── storage.ts       # Unified storage interface
│   └── trie.ts          # Trie data structure implementation
├── styles/              # Global styles
│   └── index.css
└── test/                # Test configuration
    └── setup.ts
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd contact-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run unit tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Lint code
- `npm run lint:fix` - Fix linting issues
- `npm run format` - Format code with Prettier
- `npm run type-check` - TypeScript type checking

## 🎯 Usage

### Adding Contacts
1. Click the "Add Contact" button in the header
2. Fill in the contact information
3. Add tags for better organization
4. Save the contact

### Searching Contacts
- Use the search bar in the header for real-time search
- Search works across all contact fields (name, email, phone, etc.)
- Powered by Trie data structure for optimal performance

### Managing Contacts
- Click on any contact to view details
- Use bulk selection for mass operations
- Export contacts to CSV for backup
- Import contacts from CSV files

### Learning About Tries
- Navigate to the "Learn Tries" tab
- Explore interactive lessons about Trie data structures
- Understand the performance benefits of prefix trees

## 🔧 Configuration

### Storage
The application automatically detects and uses the best available storage:
1. **IndexedDB** (preferred) - For modern browsers
2. **localStorage** (fallback) - For compatibility

### Search Performance
- **Trie Construction**: O(n*m) where n = contacts, m = average field length
- **Search Time**: O(k) where k = search query length
- **Memory Usage**: Optimized with shared prefixes

## 🧪 Testing

Run the test suite:
```bash
npm run test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## 📦 Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Trie Data Structure**: Efficient prefix tree implementation
- **React Community**: For excellent tooling and libraries
- **Tailwind CSS**: For the utility-first CSS framework
- **Lucide**: For beautiful, consistent icons

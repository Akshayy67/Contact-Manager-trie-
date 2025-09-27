# Contact Manager with Visual Trie Search Engine

Hey there! 👋 This is my contact manager app that I built to explore Trie data structures in a practical way. What started as a simple contact app turned into something pretty cool with real-time visual search algorithms!

## What I Built

I wanted to create more than just another contact manager. This app features:

**The Main Stuff:**

- Add, edit, and delete contacts (the basics, but done well)
- Super fast search using a Trie data structure I implemented from scratch
- Bulk operations when you need to manage lots of contacts
- CSV import/export because who wants to manually enter 100 contacts?
- Tagging system to keep things organized

**The Cool Part - Visual Trie Search:**

- Real-time visualization of how the Trie algorithm works as you type
- Watch the search path light up and see nodes being traversed
- Educational tooltips explaining what's happening under the hood
- Performance metrics showing why Tries are so fast

**Extra Features I Added:**

- Analytics dashboard with contact statistics
- Interactive learning module about Trie data structures
- Responsive design that works everywhere
- Toast notifications for user feedback

## Tech Stack

I chose these technologies because they work well together and let me focus on the interesting parts:

**Frontend:**

- React 18 with TypeScript (because type safety is life)
- Tailwind CSS for styling (utility classes are just faster)
- Lucide React for consistent icons

**State Management:**

- Zustand for global state (much simpler than Redux)
- React Context for component composition

**Storage:**

- IndexedDB with Dexie.js for persistent storage
- localStorage as fallback for older browsers
- Custom Trie implementation for the search engine

**Development:**

- Vite for fast builds and hot reload
- ESLint and Prettier for code quality
- Vitest for testing

## How It's Organized

The project structure is pretty straightforward:

```
src/
├── components/          # All React components
│   ├── contacts/       # Contact CRUD components
│   ├── learning/       # Trie learning module
│   ├── modals/         # Popup dialogs
│   └── ui/             # Reusable UI components
├── stores/             # Zustand state management
├── utils/              # The interesting stuff:
│   ├── trie.ts         # My Trie implementation
│   ├── search.ts       # Search engine with visualization
│   └── database.ts     # Storage abstraction
└── types/              # TypeScript definitions
```

## Getting Started

Want to run this locally? Here's how:

**Prerequisites:**

- Node.js 18+ (I use the latest LTS)
- npm (comes with Node)

**Setup:**

```bash
git clone https://github.com/Akshayy67/Contact-Manager-trie-.git
cd contact-manager
npm install
npm run dev
```

Then open `http://localhost:3000` and you're good to go!

**Available Commands:**

- `npm run dev` - Development server with hot reload
- `npm run build` - Production build
- `npm run test` - Run tests
- `npm run lint` - Check code quality
- `npm run type-check` - TypeScript validation

## How to Use It

**The Basics:**

- Click "Add Contact" to create new contacts
- Use the search bar to find contacts instantly
- Click any contact to view/edit details
- Select multiple contacts for bulk operations

**The Cool Search Feature:**

- Start typing in the search box
- Watch the Trie visualization show how the algorithm works
- See real-time performance metrics
- Toggle the visualization on/off if you just want to search

**Learning Mode:**

- Check out the "Learning" tab to understand how Tries work
- Interactive lessons with visual examples
- Compare Trie performance vs other search methods

## Technical Details

**Storage:**
The app automatically picks the best storage option available:

- IndexedDB for modern browsers (preferred)
- localStorage as fallback

**Search Performance:**

- Trie construction: O(n×m) where n = contacts, m = average field length
- Search time: O(k) where k = search query length
- Memory efficient with shared prefixes

## What I Learned

Building this project taught me a lot about:

- Implementing complex data structures in TypeScript
- Creating interactive visualizations with React
- Balancing performance with user experience
- Making educational content engaging

## Want to Contribute?

Feel free to fork this repo and make it better! I'm always open to:

- Bug fixes
- Performance improvements
- New features for the learning module
- Better visualizations

Just create a pull request and I'll take a look.

## License

MIT License - feel free to use this code for your own projects!

---

Built with ❤️ by [Akshayy67](https://github.com/Akshayy67)

_P.S. - If you find this useful, give it a star! ⭐_

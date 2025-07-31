# Timber Group CRM - Next.js Application

A modern, professional CRM application built with Next.js, featuring offline functionality, seamless backend integration, and enterprise-grade UI/UX design.

## ✨ Professional UI/UX Features

### 🎨 Design System
- **Modern Typography**: Geist font family with optimized readability
- **Professional Color Palette**: Yellow/Orange gradient theme with semantic colors
- **Smooth Animations**: CSS transitions and micro-interactions
- **Responsive Design**: Mobile-first approach with breakpoint optimization
- **Accessibility**: WCAG 2.1 compliant with proper ARIA labels

### 🧩 Enhanced Components

#### Avatar Component (NEW!)
- **Color Block System**: Automatic color generation based on name/email
- **Multiple Sizes**: XS, SM, MD, LG, XL, 2XL
- **Shape Variants**: Circle, Square, Rounded
- **Initial Generation**: Smart initials from full names
- **Tooltip Support**: Hover tooltips with full name
- **Interactive**: Optional click handlers with hover effects
- **10 Color Palette**: Yellow, Green, Blue, Purple, Pink, Red, Orange, Indigo, Teal, Cyan

#### Button Component
- **Multiple Variants**: Primary, Secondary, Danger, Gradient, Icon, Ghost, Outline
- **Size Options**: Small, Medium, Large, Extra Large
- **Loading States**: Built-in loading spinner with disabled states
- **Hover Effects**: Smooth transitions with scale and shadow effects
- **Focus States**: Proper keyboard navigation support

#### Card Component
- **Variants**: Default, Elevated, Outlined, Gradient
- **Hover Effects**: Optional hover animations with scale and shadow
- **Padding Options**: None, Small, Medium, Large, Extra Large
- **Professional Shadows**: Layered shadow system for depth

#### Input Component
- **Validation States**: Error, Success, Helper text support
- **Icon Support**: Left and right icons with proper positioning
- **Size Variants**: Small, Medium, Large
- **Style Variants**: Default, Outlined, Filled
- **Accessibility**: Proper labels and ARIA attributes

#### Badge Component
- **Color Variants**: Primary, Secondary, Success, Warning, Error, Info
- **Size Options**: Small, Medium, Large
- **Rounded Options**: Full rounded or standard rounded corners
- **Gradient Backgrounds**: Professional gradient styling

#### LoadingSpinner Component
- **Animation Variants**: Spinner, Dots, Pulse, Bars
- **Color Options**: Primary, White, Yellow, Success, Warning, Error
- **Size Range**: Extra Small to Extra Large
- **Text Support**: Optional loading text with animation

#### Tooltip Component
- **Position Options**: Top, Bottom, Left, Right
- **Style Variants**: Dark, Light, Primary
- **Customizable Delay**: Configurable show/hide timing
- **Smooth Animations**: Fade-in/out with proper positioning

### 🎯 Professional Features

#### Enhanced User Experience
- **Smooth Scrolling**: CSS scroll-behavior for better navigation
- **Professional Focus States**: Consistent focus indicators
- **Custom Scrollbars**: Styled scrollbars for better aesthetics
- **Selection Styling**: Branded text selection colors
- **Print Styles**: Optimized printing layouts

#### Advanced Animations
- **Fade In**: Smooth opacity transitions
- **Slide In**: Directional slide animations
- **Scale In**: Subtle scale effects
- **Pulse**: Attention-grabbing pulse animations
- **Shimmer**: Loading state shimmer effects

#### Professional Styling
- **Card Shadows**: Layered shadow system (sm, md, lg, xl)
- **Button States**: Hover, active, disabled states
- **Table Styling**: Professional table with sticky headers
- **Form Styling**: Enhanced form inputs with validation
- **Modal Overlays**: Backdrop blur effects

## Features

- **Offline-First Design**: Works with or without backend connection
- **Mock Data Support**: Pre-populated with sample data for testing
- **Real-time Backend Integration**: Seamlessly switches to real API when available
- **Responsive UI**: Modern, accessible interface with consistent design
- **Modular Architecture**: Clean separation of concerns with reusable components
- **Professional Animations**: Smooth transitions and micro-interactions
- **Accessibility**: WCAG 2.1 compliant design
- **Color Block System**: Professional avatar system for placeholder names

## API Configuration

The application uses a centralized API configuration system that supports both mock and real backend modes.

### Switching Between Modes

1. **Mock Mode (Offline)**: Set `NEXT_PUBLIC_USE_MOCKS=true` in your environment
2. **Real Backend Mode**: Set `NEXT_PUBLIC_USE_MOCKS=false` and configure `NEXT_PUBLIC_API_URL`

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Set to 'true' to use mock data and localStorage
# Set to 'false' to use real backend API calls
NEXT_PUBLIC_USE_MOCKS=true

# Backend API URL (used when USE_MOCKS is false)
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

## Project Structure

```
src/
├── api/                    # API modules
│   ├── auth.ts            # Authentication functions
│   ├── leads.ts           # Lead management
│   ├── followups.ts       # Follow-up tracking
│   └── leadlogs.ts        # Lead activity logs
├── components/             # Reusable UI components
│   ├── Avatar.tsx         # Color block avatars (NEW!)
│   ├── Button.tsx         # Enhanced button with variants
│   ├── Card.tsx           # Professional card component
│   ├── Input.tsx          # Advanced input with validation
│   ├── Badge.tsx          # Status and label badges
│   ├── LoadingSpinner.tsx # Multiple loading animations
│   ├── Tooltip.tsx        # Professional tooltips
│   ├── Modal.tsx          # Modal dialogs
│   ├── Select.tsx         # Dropdown components
│   └── Table.tsx          # Data table component
├── config/                 # Configuration files
│   └── api.ts             # API configuration and mock data
├── app/                    # Next.js app router pages
│   ├── login/             # Authentication
│   ├── homescreen/        # Main application
│   └── globals.css        # Professional global styles
├── types/                  # TypeScript type definitions
└── utils/                  # Utility functions
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on `http://127.0.0.1:8000`

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd timber-crm
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## Development

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Adding New Features

1. **API Integration**
   - Add endpoints to `src/config/api.ts`
   - Create corresponding API modules in `src/api/`
   - Update TypeScript types as needed

2. **UI Components**
   - Create components in `src/components/`
   - Follow existing patterns and naming conventions
   - Add proper TypeScript types and accessibility features

3. **Pages**
   - Add pages in `src/app/`
   - Use the existing layout structure
   - Implement proper error handling and loading states

## Professional UI/UX Guidelines

### Component Usage

#### Avatar Examples
```tsx
// Basic avatar with name
<Avatar name="John Doe" size="md" />

// Avatar with email and tooltip
<Avatar 
  email="john.doe@example.com" 
  size="lg" 
  showTooltip={true}
/>

// Interactive avatar with click handler
<Avatar 
  name="Jane Smith" 
  size="xl" 
  onClick={() => handleAvatarClick()}
  className="cursor-pointer"
/>

// Square avatar variant
<Avatar 
  name="Bob Wilson" 
  variant="square" 
  size="md"
/>

// Small avatar for table rows
<Avatar 
  name="Alice Johnson" 
  size="sm" 
  showTooltip={true}
/>
```

#### Button Examples
```tsx
// Primary button with loading state
<Button variant="primary" loading={isLoading}>
  Save Changes
</Button>

// Gradient button with custom size
<Button variant="gradient" size="xl">
  Create Lead
</Button>

// Icon button
<Button variant="icon">
  <PlusIcon className="w-5 h-5" />
</Button>
```

#### Card Examples
```tsx
// Elevated card with hover effect
<Card variant="elevated" hover>
  <h3>Card Title</h3>
  <p>Card content</p>
</Card>

// Gradient card with custom padding
<Card variant="gradient" padding="xl">
  <h3>Gradient Card</h3>
</Card>
```

#### Input Examples
```tsx
// Input with validation
<Input 
  label="Email Address"
  error="Please enter a valid email"
  leftIcon={<MailIcon />}
/>

// Input with success state
<Input 
  label="Username"
  success="Username is available"
  helper="Must be at least 3 characters"
/>
```

#### Badge Examples
```tsx
// Status badges
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Failed</Badge>
```

### Color Block System

The Avatar component automatically generates consistent colors based on names or emails:

#### Color Generation Algorithm
- **Deterministic**: Same name always gets same color
- **10 Color Palette**: Yellow, Green, Blue, Purple, Pink, Red, Orange, Indigo, Teal, Cyan
- **Hash-based**: Uses string hash to ensure consistency
- **Fallback**: Gray for empty/null values

#### Usage Examples
```tsx
// Different names get different colors
<Avatar name="John Doe" />     // Blue
<Avatar name="Jane Smith" />   // Green  
<Avatar name="Bob Wilson" />   // Purple
<Avatar name="Alice Johnson" /> // Yellow

// Same name always gets same color
<Avatar name="John Doe" />     // Blue
<Avatar name="John Doe" />     // Blue (same)
<Avatar name="John Doe" />     // Blue (same)
```

#### Integration Points
- **User Profiles**: Header profile buttons and dropdowns
- **Lead Tables**: Name columns with avatars
- **Customer Lists**: Customer name displays
- **Follow-up Drawers**: Lead detail headers
- **Recent Activity**: User activity indicators

### Animation Classes

Use these CSS classes for professional animations:

```css
.animate-fade-in    /* Smooth fade in */
.animate-slide-in   /* Slide in from left */
.animate-scale-in   /* Scale in effect */
.animate-pulse-slow /* Slow pulse animation */
```

### Professional Styling

#### Color Variables
```css
--primary: #f59e0b;      /* Brand yellow */
--primary-dark: #d97706;  /* Darker yellow */
--secondary: #fef3c7;     /* Light yellow */
--success: #10b981;       /* Green */
--warning: #f59e0b;       /* Orange */
--error: #ef4444;         /* Red */
```

#### Shadow System
```css
.card-shadow      /* Small shadow */
.card-shadow-lg   /* Large shadow */
.card-shadow-xl   /* Extra large shadow */
```

## Offline Functionality

### Mock Data Mode
- All data operations work without internet connection
- Data is stored in browser's localStorage
- Automatic sync when connection is restored

### Responsive Design
- Works on desktop, tablet, and mobile devices
- Consistent UI components across all pages
- Accessible design with proper ARIA labels

### Data Management
- Real-time search and filtering
- Pagination for large datasets
- Export/import functionality (planned)

### User Experience
- Loading states and error messages
- Smooth animations and transitions
- Intuitive navigation and workflows

## Development

### Adding New API Endpoints
1. Add endpoint to `config/api.ts`
2. Create corresponding API module
3. Update types if needed
4. Add mock data for offline testing

### Creating New Components
1. Create component in `components/` directory
2. Follow existing component patterns
3. Add proper TypeScript types
4. Include accessibility features
5. Add professional animations

### Testing
- Test both online and offline modes
- Verify error handling
- Check responsive design
- Validate accessibility
- Test keyboard navigation

## Troubleshooting

### Common Issues

1. **Mock data not loading**:
   - Clear browser localStorage
   - Check environment variable settings

2. **API calls failing**:
   - Verify backend URL configuration
   - Check network connectivity
   - Review browser console for errors

3. **TypeScript errors**:
   - Run `npm run build` to check types
   - Update type definitions as needed

4. **Animation issues**:
   - Check CSS class names
   - Verify Tailwind CSS configuration

5. **Avatar color inconsistencies**:
   - Check name/email input
   - Verify hash algorithm
   - Test with different names

### Performance Tips

1. **For large datasets**:
   - Implement pagination
   - Use virtual scrolling
   - Optimize search algorithms

2. **For offline mode**:
   - Limit localStorage usage
   - Implement data cleanup
   - Add sync indicators

3. **For animations**:
   - Use CSS transforms instead of layout changes
   - Implement will-change for performance
   - Use requestAnimationFrame for complex animations

4. **For avatars**:
   - Cache color calculations
   - Use memoization for repeated names
   - Optimize hash function for performance

## Contributing

1. Follow the existing code structure
2. Add proper TypeScript types
3. Include error handling
4. Test both online and offline modes
5. Update documentation as needed
6. Follow accessibility guidelines
7. Add professional animations
8. Use the color block system for user representations

## License

This project is proprietary to Timber Group.
